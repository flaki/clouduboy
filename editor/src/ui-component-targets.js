import * as Events from './editor-events.js'
import * as S from './state.js'


let uiElement = 'select[name="target"]'

// Select dropdown
let select = null



// Init component
export function init(config) {
  // CodeMirror element ID
  if (config.uiElement) {
    uiElement = config.uiElement
  }

  initTargets()
}


function initTargets() {
  select = document.querySelector(uiElement)

  // Make sure the UI element exists
  // TODO: maybe create this during init?
  if (!select) {
    return Promise.reject(new Error('Non-existent UI element: '+uiElement))
  }

  // Fetch source file list
  return S.sync("/targets")
    // Update dropdown UI
    .then(updateSelect)
    // Notify of the change of actively edited file
    .then(_ => Events.emit('TargetChanged', { activeTarget: S.get('activeTarget') }))

}


function updateSelect(data) {
  const { activeTarget, targets } = S.get()

  // Remove event listeners
  select.removeEventListener('change', changeSelection)

  // Add options
  if (select) {
    select.insertAdjacentHTML('beforeend', targets.reduce( (out, target) => {
      let { id, name } = target
      return out
        + `<option value="${id}"${activeTarget===id&&' selected'}>${name}</option>`
    }, ''));
  }

  // (Re-)add event listeners
  select.addEventListener('change', changeSelection)
}


function changeSelection(e) {
  const newSelection = e.target.value

  // Fetch file source code
  if (newSelection) {
    S.sync('/targets', { activeTarget: newSelection })
      // TODO: Update displayed template sources
      // .then(initSources)
      .then(syncResult => {
        // TODO: verify successful sync
        Events.emit('TargetChanged', { activeTarget: S.get('activeTarget') })
      })
  }
}
