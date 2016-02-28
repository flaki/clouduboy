'use strict';

let fs = require('fs');

let Avrgirl = require('avrgirl-arduino');


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


function flashArduboy(hex, port) {
  return require('./flash.js')({
    PORT: port,
    DATA: hex
  });
}


// Find & flash Arduboy with the provided .hex
let abPort, abHex;

function main(hex) {
  return findArduboy()

  .then(function(port) {
    abPort = port;
    abHex = hex;

    return flashArduboy(abHex, abPort);

  }).catch(function(e) {
    console.log("Flashing failed: ", e.stack||e);
    throw e;
  });
}

module.exports = main;

module.exports.findArduboy = findArduboy;
module.exports.flashArduboy = flashArduboy;
