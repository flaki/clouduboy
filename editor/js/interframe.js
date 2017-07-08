(function() {
  'use strict'

  const SRC = 'microcanvas_preview'
  window.addEventListener('keypress', e => {
    let msg = {
      source: SRC,
      type: 'keypress',
      value: e.key,
    }

    if (window.parent) {
      window.parent.postMessage(msg, '*')
      console.log(msg)
    }
  })

  window.ClouduboyMessage = function(type, value) {
    let msg = {
      source: SRC,
      type: type,
      value: value,
    }

    if (window.parent) {
      window.parent.postMessage(msg, '*')
      console.log(msg)
    }
  }
})()
