'use strict';

/* Load new template/document source for editing
*/
module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js');

const Build = require('../build.js');


function all(req, res) {
  req.$session.load().then(function() {
    res.json({
      files: Build.files(req.$session.builddir, req.$session.buildfile),
      activeFile: req.$session.activeFile
    });
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err);
    res.sendStatus(500);
  });
}
