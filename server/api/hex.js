'use strict';

/* Load new template/document source for editing
*/
module.exports = {
  build: { all: build_all },
  flash: { get: flash_get, post: flash_post }
};


// Dependencies
const CFG = require('../cfg.js');

const Build = require('../build.js');


function build_all(req, res) {
  // Load session and fetch build file
  req.$session.load().then(function() {
    switch (req.$session.activeTarget) {
      case 'tinyarcade':
        return res.type('application/octet-stream').download(req.$session.builddir+'/.pioenvs/tinyarcade/firmware.bin', 'build.bin');

      default:
        res.type('application/octet-stream').download(require('path').join(CFG.ROOT_DIR, '../clouduboy-platforms/lib/Arduboy-1.1.1/test/.pioenvs/leonardo/firmware.hex'));
    }
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err);
    res.sendStatus(500);
  });
}


function flash_get(req, res) {
  // Session not specified or invalid session
  if (!req.$session) {
    return res.sendStatus(500).end();
  }

  // Load session & see if flashing has been requested
  req.$session.load().then(function() {
    // No flashing requested
    if (!req.$session.flash) {
      return res.sendStatus(204).end();

    // Flashing was requested: clear the flag & return the binary
    } else {
      return req.$session.set({ flash: false }).then(function() {
        res.type('application/octet-stream').download(req.$session.builddir+'/.pioenvs/leonardo/firmware.hex', 'build.hex');
      });
    }
  })

  // Error or session does not exist
  .catch(function(err) {
    console.log("Request failed: ", err);
    res.sendStatus(404).end();
  });
}


function flash_post(req, res) {
  // Load session & set flashing to true
  req.$session.load().then(function() {
    return req.$session.set({ flash: true });

  // Flashing requested
  }).then(function() {
    res.send('Ok');
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err);
    res.sendStatus(500);
  });
}
