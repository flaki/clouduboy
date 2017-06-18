'use strict';

module.exports = {
  post: [ require('body-parser').urlencoded({ extended: true }), post ],
};


// Dependencies
const CFG = require('../cfg.js');

const path = require('path');

const Session = require('../session.js');
const Build = require('../build.js');

const DEFAULT_TEMPLATE = CFG.SOURCE_LIST[0];
const DEFAULT_ARDUBOY = CFG.ARDUBOY_LIBS[0];


function post(req, res) {
  // TODO: create intro page (source/template selector)
  // TODO: handle template selection in POST/formdata
  let newSID = req.body['new-session-id'];

  console.log('New session...', newSID);

  // Create new session and redirect
  Session.create(newSID).then(function(session) {
    req.$session = session;

    Session.log('Created: ', req.$session);

    // Initialize build sources
    let build = new Build(req.$session);

    // Initialize build sources (async)
    return build.init(
      DEFAULT_TEMPLATE.id,
      path.join(CFG.ROOT_DIR, 'templates', DEFAULT_TEMPLATE.src),
      DEFAULT_ARDUBOY //TODO: selection UI & setting for Arduboy lib version
    );

  // Save build info into the session
  }).then(function(build) {

    // Build source/file for the session
    return req.$session.set({
      builddir: build.dir,

      activeTemplate: build.template,

      buildFile:  build.mainFile,
      activeFile: build.mainFile // TODO: move into Build.init()??
    });

  // Redirect to the editor
  }).then(function() {
    res
      .cookie('session', req.$session.tag)
      .redirect('/'+req.$session.tag+'/editor');

  // Session creation error
  }).catch(function(err) {
    // TODO: handle 'violates unique constraint' case
    // TODO: clean up session id when creation failed

    Session.log('[!] Failed to create session! ', err.stack);

    res.status(500).send('Cannot create session: '+err.message);
  });
}
