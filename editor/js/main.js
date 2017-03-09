(function (exports) {
  'use strict';

  // Fetch API same-origin shorthand to easily enable session cookies
  // Sets credentials: to default to 'same-origin' (but overridable)
  let API = {
    fetch: function(url, settings) {
      settings = settings || {};
      settings.credentials = settings.credentials || 'same-origin';

      return fetch(url, settings);
    }
  }

  var inited = false;
  var plugins = {};

  function Clouduboy() {
    if (!inited) start();
    inited = true;
  }

  // Expose Clouduboy API
  Clouduboy.API = API;

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
//      theme: "night",
      theme: "neat",
      tabsize: 2,
      lineNumbers: true,
      lineWrapping: true
    }
  );

  // Add custom mime type for arduino (c-like) sources
  CodeMirror.mimeModes['text/x-arduino'] = CodeMirror.mimeModes['text/x-c++src'];

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

  let initedSources = false;
  function initSources() {
    // Fetch loadable sources
    return API.fetch("/sources").then(function(r) {
      return r.json();

    // Populate selector & set up event handlers
    }).then(function(data) {
      // Load selector
      var toolbarLoad = document.querySelector('select[name="load"]');

      // Remove contents
      toolbarLoad.innerHTML = '';

      // Add options
      data.groups.forEach(function(group) {
        toolbarLoad.insertAdjacentHTML("beforeend",
          '<optgroup label="'+group.title+':">'
          + data.sources
                  // Only sourcs from this group
                  .filter( src => src.id.match( new RegExp("^"+group.id) ) )
                  // Hide sources incompatible with active target
                  .filter( src => !( src.target && src.target !== Clouduboy.activeTarget ) )
                  // Render option
                  .map(    src => '<option value="'+src.id+'"'+(src.id===data.activeTemplate?' selected':'')+' >'+src.title+'</option>' )
                  .join('')
          +'</optgroup>'
        );
      });

      // Set up source/template switch handler
      if (toolbarLoad && !initedSources) {
        toolbarLoad.addEventListener('change', e => {
          var data = { 'load': e.target.value };
          //console.log(e.target, e.target.value, data);

          // Init files
          if (data.load) {
            API.fetch('/load', {
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })

            // Parse out current filename and store it
            .then(res => {
              return initFiles()
                .then(storeCurrentFilename.bind(null, res)); // TODO: Use "this" instead?
            })

            // Receive .ino file contents
            .then(updateEditorContents)

            // Reset selected item
            .then(() => {
              //toolbarLoad.value = '';
            });
          }
        });
      }

      // Initialized sources
      initedSources = true;
    });
  }

  function initFiles() {
    // Load selector
    var select = document.querySelector('select[name="file"]');

    // Fetch loadable sources
    return API.fetch("/files").then((r) => {
      return r.json();

    // Populate selector & set up event handlers
    }).then((data) => {
      // Add options
      if (select)  {
        select.innerHTML = '';
        select.insertAdjacentHTML('beforeend',
          data.files
              .reduce( (out, file) => out+'<option value="'+file+'"'+(data.activeFile===file?' selected':'')+'>'+file+'</option>', '' )
        );
      }

    // Handle changes and load data
    }).then(() => {
      if (select && !select.dataset.inited) select.addEventListener('change', (e) => {
        var data = { 'file': e.target.value };

        if (data.file) {
          // Fetch file source code
          API.fetch('/edit/'+data.file, {
            method: 'get',

          })

          // Parse out current filename and store it
          .then(storeCurrentFilename)

          // Update editor contents
          .then(updateEditorContents);

          // Initialized
          select.dataset.inited = 'yes';
        }
      });
    });
  }

  function initTargets() {
    // Load selector
    var select = document.querySelector('select[name="target"]');

    // Fetch loadable sources
    return API.fetch("/targets").then(function (r) {
      return r.json();

      // Populate selector & set up event handlers
    }).then(function (data) {
      // Store active target
      Clouduboy.activeTarget = data.activeTarget;

      // Add options
      if (select) {
        select.insertAdjacentHTML('beforeend', data.targets.reduce( (out, target) => {
          return out
            + '<option value="' + target.id + '"'
              + (target.id === data.activeTarget ? 'selected' : '' )
            + '>' + target.name + '</option>';
        }, ''));
      }

      // Handle changes and load data
    }).then(function () {
      if (select) select.addEventListener('change', e => {
        var data = new URLSearchParams;

        // New target
        data.append('target', e.target.value);
        console.log(data.toString());

        // Fetch file source code
        API.fetch('/targets', {
          method: 'post',
          body: data
        })
        .then( _ => {
          Clouduboy.activeTarget = e.target.value;
        })

        // Update displayed template sources
        .then(initSources)
      });
    });
  }

  function storeCurrentFilename(r) {
    let disposition = r.headers.get('Content-Disposition') || '';
    let filename = (disposition.match(/filename="([^"]+)"/)||[])[1];

    //Clouduboy.editor.display.wrapper.dataset.file = filename;
    let target = document.getElementById("codeeditor-filename");
    target.value = filename;
    target.dataset.filename = filename;

    // Update document syntax mode
    let ctype = ( r.headers.get('Content-Type') || '' ).match(/^[^\s;]+/);
    let cmode = CodeMirror.mimeModes[ctype && ctype[0]];
    console.log("c-type & mode", ctype, cmode);

    if (ctype && cmode !== target.dataset.cmode) {
      Clouduboy.editor.setOption('mode', cmode);

      target.dataset.ctype = ctype[0];
      target.dataset.cmode = typeof cmode == 'object' ? cmode.name : cmode;

      console.log("New document mode: ", (typeof cmode=='object' ? cmode.name : cmode));
    }

    // Update file selector dropdown
    document.querySelector('select[name="file"]').value = filename;

    return r;
  }

  function getCurrentFile() {
    return document.getElementById('codeeditor-filename').dataset
  }

  // Initialize
  function init() {
    return Promise.resolve()

      // Init the "targets" dropdown
      .then(initTargets)

      // Init UI "sources" dropdown
      .then(initSources)

      // Init UI "files" dropdown
      .then(initFiles)

      // Run post-init callbacks
      .then( runCallbacksFor.bind(null, 'init') );
  }

  // Fetch last build source
  function load() {
    // Fetch last edited source
    return API.fetch("/edit")
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

  // Expose functionality
  Clouduboy.reinit = {
    filesDropdown: initFiles
  };

  Object.defineProperty(Clouduboy, 'currentFile', { get: getCurrentFile })

  // Auto-init
  setTimeout(Clouduboy, 0);

})(window);
