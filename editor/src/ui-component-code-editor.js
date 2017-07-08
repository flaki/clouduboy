import * as Events from './editor-events.js'
import * as S from './state.js'

import * as API from './api.js'


let uiElement = '#codeeditor'
let cmOptions = {
  // theme: "night",
  theme: "neat",
  tabsize: 2,
  lineNumbers: true,
  lineWrapping: true,
}

// Type throttling
let typeDelay = 300


// Use CodeMirror for editing
export let editor;

// Init component
export function init(config) {
  // CodeMirror element ID
  if (config.uiElement) {
    uiElement = config.uiElement
  }

  // CodeMirror element ID
  if (typeof config.typeDelay !== 'undefined') {
    typeDelay = config.typeDelay
  }

  // If CodeMirror options are specified, they override the defaults
  if (config.cmOptions) {
    Object.assign(cmOptions, config.cmOptions)
  }

  // Set up CodeMirror on the editor element
  editor = CodeMirror.fromTextArea(
    document.querySelector(uiElement),
    cmOptions
  )

  // Ensure we also recognize .ino files as C sources
  CodeMirror.mimeModes['text/x-arduino'] = CodeMirror.mimeModes['text/x-c++src']

  // On change of active selection (currently edited file) load its contents
  Events.on('FileSelectionChanged', function(data) {
    switchTo(data.activeFile)
  })

  // Emit editor content changes as change event (but throttle them)
  editor.on("changes", (ed, changes) => {
    contentChanged(changes, typeDelay)
  })


  // DEBUG:
  Object.defineProperty(window, 'ClouduboyEditor', { get: function() { return editor } })
}

export function switchTo(file) {
  // Fetch file source code
  // TODO: update this to use S.sync
  API.fetch(`/edit/${file}`, {
    method: 'get',
  })
    //.then(updateEditorContents)
    // included in storeCurrentFilename (called at the end)
    .then(storeCurrentFilename)

}


function contentChanged(content, delay = 0) {
  // Update state with changed editor contents
  S.set({ [S.get('activeFile')]: editor.getValue() }, 'fileContents')

  // Notify other components of the change
  Events.emitThrottled(delay, "CodeEditorContentChanged", content)
}

// Update editor
function setEditorContents(v) {
  // Remove extra carriage-returns
  v = v.replace(/\r\n/g,'\n')

  // Update editor value
  editor.setValue(v)
  editor.refresh()

  // Run callbacks for plugins
  contentChanged(v, 33)
}

function updateEditorContents(r) {
  // Response object
  if (typeof r === 'object' && r instanceof Response) {
    // Check for errors
    if (r.status >= 400) {
      return r.text().then(alert)
    }

    return r.text().then(setEditorContents);
  }

  // Fallback as string
  return Promise.resolve(setEditorContents(r ||''))
}

function storeCurrentFilename(r) {
  let disposition, filename, contentType, contents

  // r is an result of a fetch
  if (r.headers) {
    disposition = r.headers.get('Content-Disposition') || ''
    filename = (disposition.match(/filename="([^"]+)"/)||[])[1]

    contentType = r.headers.get('Content-Type') || ''
    contents = r
  }

  // Result is a returned JSON
  if (!disposition && 'file' in r) {
    filename = r.file.filename
    contentType = r.file.contentType
    contents = r.file.contents
  }

  // Update document syntax mode
  let ctype = contentType ? contentType.match(/^[^\s;]+/) : '?'
  let cmode = CodeMirror.mimeModes[ctype && ctype[0]]
  let newMode = typeof cmode == 'object' ? cmode.name : cmode

  if (ctype && newMode !== S.get('codeEditor', {}).mode) {
    editor.setOption('mode', cmode)

    console.log(`New document mode: ${newMode} (${ctype})`)

    Events.emit('CodeEditorModeChanged', { mode: newMode })
  }

  // Update file selector dropdown
  document.querySelector('select[name="file"]').value = filename

  // Update state
  S.set({
    activeFileMetadata: {
      filename, disposition, contentType
    },
    codeEditor: {
      mode: newMode,
      ctype: ctype[0],
      cmode
    }
  })

  return updateEditorContents(contents)
}
