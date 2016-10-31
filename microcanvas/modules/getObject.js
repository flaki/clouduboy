'use strict';

const getString = require('./getString.js');



function getObject(exp) {
  if (typeof exp === 'string') return exp;

  if (!exp || !exp.type ) return '__getObject("'+String(exp)+'")';

  let self = getObject;

  switch (exp.type) {
    case 'ObjectExpression':
      let obj = {};
      exp.properties.forEach(prop => { // prop.type = 'Property'
        obj[ self(prop.key) ] = self(prop.value);
      });
      return obj;

    case 'Identifier':
    case 'TemplateLiteral':
      return getString(exp);

    default:
      return '__getObject("'+exp.type+'")';
  }
}



module.exports = getObject;
