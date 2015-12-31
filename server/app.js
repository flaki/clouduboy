"use strict";

const APP_VERSION = process.env.npm_package_version || (require('../package.json').version);

let fs = require('fs');

let express = require('express'),
    cors = require('cors'),
    formidable = require('formidable'),
    vhost = require('vhost');

let exec = require('child-process-promise').exec;

const DIR_ROOT = require('path').normalize(__dirname+"/..");
const DIR_SOURCES = DIR_ROOT + "/sources";
const DIR_BUILD = DIR_ROOT + "/build";
const DIR_EDITOR = DIR_ROOT + "/editor";


// App
let app = express();


// Top level host
let root = express();
app.use(vhost('slsw.hu', root));

// Print app version
root.get('/', function (req, res) {
  res.send('Welcome to slsw.hu');
});


// Clouduboy App
let cdb = express();
app.use(vhost('clouduboy.slsw.hu', cdb));


// Enable CORS for all endpoints (TODO: may want to further refine this later)
cdb.use(cors());

// Serve static
cdb.use(express.static(DIR_EDITOR));

// Print app version
cdb.get('/version', function (req, res) {
  res.send('Clouduboy Cloud Compiler ' + APP_VERSION);
});


// Editor
cdb.get('/editor', function (req, res) {
  res.sendFile(DIR_EDITOR + '/editor.html');
});


// Get build source
cdb.get('/src/build', function (req, res) {
  res.type('text/x-arduino').download(DIR_BUILD + '/src/build.ino', 'build.ino');
});

// Get last built HEX
cdb.get('/build', function (req, res) {
  var hex = fs.readFileSync(DIR_BUILD + '/.pioenvs/leonardo/firmware.hex');
  res.json({
    "result": {
      hex: hex.toString()
    }
  });
});


// Build & report errors on posted document
cdb.post('/build', function (req, res) {
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
      "error": e.toString()
    });
  });
});



var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Clouduboy %s at http://%s:%s', APP_VERSION, host, port);
});


const RX_BUILD_PROGMEM = /Program:\s*(\d+) bytes \(([\d\.]+)\%/;
const RX_BUILD_DATAMEM = /Data:\s*(\d+) bytes \(([\d\.]+)\%/;

function build() {
//  Program:   10232 bytes (31.2% Full)
//  (.text + .data + .bootloader)

//  Data:       1275 bytes (49.8% Full)
//  (.data + .bss + .noinit)

  return exec('platformio run -d "' + DIR_BUILD + '" --disable-auto-clean')
    .catch(function (failed) {
      console.log("Build failed with code "+ failed.code +": ", failed.stderr)
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
      console.log("Build error in exec: ", err);
      throw(err);
    });
}
