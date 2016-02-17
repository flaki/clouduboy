'use strict';

const APP_VERSION = process.env.npm_package_version || (require('../package.json').version);

const APP_CONFIG = require('../config.json');


// APP DEPENDENCIES

// Used for file operations
// TODO: make this fs-extra or fs-promise
const fs = require('fs');


// Used for serving the app
const express = require('express'),
    cors = require('cors'),
    formidable = require('formidable'),
    vhost = require('vhost'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

// JSON postdata parser middleware
const bodyParserJSON = bodyParser.json();


// CUSTOM MODULES

// Contains the session-related functions
const cdbSession = require(__dirname+'/session.js');

// Contains the build-related functions
const cdbBuild = require(__dirname+'/build.js');


// CONSTANTS & CONVENIENCE FUNCTIONS

// Simple logging
const log = function(label, log) {
  return console.log.apply('['+label+']', [].splice.call(arguments,1));
}

// Promise rejected, request failed (this == res)
const error500 = function(err) {
  console.log("Request failed: ", err);
  this.sendStatus(500);
}

// Paths
const DIR_ROOT = require('path').normalize(__dirname+'/..');
const DIR_SOURCES = DIR_ROOT + '/sources';
const DIR_TEMPLATES = DIR_ROOT + '/templates';
const DIR_BUILD = DIR_ROOT + '/build';
const DIR_EDITOR = DIR_ROOT + '/editor';

const BUILDFILE = DIR_BUILD + '/src/build.ino';

const LOADSOURCES = APP_CONFIG.sources; // TODO: load these from a JSON (also, automate editor dropdown)
const DEFAULT_TEMPLATE = LOADSOURCES[0];

const LIBVERSIONS = APP_CONFIG.arduboyLibs;
const DEFAULT_ARDUBOY = LIBVERSIONS[0];

const SOURCEGROUPS = APP_CONFIG.sourceGroups;


// App
let app = express();


// Top level host
let root = express();
app.use(vhost('slsw.hu', root));

root.get('/', function (req, res) {
  res.send('Welcome to slsw.hu');
});


// Clouduboy App
let cdb = express();
app.use(vhost('clouduboy.slsw.hu', cdb));


// Enable CORS for all endpoints (TODO: may want to further refine this later)
cdb.use(cors());

// Enable cookies
cdb.use(cookieParser());


// Print app version
cdb.get('/version', function (req, res) {
  res.send('Clouduboy Cloud Compiler ' + APP_VERSION);
});

cdb.get('/support', function (req, res) {
  try {
    let conf = require(__dirname+'/../config.json');
    res.redirect(conf.supportUrl);

  // Make sure we still run even if config.json doesn't exist
  } catch(err) {
    console.log("Error loading config.json: ", err);
  }
});


// Session handling
let cSess;
let sesslog = log.bind(log,'session');

// If a session id is found in a cookie, try to load as active session
cdb.use(function(req, res, next) {
  if (req.cookies.session) {
    cSess = cdbSession.init(req.cookies.session);
  }
  next();
});

// Create a new session
cdb.all('/init', function (req, res) {
  // TODO: create intro page (source/template selector)
  // TODO: handle template selection in POST/formdata
  console.log('New session...');
  // TODO: handle session cookies (res.cookies)
  // https://github.com/expressjs/cookie-parser

  // Create new session and redirect
  cdbSession.create().then(function(session) {
    cSess = session;

    sesslog('Created: ', cSess);

    // Initialize build sources
    let build = new cdbBuild(cSess);

    // Initialize build sources (async)
    return build.init(
      DEFAULT_TEMPLATE.id,
      Build.sources(DIR_ROOT+'/'+DEFAULT_TEMPLATE.src),
      DEFAULT_ARDUBOY //TODO: selection UI & setting for Arduboy lib version
    );

  // Save build info into the session
  }).then(function(build) {

    // Build source/file for the session
    return cSess.set({
      builddir: build.dir,
      buildfile: build.ino
    });

  // Redirect to the editor
  }).then(function() {
    res
      .cookie('session', cSess.tag)
      .redirect('/editor/'+cSess.tag);

  // Session creation error
  }).catch(function(err) {
    sesslog('[!] Failed to create session! ', err.stack);

    res.send('Cannot create session: '+err.toString()).sendStatus(500);
  });
});

// Handle SID tag in urls
cdb.param('sid', function(req, res, next, sid) {
  // Try to load provided session
  cdbSession.load(sid).then(function(session) {
    cSess = session;

    sesslog('Loaded: ', cSess.tag);
    next();

  // Error loading session
  }).catch(function(err) {
    sesslog('[!] Failed to load session!', err.stack);
  });

});


// Editor
cdb.get('/editor/:sid', function (req, res) {
  res.sendFile(DIR_EDITOR + '/editor.html');
});

// List installed sources/source groups/arduboy lib versions
cdb.get('/sources', function (req,res) {
  res.json({
    sources: LOADSOURCES,
    groups: SOURCEGROUPS,
    libs: LIBVERSIONS
  });
});


// Sprite Editor
let currentSprite = null;
cdb.get('/sprite', function (req, res) {
  res.json(currentSprite);
});
// Editor
cdb.post('/sprite', bodyParserJSON, function (req, res) {
  console.log(req.body);
  if (req.body && req.body.sprite) {
    currentSprite = req.body.sprite;
  }
  res.send('Ok');
});


// Get build source
cdb.get('/src/build', function (req, res) {
  // Load session and fetch build file
  cSess.load().then(function() {
    res.type('text/x-arduino').download(cSess.builddir+'/src/'+cSess.buildfile, cSess.buildfile);

  // Failed
  }).catch(error500.bind(res));
});

// Get last built HEX
cdb.get('/hex/build', function (req, res) {
  // Load session and fetch build file
  cSess.load().then(function() {
    res.type('application/octet-stream').download(cSess.builddir+'/.pioenvs/leonardo/firmware.hex', 'build.hex');

  // Failed
  }).catch(error500.bind(res));
});

// Get last built HEX for flashing (only returns with the HEX if flashing isrequested from the IDE)
var doFlash = false;
cdb.get('/hex/flash/:sid', function (req, res) {
  // Load session & see if flashing has been requested
  if (cSess) cSess.load().then(function() {
    // No flashing requested
    if (!cSess.flash) {
      return res.sendStatus(204);

    // Flashing was requested: clear the flag & return the binary
    } else {
      return cSess.set({ flash: false }).then(function() {
        res.type('application/octet-stream').download(cSess.builddir+'/.pioenvs/leonardo/firmware.hex', 'build.hex');
      });
    }
  // Failed
  }).catch(error500.bind(res));

});

// Request flashing
cdb.post('/do/flash', function (req, res) {
  // Load session & set flashing to true
  cSess.load().then(function() {
    return cSess.set({ flash: true });

  // Flashing requested
  }).then(function() {
    res.send('Ok');

  // Failed
  }).catch(error500.bind(res));
})



// Load source for editing/building
cdb.post('/load', bodyParserJSON, reqPostLoad);



// List files in current build
function buildFiles() {
  let path = require('path');

  // Make sure we have an initialized session
  if (!cSess.builddir || !cSess.buildfile) return [];

  // List files
  return cdbBuild.sources(
    cSess.builddir+'/src/'+cSess.buildfile
  ).map((p) => path.basename(p))
}

// List files for current session
cdb.get('/files', function (req,res) {
  cSess.load().then(function() {
    res.json({
      files: buildFiles()
    });

  // Failed
  }).catch(error500.bind(res));
});

// List files for current session
cdb.get('/edit/:file?', reqGetEdit);

function reqGetEdit(req, res) {
  // Load session and check supplied filename in request params
  cSess.load().then(function() {
    // :file param defaults to session.buildfile
    // TODO: create an "editedfile" active file entry and use that
    let newfile = req.params.file || cSess.buildfile;
    let files = buildFiles();

    // No such file exists in the current source
    if (!newfile || files.indexOf(newfile)===-1) {
      return res.sendStatus(403);
    };

    console.log('Switching to: ', newfile);
    res.type('text/plain').download(cSess.builddir+'/src/'+newfile, newfile);

  // Failed
  }).catch(error500.bind(res));
}

// Build & report errors on posted document
cdb.post('/build', reqPostBuild);


// Serve static
cdb.use(express.static(DIR_EDITOR));



// Start server
var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Clouduboy %s starting at http://%s:%s', APP_VERSION, host, port);
});



