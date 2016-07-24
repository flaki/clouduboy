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
const ROOTDIR = path.normalize(__dirname+'/..');

// Platformio build result regexes
const RX_BUILD_PROGMEM = /Program:\s*(\d+) bytes \(([\d\.]+)\%/;
const RX_BUILD_DATAMEM = /Data:\s*(\d+) bytes \(([\d\.]+)\%/;



// Initialize build directory
function init(src, sources, aboylib) {
  const sessionid = this.session.strid, builder = this;

  // Build root for current session
  const BUILDDIR = CFG.BUILD_DIR + '/src/'+sessionid;


  // Make sure session dir exists, but clean any contents
  return fs.emptyDir(BUILDDIR)

    // "src" directory for sources
    .then( function() {
      return fs.ensureDir(BUILDDIR+'/src'); })

    // copy sources to src
    .then( function() {
       return Promise.all(sources.map(function(src) {
         return fs.copy( src, BUILDDIR+'/src/'+path.basename(src) );
       }));
    })

    // "lib" directory for extra libraries
    .then( function() {
      return fs.ensureDir(BUILDDIR+'/lib'); })

    // link arduboy lib if needed
    .then(function() {
      if (aboylib) {
        // No symlinking on Windows, just copy the thing
        if (require('os').platform() === 'win32') {
          return require('fs-promise').copy(ROOTDIR+'/build/lib/'+aboylib, BUILDDIR+'/lib/Arduboy');          
        }

        return fs.symlink(ROOTDIR+'/build/lib/'+aboylib, BUILDDIR+'/lib/Arduboy');
      }
    })

    // create platformio.ini
    .then(function() {
      return fs.writeFile(BUILDDIR+'/platformio.ini', fs.readFileSync(ROOTDIR+'/build/platformio.ini'));
    })

    // Builder object initialized
    .then(function() {
      // Source/template identifier
      builder.src = src;

      // Build directory
      builder.dir = BUILDDIR;

      // Main source (arduino .ino file)
      builder.ino = path.basename(
        sources.filter(function (file) {
          return file.match(/\.ino$/);
        })[0]
      );

      // Build sources & other parameters
      builder.sources = sources;
      builder.arduboy = aboylib;

      return builder;
    })

    // Something went south :(
    .catch(function(err) {
      console.log('oops...', err);
      throw err;
    });
}


function build() {
  const BUILDDIR = this.dir, builder = this;

//  Program:   10232 bytes (31.2% Full)
//  (.text + .data + .bootloader)

//  Data:       1275 bytes (49.8% Full)
//  (.data + .bss + .noinit)

  return exec('platformio run -d "' + BUILDDIR + '" --disable-auto-clean')
    .catch(function (failed) {
      console.log('Build failed with code '+ failed.code +': ', failed.stderr)
      return failed;

    }).then(function (result) {
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
        let rx = /([\w\/]+\.(?:ino|h|c|cpp))\:(\d+)\:(\d+)\:\s*(.*)/g

        let e = null;
        while ((e = rx.exec(r.error)) !== null) {
          if (!r.compiler[ e[1] ]) r.compiler[ e[1] ]= [];

          r.compiler[ e[1] ].push({
            line: e[2],
            col: e[3],
            msg: e[4]
          });
        }
      }

      // Store last result on the build object
      builder.lastresult = r;

      return r;
    })
    .catch(function (err) {
      console.log('Build error in exec: ', err);
      throw(err);
    });
}


// List relevant source files in a directory
function listSources(p) {
  let dir = path.dirname(p);

  // List all source files in source directory
  return fs.readdirSync(dir).filter(function(f) {
    return f.match(/\.(ino|h|c|cpp)$/);

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
    builddir+'/src/'+buildfile
  ).map((p) => path.basename(p));
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

Builder.sources = listSources;
Builder.files = listFiles;

module.exports = Builder;
