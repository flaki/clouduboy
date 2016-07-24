(function(exports) {
  'use strict';

  function ClouduboyFlasher() {
  }


  function init () {
    document.querySelector(".toolbar button[name=flash]").addEventListener("click", function(e) {
      Clouduboy.API.fetch("/hex/flash", {method: "post"}).then(function(r) {
        console.log(r.status === 200 ? "Flashing in progress..." : "Failed!");
      });
    });

    document.querySelector('.toolbar button[name="download"]')
      .addEventListener('click',
        e => window.open('/hex/build')
      );
  }

  // Expose
  //exports.ClouduboyFlasher = ClouduboyFlasher;

  // Add plugin
  Clouduboy.on("contentloaded", init);
})(window);
