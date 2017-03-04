 'use strict';

const fs = require('fs');
const acorn = require('acorn');

const utils = require('./modules/utils.js')

const translate = require('./modules/translate.js');
const lookup = require('./modules/lookup.js');
const getString = require('./modules/getString.js');

let srcFile = process.argv[2] || './game.js';
let targetSystem = process.argv[3] || 'arduboy';

let game;


// Game object
function Game(target) {
  Object.assign(this, {
    alias: 'game',
    target: target,
    constants: [], globals: [], gfx: [], sfx: []
  });
}

Object.assign(Game.prototype, {
  createConstant: pCreateConstant,
  createVariable: pCreateVariable,

  guessType: pGuessType,

  export: exportGame
})


// Commandline
if (!module.parent) {
  if (srcFile === '--help') {
    console.log('Usage: node build.js <MICROCANVAS_SRC.JS> <TARGET>\n\nCurrently supported targets: arduboy');

  } else {
    buildGame(targetSystem, fs.readFileSync(srcFile), require('path').basename(srcFile));

    // Save
    fs.writeFileSync('ast.json', JSON.stringify(game.ast));
    fs.writeFileSync('game.json', JSON.stringify(game));
    fs.writeFileSync('game.ino', game.ino||'');
  }
}


// Module usage
module.exports = buildGame;


function buildGame(target, source, id) {
  translate.game = lookup.game = game = new Game();

  game.id = id;
  game.target = target;

  game.ast = acorn.parse(source, { ecmaVersion: 6, sourceType: 'script' });
  game.ast = astAddParents(game.ast, source.toString());

  // Parse
  parseGlobals(); // TODO: function declarations!

  parseInitializers();

  parseSetupBody();

  parseLoopBody();

  parseGlobalFunctions();
  console.log("game",Object.keys(game.__proto__));

  // Build
  game.ino = game.export(target);

  return game;
}


// Methods available on the Game prototype
function pCreateConstant(id, value, type) {
  // If no type specified, try to guess it
  // PS: constants shouldn't be affected by scope issues
  //if (!type) type = guessType(id, value, 'constant');
  // only explicit types here, do not guess here only on output

  game.constants.push({
    id: id,
    cid: utils.toConstCase(id),
    value: value,
    type: type
  });

  // Make the constant accessible via its id
  game.constants[id] = game.constants[game.constants.length-1];

  console.log('+ new const: %s = %s', game.constants[id].cid, value);
}

function pCreateVariable(id, value, type, declaration) {
  // If no type specified, try to guess it
  // PS: constants shouldn't be affected by scope issues
  //if (!type) type = guessType(id, value, 'constant');
  // only explicit types here, do not guess here only on output
  if (!type) {
    type = game.guessType(id, undefined, declaration)
    console.log('- no type information, guessed: ', type)
  }

  // Value based on type
  if (!value && type) {
    if (declaration.init && declaration.init.type == 'ArrayExpression') {
      value = declaration.init.elements.map(e => e.raw)
    } else {
      value = declaration.init ? declaration.init.value : void 0
    }

    console.log('- no initial value supplied, detected: ', value)
  }

  let newVar = {
    id: id,
    cid: utils.toSnakeCase(id),
    value: value,
    type: type
  };

  // Find parent scope
  let scope = declaration; // fallback
  let scopes = utils.walkParents(scope);
  // TODO: find scope parent
  // TODO: support var/function scope

  let s = scopes.length;
  while (--s > 0) if (scopes[s].type === 'BlockStatement') {
    scope = scopes[s];
    break;
  }

  // Make variable accessible via it's scope (defining element in AST)
  scope.$variables = scope.$variables || [];
  scope.$variables.push(newVar);
  scope.$variables[id] = scope.$variables[scope.$variables.length-1];

  Object.defineProperty(newVar, '$scope', { value: scope });

  console.log('+ new var: %s', scope.$variables[id].cid + ( value ? ' = '+value : ''));
  console.log('  scope: ' + scopes
    .map(x => (x.type ? x.type : (x instanceof Array ? '[]' : typeof x)) + (x.body ? '('+(scope===x?'*':'S')+')':'') )
    .join(' > ') + ' "'+id+'"'
  );

  return newVar;
}

