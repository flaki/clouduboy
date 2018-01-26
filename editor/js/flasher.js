(function(exports) {
  'use strict';

  function ClouduboyFlasher() {
  }


  function init () {
    let emt

    emt = document.querySelector(".toolbar button[name=flash]")
    if (emt) {
      emt.removeEventListener('click', flash);
      emt.addEventListener("click", flash);
    }

    emt = document.querySelector('.toolbar button[name="download"]')
    if (emt) {
      emt.removeEventListener('click', download);
      emt.addEventListener('click', download);
    }
  }

  function flash(e) {
    Clouduboy.API.fetch("/hex/flash", {method: "post"}).then(function(r) {
      console.log(r.status === 200 ? "Flashing in progress..." : "Failed!");
    });
  }

  function download(e) {
    window.open('/hex/build')
  }

  // Expose
  //exports.ClouduboyFlasher = ClouduboyFlasher;

  // Add plugin
  Clouduboy.on("contentloaded", init);
})(window);
