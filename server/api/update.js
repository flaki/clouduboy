'use strict';

/* Save edited document data and rebuild project
*/
module.exports = {
  all: [ require('body-parser').json(), post ]
};


// Dependencies
const CFG = require('../cfg.js');

const Build = require('../build.js');
const FS = require('fs'); // TODO: make this fs-extra or fs-promise
const path = require('path');

function post(req, res) {
  // Load session data
  req.$session.load()

  // Write file changes
  .then(function() {
    let updates = Object.keys(req.body.fileContents)
    let files = Build.files(req.$session.builddir, req.$session.activeFile);

    updates.forEach(filename => {
      // No such file exists in the current source
      if (!filename || files.indexOf(filename)===-1) {
        return res.sendStatus(403);
      };

      // write file
      const outFile = path.join(req.$session.builddir, 'editor', filename)
      FS.writeFileSync(outFile, req.body.fileContents[filename]) // TODO: make async
    })

    // Configure build process
    // TODO: break of lint & build processes
    const builder = new Build(req.$session)

    const buildFile = path.join(req.$session.builddir, 'editor', req.$session.buildFile)
    return builder.from(buildFile)
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
