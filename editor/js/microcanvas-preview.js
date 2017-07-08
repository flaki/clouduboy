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

  Array.from(document.querySelectorAll('[data-pif-icon]')).forEach(element => {
    element.insertAdjacentHTML('beforeend', (new PixelData(element.dataset.pifIcon).svg()))
  })
},1)
