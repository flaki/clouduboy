'use strict';

module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js');

const Session = require('../session.js');
const Build = require('../build.js');

const DEFAULT_TEMPLATE = CFG.SOURCE_LIST[0];
const DEFAULT_ARDUBOY = CFG.ARDUBOY_LIBS[0];


function all(req, res) {
  // TODO: create intro page (source/template selector)
  // TODO: handle template selection in POST/formdata
  console.log('New session...');

  // Create new session and redirect
  Session.create().then(function(session) {
    req.$session = session;

    Session.log('Created: ', req.$session);

    // Initialize build sources
    let build = new Build(req.$session);

    // Initialize build sources (async)
    return build.init(
      DEFAULT_TEMPLATE.id,
      Build.sources(CFG.ROOT_DIR+'/'+DEFAULT_TEMPLATE.src),
      DEFAULT_ARDUBOY //TODO: selection UI & setting for Arduboy lib version
    );

  // Save build info into the session
  }).then(function(build) {

    // Build source/file for the session
    return req.$session.set({
      builddir: build.dir,
      buildfile: build.ino
    });

  // Redirect to the editor
  }).then(function() {
    res
      .cookie('session', req.$session.tag)
      .redirect('/editor/'+req.$session.tag);

  // Session creation error
  }).catch(function(err) {
    Session.log('[!] Failed to create session! ', err.stack);

    res.send('Cannot create session: '+err.toString()).sendStatus(500);
  });
}
