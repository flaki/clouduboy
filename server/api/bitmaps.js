'use strict';

module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js')

const fs = require('fs-extra')
const path = require('path')



function all(req, res) {
  // List contents of the bitmaps folder
  fs.readdir(CFG.BITMAPS_DIR).then(d => {
    // List .pif files only
    d = d.filter(f => f.match(/\.pif$/))

    // Build result object from file contents
    const result = {}
    const buildResult = d.map(file => {
      return fs.readFile(path.join('./bitmaps', file)).then(contents => {
        result[file] = contents.toString()
      }).catch(err => console.log(err))
    })

    // Once all images are loaded return them as a single JSON
    Promise.all(buildResult).then(_ => {
      //fs.writeFileSync(path.join('./editor/dist', 'bitmaps.json'), JSON.stringify(result, null, 2))
      res.json(result)
    })
  })

}
