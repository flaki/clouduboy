'use strict';

/* Save edited document data and rebuild project
*/
module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js');

const Build = require('../build.js');
const Formidable = require('formidable');
const FS = require('fs'); // TODO: make this fs-extra or fs-promise


function all(req, res) {
  let fd;

  // parse a file upload
  (new Promise(function(resolve, reject) {
    var form = new Formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      // Rejected with an error
      if (err) return reject(err);

      resolve({
        fields: fields,
        files: files
      });
    });
  }))

  // Store formdata
  .then(function(formdata) {
    fd = formdata
  })

  // Load session data
  .then(req.$session.load.bind(req.$session))

  // Write file changes
  .then(function() {
    let filename = fd.fields.filename || req.$session.buildfile;
    let files = Build.files(req.$session.builddir, req.$session.buildfile);

    // No such file exists in the current source
    if (!filename || files.indexOf(filename)===-1) {
      return res.sendStatus(403);
    };

    // write file
    // TODO: cleanup
    filename = filename.replace('.ino', '.arduboy.ino');
    FS.writeFileSync(req.$session.builddir+'/src/'+filename, fd.fields.code);
    // TODO: also, make this async
  })

  // Rebuild project
  .then(function() {
    return new Build(req.$session).build();
  })

  // Return build results as a JSON
  .then(res.json.bind(res))

  // Something went wrong
  .catch(function(e) {
    console.error('Failed to build: ', e);

    res.json({
      'error': e.toString()
    });
  });
}
