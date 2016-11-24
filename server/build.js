'use strict';

// Configuration
const CFG = require('./cfg.js');

// Asynchronous filesystem operations
var fs = require('fs-promise');

// Path handling
var path = require('path');

// Used for async execution of platformio
const exec = require('child-process-promise').exec;


// Application root directory
const ROOTDIR = path.join(__dirname, '../');

const PATH_TO_PROJECT_SRC = 'editor/';
const PATH_TO_BUILD_SRC = 'src/';

// Platformio build result regexes
const RX_BUILD_PROGMEM = /Program:\s*(\d+) bytes \(([\d\.]+)\%/;
const RX_BUILD_DATAMEM = /Data:\s*(\d+) bytes \(([\d\.]+)\%/;



// Initialize build directory
function init(src, sources, aboylib) {
  const sessionid = this.session.strid, builder = this;

  // Build root for current session
  const BUILDDIR = path.join( CFG.BUILD_DIR, 'compile/', sessionid, '/');

  const DIR_BUILD_EDITOR = path.join( BUILDDIR, PATH_TO_PROJECT_SRC );
  const DIR_BUILD_SRC = path.join( BUILDDIR, PATH_TO_BUILD_SRC );


  // Make sure session dir exists, but clean any contents
  return fs.emptyDir(BUILDDIR)

    // "src" directory for sources
    .then( function() {
      return Promise.all([
        fs.ensureDir(DIR_BUILD_EDITOR),
        fs.ensureDir(DIR_BUILD_SRC)
      ]);
    })

    // copy sources to src
    .then( function() {
       return Promise.all(sources.map(function(src) {
         return fs.copy( src, path.join(DIR_BUILD_EDITOR, path.basename(src)) );
       }));
    })

    // "lib" directory for extra libraries
    .then( function() {
      // TODO: group these
      return fs.ensureDir( path.join(BUILDDIR, 'lib/') );
    })

    // link arduboy lib if needed
    .then(function() {
      if (aboylib) {
        // No symlinking on Windows, just copy the thing
        if (require('os').platform() === 'win32') {
          return require('fs-promise').copy( path.join(ROOTDIR, 'build/lib/', aboylib), path.join(BUILDDIR, 'lib/Arduboy/') );
        }

        return fs.symlink( path.join(ROOTDIR, 'build/lib/', aboylib), path.join(BUILDDIR, 'lib/Arduboy/') );
      }
    })

    // create platformio.ini
    .then(function() {
      return fs.writeFile( path.join(BUILDDIR, 'platformio.ini'), fs.readFileSync( path.join(ROOTDIR, 'build/platformio.ini') ));
    })

    // Builder object initialized
    .then(function() {
      // Source/template identifier
      builder.src = src; // TODO: deprecated
      builder.template = src;
      builder.templatePath = path.join(ROOTDIR, src);

      // Build directory
      builder.dir = BUILDDIR;

      // Main source (arduino .ino file)
      builder.ino = path.basename(
        sources.filter(function (file) {
          return file.match(/\.ino$/);
        })[0]
      ); // TODO: deprecated
      builder.templateName = path.basename(src);


      // Build sources & other parameters
      builder.sources = sources;
      builder.arduboy = aboylib;

      console.log(builder);
      return builder;
    })

    // Something went south :(
    .catch(function(err) {
      console.log('oops...', err);
      throw err;
    });
}


function build(buildfile) {
  const BUILDDIR = this.dir,
    BUILDFILE = path.basename(this.buildfile || buildfile),
    builder = this;

  //  Program:   10232 bytes (31.2% Full)
  //  (.text + .data + .bootloader)

  //  Data:       1275 bytes (49.8% Full)
  //  (.data + .bss + .noinit)

  let cmd = 'platformio run --disable-auto-clean --project-dir "' + path.normalize(BUILDDIR).replace(/\\/g,'\\\\') + '"';

  return exec(cmd)
    .catch(function(failed) {
      console.log('Build failed with code '+ failed.code +': ', failed.stderr);
      console.log('Build command: ', cmd);
      return failed;

    }).then(function(result) {
      let r = {
        stdout: result.stdout,
        stderr: result.stderr,
        memory: {}
      };

      console.log('stdout: ', result.stdout);
      console.log('stderr: ', result.stderr);

      if (result.stdout) {
        let mem;

        // Parse used Program memory
        if (mem = result.stdout.match(RX_BUILD_PROGMEM)) {
          r.memory.program = {
            bytes: parseInt(mem[1],10),
            used: parseFloat(mem[2])/100,
          };
        }

        // Parse used Data memory
        if (mem = result.stdout.match(RX_BUILD_DATAMEM)) {
          r.memory.data = {
            bytes: parseInt(mem[1],10),
            used: parseFloat(mem[2])/100,
          };
        }
      }

      if (result.stderr) {
        r.error = result.stderr;
        r.compiler = {};

        // Find compile errors/warnings
        let rx = /([\w\.]+\.(?:ino|h|c|cpp))\:(?:(?:\sIn\s(\w+\s\'(?:[^\n]+)\'):)|(?:(\d+)\:(\d+)\:\s(\w+)\:\s*(.*)))/g

        let e = null, inFile, inFunc;
        while ((e = rx.exec(r.error)) !== null) {
          if (!r.compiler[ e[1] ]) r.compiler[ e[1] ]= [];

          // 'in function' prefixes
          if (e[2]) {
            inFile = e[1];
            inFunc = e[2];

          // 'declared here' suffixes
          } else if (e[5] === 'note' && e[6] === 'declared here') {
            r.compiler[ e[1] ][ r.compiler[ e[1] ].length-1 ].declared = {
              line: e[3],
              col: e[4],
            };

          } else {
            r.compiler[ e[1] ].push({
              line: e[3],
              col: e[4],
              type: e[5],
              msg: e[6],
              in: inFunc
            });
          }
        }
      }

      // Store last result on the build object
      return builder.lastresult = r;
    })

    // Copy compiled hex to the build directory
    .then(function(r) {
      if (!r.error) {
        r.lastbuild = BUILDFILE.replace('.ino','.hex');

        return fs.copy(
          path.join( BUILDDIR, '/.pioenvs/leonardo/firmware.hex' ),
          path.join( BUILDDIR, '/'+ r.lastbuild ),
          { clobber: true }
        );
      }
    })

    // Return build result
    .then(function() {
      return builder.lastresult;
    })
    .catch(function(err) {
      console.log('Build error in exec: ', err);
      throw(err);
    });
}


// List relevant source files in a directory
function listSources(p) {
  let dir = path.dirname(p);

  // List all source files in source directory
  return fs.readdirSync(dir).filter(function(f) {
    return f.match(/\.(ino|h|c|cpp|js)$/);

  // Create absolute paths
  }).map(function(f) {
    return dir + '/'+ f;
  });
}

// List files in current build
function listFiles(builddir, buildfile) { // TODO: we don't really need buildfile
  // Make sure we have an initialized session
  if (!builddir || !buildfile) return [];

  // List files
  return listSources(
    path.join( builddir, PATH_TO_PROJECT_SRC, buildfile)
  ).map((p) => path.basename(p));
}

// Clean build dir and prep build with file presented here
function createFrom(sourceFile) {
  const sessionid = this.session.strid, builder = this;

  // Build root for current session
  const BUILDDIR = path.join( CFG.BUILD_DIR, 'compile/', sessionid, '/');

  const DIR_BUILD_EDITOR = path.join( BUILDDIR, PATH_TO_PROJECT_SRC );
  const DIR_BUILD_SRC = path.join( BUILDDIR, PATH_TO_BUILD_SRC );

  console.log('Empty ', DIR_BUILD_SRC, ' & copy ', sourceFile, ' into it.');

  const buildFile = path.join( DIR_BUILD_SRC, path.basename(sourceFile) );

  return fs.emptyDir(DIR_BUILD_SRC)
    .then(_ => fs.copy(
        sourceFile, buildFile
      )
    ).then(_ => buildFile);
}


// Builder object
function Builder(session) {
  this.session = session;

  // Retrieve build dir from session if there is one
  this.dir = session.builddir;
}

Builder.prototype = Object.create(null);
  Builder.prototype.init = init;
  Builder.prototype.build = build;
  Builder.prototype.from = createFrom;

Builder.sources = listSources;
Builder.files = listFiles;

module.exports = Builder;
