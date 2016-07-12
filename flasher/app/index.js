'use strict';

// Fetch API
var fetch = require('node-fetch');

// IPC Main thread
var ipcMain = require('electron').ipcMain;


var APP_DIR = 'file://'+__dirname;

// Create menubar app
var mb = require('menubar')({
  dir: __dirname,
  index: APP_DIR + '/main.html',
  width: 360,
  height: 180,
  preloadWindow: true
});

// Flasher functions
let Flasher = require('./flasher.js');

// Initial SID - get it from the last command line parameter
var STATE = {};

STATE.s = 'init';

// Arg processing
let arg = 2, argv = process.argv;

// Host to poll/download hex from
console.log(arg,argv.length,argv)
if (argv.length > arg && argv[arg].match(/^http/)) {
  STATE.host = argv[arg];
  arg++;

// Default host
} else {
  STATE.host = 'http://clouduboy.slsw.hu/hex/flash/';
}

// Default SID
STATE.sid = argv[arg] || null;



// Menubar app ready
mb.on('ready', function () {
  console.log('Arduboy Flasher Ready! ', mb.getOption('dir'));

  // Start Flashing
  var hexToFlash;


  // Flasher polling
  function pollFlasher() {
    let pollURL = STATE.host + STATE.sid;

    // Wait until we have a session ID
    (new Promise(function(resolve, reject) {
      if (!STATE.sid) {
        reject(new Error('E_NO_SID'));
      } else {
        resolve(pollURL);
      }
    }))

    // Check for HEX to flash
    .then(fetch)

    // Poll for a request to flash
    .then(function(r) {
      if (r.status < 300) return r.text();

      throw new Error('E_HTTP_'+r.status);
    })

    // If no hex, continue polling
    .then(function(hex) {
      hexToFlash = hex;

      if (!hex) throw new Error('E_NO_HEX');
    })

    // Find a connected Arduboy
    .then(function() {
      return Flasher.findArduboy().catch(function() {
        throw new Error('E_NO_DEVICE');
      });
    })

    // Try uploading
    .then(function() {
      mb.showWindow();
      return flashBuild(hexToFlash);
    })

    // Upload error, notify user and try again
    .catch(function(e) {
      // Type session ID
      if (e.message == 'E_NO_SID') {
        return errorMessage("Not connected... (no SID)", function(resolve,reject) {
          updateState('init', { msg: 'Not Connected.', msgt: 'notice' })

          // Wait until next update
          ipcMain.once('state', reject);
        });
      }

      // Invalid session id specified
      if (e.message == 'E_INVALID_SID') {
        return errorMessage("Not connected... (invalid SID)", function(resolve,reject) {
          updateState('init', { msg: 'Invalid Session ID.', msgt: 'error' })

          // Wait until next update
          ipcMain.once('state', reject);
        });
      }

      // Nothing to flash
      if (e.message == 'E_NO_HEX') {
        return errorMessage("Nothing to flash...", function(resolve,reject) {
          if (STATE.s == 'connecting') {
            updateState('connected', { msg: '', msgt: '' })
          }
          setTimeout(reject, 10);
        });
      }

      // Connect device
      if (e.message == 'E_NO_DEVICE') {
        return errorMessage("Flashing failed...", resolverFindArduboy)
        .then(function() {
          // Try flashing again
          return flashBuild(hexToFlash);
        });
      }

      // Other Error
      return errorMessage("Error: "+e.message, function(resolve,reject) {
        updateState('init', { msg: e.message, msgt: 'error' })

        // Wait until next update
        ipcMain.once('state', reject);
      });
    })

    // Return to polling
    .catch(function() {}).then(function() {
      // Continue polling
      setTimeout(pollFlasher, 1000);
    });
  }

  // Start polling
  setTimeout(pollFlasher, 100);
});


// Menubar app window created
mb.on('ready', function () {
  var wnd = mb.window.webContents;

  wnd.on('did-finish-load', function() {
    if (!STATE.sid) {
      updateState('init', { msg: 'Not Connected.', msgt: 'error'  });
      mb.showWindow();

    } else {
      updateState('connecting');
    }
  });

  // State changes
  ipcMain.on('state', function(e, state) {
    console.log('Inbound: ', state);

    STATE.sid = state.sid;

    // SID specified, try to connect
    if (STATE.s === 'init' && STATE.sid) {
      updateState('connecting', { msg: 'Connecting...', msgt: 'progress' });
    }

    /* TODO: Check session id validity */
    //e.returnValue = '';
    //e.sender.send('state', {});
  });

  // Flashing requests
  ipcMain.on('flash', function(e, flash) {
    console.log(flash.data);
    updateState('flashing', { msg: 'Uploading...', msgt: 'progress' })
      .then( flashBuild.bind(null, flash.data) )
      .then( function() {
        return updateState('connecting', { msg: 'Done.', msgt: 'notice' });
      })
      .catch( function(e) {
        return updateState('connecting', { msg: 'Error:'+e, msgt: 'error' });
      });
  });


  //mb.window.openDevTools();
  //mb.window.loadURL('http://clouduboy.slsw.hu/wacky-muffin-pocket/editor');
});


// Download and Flash latest build from Couduboy host
function flashBuild(hex) {
  var flashing = setInterval( (function() {
    this.current++;
    mb.tray.setImage(__dirname + '/'+this.images[ this.current % 2 ]+'.png');

  }).bind({ current: 0, images: [ 'IconTemplate', 'boltTemplate' ]}), 333);
  mb.tray.setToolTip("Flashing Arduboy image...");

  return Flasher(hex)
  .then(function() {
    console.log('Flashing done!');

    return 'Success!';
  }).catch(function (e) {
    console.log('Flashing failed: ', e);

    throw new Error('Flashing failed: '+e.toString());

  }).then(function(msg) {
    clearInterval(flashing);
    mb.tray.setImage(__dirname + '/IconTemplate.png');
    mb.tray.setToolTip(msg);
  });
}

function errorMessage(msg, resolver) {
  console.log(msg);

  var p = new Promise(function(resolve, reject) {
    // Update state, set error message and send it to the content process
    updateState({ error: msg }).catch(console.log.bind(console));

    // Let the resolver wait for automatic resolution
    resolver(resolve, reject);
  });

  return p;
}

function updateState(newstate, props) {
  if (typeof newstate === 'object') {
    Object.assign( STATE, newstate );
  } else {
    Object.assign( STATE, props );
    STATE.s = newstate;
  }

  return new Promise(function(resolve, reject) {
    var wnd = mb.window.webContents;

    wnd.send('state', STATE);
    resolve("state resolved");
  });
}

function resolverFindArduboy(resolve, reject) {
  var tries = 5;

  var find = function() {
    Flasher.findArduboy().then(function(port) {
      console.log('Arduboy found @ ', port);
      resolve();
    }).catch(function() {
      console.log('No connected Arduboys found!');
      if (tries <= 0) {
        reject("Flashing failed - no connected device found.");
      } else {
        tries--;
        setTimeout(find, 1000);
      }
    });
  };

  find();
}
