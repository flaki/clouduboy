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
    let html = require('fs').readFileSync(editor).toString();

    // Replace JS includes with dist versions
    html = html.replace(/\/js\//g, '/dist/js/');

    // Add Fetch API polyfill
    html = html.replace(/<\/head>/g, '<script src="/dist/lib/fetch.js"></script></head>');

    // TODO: move all this to a build step?

    return res.send(html);
  }

  res.sendFile(editor);
}
