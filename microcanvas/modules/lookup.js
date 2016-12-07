  'use strict';

const getString = require('./getString.js');
const utils = require('./utils.js');


function lookup(exp) {
  let id = getString(exp);

  let self = lookup;

  // it's the MicroCanvas alias
  if (id === self.game.alias) return id;

  // It's an asset
  if (id in self.game.gfx) {
    return self.game.gfx[id].cid;
  }
  if (id in self.game.sfx) {
    return self.game.sfx[id].cid;
  }

  // It's a built-in library global or constant
  if (id.match(/^(TRUE|FALSE|WIDTH|HEIGHT|WHITE|BLACK|INVERT)$/)) {
    return id;
  }

  // Try to resolve identifier on the current scope
  let scopes = utils.walkParents(exp).reverse();
  for (let i=0; i<scopes.length; ++i) {
    if (scopes[i].$variables && scopes[i].$variables[id]) {
      let v = scopes[i].$variables[id];

      return v.cid;
    }
  }

  // It's a global constant
  if (id in self.game.constants) {
    return self.game.constants[id].cid;
  }

  // It's a global variable
  if (id in self.game.globals) {
    return self.game.globals[id].cid;
  }

  return '__lookup("'+(scopes.map( scope => scope.type ).join('>'))+'>'+(exp.$raw||id)+'")';
}



module.exports = lookup;
