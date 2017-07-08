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
<button name="toggle-fullscreen"><svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg">
<g>
  <rect height="1" width="1" x="2" y="0" />
  <rect height="1" width="1" x="3" y="0" />
  <rect height="1" width="1" x="4" y="0" />
  <rect height="1" width="1" x="4" y="1" />
  <rect height="1" width="1" x="4" y="2" />

  <rect height="1" width="1" x="0" y="2" />
  <rect height="1" width="1" x="0" y="3" />
  <rect height="1" width="1" x="0" y="4" />
  <rect height="1" width="1" x="1" y="4" />
  <rect height="1" width="1" x="2" y="4" />
</g>
</svg></button>
<button name="close"><svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg">
<g>
  <rect height="1" width="1" y="2" x="2" />

  <rect height="1" width="1" y="0" x="0" />
  <rect height="1" width="1" y="1" x="1" />
  <rect height="1" width="1" y="3" x="3" />
  <rect height="1" width="1" y="4" x="4" />

  <rect height="1" width="1" y="4" x="0" />
  <rect height="1" width="1" y="3" x="1" />
  <rect height="1" width="1" y="1" x="3" />
  <rect height="1" width="1" y="0" x="4" />
</g>
</svg></button>
<script>
// Wait until scripts are loaded
setTimeout(function() {
  if (window.ClouduboyMessage) {
    document.querySelector('button[name=toggle-fullscreen]').addEventListener('click', e => {
      ClouduboyMessage('command', 'toggle-fullscreen')
    })
    document.querySelector('button[name=close]').addEventListener('click', e => {
      ClouduboyMessage('command', 'close')
    })
  }
},1)
</script>
</body>
    `)

    // Fix body
    contents = contents.replace('</body>', `
<script src="/js/interframe.js"></script>
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
