'use strict';

/* Load new template/document source for editing
*/
module.exports = {
  all: [ require('body-parser').json(), all ]
};


// Dependencies
const CFG = require('../cfg.js');

const Build = require('../build.js');

const path = require('path');

const DEFAULT_ARDUBOY = CFG.ARDUBOY_LIBS[0];


function all(req, res) {
  let template, arduboyLib;
  let builddir;

  req.$session.load().then(function() {
    // Check for posted template source existence
    template = req.body && req.body.load;
    let source = template && CFG.SOURCE_LIST.find(i => i.id===template);

    // No source or invalid source file requested
    if (!source) {
      return res.sendStatus(403);
    };


    // Arduboy Library version used (based on selected target)
    if (req.$session.activeTarget) {
      let target = req.$session.activeTarget;
      let targetIdx = CFG.TARGETS.findIndex(t => t.id===target);

      if (targetIdx > -1) {
        arduboyLib = CFG.TARGETS[targetIdx].libs[0];
        console.log('Inited with target ', target, arduboyLib);
      }
    }

    // Override Library version
    if (req.body && req.body.lib) {
      arduboyLib = req.body.lib;
    }

    // Unknown Arduboy lib version was requested, just use default
    if (!arduboyLib && CFG.ARDUBOY_LIBS.indexOf(arduboyLib) === -1) {
      arduboyLib = DEFAULT_ARDUBOY;
    }


    // Copy build source
    let build = new Build(req.$session);
    let buildSources = Build.sources( path.join( CFG.TEMPLATES_DIR, source.src) );
    console.log('New Build Sources: ', buildSources);

    return build.init(
      template,
      path.join(CFG.TEMPLATES_DIR, source.src),
      arduboyLib //TODO: selection UI & setting for Arduboy lib version
    )
  })

  // Update buildfile in session data
  .then(function(build) {
    return req.$session.set({
      builddir: build.dir,

      activeTemplate: build.template,

      buildFile:  build.mainFile,
      activeFile: build.mainFile
    });
  })

  // Finished!
  .then(function() {
    console.log('Loaded new template: ', template, arduboyLib);

    // TODO: at this point this should just redirect to GET /edit/<buildfile>

    //res.type('application/javascript').download( path.join( req.$session.builddir, 'editor', req.$session.buildFile ), req.$session.buildFile);
    // TODO: make this return the main file of the template, designated by SRC in config.json, handle different filetypes
    res.redirect('/edit');
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err.stack||err);
    res.sendStatus(500);
  });
}
