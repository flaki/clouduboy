'use strict'

module.exports = {
  all: all
};

//
const fs = require('fs')
const path = require('path')

// Dependencies
const CFG = require('../cfg.js')


function all(req, res) {
  req.$session.load().then(_ => {
    // TODO: allow serving templates with this as well (?play=<id>)
    let contents = fs.readFileSync(path.join(CFG.WEB_DIR, 'microcanvas.html')).toString()
    let source = fs.readFileSync(path.join(req.$session.builddir, 'editor', req.$session.activeFile))

    // Buttons
    contents = contents.replace('</body>', `
<aside class="buttons">
<button
  name="toggle-fullscreen"
  data-pif-icon="! ui_expand 5x5
  ..###
  ....#
  #...#
  #....
  ###..
"></button>
<button
  name="close"
  data-pif-icon="! ui_close 5x5
  #...#
  .#.#.
  ..#..
  .#.#.
  #...#
"></button>
<script src="/js/interframe.js"></script>
<script src="/js/microcanvas-preview.js"></script>
<script>
  /* TODO: MicroCanvas sound handling */
  /* TODO: Fit MicroCanvas to current target setup (eg screen dimensions, colors) */
  /* TODO: Maximize/Close buttons */

  /* MicroCanvas game source */
  ${source}
</script>
</body>
    `)

    res.type('text/html').send(contents)
  })

  .catch(err => {
    console.log("Preview failed: ", err)
    res.sendStatus(500).end()
  })
}