function pGuessType(id, value, hint) {
  if (hint === 'constant' && typeof value == 'number' && value < 256) return 'byte';

  if (typeof hint == 'object') {
    if (hint.init) {
      console.log('- guessing type based on decl.: ', hint.type, hint.init)
      switch (hint.init.type) {
        case 'Literal':
          return 'int' // TODO: strings, floats, bytes & unsigneds
        case 'ArrayExpression':
          return 'byte[]'
      }
    }
  }

  // unsigned int, byte, char, char[]
  return 'int';
}


// Collect global declarations
function parseGlobals() {
  console.log('Processing globals');

  // TODO: check for reserved globals, like "arduboy"

  // All variable declarations
  let vars = game.ast.body
  .filter(o => o.type === 'VariableDeclaration')
  .forEach(function (n) {
    if (n.kind === 'const') {
      n.declarations.forEach(dec => {
        game.createConstant(getString(dec.id), getString(dec.init));
      });

    } else if (n.kind === 'let') {
      n.declarations.forEach(dec => {
        if (dec.id.name.match(/^gfx/)) {
          game.gfx.push({
            id: dec.id.name,
            cid: utils.toSnakeCase(dec.id.name)
          });
          game.gfx[dec.id.name] = game.gfx[game.gfx.length-1];

        } else if (dec.id.name.match(/^sfx/)) {
          game.sfx.push({
            id: dec.id.name,
            cid: utils.toSnakeCase(dec.id.name)
          });
          game.sfx[dec.id.name] = game.sfx[game.sfx.length-1];

        // MicroCanvas standard library hook
        } else if (getString(dec.init) === 'new MicroCanvas') {
          game.alias = dec.id.name;

          console.log("MicroCanvas uses the alias: game")

        } else {
          let v = game.createVariable(dec.id.name, undefined, undefined, dec)

          game.globals.push(v)

          // Make global accessible via its name
          // TODO: maybe use a WeakMap instead?
          Object.defineProperty(game.globals, dec.id.name, { value: game.globals[game.globals.length-1] })
        }
      });
    }
  });

  // All global function declaration
  game.ast.body
  .filter(o => o.type === 'FunctionDeclaration')
  .forEach(function (dec) {
    let id = getString(dec.id);
    let params = [];
    console.log('+ new', dec.generator ? 'generator' : 'function', dec.id.name, dec.params.map(p => getString(p)));

    game.globals.push({
      id: id,
      cid: utils.toSnakeCase(id),
      params: params,
      value: dec,
      type: dec.generator ? 'generator' : 'function'
    });
    game.globals[id] = game.globals[game.globals.length-1];

    // parse function arguments to create local variables
    dec.params.forEach(p => {
      params.push(game.createVariable(getString(p), undefined, undefined, dec));
    });

  });
}

// Find intializers
function parseInitializers() {
  console.log('Looking for initializers');

  let initializers = game.ast.body
    .filter(o => o.type === 'ExpressionStatement')
    .map(es => es.expression)
    .filter(ex => ex.type === 'CallExpression' && ex.callee.type === 'MemberExpression' && ex.callee.object.name === game.alias)

  if (!initializers) {
    throw new Error('Invalid MicroCanvas file: initializers (setup/loop) not found.');
  }

  game.initializers = {
    setup: initializers.find(e => e.callee.property.name === 'setup'),
    loop: initializers.find(e => e.callee.property.name === 'loop')
  };

  if (!game.initializers.setup) {
    throw new Error('Required initializer `game.setup()` not found.');
  }
  if (!game.initializers.loop) {
    throw new Error('Required initializer `game.loop()` not found.');
  }
}

