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
    res.type('application/octet-stream').download(req.$session.builddir+'/.pioenvs/leonardo/firmware.hex', 'build.hex');
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err);
    res.sendStatus(500);
  });
}


function flash_get(req, res) {
  // Load session & see if flashing has been requested
  if (req.$session) req.$session.load().then(function() {
    // No flashing requested
    if (!req.$session.flash) {
      return res.sendStatus(204);

    // Flashing was requested: clear the flag & return the binary
    } else {
      return req.$session.set({ flash: false }).then(function() {
        res.type('application/octet-stream').download(req.$session.builddir+'/.pioenvs/leonardo/firmware.hex', 'build.hex');
      });
    }
  // Failed
  }).catch(error500.bind(res));
}


function flash_post(req, res) {
  // Load session & set flashing to true
  req.$session.load().then(function() {
    return req.$session.set({ flash: true });

  // Flashing requested
  }).then(function() {
    res.send('Ok');

  // Failed
  }).catch(error500.bind(res));
}
