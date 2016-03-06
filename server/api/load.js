'use strict';

/* Load new template/document source for editing
*/
module.exports = {
  all: [ require('body-parser').json(), all ]
};


// Dependencies
const CFG = require('../cfg.js');

const Build = require('../build.js');

const DEFAULT_ARDUBOY = CFG.ARDUBOY_LIBS[0];


function all(req, res) {
  let template, arduboyLib;

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
    arduboyLib = req.body && req.body.lib;

    // Unknown Arduboy lib version was requested, just use default
    if (!arduboyLib && CFG.ARDUBOY_LIBS.indexOf(arduboyLib) === -1) {
      arduboyLib = DEFAULT_ARDUBOY;
    }


    // Copy build sources
    let build = new Build(req.$session);
    let buildSources = Build.sources( CFG.ROOT_DIR+'/'+source.src );

    return build.init(
      template,
      buildSources,
      arduboyLib //TODO: selection UI & setting for Arduboy lib version
    )
  })

  // Update buildfile in session data
  .then(function(build) {
    return req.$session.set({
      buildfile: build.ino,
      activeTemplate: build.src
    });
  })

  // Finished!
  .then(function() {
    console.log('Loaded new template: ', template, arduboyLib);

    // TODO: at this point this should just redirect to GET /edit/<buildfile>

    res.type('text/x-arduino').download(req.$session.builddir+'/src/'+req.$session.buildfile, req.$session.buildFile);
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err);
    res.sendStatus(500);
  });
}