// Parse game.setup call body and generate setup
function parseSetupBody() {
  console.log('Processing game.setup()');
  game.setup = { code: [] };

  let sbody = game.initializers.setup
    .arguments[0] // FunctionExpression; TODO: reference
    .body // BlockStatement
    .body;

  // Walk the setup-body contents
  // TODO: these should probably live in translate/translateLib
  sbody.forEach(exp => {
    // Load graphics or sound assets
    if (exp.expression
     && exp.expression.type === 'AssignmentExpression'
     && exp.expression.left.type === 'Identifier' // TODO: MemberExpression, like game.state
     && exp.expression.left.name.match(/^(gfx|sfx)/)
    ) {
      loadAsset(exp.expression);

    // Try translating the line
    } else if (true) {
      let ln = translate(exp);
      game.setup.code.push(ln);

    } else {
      game.setup.code.push('__parseSetupBody("'+(exp.$raw||getString(exp))+'")');
      console.log('Unknown expression: '+getString(exp));
    }
  });
}

// Parse game.setup call body and generate setup
function parseLoopBody() {
  console.log('Processing game.loop()');
  game.loop = { code: [] };

  let loopbody = game.initializers.loop
    .arguments[0] // FunctionExpression; TODO: reference
    .body // BlockStatement
    .body;

  // Walk the setup-body contents
  loopbody.forEach(exp => {
    let ln = translate(exp);
    game.loop.code.push(ln);
  });
}

// Parse (global) function declarations
function parseGlobalFunctions() {
  game.functions = [];

  game.globals.forEach(dec => {
    if (dec.type === 'function') {
      console.log('Translating function declaration "'+dec.cid+'()"');
      let f = { fobj: dec, code: [] };

      let funcbody = dec.value // FunctionDeclaration; TODO: FunctionExpression
        .body // BlockStatement
        .body;

      // Walk the body contents
      funcbody.forEach(exp => {
        let ln = translate(exp);
        f.code.push(ln);
      });

      // Guess return type
      if (f.code.filter(ln => ln.match(/return/)).length) {
        f.fobj.rtype = 'int';

      // no return statements: void
      } else {
        f.fobj.rtype = 'void';
      }
      // TODO: walk AST instead, find 'ReturnStatement'
      // TODO: guess return type from 'ReturnStatement' value objecttype

      game.functions.push(f);
    } else if (dec.type === 'generator') {
      console.log('Translating generator function "'+dec.cid+'()"');
      let f = { fobj: dec, code: [] };

      let funcbody = dec.value // FunctionDeclaration; TODO: FunctionExpression
        .body // BlockStatement
        .body;

      // Walk the body contents
      funcbody.forEach(exp => {
        let ln = translate(exp);
        f.code.push(ln);
      });

      game.functions.push(f);
    }

  });
}

function astAddParents(ast, src) {
  let Node = astNode();

  let addParent = function(n, parent) {
    if (!(n && typeof n == 'object')) return;

    // Collections
    if (n.length) return n.forEach(node => addParent(node, parent));

    // Nodes
    if (n instanceof Node) {
      Object.defineProperty(n, '$parent', { value: parent });
    }

    // Raw content
    if ('start' in n && 'end' in n) {
      Object.defineProperty(n, '$raw', { value: src.substring(n.start,n.end) });
    }

    // Walk subtree
    ['body', 'left', 'right', 'object', 'property',
     'callee', 'argument', 'arguments', 'expression',
     'test', 'consequent', 'alternate',
     'declarations',
     'init', 'test', 'update',
    ].forEach(prop => {
      if (prop in n) addParent(n[prop], n);
    });
  };

  game.ast.body.forEach(n => {
    // Top level nodes
    if (n instanceof Node) addParent(n, null);
  });

  return ast;
}

function astNode() {
  return (acorn.parse('function x() {}').body[0]).constructor;
}

function isCalling(exp, id) {
  if (exp.type === 'CallExpression') {
    // looking for a MemberExpression
    if (id.indexOf('.')) {
      let mexp = id.split('.');
      if (exp.callee.type === 'MemberExpression') {
        return (
          exp.callee.object.name === mexp[0]
          &&
          exp.callee.property.name === mexp[1]
        );
      } else {
        console.warn('Expecting call to a MemberExpression `'+id+'(…)`, but found: '+exp.right.type);
      }

    // Other call
    } else {
      console.warn('Unrecognized call expression format: '+id);
    }
  } else {
    console.warn('Expecting CallExpression `'+id+'(…)`, but found: '+exp.type);
  }

  return false;
}




