(function(exports) {
  'use strict';

  function ClouduboyMicroCanvas() {
  }


  function init () {
    document.querySelector('.toolbar button[name="build"]')
      .addEventListener('click', buildMicroCanvas);

    document.querySelector('.toolbar button[name="preview"]')
      .addEventListener('click', showPreview);
  }


  function buildMicroCanvas() {
    Clouduboy.API.fetch('/compile')
      .then(Clouduboy.reinit.filesDropdown);
  }

  function showPreview() {
    let i = document.createElement('iframe');
    document.body.appendChild(i);
    i.className = 'preview';
    i.contentWindow.addEventListener('error', function(err) {
      console.log('Script error:', err);

      let activeFile = document.getElementById("codeeditor-filename").value;

      // Error in active file
      if (err.filename.match(new RegExp(activeFile.replace('.','\\.')))) {
        console.log('Line ', err.lineno, ': ', err.message);
      }
    });
    i.src = '/microcanvas.html';
  }

  // Add plugin
  Clouduboy.on("contentloaded", init);
})(window);
