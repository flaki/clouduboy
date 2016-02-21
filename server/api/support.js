'use strict';

module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js');


function all(req, res) {
  res.redirect(CFG.SUPPORT_URL);
}
