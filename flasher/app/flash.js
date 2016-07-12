var Serialport = require('serialport');
var Chip = require('chip.avr.avr109');
var Async = require('async')


var log = console.log.bind(console);


/* Delay promise */
function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

/* Resetting Arduboy */
function reset(cfg) {
  // Already in bootloader mode
  if (cfg.NORESET) return Promise.resolve();

  return new Promise(function(resolve, reject) {
    var resetSP = new Serialport.SerialPort(cfg.PORT, {
      baudRate: 1200,
      autoOpen: false
    });

    resetSP.open(function (error) {
      if (error) {
        log('reset: serialport open failed: ', error, error.stack);
        reject(error);
      } else {
        log('reset: serialport open', resetSP.path+' @ '+resetSP.options.baudRate);

        // Toggle RTS/DTR
        resetSP.set({
          rts: true,
          dtr: true
        }, function (error) {
          if (error) {
            log('rts/dtr toggle failed: ', error, error.stack);
            reject(error);
          } else {
            setTimeout(function () {
              resetSP.set({ rts:false, dtr: false }, function (error) {
                if (error) {
                  reject();
                } else {
                  log('reset ok')
                  resolve();
                }
              });
            }, 250);
          }
        });

      }
    });
  });
}

function flash(cfg) {
  return new Promise(function(resolve, reject) {
    var bootloaderSP = new Serialport.SerialPort(cfg.PORT, {
      baudRate: cfg.BAUDRATE,
      autoOpen: false
    });

    bootloaderSP.open(function (error) {
      if (error) {
        log('bootloader: serialport open failed: ', error, error.stack);
        reject(error);

      } else {
        log('bootloader: serialport open', bootloaderSP.path+' @ '+bootloaderSP.options.baudRate);

        Chip.init(bootloaderSP, { debug: cfg.DEBUG, signature: cfg.SIGNATURE }, function(error, flasher) {
          if (error) {
            log('bootloader: avr109 init failed', error, error.stack);
            return reject(error);
          }

          log('flashing, please wait...');

          Async.series([
            flasher.erase.bind(flasher),
            flasher.program.bind(flasher, cfg.DATA.toString()),
            flasher.verify.bind(flasher),
            flasher.fuseCheck.bind(flasher),
            function(cb) {
              setTimeout(function() {
                log("finished, closing");
                bootloaderSP.close();
                cb();
              }, 500);
            }
          ],
          function(error) {
            if (error) {
              log('flashing failed:', error, error.stack);
              return reject(error);
            }

            log('flashing ok');
            resolve();
          });
        });

      }
    });
  });
}

module.exports = function(cfg) {
  cfg = Object.assign({
    DEBUG: false,
    SIGNATURE: 'CATERIN',
    PORT: '/dev/cu.usbmodem1411',
    BAUDRATE: 19200,
    DELAY: 2000,
    DATA: null
  }, cfg);


  // Check config
  return new Promise(function(resolve, reject) {

    // No data to flash
    if (!cfg.DATA) {
      return reject(new Error("No firmware data specified!"));
    }

    // Check/parse hex (throws on error)
    ihex = require('intel-hex').parse(cfg.DATA);

    if (!ihex.data) {
      return reject(new Error("Invalid HEX contents!"));
    }

    resolve();
  })

  // Reset board
  .then(reset.bind(null, cfg))

  // Wait for bootloader
  .then(delay.bind(null, cfg.DELAY))

  // Flash firmware
  .then(flash.bind(null, cfg))

  .catch(function(error) {
    log('[flasher]', error)
    log('[flasher] Config: ', require('util').inspect(cfg));

    throw error;
  });
}
