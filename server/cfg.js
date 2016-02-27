'use strict';

const CFG = {};

// Copy app configuration from config.json
Object.assign( CFG, require('../config.json') );

// App version is loaded from package.json
CFG.APP_VERSION = process.env.npm_package_version || (require('../package.json').version);

// Production run
CFG.DIST = (process.argv.indexOf("--dist") >= 0);


// Root directory
CFG.ROOT_DIR = require('path').normalize( __dirname + '/..' );

// Root directory for the webapp
CFG.APP_DIR = __dirname;

// Root directory for the served content
CFG.WEB_DIR = CFG.ROOT_DIR + '/editor';


// Expose configuration object
module.exports = CFG;
