'use strict';

// Fetch API
var fetch = require('node-fetch');

// Create menubar app
var mb = require('menubar')({
  dir: __dirname,
  index: 'main.html',
  width: 1,
  height: 1,
  preloadWindow: true
});

// Flasher functions
let Flasher = require('../index.js');


// Menubar app ready
mb.on('ready', function () {
  console.log('Arduboy Flasher Ready! ', mb.getOption('dir'));

  // Flash latest build when menubar tray icon is clicked
  mb.tray.on('click', flashBuild);

  // Flasher polling
  function pollFlasher() {
    fetch("http://clouduboy.slsw.hu/hex/flash").then(function(r) {
      if (r.status === 204) throw "Nothing to flash";

      // TODO: use HEX returned here, avoid refetching
      flashBuild().then(function() {
        setTimeout(pollFlasher, 2000);
      });

    }).catch(function(e) {
      console.log(e);

      return setTimeout(pollFlasher, 2000);
    });
  }

  setTimeout(pollFlasher, 1000);

});


// Menubar app window created
mb.on('after-create-window', function () {
  console.log('Searching for connected Arduboy devices...');

  Flasher.findArduboy().then(function(port) {
    console.log('Arduboy found @ ', port);
  }).catch(function() {
    console.log('No connected Arduboys found!');
  });

  //setTimeout(mb.app.quit.bind(mb.app), 5000);
});


// Download and Flash latest build from Couduboy host
function flashBuild () {
  let flashBuild = require('../index.js');

  var flashing = setInterval( (function() {
    this.current++;
    mb.tray.setImage(__dirname + '/'+this.images[ this.current % 2 ]+'.png');

  }).bind({ current: 0, images: [ 'IconTemplate', 'boltTemplate' ]}), 333);
  mb.tray.setToolTip("Flashing Arduboy image...");

  return flashBuild().then(function() {
    console.log('Flashing done!');

    return 'Success!';
  }).catch(function (e) {
    console.log('Flashing failed: ', e);

    return 'Failed: '+e.toString();
  }).then(function(msg) {
    clearInterval(flashing);
    mb.tray.setImage(__dirname + '/IconTemplate.png');
    mb.tray.setToolTip(msg);
  });
}
