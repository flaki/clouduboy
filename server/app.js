'use strict';

// APP CONFIGURATION

const CFG = require('./cfg.js');


// APP DEPENDENCIES

// Used for serving the app
const express = require('express'),
    cors = require('cors'),
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


// App
let app = express();


// Print app version
app.get('/version', require('./api/version.js').all);

// Support app development
app.get('/support', require('./api/support.js').all);


// Optional short link support
if (CFG.SHORT_LINK_HOST) {
  app.use(require('./short-link-host.js'));
}



// Clouduboy App
let cdb = express();
app.use(vhost(CFG.SERVER_HOST, cdb));


// Enable CORS for all endpoints (TODO: may want to further refine this later)
cdb.use(cors());

// Enable cookies
cdb.use(cookieParser());


// Session handling
let sesslog = log.bind(log,'session');

// If a session cookie was sent along with the request, init the session
cdb.use(cdbSession.cookieHandler);

// Create a new session
cdb.all('/init', require('./api/init.js').all);

// Generate new session id
cdb.all('/session/generate', require('./api/session.js').generate.all);


// Handle SID tag in urls
// TODO: do we still need to handle this after the intro screen lands?
cdb.param('sid', function(req, res, next, sid) {
  // Skip if not a valid SID
  // TODO: maybe throw an error, rather?
  if (!cdbSession.parseSid(sid)) {
    sesslog('[!] Invalid session ID!', sid);
    return next();
  }

  // Try to load provided session
  cdbSession.load(sid).then(function(session) {
    req.$session = session;

    // Make sure we update the stored cookie to reflect the SID passed
    cdbSession.dropCookie(req, res);

    sesslog('Loaded: ', req.$session.tag);
    next();

  // Error loading session
  }).catch(function(err) {
    sesslog('[!] Failed to load session!', err.stack);
    next();
  });
});


// Editor
cdb.get('/:sid?/editor', require('./api/editor.js').all);

// List installed sources/source groups/arduboy lib versions
cdb.get('/sources', require('./api/sources.js').all);


// Sprite Editor
cdb.get('/editor/painter', require('./api/editor.js').painter.all);

cdb.get('/sprite', require('./api/sprite.js').get);
cdb.post('/sprite', require('./api/sprite.js').post);
// TODO: decouple these into their own plugin, maybe?



// Get last built HEX
cdb.get('/hex/build', require('./api/hex.js').build.all);

// Get last built HEX for flashing
// (only returns with the HEX if flashing is requested from the IDE)
cdb.get('/hex/flash/:sid?', require('./api/hex.js').flash.get);

// Request flashing
cdb.post('/hex/flash', require('./api/hex.js').flash.post);



// Load source for editing/building
cdb.post('/load', require('./api/load.js').all );



// List files for current session
cdb.get('/files', require('./api/files.js').all);

// List files for current session
cdb.get('/edit/:file?', require('./api/edit.js').all);


// Build & report errors on posted document
cdb.post('/build', require('./api/build.js').all);


// Serve static assets for the Editor
cdb.use(express.static(CFG.WEB_DIR, { maxAge: 60*60*1000 }));

// Serve static files of the Flasher redistributable packages
cdb.use('/download', express.static(CFG.ROOT_DIR + '/flasher/dist'));



// Start server
var server = app.listen(CFG.SERVER_PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Clouduboy %s starting %s at http://%s:%s',
    CFG.APP_VERSION,
    (CFG.DIST ? 'IN PRODUCTION' : ''),
    host, port
  );
});
