import * as API from './api.js'
import { emit } from './editor-events.js'

// Components config
const uiComponents = [
  {
    id: 'uicCodeEditor',
    config: {}
  },
]

const uiComponentMetadata = {}
uiComponents.forEach(c => uiComponentMetadata[c.id] = c)
// TODO: use weakmap?

// TODO: load all UI components automatically,
// tree-shake out what we don't need based on UI config passed to init()
import * as uicCodeEditor from './ui-component-code-editor.js'



// Initialize
export function init(uiComponents) {
  return Promise.all([
    uicCodeEditor.init(uiComponentMetadata.uicCodeEditor['config']),
  ])

    // Init the "targets" dropdown
//    .then(initTargets)

    // Init UI "sources" dropdown
//    .then(initSources)

    // Init UI "files" dropdown
//    .then(initFiles)

    // Run post-init callbacks
    .then( data => emit('init', data) )
}

// Fetch last build source
export function load(response) {
  // Use provided response, or fetch last edited source
  const p = response ? Promise.resolve(response) : API.fetch("/edit")

  return p
    // Parse out current filename and store it
    .then(storeCurrentFilename) //TODO: rename to switchToFile

    // Listen for changes & compile
    .then(() => {
      // Execute "contentchanged" callbacks whenever editor contents change
      editor.on("changes", (ed, changes) => {
        emit('contentchanged', changes);
      });
    })

    // Run registerd post-load callbacks
    .then( data => emit('load', data) );
}
