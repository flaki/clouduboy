(function(exports) {
  'use strict';

  function ClouduboyLinter() {
  }

  // Last build's output
  var lastBuild;


  function throttle(callback, delay) {
    var lastRequest = null;
    var lastArgs = [];
    var timeout;

    var fulfill = function() {
      lastRequest = null;
      timeout = null;
      callback.call(null, ...lastArgs);
    }

    return function(...args) {
      lastArgs = args;

      // Restart throttle
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(fulfill, delay);
      lastRequest = Date.now();
    }
  }


  // Build form document and check for errors, size etc.
  let widgets = [];

  function checkBuild(ed, changes) {
    var editor = Clouduboy.editor;

    // Commit editor changes to underlying textarea
    editor.save();

    // Remove previous markers
    editor.operation(function() {
      for (var i = 0; i < widgets.length; ++i)
        editor.removeLineWidget(widgets[i]);
      widgets.length = 0;
    });

    Clouduboy.API.fetch('/update', {
      method: 'post',
      body: new FormData(document.querySelector('form'))

    }).then(function(r) {
      return r.json();

    }).then(function(res) {
      lastBuild = res;

      if (lastBuild.error) {
        sidebar.log(lastBuild.error, 'error');

        if (lastBuild.compiler['build.ino'] && lastBuild.compiler['build.ino'].length > 0) {
          lastBuild.compiler['build.ino'].forEach(function(err) {
            //console.log(err);
            var blip = document.createElement("div");
              blip.appendChild(document.createTextNode(err.msg));
              blip.className = "build-error";

            // Collect line widgets
            widgets.push(
              editor.addLineWidget(err.line - 1, blip, {
                coverGutter: false, noHScroll: true
              })
            );
          });
        }
      }
    }).catch(function(error) {
      console.error("Error checking build: ", error.stack||error);
    });
  }

  // Expose
  exports.ClouduboyLinter = ClouduboyLinter;

  // Initialize on load
  Clouduboy.on("init", function() {
  });

  // Periodically check for syntax errors (also creates a flashable new build)
  let throttleCheckBuild = throttle(checkBuild, 1500);

  Clouduboy.on("contentchanged", throttleCheckBuild);
})(window);
