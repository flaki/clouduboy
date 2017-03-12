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
const path = require('path');

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
    let filename = fd.fields.filename || req.$session.activeFile;
    let files = Build.files(req.$session.builddir, req.$session.activeFile);

    // No such file exists in the current source
    if (!filename || files.indexOf(filename)===-1) {
      return res.sendStatus(403);
    };

    // write file
    const outFile = path.join(req.$session.builddir, 'editor', filename)
    FS.writeFileSync(outFile, fd.fields.code)
    // TODO: also, make this async

    // Configure build process
    const builder = new Build(req.$session)

    return builder.from(outFile)
  })

  // Rebuild project
  .then( builder => builder.build() )

  // Return build results as a JSON
  .then(builder => res.json(builder.lastresult) )

  // Something went wrong
  .catch(function(e) {
    console.error('Failed to build: ', e.stack||e);

    res.json({
      'error': e.stack||e.toString()
    });
  });
}
