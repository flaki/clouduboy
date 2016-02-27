'use strict';

module.exports = {
  all: all,

  // Sprite editor
  painter: { all: painter_all }
};


// Dependencies
const CFG = require('../cfg.js');


function all(req, res) {
  const DIST = req.query.dist || CFG.DIST;
  const editor = CFG.WEB_DIR + (DIST ? '/dist': '') + '/editor.html';

  // If [dist] version requested modify the editor.html to point to [dist] sources
  if (DIST) {
    let html = require('fs').readFileSync(editor).toString();

    // Add Fetch API polyfill
    html = html.replace(/<\/head>/g, '<script src="/dist/lib/fetch.js"></script></head>');

    // TODO: move all this to a build step?

    return res.send(html);
  }

  res.sendFile(editor);
}


// Sprite editor (painter)
function painter_all(req, res) {
  const DIST = req.query.dist || CFG.DIST;
  const editor = CFG.WEB_DIR + (DIST ? '/dist': '') + '/painter-window.html';

  // If [dist] version requested modify the editor.html to point to [dist] sources
  if (DIST) {
    let html = require('fs').readFileSync(editor).toString();

    // Add Fetch API polyfill
    html = html.replace(/<\/head>/g, '<script src="/dist/lib/fetch.js"></script></head>');

    // TODO: move all this to a build step?

    return res.send(html);
  }

  res.sendFile(editor);
}
