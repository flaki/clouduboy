'use strict';

module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js');


function all(req, res) {
  res.send('Clouduboy Cloud Compiler ' + CFG.APP_VERSION);
}
