'use strict';

const getString = require('./getString.js');
const getObject = require('./getObject.js');

const lookup = require('./lookup.js');

const translateLib = require('./translateLib.js')(translate);



function translate(exp) {
  if (typeof exp === 'string') return exp;

  if (!exp || !exp.type ) return '?';

  let self = translate;

  switch (exp.type) {

    // Literals return the textual definiton of the literal
    case 'Literal':
      return JSON.stringify(exp.value);

    // Look up identifiers
    case 'Identifier': // TODO: we'll need to handle scope (path)
      return lookup(exp);

    // Member expressions are usually translated to built-in methods
    case 'MemberExpression':
      let obj = self(exp.object);

      // MicroCanvas calls
      if (obj === self.game.alias
       || obj.match(/^(g|s)fx/) // Game asset properties (gfx & sfx)
     ) {
        return translateLib(exp);

      // Some other library
      } else {
        // Simple property access
        //if (exp.property.type === 'Identifier') {
        //  return '? ' + (self(exp.object) + '.' + self(exp.property));
        //} this shouldn't be needed now

        // Property expression
        return '(' + (self(exp.object) + ').' + self(exp.property));
        // TODO: property access belongs to subexpressions, move it there
        // TODO: add one-level-deep ternary support
        // TODO: support bracket notation for complex properties
        // TODO: do not parenthetise simple identifiers
      }

    // Define a new variable on the current scope
    case 'VariableDeclaration':
      return exp.declarations.map(dec => self(dec)).join(' ');

    case 'VariableDeclarator':
      let id = getString(exp.id),
          initializer = self(exp.init);

      let v = self.game.createVariable(id, initializer, undefined, exp);

      return (
        (v.type ? v.type : self.game.guessType(v.id, v.value, v.$scope)) + ' '
        + v.cid
        + (typeof v.value !== 'undefined' ? ' = ' + v.value : '')
        + ';'
      );

    // Just unwrap expression body
    case 'ExpressionStatement':
      return self(exp.expression) +';';

    // And wrap a block statement
    case 'BlockStatement':
      return '{\n'+exp.body.map(e => '  '+self(e)).join('\n') +'\n}';

    // Loops
    case 'WhileStatement':
      return 'while ('+self(exp.test)+') ' + self(exp.body);

    // For loop
    case 'ForStatement':
      // init / test / update / body
      let loopInit = self(exp.init).replace(/;$/,'');

      return 'for ('+loopInit+'; '+self(exp.test)+'; '+self(exp.update)+') '+self(exp.body);
      break;

    // If statements are all the same
    case 'IfStatement':
      return 'if ('+self(exp.test)+') '
        +( exp.consequent
           ? self(exp.consequent) + ( exp.alternate ? ' else ' + self(exp.alternate) : '')
           : ''
        );

    // Similarly, conditionals too
    case 'ConditionalExpression':
      return '('+self(exp.test)
        +( exp.consequent
           ? ' ? '+self(exp.consequent) + ( exp.alternate ? ' : '+self(exp.alternate) : '')
           : ''
        )+')'; // TODO: smarter parens

    // Function calls
    case 'CallExpression':
      return translateLib(exp.callee, exp);

    // Return statements
    case 'ReturnStatement':
      return 'return' + (exp.argument ? ' '+self(exp.argument) : '') + ';';

    // Assignment and binary expressions work pretty much unchanged across JS/C
    case 'LogicalExpression': // TODO: parens?
    case 'BinaryExpression': // TODO: parens!
    case 'AssignmentExpression':
      // Special handling for game.playbackRate changes
      if (exp.type == 'AssignmentExpression'
       && getString(exp.left) == self.game.alias+'.playbackRate'
      ) {
        return translateLib(exp.left, exp);
      }

      let op = exp.operator

      // Handle triple-equals
      if (op === '===') op = '==';

      return self(exp.left) +' '+op+' '+ self(exp.right);

    // Unary expression (pre + postfix) work mostly the same
    // TODO: boolean tricks? (!something >>> 1-something)
    case 'UpdateExpression':
    case 'UnaryExpression':
      return (exp.prefix
        ? exp.operator + self(exp.argument)
        : self(exp.argument) + exp.operator
      );

    // Yield has a special meaning in microcanvas
    // (acts as a terminator of a generator-function frame)
    case 'YieldExpression':
      return translate.game.target+'.display(); delay('+getString(exp.argument)+'*16)';

  }

console.log(exp);
  return '__translate("'+exp.type+'", "'+(exp.$raw||'')+'")';
}

function translateArgs(args) {
  return '('
    +(args.length
      ? ' '+args.map(arg => translate(arg)).join(', ')+' '
      : ''
    )
  +')';

}



translate.args = translateArgs;
module.exports = translate;
