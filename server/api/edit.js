'use strict';

/* Load new template/document source for editing
*/
module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js');

const Build = require('../build.js');
const path = require('path');


function all(req, res) {
  // Load session and check supplied filename in request params
  req.$session.load().then(function() {
    // :file param defaults to session.buildfile
    let newfile = req.params.file || req.$session.activeFile;
    let files = Build.files(req.$session.builddir, req.$session.buildfile);

    // No such file exists in the current source
    if (!newfile || files.indexOf(newfile)===-1) {
      return res.sendStatus(403);
    };

    req.$session.activeFile = newfile;

    return req.$session.save().then(function() {
      console.log('Switched to: ', newfile);

      if (newfile.match(/\.ino$/)) res.type('text/x-arduino; charset=utf-8');
      res.download( path.join( req.$session.builddir, 'editor', newfile), newfile);
    });
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err);
    res.sendStatus(500);
  });
}
