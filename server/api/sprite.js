'use strict';

module.exports = {
  get: get,
  post: [ require('body-parser').json(), post ]
};


// Dependencies
const CFG = require('../cfg.js');


// TODO: move this to $session
let currentSprite = null;


function get(req, res) {
  res.json(currentSprite);
}


function post(req, res) {
  console.log(req.body);

  if (req.body && req.body.sprite) {
    currentSprite = req.body.sprite;
  }

  res.send('Ok');
}
