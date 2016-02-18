'use strict';

let fs = require('fs');

let Avrgirl = require('avrgirl-arduino');

const BUILDURL = 'http://clouduboy.slsw.hu/hex/build';


function findArduboy() {
  return new Promise(function(resolve, reject) {
    Avrgirl.list(function(err, ports) {
      if (err) return reject(err);

      // Find (first) Arduboy device
      for (let p of ports) {
        // Bootloader mode
        if (p.vendorId === '0x2341' && p.productId === '0x8036') {
          return resolve(p.comName);
        }
        // Recovery mode
        if (p.vendorId === '0x2341' && p.productId === '0x0036') {
          return resolve(p.comName);
        }
      }

      reject(new Error("Can't find any connected Arduboy device!"));
    });
  });
}

function fetchHex(hex) {
  return new Promise(function(resolve, reject) {
    console.log('fetching '+BUILDURL+'...');
    require('http').get(BUILDURL, function(res) {
      var chunks = [];
      //res.pipe(fs.createWriteStream('tmp.hex'));
      res.on('data', chunks.push.bind(chunks) );
      res.on('end', function() {
        var hex = Buffer.concat(chunks).toString();
        console.log('ok, '+hex.length+' bytes');
        resolve(hex);
      });
    });
  });
}

function flashArduboy(hex, port) {
  return require('./flash.js')({
    PORT: port,
    DATA: hex//require('fs').readFileSync("/Users/flaki/Data/clouduboy/flasher/tmp.hex")
  });
  //return new Promise(function(resolve, reject) {
    // let avrgirl = new Avrgirl({
    //   board: 'leonardo',
    //   port: port
    // });
    //
    // avrgirl.flash(hex, function (error) {
    //   if (error) {
    //     console.log(error);
    //     reject(error);
    //   } else {
    //     resolve();
    //   }
    // });
  //});
}


// Find & flash Arduboy with the provided .hex
let abPort, abHex;

function main(hex) {
  return findArduboy()

  .then(function(port) {
    abPort = port;

    // Use provided hex
    return hex || fetchHex();
  }).then(function(hex) {
    abHex = hex;

    return flashArduboy(abHex, abPort);

  }).catch(function(e) {
    console.log("Flashing failed: ", e.stack||e);
    throw e;
  });
}

module.exports = main;

module.exports.findArduboy = findArduboy;
module.exports.downloadBuild = fetchHex;
module.exports.flashArduboy = flashArduboy;

/*
var menubar = require('menubar');

var mb = menubar();

mb.on('ready', function ready () {
  console.log('app is ready');
  // your app code here
});
*/
