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



// Initialize
export function init(uiComponents) {
  return Promise.all([
    uicCodeEditor.init(uiComponentMetadata.uicCodeEditor['config']),
    uicFiles.init(uiComponentMetadata.uicFiles['config']),
    uicTargets.init(uiComponentMetadata.uicTargets['config']),
    uicExamples.init(uiComponentMetadata.uicExamples['config']),
  ])

    // Run post-init callbacks
    .then( data => emit('Initilized', data) )
}