function loadAsset(exp) {
  let id = exp.left.name;

  // Graphics assets
  if (id.match(/^gfx/)) {
    if (!id in game.gfx) {
      console.warn('Warning: asset '+exp.left.name+' is not declared on the global scope!');
    }

    // LoadGraphics / LoadSprite are both valid methods for loading graphics assets
    if (isCalling(exp.right, game.alias+'.loadGraphics')
     || isCalling(exp.right, game.alias+'.loadSprite')
    ) {
      loadGraphics(id, exp.right.arguments);
      console.log(' 👾 loaded %s as GFX', id);
    } else {
      console.log('Unknown GFX load format: '+JSON.stringify(exp.right.callee));
    }
  }

  if (id.match(/^sfx/)) {
    if (!id in game.sfx) {
      console.warn('Warning: asset '+exp.left.name+' is not declared on the global scope!');
    }

    if (isCalling(exp.right, game.alias+'.loadTune')) {
      loadTune(id, exp.right.arguments);
      console.log(' 🔔 loaded %s as SFX', id);
    } else {
      console.log('Unknown SFX load format: '+getString(exp.right.callee));
    }
  }
}

function loadGraphics(id, args) {
  let str = getString(args[0]);

  // Load graphics data
  game.gfx[id].value = arrayInitializerContent(str);

  // Parse hints and create constants for them
  game.gfx[id].meta = arrayInitializerHints(game.gfx[id].value);

  game.createConstant(id+'Width', game.gfx[id].meta.w);
  game.createConstant(id+'Height', game.gfx[id].meta.h);
  game.createConstant(id+'Frames', game.gfx[id].meta.frames);
  game.createConstant(id+'Framesize', Math.ceil(game.gfx[id].meta.h/8)*game.gfx[id].meta.w);
};

function loadTune(id, args) {
  let str = getString(args[0]);
  game.sfx[id].value = arrayInitializerContent(str);
};


function arrayInitializerContent(statement) {
  try {
    return ( statement
      .replace(/\r|\n|\t/g, ' ') // remove line breaks and tabs
      .match(/=\s*[{\[](.*)[}\]]/)[1] // match core data
      .replace(/\s+/g, ' ').trim() // clean up whitespace
    ) || statement;
  } catch(e) {};

  return statement;
}

function arrayInitializerHints(statement) {
  let ret = {};

  let m = statement.match(/(?:\/\/|\/\*)\s*(\d+)x(\d+)(?:x(\d+))?/);

  if (m && m[1] && m[2]) {
    ret.w = parseInt(m[1],10);
    ret.h = parseInt(m[2],10);
    ret.frames = m[3] ? parseInt(m[3],10) : 0;
  }

  return ret;
}

