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
  // Load session and check supplied filename in request params
  req.$session.load().then(function() {
    // :file param defaults to session.buildfile
    // TODO: create an "editedfile" active file entry and use that
    let newfile = req.params.file || req.$session.buildfile;
    let files = Build.files(req.$session.builddir, req.$session.buildfile);

    // No such file exists in the current source
    if (!newfile || files.indexOf(newfile)===-1) {
      return res.sendStatus(403);
    };

    console.log('Switching to: ', newfile);
    res.type('text/plain').download(req.$session.builddir+'/src/'+newfile, newfile);
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err);
    res.sendStatus(500);
  });
}
