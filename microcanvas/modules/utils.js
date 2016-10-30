'use strict';

// Button mapping for different targets
const BUTTONS = {
  'arduboy': {
    left: 'LEFT_BUTTON',
    right: 'RIGHT_BUTTON',
    up: 'UP_BUTTON',
    down: 'DOWN_BUTTON',
    space: 'A_BUTTON',
    enter: 'B_BUTTON',
  }
};


// Enumerate parent nodes (returns an array of elements leaf => root)
function walkParents(node) {
  let ret = [];

  while (node) {
    ret.unshift(node);
    node = node.$parent;
  }

  return ret;
}

function toSnakeCase(s) {
  return s.replace(/[A-Z0-9]/g, e => '_'+e.toLowerCase() );
}

function toConstCase(s) {
  // Already in const case
  if (s.match(/^[A-Z0-9_]+$/)) return s;

  return toSnakeCase(s).toUpperCase();
}



module.exports = {
  BUTTONS: BUTTONS,
  walkParents: walkParents,
  toSnakeCase: toSnakeCase,
  toConstCase: toConstCase
}
