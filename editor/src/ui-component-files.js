import * as S from './state.js'
import * as Events from './editor-events.js'

// Initial component config
let uiElement = 'select[name="file"]'

// Select dropdown
let select = null



// Init component
export function init(config) {
  // CodeMirror element ID
  if (config.uiElement) {
    uiElement = config.uiElement
  }

  initFiles()
}


function initFiles() {
  select = document.querySelector(uiElement)

  // Make sure the UI element exists
  // TODO: maybe create this during init?
  if (!select) {
    return Promise.reject(new Error('Non-existent UI element: '+uiElement))
  }

  // Start listening for future changes
  Events.on('FileListUpdated', updateSelect)

  // Fetch source file list
  return S.sync("/files")
    // Update dropdown UI
    .then(updateSelect)
    .then(_ =>
      Events.emit('FileSelectionChanged', { activeFile: S.get('activeFile') })
    )
}

function updateSelect() {
  const { files, activeFile } = S.get()

  // Remove event listeners
  select.removeEventListener('change', changeSelection)

  // Empty options
  select.innerHTML = ''

  // Add new options
  select.insertAdjacentHTML('beforeend',
    files.reduce(
      (out, file) => out+`<option value="${file}"${activeFile===file&&' selected'}>${file}</option>`
    ,'')
  )

  // (Re-)add event listeners
  select.addEventListener('change', changeSelection)

  // Notify of the change of actively edited file
  // TODO: probably this is not automatically true
  // (e.g. a new file was added to the file list without changing the selection)
  //Events.emit('FileSelectionChanged', { activeFile: S.get('activeFile') })
}

function changeSelection(e) {
  const newSelection = e.target.value

  if (newSelection) {
    S.set({ activeFile: newSelection })

    Events.emit('FileSelectionChanged', { activeFile: S.get('activeFile') })
  }
}