// Load new template/document source for editing
function reqPostLoad(req, res) {
  // Check for posted template source existence
  let template = req.body && req.body.load;
  let source = template && LOADSOURCES.find(function(i) {
    return (i.id === template);
  });

  // No source or invalid source file requested
  if (!source) {
    return res.sendStatus(403);
  };

  // Library version
  let arduboyLib = req.body && req.body.lib;

  // Unknown Arduboy lib version was requested, use default
  if (LIBVERSIONS.indexOf(arduboyLib) === -1) {
    arduboyLib = DEFAULT_ARDUBOY;
  }

  // Copy build sources
  let build = new cdbBuild(cSess);
  let buildSources = cdbBuild.sources(DIR_ROOT+'/'+source.src);

  return build.init(
    template,
    buildSources,
    arduboyLib //TODO: selection UI & setting for Arduboy lib version
  )

  // Update buildfile in session data
  .then(function(build) {
    return cSess.set({
      buildfile: build.ino
    });
  })

  // Finished!
  .then(function() {
    console.log('Loaded new template: ', template, arduboyLib);

    // TODO: at this point this should just redirect to GET /edit/<buildfile>

    res.type('text/x-arduino').download(cSess.builddir+'/src/'+cSess.buildfile, cSess.buildFile);
  })

  // Error
  .catch(error500.bind(res));
}


// Save edited document data and rebuild project
function reqPostBuild (req, res) {
  let fd;

  // parse a file upload
  (new Promise(function(resolve, reject) {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      // Rejected with an error
      if (err) return reject(err);

      resolve({
        fields: fields,
        files: files
      });
    });
  }))

  // Store formdata
  .then(function(formdata) {
    fd = formdata
    console.log(formdata);
  })

  // Load session data
  .then(cSess.load.bind(cSess))

  // Write file changes
  .then(function() {
    let filename = fd.fields.filename || cSess.buildfile;
    let files = buildFiles();

    // No such file exists in the current source
    if (!filename || files.indexOf(filename)===-1) {
      return res.sendStatus(403);
    };

    // write file
    fs.writeFileSync(cSess.builddir+'/src/'+filename, fd.fields.code);
    // TODO: also, make this async
  })

  // Rebuild project
  .then(function() {
    return new cdbBuild(cSess).build();
  })

  // Return build results as a JSON
  .then(res.json.bind(res))

  // Something went wrong
  .catch(function(e) {
    console.error('Failed to build: ', e);

    res.json({
      'error': e.toString()
    });
  });
}
