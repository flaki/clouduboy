'use strict';

const APP_VERSION = process.env.npm_package_version || (require('../package.json').version);

const log = function(label, log) {
  return console.log('['+label+']', [].splice.call(arguments,1));
}

let fs = require('fs');

let express = require('express'),
    cors = require('cors'),
    formidable = require('formidable'),
    vhost = require('vhost'),
    bodyParser = require('body-parser');

let bodyParserJSON = bodyParser.json()

let exec = require('child-process-promise').exec;

const DIR_ROOT = require('path').normalize(__dirname+'/..');
const DIR_SOURCES = DIR_ROOT + '/sources';
const DIR_TEMPLATES = DIR_ROOT + '/templates';
const DIR_BUILD = DIR_ROOT + '/build';
const DIR_EDITOR = DIR_ROOT + '/editor';

const BUILDFILE = DIR_BUILD + '/src/build.ino';

const LOADSOURCES = {
  'rundino': DIR_SOURCES + '/arduboy-rund-ino/rund/rund.ino',
  'rundino/halloween': DIR_SOURCES + '/arduboy-rund-ino/halloweend/halloweend.ino',
  'examples/ardubreakout': DIR_SOURCES + '/Arduboy/examples/ArduBreakout/ArduBreakout.ino',
  'examples/floatyball': DIR_SOURCES + '/Arduboy/examples/FloatyBall/FloatyBall.ino',
  'examples/tunes': DIR_SOURCES + '/Arduboy/examples/Tunes/Tunes.ino',
  'templates/empty': DIR_TEMPLATES + '/empty.ino',
  'templates/minimal': DIR_TEMPLATES + '/minimal.ino',
  'templates/sprites': DIR_TEMPLATES + '/sprites.ino',
  'templates/tunes': DIR_TEMPLATES + '/tunes.ino'
}

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

// Print app version
cdb.get('/version', function (req, res) {
  res.send('Clouduboy Cloud Compiler ' + APP_VERSION);
});

// No path info (server root), create new session
let Session = require(__dirname+'/session.js');
let sess;
let sesslog = log.bind(log,'session');

cdb.get('/', function (req, res) {
  console.log('New session...');
  // TODO: handle session cookies (res.cookies)
  // https://github.com/expressjs/cookie-parser

  // Create new session and redirect
  Session.create().then(function(session) {
    sess = session;

    sesslog('Created: ', sess);

    res
      .cookie('session', sess.tag)
      .redirect('/editor/'+sess.tag);

  // Session creation error
  }).catch(function(err) {
    sesslog('[!] Failed to create session! ', err);

    res.send('Cannot create session: '+err.toString()).sendStatus(500);
  });
});

// Handle SID tag in urls
cdb.param('sid',function(req, res, next, sid) {
  // Try to load provided session
  Session.load(sid).then(function(session) {
    sess = session;

    sesslog('Loaded: ', sess);
    next();

  // Error loading session
  }).catch(function(err) {
    sesslog('[!] Failed to load session!', err);
  });

});


// Editor
cdb.get('/editor/:sid', function (req, res) {
  res.sendFile(DIR_EDITOR + '/editor.html');
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
  res.type('text/x-arduino').download(BUILDFILE, 'build.ino');
});

// Get last built HEX
cdb.get('/hex/build', function (req, res) {
  res.type('application/octet-stream').download(DIR_BUILD + '/.pioenvs/leonardo/firmware.hex', 'build.leonardo.hex');
});

// Get last built HEX for flashing (only returns with the HEX if flashing isrequested from the IDE)
var doFlash = false;
cdb.get('/hex/flash', function (req, res) {
  if (!doFlash) {
    return res.sendStatus(204);
  }

  doFlash = false;
  res.type('application/octet-stream').download(DIR_BUILD + '/.pioenvs/leonardo/firmware.hex', 'build.leonardo.hex');
});

// Request flashing
cdb.post('/do/flash', function (req, res) {
  doFlash = true;
  res.send('Ok');
})


cdb.get('/build', function (req, res) {
  var hex = fs.readFileSync(DIR_BUILD + '/.pioenvs/leonardo/firmware.hex');
  res.json({
    'result': {
      hex: hex.toString()
    }
  });
});


// Load app as build source
cdb.post('/load', bodyParserJSON, reqPostLoad);

// Build & report errors on posted document
cdb.post('/build', reqPostBuild);


// Serve static
cdb.use(express.static(DIR_EDITOR));




var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Clouduboy %s at http://%s:%s', APP_VERSION, host, port);
});


function reqPostLoad(req, res) {
  let source;

  // Ignore invalid sources
  if (!req.body || req.body.load in LOADSOURCES === false) {
    return res.sendStatus(403);
  };

  // Load source
  console.log('Loading', req.body.load);
  source = LOADSOURCES[req.body.load];
  let copy = fs.createReadStream(source);
    copy.pipe(fs.createWriteStream(BUILDFILE));

  copy.on('end', function() {
    console.log('Loaded "%s" into build.ino.', source);
    res.type('text/x-arduino').download(BUILDFILE, 'build.ino');
  });
}

function reqPostBuild (req, res) {
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

  // Write changed code
  })).then(function(formdata) {
    console.log(formdata);

    // write file
    fs.writeFileSync(DIR_BUILD + '/src/build.ino', formdata.fields.code);

  }).then(function() {
    return build().then(res.json.bind(res));

  }).catch(function(e) {
    console.error('Failed to build: ', e);

    res.json({
      'error': e.toString()
    });
  });
}


const RX_BUILD_PROGMEM = /Program:\s*(\d+) bytes \(([\d\.]+)\%/;
const RX_BUILD_DATAMEM = /Data:\s*(\d+) bytes \(([\d\.]+)\%/;

function build() {
//  Program:   10232 bytes (31.2% Full)
//  (.text + .data + .bootloader)

//  Data:       1275 bytes (49.8% Full)
//  (.data + .bss + .noinit)

  return exec('platformio run -d "' + DIR_BUILD + '" --disable-auto-clean')
    .catch(function (failed) {
      console.log('Build failed with code '+ failed.code +': ', failed.stderr)
      return failed;

    }).then(function (result) {
      let r = {
        stdout: result.stdout,
        stderr: result.stderr,
        memory: {}
      };

      console.log('stdout: ', result.stdout);
      console.log('stderr: ', result.stderr);

      if (result.stdout) {
        let mem;

        // Parse used Program memory
        if (mem = result.stdout.match(RX_BUILD_PROGMEM)) {
          r.memory.program = {
            bytes: parseInt(mem[1],10),
            used: parseFloat(mem[2])/100,
          };
        }

        // Parse used Data memory
        if (mem = result.stdout.match(RX_BUILD_DATAMEM)) {
          r.memory.data = {
            bytes: parseInt(mem[1],10),
            used: parseFloat(mem[2])/100,
          };
        }
      }

      if (result.stderr) {
        r.error = result.stderr;
        r.compiler = {};

        // Find compile errors/warnings
        let rx = /([\w\/]+\.(?:ino|h|c|cpp))\:(\d+)\:(\d+)\:\s*(.*)/g

        let e = null;
        while ((e = rx.exec(r.error)) !== null) {
          if (!r.compiler[ e[1] ]) r.compiler[ e[1] ]= [];

          r.compiler[ e[1] ].push({
            line: e[2],
            col: e[3],
            msg: e[4]
          });
        }
      }

      return r;
    })
    .catch(function (err) {
      console.log('Build error in exec: ', err);
      throw(err);
    });
}
