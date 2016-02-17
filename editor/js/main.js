(function (exports) {
  'use strict';

  var inited = false;
  var plugins = {};

  function Clouduboy() {
    if (!inited) start();
    inited = true;
  }

  // Subscribe to a specific "event" with a callback to be called
  Clouduboy.on = function(event, callback) {
    if (!(event in plugins)) plugins[event] = [];

    plugins[event].push(callback);
  }

  // Remove event listener/callback
  Clouduboy.off = function(event, callback) {
    if (!(event in plugins)) plugins[event] = [];

    // Find event listener
    let idx = arr.indexOf(callback);

    // If found, remove from the list
    if (idx >= 0) arr.splice( idx, 1 );
  }

  // Run callbacks for a specified event
  // All callbacks receive the optional "data" parameter, if specified
  function runCallbacksFor(event, data) {
    // Callbacks may return promises in which case
    // RunCallbacksFor resolves when all those promise is settled
    // (that is, the returned value is either a primitive value,
    //  or a promise, and the promise either resolves or rejects)
    if (plugins[event]) {
      // Resolves when all promise resolves
      let ret = Promise.all(
        // Map callbacks to return values
        plugins[event].map((cb) => {
          // Make sure all promises "resolve" so Promise.all doesn't reject
          // Wrap rejected promises as well, return reject reason
          return Promise.resolve( cb(data) ).catch( e => e);
        })
      );

      // Return promise
      return ret;
    }
  }


  var editor;
  Object.defineProperty(Clouduboy, 'editor', {
    enumerable: true,
    get: function() { return editor; }
  });

  // Set up CodeMirror for editing
  editor = CodeMirror.fromTextArea(
    document.getElementById("codeeditor"),
    {
      theme: "night",
      tabsize: 2,
      lineNumbers: true,
      lineWrapping: true
    }
  );


  // Update editor
  function setEditorContents(v) {
    // Remove extra carriage-returns
    v = v.replace(/\r\n/g,'\n');

    // Update editor value
    editor.setValue(v);

    // Run callbacks for plugins
    runCallbacksFor("contentloaded", v);
  }

  function updateEditorContents(r) {
    // Response object
    if (typeof r === 'object' && r instanceof Response) {
      // Check for errors
      if (r.status >= 400) {
        return r.text().then(alert);
      }

      return r.text().then(function(body) {
        setEditorContents(body);
      });

    // Plain ole' string stuff
    } else {
      setEditorContents(r);
    }
  }
  Clouduboy.update = function(v) {
    return updateEditorContents(v);
  }

  function initSources() {
    // Fetch loadable sources
    return fetch("/sources").then(function(r) {
      return r.json();

    // Populate selector & set up event handlers
    }).then(function(data) {
      // Load selector
      var toolbarLoad = document.querySelector('select[name="load"]');

      // Add options
      data.groups.forEach(function(group) {
        toolbarLoad.insertAdjacentHTML("beforeend",
          '<optgroup label="'+group.title+'":>'
          + data.sources
                  .filter( (i) => i.id.match( new RegExp("^"+group.id) ) )
                  .map(    (i) => '<option value="'+i.id+'">'+i.title+'</option>' )
                  .join('')
          +'</optgroup>'
        );
      });

      // Set up source/template switch handler
      if (toolbarLoad) {
        toolbarLoad.addEventListener('change', (e) => {
          var data = { 'load': e.target.value };
          //console.log(e.target, e.target.value, data);

          // Init files
          if (data.load) {
            fetch('/load', {
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })

            // Parse out current filename and store it
            .then(storeCurrentFilename)

            // Receive .ino file contents
            .then(updateEditorContents)

            // Reset selected item
            .then(() => {
              toolbarLoad.value = '';
            });
          }
        });
      }
    });
  }

  function initFiles() {
    // Load selector
    var select = document.querySelector('select[name="file"]');

    // Fetch loadable sources
    return fetch("/files").then((r) => {
      return r.json();

    // Populate selector & set up event handlers
    }).then((data) => {
      // Add options
      if (select)  {
        select.insertAdjacentHTML('beforeend',
          data.files
              .reduce( (out, file) => out+'<option value="'+file+'">'+file+'</option>', '' )
        );
      }

    // Handle changes and load data
    }).then(() => {
      if (select) select.addEventListener('change', (e) => {
        var data = { 'file': e.target.value };

        if (data.file) {
          // Fetch file source code
          fetch('/edit/'+data.file, {
            method: 'get',

          })

          // Parse out current filename and store it
          .then(storeCurrentFilename)

          // Update editor contents
          .then(updateEditorContents);
        }
      });
    });
  }

  function storeCurrentFilename(r) {
    let disposition = r.headers.get('Content-Disposition');
    let filename = (disposition.match(/filename="([^"]+)"/)||[])[1];
    //Clouduboy.editor.display.wrapper.dataset.file = filename;
    document.getElementById("codeeditor-filename").value = filename;
    return r;
  }

  // Initialize
  function init() {
    return Promise.resolve()

      // Init UI "sources" dropdown
      .then(initSources)

      // TODO: Init Library switcher
      //.then()

      // Init UI "files" dropdown
      .then(initFiles)

      // Run post-init callbacks
      .then( runCallbacksFor.bind(null, 'init') );
  }

  // Fetch last build source
  function load() {
    // Fetch last edited source
    return fetch("/edit")
      // Parse out current filename and store it
      .then(storeCurrentFilename)

      // Update editor to last build source
      .then(updateEditorContents)

      // Listen for changes & compile
      .then(() => {
        // Execute "contentchanged" callbacks whenever editor contents change
        editor.on("changes", (ed, changes) => {
          runCallbacksFor('contentchanged', changes);
        });
      })

      // Run registerd post-load callbacks
      .then( runCallbacksFor.bind(null, 'load') );
  }


  // Create instance, initialize & load
  function start() {
    return init().then(load).catch(function(error) {console.log(error);
      console.log('Failed to initialize: ', error.stack||error);
    });
  }

  // Expose
  exports.Clouduboy = Clouduboy;

  // Auto-init
  setTimeout(Clouduboy, 0);

})(window);
