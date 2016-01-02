'use strict';

// Create menubar app
var mb = require('menubar')({
  dir: __dirname,
  index: 'main.html',
  width: 240,
  height: 400,
  preloadWindow: true
});

// Flasher functions
let Flasher = require('../index.js');


// Menubar app ready
mb.on('ready', function () {
  console.log('Arduboy Flasher Ready! ', mb.getOption('dir'));

  // Flash latest build when menubar tray icon is clicked
  mb.tray.on('click', flashBuild);
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

  flashBuild().then(function() {
    console.log('Flashing done!');
  }).catch(function (e) {
    console.log('Flashing failed: ', e);
  });
}
