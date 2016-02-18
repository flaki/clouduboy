'use strict';

const CFG = {};

// Copy app configuration from config.json
Object.assign( CFG, require('../config.json') );

// App version is loaded from package.json
CFG.APP_VERSION = process.env.npm_package_version || (require('../package.json').version);


// Expose configuration object
module.exports = CFG;
console.log(CFG);
