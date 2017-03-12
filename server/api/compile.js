'use strict';

/* Load new template/document source for editing
*/
module.exports = {
  info: {
    all: [ require('body-parser').json(), compileInfo ]
  },
  flash: {
    all: [ require('body-parser').json(), flash ]
  },
  convert: {
    all: [ require('body-parser').json(), convert ]
  },
};


// Dependencies
const CFG = require('../cfg.js');

const Build = require('../build.js');

// Asynchronous filesystem operations
const fs = require('fs-promise'),
      path = require('path'),
      exec = require('child-process-promise').exec;


const DEFAULT_ARDUBOY = CFG.ARDUBOY_LIBS[0];


function compile(req) {
  const builddir = req.$session.builddir;
  const sourceFile = req.$session.activeFile;

  // No compilation needed, active file is already a buildable sourcefile
  console.log(sourceFile)
  if (sourceFile.match(/\.ino$/)) {
    return { info: {}, outFile: path.join(builddir, 'editor', sourceFile) }
  }

  // Compile with MicroCanvas builder
  const microCanvasBuild = require(CFG.ROOT_DIR+'/microcanvas/build.js');

  let source = require('fs').readFileSync( path.join(builddir, 'editor', sourceFile) );

  req.$session.fileToBuild = sourceFile.replace('.js','.arduboy.ino');
  let outFile = path.join(builddir, 'editor', req.$session.fileToBuild);

  let game = microCanvasBuild('arduboy', source, req.$session.activeFile);
  require('fs').writeFileSync( outFile, game.ino);
  console.log(outFile, game.ino);

  console.log('Compilation finished: ', outFile);
  return { info: game, outFile: outFile };
}

function compileInfo(req, res) {
  req.$session.load()
    .then(compile.bind(null, req))
    .then(game => res.json({
      session: req.$session,
      compile: game.info
    }))
    .catch(JSONError.bind(res));
}

function convert(req, res) {
  req.$session.load()
    .then(compile.bind(null, req))

    .then(compile => {
      res.json({ result: 'ok', file: {
        filename: path.basename(compile.outFile),
        contentType: CFG.MIME.ARDUINO,
        contents: compile.info.ino
      } })
    })
    .catch(JSONError.bind(res));
}

function flash(req, res) {
  let template, arduboyLib;

  req.$session.load()
    .then(compile.bind(null, req))

    .then(compile => {
      console.log('Building project...');

      // TODO: move builder.from() into the compile() step
      let builder = new Build(req.$session);

      return builder.from(compile.outFile).then(builder.build.bind(builder));
    })

    // Build finished
    .then(builder => {
      //TODO: handle failed build
      console.log('Build successful: ', builder.lastresult);
      res.json({ result: 'ok', build: builder.lastresult });
    })

  // TODO: move to separate process?
  // Try reflashing
  .then(function() {
    let cmd = (
      path.join(CFG.ROOT_DIR, 'node_modules/.bin/avrgirl-arduino')
      + (require('os').platform()==='win32'?'.cmd':'')
      + ' flash'
      + ' -a arduboy'
      + ' -f "'+ path.join(
          req.$session.builddir, '.pioenvs/leonardo/firmware.hex'
        ).replace(/\\/g,'\\\\')
      + '"');

    return exec(cmd)
      .catch(err => {
        const error = `Flashing failed with code ${err.code}: ${err.stderr}`

        console.error('Flashing command: ', cmd)

        return JSONError.call(res,err);
      });
  })

  // Error
  .catch(JSONError.bind(res));
}

function JSONError(err) {
  const error = '[!] Compile Error: ' + (err.stack||err)
  console.log(error)

  // this should be bound to `res` (active response)
  if (this.headersSent) return error

  this.sendStatus(500).json({ result: error})
}
