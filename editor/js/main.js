(function (exports) {
  var inited = false;
  var plugins = {};

  function Clouduboy() {
    if (!inited) start();
    inited = true;
  }

  Clouduboy.on = function(event, callback) {
    if (!(event in plugins)) plugins[event] = [];

    plugins[event].push(callback);
  }

  function runCallbacksFor(event, data) {
    if (plugins[event]) plugins[event].forEach(function(cb) { cb(data); });
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
    if (typeof r === 'object' && 'text' in r) {
      // TODO: check if returned an error

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


  // Initialize
  function init() {
    return new Promise(function(resolve, reject) {
      // Set up source/template switch handler
      toolbarLoad = document.querySelector('select[name="load"]');
      if (toolbarLoad) {
        toolbarLoad.addEventListener('change', function(e) {
          var data = { 'load': e.target.value };
          //console.log(e.target, e.target.value, data);

          if (data.load) {
            fetch('/load', {
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            }).then(updateEditorContents).then(function() {
              toolbarLoad.value = '';
            });
          }
        });
      }

      // Run init callbacks
      runCallbacksFor('init');

      resolve();
    });
  }

  // Fetch last build source
  function load() {
    return fetch("/src/build").then(
      // Update editor to last build source
      updateEditorContents

    // Listen for changes & compile
    ).then(function() {
      // Change listeners
      editor.on("changes", function(ed, changes) {
        runCallbacksFor('contentchanged', changes);
      });

      // Loaded
      runCallbacksFor('load');
    });
  }


  // Create instance, initialize & load
  function start() {
    return init().then(load).catch(function(error) {
      console.log('Failed to initialize: ', error.stack||error);
    });
  }

  // Expose
  exports.Clouduboy = Clouduboy;

  // Auto-init
  setTimeout(Clouduboy, 0);

})(window);
