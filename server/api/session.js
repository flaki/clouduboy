'use strict';

module.exports = {
  generate: { all: generate_all }
};


// Dependencies
const CFG = require('../cfg.js');

const Session = require('../session.js');


function generate_all(req, res) {
  // Create new session and redirect
  Session.availableSession().then(function(sid) {
      setTimeout(function() {
        // Return as array of the three words
        res.json( Session.stringifySid(sid, true) );
        // TODO: reserve these sid-s for a short period
      }, 500);

  // Session creation error
  }).catch(function(err) {
    Session.log('[!] Failed to generate session! ', err.stack);

    res.send('Cannot generate session: '+err.toString()).sendStatus(500);
  });
}
