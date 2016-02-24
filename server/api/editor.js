'use strict';

module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js');


function all(req, res) {
  let editor = CFG.WEB_DIR + '/editor.html';

  // If [dist] version requested modify the editor.html to point to [dist] sources
  if (req.query.dist) {
    return res.send(require('fs').readFileSync(editor).toString().replace(/\/js\//g,'/dist/js/'));
  }

  res.sendFile(editor);
}
