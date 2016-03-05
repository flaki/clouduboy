'use strict';

module.exports = {
  get: beta_get,
  post: [ require('body-parser').urlencoded({ extended: true }), beta_post ],

  check: check
};


// Dependencies
const CFG = require('../cfg.js');

const path = require('path');

const STATIC_EXTS = 'css,js,jpg,png,gif'.split(',').map(ext => '.'+ext);


function check(req, res, next) {
  let betakey = req.cookies.beta;
  let isStaticReq = (STATIC_EXTS.indexOf( path.extname(req.path) ) !== -1);

  // Only in production mode
  if (CFG.DIST) {
    // No or invalid beta key supplied
    if (!betakey || CFG.BETA_KEYS.indexOf(betakey) === -1) {
      // Beta page should be the only one showing up, also allow serving of
      // some of the static assets
      if (req.path === '/beta' || isStaticReq) return next();

      // TODO: research further
      // Temporarily allow also Flasher requests too
      // (Flasher doesn't have UI for beta key input)
      console.log(req.path, req.path.match(/^\/hex\/flash\//));
      if (req.path.match(/^\/hex\/flash\//)) return next();

      // Redirect to beta page
      return res.redirect('/beta');
    }
  }

  next();
}

function beta_get(req, res) {
  res.sendFile(CFG.WEB_DIR+'/beta.html');
}

function beta_post(req, res) {
  // TODO: create intro page (source/template selector)
  // TODO: handle template selection in POST/formdata
  let betakey = req.body['beta-key'];

  console.log('Beta key used: ', betakey);

  // Check if beta key exists.
  // Yes, it's plain text. Deal with it. B)
  if (CFG.BETA_KEYS.indexOf(betakey) === -1) {
    console.log('Invalid beta key: ', betakey);

    return res.status(403).send('Invalid beta key!').end();
  }

  // Save beta key as a cookie and redirect back to site
  res
    .cookie('beta', betakey)
    .redirect('/');
}
