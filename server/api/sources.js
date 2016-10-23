'use strict';

module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js');


function all(req, res) {
  req.$session.load().then(function() {
    res.json({
     sources: CFG.SOURCE_LIST,
     groups: CFG.SOURCE_GROUPS,
     libs: CFG.ARDUBOY_LIBS,
     activeTemplate: req.$session.activeTemplate
   });
 });
}
