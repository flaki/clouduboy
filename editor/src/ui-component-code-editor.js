let cmElement = 'codeeditor'
let cmOptions = {
  // theme: "night",
  theme: "neat",
  tabsize: 2,
  lineNumbers: true,
  lineWrapping: true,
}


// Use CodeMirror for editing
export let editor;

// Init component
export function init(config) {
  // CodeMirror element ID
  if (config.cmElement) {
    cmElement = config.cmElement
  }

  // If CodeMirror options are specified, they override the defaults
  if (config.cmOptions) {
    Object.assign(cmOptions, config.cmOptions)
  }

  // Set up CodeMirror on the editor element
  CodeMirror.fromTextArea(
    document.getElementById(cmElement),
    cmOptions
  )

  // Ensure we also recognize .ino files as C sources
  CodeMirror.mimeModes['text/x-arduino'] = CodeMirror.mimeModes['text/x-c++src']
}
