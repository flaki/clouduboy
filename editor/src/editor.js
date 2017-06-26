import * as API from './api.js'
import * as UI from './ui.js'


// Initialize once
let inited = false

// Main object
export default function Clouduboy() {
  if (!inited) {
    start()
  }

  inited = true
}

// Create instance, initialize & load
function start() {
  // Init components
  return UI.init()

//    .then(_ => load())

    .catch(error => {
      console.log('Failed to initialize: ', error.stack||error);
    });
}
