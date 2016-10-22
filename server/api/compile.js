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
    let source = require('fs').readFileSync( path.join(builddir, 'src', sourceFile) );

    req.$session.compiledFile = sourceFile.replace('.js','.arduboy.ino');
    let outFile = path.join(builddir, 'editor', req.$session.compiledFile);

    let game = microCanvasBuild('arduboy', source, req.$session.activeFile);
    require('fs').writeFileSync( outFile, game.ino);
    console.log(outFile, game.ino);

    // Copy build sources
//    let build = new Build(req.$session);
//    let buildSources = Build.sources( CFG.ROOT_DIR+'/'+source.src );
    return outFile;
  })

  // Rebuild project
  .then(function(outfile) {
    console.log('Compilation finished: ', req.$session.compiledFile);
    console.log('Building project...');

    const log = function(msg, value, ret) { console.log(msg, value); return ret; };

    let builder = new Build(req.$session)
    let r = builder.from(outfile)
      .then(builder.build.bind(builder))
      .then(
        build => log('Successful build: ', build, build),
        err => log('Failed build: ', err, null)
      );

    return r;
  })

  // Build finished
  .then(function(build) {
    console.log('Build finished: ', req.$session.builddir+'/src/build.json');
    fs.writeFileSync(req.$session.builddir+'/src/build.json', build);

    // TODO: at this point this should just redirect to GET /edit/<buildfile>

    //res.type('text/x-arduino').download(req.$session.builddir+'/src/'+req.$session.buildfile, req.$session.buildfile);
    res.type('text/plain').sendFile(req.$session.builddir+'/src/'+req.$session.compiledFile);
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

/*
const Formidable = require('formidable');

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

// Write file changes
.then(function(fd) {
  let files = Build.files(req.$session.builddir, req.$session.buildfile);

  fd.fields.updated.forEach(f) {
    let filename = f.id;

    // No such file exists in the current source
    if (!filename || files.indexOf(filename)===-1) {
      console.log('No such file %s', filename);
      return res.sendStatus(403);
    };

    // write file
    FS.writeFileSync(req.$session.builddir+'/src/'+filename, fd.fields.code);

  }
  let filename = fd.fields.filename || req.$session.buildfile;
  let files = Build.files(req.$session.builddir, req.$session.buildfile);

  // No such file exists in the current source
  if (!filename || files.indexOf(filename)===-1) {
    return res.sendStatus(403);
  };

  // write file
  FS.writeFileSync(req.$session.builddir+'/src/'+filename, fd.fields.code);
  // TODO: also, make this async
})
*/
