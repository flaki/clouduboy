import * as API from './api.js'
import { emit } from './editor-events.js'

// Components config
const uiComponents = [
  {
    id: 'uicCodeEditor',
    config: {}
  },
  {
    id: 'uicFiles',
    config: {}
  },
  {
    id: 'uicTargets',
    config: {}
  },
  {
    id: 'uicExamples',
    config: {}
  },
  {
    id: 'uicAutosave',
    config: {}
  },
  {
    id: 'uicMcPreview',
    config: {}
  },
  {
    id: 'uicMcTranslate',
    config: {}
  },
]

const uiComponentMetadata = {}
uiComponents.forEach(c => uiComponentMetadata[c.id] = c)
// TODO: use weakmap?

// TODO: load all UI components automatically,
// tree-shake out what we don't need based on UI config passed to init()
import * as uicCodeEditor from './ui-component-code-editor.js'
import * as uicFiles      from './ui-component-files.js'
import * as uicTargets    from './ui-component-targets.js'
import * as uicExamples   from './ui-component-examples.js'
import * as uicAutosave   from './ui-component-autosave.js'
import * as uicMcPreview  from './ui-component-mc-preview.js'
import * as uicMcTranslate from './ui-component-mc-translate.js'



// Initialize
export function init(uiComponents) {
  return Promise.all([
    uicCodeEditor.init(uiComponentMetadata.uicCodeEditor['config']),
    uicFiles.init(uiComponentMetadata.uicFiles['config']),
    uicTargets.init(uiComponentMetadata.uicTargets['config']),
    uicExamples.init(uiComponentMetadata.uicExamples['config']),
    uicAutosave.init(uiComponentMetadata.uicAutosave['config']),
    uicMcPreview.init(uiComponentMetadata.uicMcPreview['config']),
    uicMcTranslate.init(uiComponentMetadata.uicMcTranslate['config']),
  ])

    // Run post-init callbacks
    .then( data => emit('Initilized', data) )

    // Display icons
    // TODO: find better place for this / maybe run in pre-compile
    .then( _=> {
      Array.from(document.querySelectorAll('[data-pif-icon]')).forEach(element => {
        element.insertAdjacentHTML('beforeend', (new PixelData(element.dataset.pifIcon).svg()))
      })
    })
}
