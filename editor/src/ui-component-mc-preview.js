import * as Events from './editor-events.js'
import * as S from './state.js'


let uiElement = 'button[name="preview"]'

// UI button
let button = null



// Init component
export function init(config) {
  // CodeMirror element ID
  if (config.uiElement) {
    uiElement = config.uiElement
  }

  return initEvents()
}


function initEvents() {
  button = document.querySelector(uiElement)

  // Make sure the UI element exists
  // TODO: maybe create this during init?
  if (!button) {
    return Promise.reject(new Error('Non-existent UI element: '+uiElement))
  }


  document.querySelector('.toolbar button[name="preview"]')
    .addEventListener('click', showPreview);

  window.addEventListener("message", iframeEventHandler, false);

  return Promise.resolve()
}


function showPreview() {
  let i = document.createElement('iframe');
  document.body.appendChild(i);
  i.className = 'preview';
  i.contentWindow.addEventListener('error', function(err) {
    console.log('Script error:', err);

    // TODO: pass in actual source
    let activeFile = document.getElementById("codeeditor-filename").value;

    // Error in active file
    if (err.filename.match(new RegExp(activeFile.replace('.','\\.')))) {
      console.log('Line ', err.lineno, ': ', err.message);
    }
  });
  i.src = '/microcanvas';

  // Put (keyboard) focus on the iframe
  i.contentWindow.focus();
}

function dismissPreview() {
  Array.from( document.querySelectorAll('iframe.preview') ).forEach(iframe => iframe.parentNode.removeChild(iframe));
}

function iframeEventHandler(event) {
  let origin = event.origin || event.originalEvent.origin,
      data = event.data;

  if (origin && data.source === 'microcanvas_preview') {
    if (data.type === 'keypress' && data.value === 'Escape') {
      dismissPreview();
    }
    if (data.type === 'command' && data.value === 'close') {
      dismissPreview();
    }
    if (data.type === 'command' && data.value === 'toggle-fullscreen') {
      document.body.classList.toggle('fullscreen-preview')
    }
  }
}
