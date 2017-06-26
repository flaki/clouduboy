'use strict';

module.exports = {
  all: all
};


// Dependencies
const CFG = require('../cfg.js');


function all(req, res) {
  require('rollup').rollup(
    {
      entry: './editor/src/editor.js'
    }
  ).then(bundle => {
    let gen = bundle.generate({
      format: 'umd',
      sourceMap: 'inline',
      moduleName: 'Clouduboy'
    })

    // TODO: cache/no-cache depending on DEV mode
    // TODO: minify in prod, add sourcemaps in DEV
    res.type('text/javascript').send(
      gen.code +'\n//# sourceMappingURL='+ gen.map.toUrl()
    );
  }).catch(err => {
    console.log("Bundle generation failed: ", err);
    res.sendStatus(500).end();
  })
}
