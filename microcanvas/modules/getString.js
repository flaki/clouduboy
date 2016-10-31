'use strict';



function getString(exp) {
  if (typeof exp === 'string') return exp;

  if (!exp || !exp.type ) return '<"'+String(exp)+'>"';

  let self = getString;

  switch (exp.type) {
    case 'Identifier':
      return exp.name;

    case 'Literal':
      return exp.value;

    case 'TemplateLiteral':
      return (exp.quasis.map(q => q.value.raw).join())

    case 'MemberExpression':
      // Simple property access
      if (exp.property.type === 'Identifier') {
        return (self(exp.object) + '.' + self(exp.property));
      }

      // Property expression
      return (self(exp.object) + '[ ' + self(exp.property)) +' ]';

    case 'NewExpression':
      return 'new '+self(exp.callee);

    case 'ExpressionStatement':
      return self(exp.expression);

    case 'BinaryExpression':
    case 'AssignmentExpression':
      return self(exp.left) +' '+exp.operator+' '+ self(exp.right);

    default:
      return '"<'+exp.type+'>"';
  }
}



module.exports = getString;
