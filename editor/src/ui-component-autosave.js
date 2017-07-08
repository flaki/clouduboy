import * as Events from './editor-events.js'
import * as S from './state.js'

import { wait } from './util.js'


// Current save operation
let saving = null
let queued = false

// The amount of ms to wait after an update (try not to overwhelm the server)
let cooldown = 100

export function init(config) {
  if (typeof config.cooldown != 'undefined') {
    cooldown = config.cooldown
  }

  // Autosave when content updates
  Events.on('CodeEditorContentChanged', save)

  // TODO: FileSelectionChanged should clear the update queue
}

export function save(data) {
  const file = S.get('activeFile')

  // Already saving, add as queued operation
  if (saving && !queued) {
    queued = true

    saving
      .then(wait(cooldown))
      .then(_ => {
        queued
        return S.sync('/update', 'fileContents')
      })
      .then(_ => {
        saving = null
        Events.emit('FileSaved', file)
      })

  // New save operation
  } else {
    // TODO: make this 'files/[activeFile]' (sync only edited file)
    // in S.get, <string>.split('/'), then reduce(), unless key=lastkey obj=obj[key]
    // TODO: further reduce transmitted data (e.g. patch/diff?)
    // e.g. send changes+hash, send full file if same state
    // cannot be reconstructed on server
    saving = S.sync('/update', 'fileContents').then(_ => {
      saving = null
      Events.emit('FileSaved', file)
    })
  }
}
