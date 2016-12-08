'use strict';

/* Short link support (requires SHORT_LINK_HOST to be set in config.json)
*/


// Dependencies
const CFG = require('./cfg.js');

const Express = require('express');
const ExpressVhost = require('vhost');


// Auto-init on require
module.exports = init();



// Create a virtual host that will redirect incoming requests to the editor
function init() {
  let slh = Express();


  // Find session id if supplied
  slh.param('sid', function(req, res, next, sid) {
    // Splendid Fox demo
    if (sid === 'firefox') res.redirect('http://'+CFG.SERVER_HOST+'/templates/splendidfox/');

    // Check if a valid sid
    // TODO: more thorough checks
    if (!sid.match(/^\w+\-\w+\-\w+$/)) return next();

    // Redirect to editor
    res.redirect('http://'+CFG.SERVER_HOST+'/'+sid+'/editor');

    console.log("Shortlink: ", sid);
  });


  // Redirect session id-requests to the editor (handled by param)
  slh.get('/:sid', () => {});

  // All other requests redirect to main page
  slh.get('*', (req, res) => {
    res.redirect('http://'+CFG.SERVER_HOST+'/');
  });


  // Create vhost
  return ExpressVhost(CFG.SHORT_LINK_HOST, slh);
}