function exportGame(target) {
  let game = this;
  target = target || game.target;

  console.log('Exporting %s for %s', game.id, target);

  switch (target) {
    case 'arduboy':
      let b = '';

      // Header
      b += arduboyHeader().trim()+'\n\n';

      // Assets
      // Graphics
      if (game.gfx) {
      game.gfx.forEach(asset => {
          b += arduboyGfx(asset.cid, asset.value);
        });
        b+='\n';
      }

      // Sounds
      if (game.sfx) {
        game.sfx.forEach(asset => {
          b += arduboySfx(asset.cid, asset.value);
        });
        b+='\n';
      }

      // Constants
      if (game.constants) {
        game.constants.forEach(c => {
          b += 'const ' + (c.type ? c.type : game.guessType(c.id, c.value, 'constant')) + ' ';
          b += c.cid;

          if (typeof c.value !== 'undefined') {
            b += ' = ' + c.value;
          }

          b+=';\n';
        });
        b+='\n';
      }

      // Globals
      if (game.globals) {
        game.globals.filter(dec => dec.type!=='function'&&dec.type!=='generator').forEach(c => {
          // Array initializer
          if (c.type && (c.type == 'char[]' || c.type == 'byte[]')) {
            b += c.type.substr(0,4) +' '+ c.cid +'[]'

          } else {
            b += (c.type ? c.type : game.guessType(c.id, c.value)) +' ';
            b += c.cid;
          }

          if (typeof c.value !== 'undefined') {
            // Array initializer value
            if (typeof c.value == 'object' && c.value.length) {
              b += ' = { ' +c.value.join(', ')+ ' }'
            } else {
              b += ' = ' + c.value;
            }
          }

          b+=';\n';
        });
        b+='\n';
      }

      // Optional built-ins
      if (game.generators) {
        b += arduboyBuiltins('generators').trim()+'\n\n';
      }
      if (game.collisions) {
        b += arduboyBuiltins('collisions').trim()+'\n\n';
      }

      // Functions
      if (game.functions) {
        game.functions.forEach(f => {
          if (f.fobj.type === 'generator') {
            b += 'boolean ';
          } else {
            b += (f.fobj.rtype ? f.fobj.rtype : 'void') + ' ';
          }
          b += f.fobj.cid;

          b += '(';
          if (f.fobj.params) {
            b += f.fobj.params.map(param => {
              return (param.type ? param.type : game.guessType(param.id, param.value)) + ' ' +param.cid;
            }).join(', ');
          }
          b += ')';

          b += ' {\n';
          b += '////// FUNCTION BODY //////\n';
          b += f.code.join('\n')+'\n';
          b += '\n}\n';
        });
        b+='\n';
      }

      // Setup
      b+=arduboySetup(game.setup.code.join('\n'))+'\n';

      // Loop
      b+=arduboyLoop(game.loop.code.join('\n'))+'\n';

      // Functions

      return b;
  }
};

function arduboyHeader() {
  return `
#include <SPI.h>
#include "Arduboy.h"

#include <EEPROM.h>
#include <avr/pgmspace.h>

Arduboy arduboy;

// frame counter, 2-byte unsigned int, max 65536
unsigned int _microcanvas_frame_counter = 0;

// sprintf() textbuffer for drawText
char _microcanvas_textbuffer[32];

// global state machine
unsigned int _microcanvas_state;
`;
}

function arduboyGfx(id, data) {
  return `
PROGMEM const unsigned char ${id}[] = { ${data} };
`;
}

function arduboySfx(id, data) {
  return `
const byte PROGMEM ${id}[] = { ${data} };
`;
}

function arduboySetup(contents) {
  return `
void setup() {
  arduboy.begin();

////// CUSTOM SETUP //////
${contents}
}
`;
}

function arduboyLoop(contents) {
  return `
void loop() {
  if (!arduboy.nextFrame()) return;

  ++_microcanvas_frame_counter;
  if (_microcanvas_frame_counter==60000) _microcanvas_frame_counter = 0;

////// LOOP CONTENTS TO FOLLOW //////
${contents}
////// END OF LOOP CONTENTS //////

  arduboy.display();
}
`
}

function arduboyBuiltins(id) {
  switch (id) {
    // TODO: implement in C for the Arduboy/PROGMEM
    case 'collisions': return `
boolean collides(const unsigned char* s1, int x1,int y1, int s1_width, int s1_height, const unsigned char* s2, int x2,int y2, int s2_width, int s2_height, boolean precise) {
  boolean result = false;

  // Basic collision rectangle
  int cx = x1>x2 ? x1 : x2;
  int cw = x1>x2 ? x2+s2_width-x1 : x1+s1_width-x2;

  int cy = y1>y2 ? y1 : y2;
  int ch = y1>y2 ? y2+s2_height-y1 : y1+s1_height-y2;

  if (cw>0 && ch>0) {
    result = true;
  }

  // No bounding rect collision or no precise check requested
  if (!precise || !result) {
    return result;
  }


  return false;
}`;

    case 'generators': return `
void _microcanvas_yield(byte n) {
  arduboy.display();
  while(n>0) {
    while (!arduboy.nextFrame()) delay(1);
    --n;
  }
}`;
  }
}
