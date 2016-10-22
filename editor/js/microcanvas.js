(function(exports) {
  'use strict';

  function ClouduboyMicroCanvas() {
  }


  function init () {
    document.querySelector('.toolbar button[name="build"]')
      .addEventListener('click', buildMicroCanvas);
  }


  function buildMicroCanvas() {
    Clouduboy.API.fetch('/compile');
  }

  // Add plugin
  Clouduboy.on("contentloaded", init);
})(window);
