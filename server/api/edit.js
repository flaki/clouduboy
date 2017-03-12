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
    // :file param defaults to session.activeFile
    let newfile = req.params.file || req.$session.activeFile;
    let files = Build.files(req.$session.builddir);

    // No such file exists in the current source
    if (!newfile || files.indexOf(newfile)===-1) {
      console.log(files)
      return res.status(403).send('[edit] Unknown source file: `'+newfile+'`');
    };

    req.$session.activeFile = newfile;

    return req.$session.save().then(function() {
      console.log('Switched to: ', newfile);

      if (newfile.match(/\.ino$/)) res.type(CFG.MIME.ARDUINO);
      res.download( path.join( req.$session.builddir, 'editor', newfile), newfile);
    });
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err);
    res.sendStatus(500);
  });
}
