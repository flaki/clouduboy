'use strict';

const CFG = {};

const path = require('path')
const jsonfile = require('jsonfile')

// Copy app configuration from config.json
Object.assign(CFG, jsonfile.readFileSync(path.join(__dirname, '../config.json'), { throws: false }));

// If config.json doesn't exist generate one with sensible defaults
if (!CFG.SOURCE_LIST) {
  console.log('[!] config.json not found!\nGenerating initial configuration, please wait...')
  Object.assign(CFG, require(path.join(__dirname, 'first-run.js')))
}

// App version is loaded from package.json
CFG.APP_VERSION = process.env.npm_package_version || (require('../package.json').version);

// Production run
CFG.DIST = (process.argv.indexOf("--dist") >= 0);


// Root directory
CFG.ROOT_DIR = path.normalize( __dirname + '/..' );

// Root directory for the webapp
CFG.APP_DIR = __dirname;

// Root directory for the served content
CFG.WEB_DIR = CFG.ROOT_DIR + '/editor';

// Root directory for the built-in templates
CFG.TEMPLATES_DIR = CFG.ROOT_DIR + '/templates';

// MIME Types
CFG.MIME = {
  ARDUINO: 'text/x-arduino; charset=utf-8'
}

// Production/development host/port setup
if (!CFG.DIST) {
  if (CFG.DEV_SERVER_HOST) CFG.SERVER_HOST = CFG.DEV_SERVER_HOST;
  if (CFG.DEV_SERVER_PORT) CFG.SERVER_PORT = CFG.DEV_SERVER_PORT;
}

// Session storage (use separate session file for dev/prod)
CFG.SESSION_FILE = CFG.APP_DIR + '/data/session' +(CFG.DIST?'.dist':'')+ '.db';

// Build directory (use separate for dev/prod)
CFG.BUILD_DIR = CFG.ROOT_DIR + '/build' +(CFG.DIST?'/dist':'');


// Expose configuration object
module.exports = CFG;
