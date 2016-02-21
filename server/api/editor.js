'use strict';

module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js');


function all(req, res) {
  res.sendFile(CFG.WEB_DIR + '/editor.html');
}
