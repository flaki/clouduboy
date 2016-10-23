'use strict';

/* Load new template/document source for editing
*/
module.exports = {
  all: [ require('body-parser').json(), all ]
};


// Dependencies
const CFG = require('../cfg.js');

const Build = require('../build.js');

// Asynchronous filesystem operations
const fs = require('fs-promise'),
      path = require('path'),
      exec = require('child-process-promise').exec;


const DEFAULT_ARDUBOY = CFG.ARDUBOY_LIBS[0];


function all(req, res) {
  let template, arduboyLib;
  let builddir;
  const microCanvasBuild = require(CFG.ROOT_DIR+'/microcanvas/build.js');

  req.$session.load().then(function() {
    builddir = path.join( req.$session.builddir );
    let sourceFile = req.$session.activeFile;

    // No compilation needed, active file is already a buildable sourcefile
    if (sourceFile.match(/\.ino$/)) {
      req.$session.compiledFile = void 0;
      req.$session.buildFile = sourceFile;
      return path.join(builddir, 'editor', sourceFile);
    }

    let source = require('fs').readFileSync( path.join(builddir, 'editor', sourceFile) );

    req.$session.compiledFile = sourceFile.replace('.js','.arduboy.ino');
    let outFile = path.join(builddir, 'editor', req.$session.compiledFile);

    let game = microCanvasBuild('arduboy', source, req.$session.activeFile);
    require('fs').writeFileSync( outFile, game.ino);
    console.log(outFile, game.ino);

    console.log('Compilation finished: ', outFile);
    return outFile;
  })

  // Rebuild project
  .then(function(outfile) {
    console.log('Building project...');

    const log = function(msg, value, ret) { console.log(msg, value); return ret; };

    let builder = new Build(req.$session)

    return builder.from(outfile).then(builder.build.bind(builder));
  })

  // Build finished
  .then(function(build) {
    let newfile = req.$session.compiledFile || req.$session.buildFile;

    console.log('Builds successful: ', build);
    res.send(build);
  })

  // Try reflashing
  .then(function() {
    let cmd = 'avrgirl-arduino flash -a leonardo -f "'+ path.join(req.$session.builddir, '.pioenvs/leonardo/firmware.hex').replace(/\\/g,'\\\\') +'"';

    return exec(cmd)
      .catch(function(failed) {
        console.log('Flashing failed with code '+ failed.code +': ', failed.stderr);
        console.log('Flashing command: ', cmd);
        return failed;

      }).then(function(result) {
        console.log('Flashing successful', result);
      });
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err, err.stack);
    res.sendStatus(500);
  });
}
