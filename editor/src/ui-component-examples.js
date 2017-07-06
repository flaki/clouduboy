import * as Events from './editor-events.js'
import * as S from './state.js'


let uiElement = 'select[name="load"]'

// Select dropdown
let select = null



// Init component
export function init(config) {
  // CodeMirror element ID
  if (config.uiElement) {
    uiElement = cdnfig.uiElement
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
  return S.sync("/sources")
    // Update dropdown UI
    .then(updateSelect)
    // Notify of the change of actively edited file

    // Sources (active template) has changed
    .then(_ => Events.emit('SourcesChanged', { activeTarget: S.get('activeTarget') }))
}


function updateSelect() {
  const { sources, groups, activeTemplate } = S.get()

  // Remove event listeners
  select.removeEventListener('change', changeSelection)

  // Add options
  if (select) {
    groups.forEach(function(group) {
      select.insertAdjacentHTML("beforeend",
        `<optgroup label="${group.title}">`
        + sources
          // Only sourcs from this group
          .filter( src => src.id.match( new RegExp("^"+group.id) ) )

          // TODO: this is probably obsolete
          // Hide sources incompatible with active target
          // .filter( src => !( src.target && src.target !== Clouduboy.activeTarget ) )

          // Render option
          .reduce(
            (out, src) => out + `<option value="${src.id}"${src.id===activeTemplate&&' selected'}>${src.title}</option>`
          , '')
        +'</optgroup>'
      )
    })
  }

  // (Re-)add event listeners
  select.addEventListener('change', changeSelection)
}


function changeSelection(e) {
  const newSelection = e.target.value

  // Fetch file source code
  if (newSelection) {
// TODO: this should post to /sources instead
//    S.sync('/sources', { activeTemplate: newSelection })
    S.sync('/load', { activeTemplate: newSelection })
      // TODO: Update displayed template sources
      .then(syncResult => {
        // TODO: verify successful sync

        // Sources (active template) has changed
        Events.emit('SourcesChanged', { activeTemplate: S.get('activeTemplate') })

        // File list has changed
        Events.emit('FileListUpdated', { files: S.get('files') })

        // The currently edited file has changed
        Events.emit('FileSelectionChanged', { activeFile: S.get('activeFile') })
      })
  }
}
