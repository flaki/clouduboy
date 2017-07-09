'use strict'

module.exports = {
  all: all
};

//
const fs = require('fs')
const path = require('path')

const scss = require("node-sass")

// Dependencies
const CFG = require('../cfg.js')


function all(req, res) {
  let output = '', imports = []
  let target = req.query.q

  if (target) {
    target.split(',').forEach(entry => {
      const styles = scss.renderSync({ file: path.join(CFG.WEB_DIR, 'style', entry+'.scss') })
      console.log(styles)

      // All @import-s need to be hoisted
      let css = styles.css.toString()

      css.replace(/@import\s[^\n]+\n/g, m => imports.push(m)||'')

      output += `/*~> ${entry} */\n` + styles.css.toString().trim() + '\n\n'
    })

  } else {
    target = '[!] no target specified!'
  }

  console.log(imports)

  res.type('text/css').send(
    '/*~> q = '+target+' */\n\n'
    + (imports.length > 0 ? imports.join('') +'\n' : '')
    + output
  )
}
