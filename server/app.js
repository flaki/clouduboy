"use strict";

var APP_VERSION = process.env.npm_package_version || (require('../package.json').version);

var fs = require('fs');
var express = require('express');
var app = express();

const DIR_ROOT = require('path').normalize(__dirname+"/..");
const DIR_SOURCES = DIR_ROOT + "/sources";
const DIR_BUILD = DIR_ROOT + "/build";

app.get('/', function (req, res) {
  res.send('Clouduboy Cloud Compiler ' + APP_VERSION);
});

app.get('/build', function (req, res) {
  //res.send(fs.readFileSync(DIR_SOURCES + '/arduboy-rund-ino/rund/rund.ino.leonardo.hex'));
  build().then(res.send.bind(res));
});

app.get('/post', function (req, res) {
  var hex = fs.readFileSync(DIR_SOURCES + '/arduboy-rund-ino/rund/rund.ino.leonardo.hex');
  res.json({
    "result": {
      hex: hex
    }
  });
});

var server = app.listen(3204, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Clouduboy %s at http://%s:%s', APP_VERSION, host, port);
});


const RX_BUILD_PROGMEM = /Program:\s*(\d+) bytes \(([\d\.]+)\%/;
const RX_BUILD_DATAMEM = /Data:\s*(\d+) bytes \(([\d\.]+)\%/;

function build() {
  var exec = require('child-process-promise').exec;

//  Program:   10232 bytes (31.2% Full)
//  (.text + .data + .bootloader)

//  Data:       1275 bytes (49.8% Full)
//  (.data + .bss + .noinit)

  return exec('platformio run -d "' + DIR_BUILD + '" --disable-auto-clean')
    .then(function (result) {
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
          }
        }

        // Parse used Data memory
        if (mem = result.stdout.match(RX_BUILD_DATAMEM)) {
          r.memory.data = {
            bytes: parseInt(mem[1],10),
            used: parseFloat(mem[2])/100,
          }
        }
      }

      return r;
    })
    .fail(function (err) {
      console.error('ERROR: ', err);
    });
}
