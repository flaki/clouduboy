'use strict';

const fs = require('fs')
const path = require('path')
const tar = require('tar')
const jsonfile = require('jsonfile')

const configFile = path.join(__dirname, '../config.json')
const exampleFile = path.join(__dirname, '../examples.tar.gz')
const bitmapFile = path.join(__dirname, '../bitmaps.tar.gz')

const TEMPLATES_DIR = path.join(__dirname, '../templates')
const BITMAPS_DIR = path.join(__dirname, '../bitmaps')


// Config file already exists, no need to reconfigure
if (fs.existsSync(configFile)) throw new Error('[!] config.json already exists!');


// config.json defaults
let CFG = {
  SERVER_HOST: 'localhost',
  SERVER_PORT: 8080,

  // Disable short links
  SHORT_LINK_HOST: null,

  // Disable beta limitations
  BETA_KEYS: null,
}


// standard built-in device targets
// TODO: query from build server)
Object.assign(CFG, {
  'TARGETS': [
    {
      id: 'arduboy',
      name: 'Arduboy'
    },
    {
      id: 'tiny_arcade',
      name: 'Tiny Arcade'
    }
  ]
});

// https://github.com/Arduboy/Arduboy/archive/1.1.1.tar.gz
// TODO: deprecate/rethink this, or query build server
Object.assign(CFG, {
  'ARDUBOY_LIBS': [ 'Arduboy-1.1.1' ]
})


// TEMPLATES (MICROCANVAS EXAMPLES)

// if for some reason the templates directory doesn't exist, create it
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR)
}

// if there are no templates, extract and include built-in examples
// by default there are two files (.gitignore, README.md) in there
if (fs.readdirSync(TEMPLATES_DIR).length < 3) {
  console.log(' - extracting MicroCanvas examples...')

  // TODO: maybe fetch these from a server? or just include them in the repo
  tar.x({
    sync: true, gzip: true,
    cwd: TEMPLATES_DIR, strip: 1,
    file: exampleFile
  })
}

// enumerate templates
let r = fs.readdirSync(TEMPLATES_DIR)
// TODO: figure out metadata and sorting
let examples = r.filter(dir => dir[0] !== '.' && dir !== 'README.md').map(d => {
  return ({
    id: 'examples/'+d,
    src: `${d}/${d}.js`,
    title: d.split('-').map(w => w[0].toUpperCase()+w.substring(1)).join(' '),
    group: 'examples'
  })
})

// there is just one group by default
Object.assign(CFG, {
  'SOURCE_GROUPS': [ { id: 'examples', title: 'Examples' } ],
  'SOURCE_LIST': examples,
})


// BITMAPS (PIF - PIXELSPRITE EXAMPLES)

// if for some reason the templates directory doesn't exist, create it
if (!fs.existsSync(BITMAPS_DIR)) {
  fs.mkdirSync(BITMAPS_DIR)
}

// if there are no examples, extract and include built-in examples
// by default there are two files (.gitignore, README.md) in there
if (fs.readdirSync(BITMAPS_DIR).length < 3) {
  console.log(' - extracting PIF bitmap examples...')

  // TODO: maybe fetch these from a server? or just include them in the repo
  tar.x({
    sync: true, gzip: true,
    cwd: BITMAPS_DIR, strip: 1,
    file: bitmapFile
  })
}


jsonfile.writeFileSync(configFile, CFG, { spaces: 2 })
// DEBUG: console.log(require('fs').readFileSync(configFile).toString())
console.log('config.json created in application root')

module.exports = CFG;
