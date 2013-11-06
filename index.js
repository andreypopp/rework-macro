"use strict";

module.exports = function(style, ctx) {
  style.rules = style.rules
    .map(visit.bind(null, ctx && ctx.macros || {}))
    .filter(Boolean);
  return style;
};

function visit(macros, node) {
  if (node.selectors &&
      node.selectors.length === 1 &&
      /^@macro /.exec(node.selectors[0])) {
    var name = node.selectors[0].slice(7);
    node.declarations = apply(macros, node);
    macros[name] = compile(node, name);
  } else if (node.rules) {
    node.rules = node.rules.map(visit.bind(null, macros)).filter(Boolean);
    return node;
  } else if (node.declarations) {
    node.declarations = apply(macros, node);
    return node;
  }
}

function apply(macros, node) {
  var declarations = [];
  for (var i = 0, len = node.declarations.length; i < len; i++) {
    var decl = node.declarations[i];
    if (macros[decl.property]) {
      var args = decl.value.split(' ');
      args.unshift(decl);
      declarations = declarations.concat(macros[decl.property].apply(null, args));
    } else {
      declarations.push(node.declarations[i]);
    }
  }
  return declarations;
}

function compile(node, name) {
  var code = [];
  var argnum = 0;

  for (var i = 0, len = node.declarations.length; i < len; i++) {
    var decl = node.declarations[i];
    var compiled = {};

    for (var k in decl)
      compiled[k] = decl[k];

    compiled.value = decl.value
      .replace(/\$[1-9]/g, function(m) {
        argnum = Math.max(argnum, m.slice(1));
        return '\u0001' + m + '\u0001';
      }) // jshint ignore:line
      .split('\u0001')
      .filter(Boolean)
      .map(quote)
      .join(' + ');
    compiled.value = '\u0001' + compiled.value + '\u0001';
    compiled = JSON.stringify(compiled).replace(/"?\\u0001"?/g, '');
    code.push(compiled);
  }

  var assertion = (
    'if (undefined === $' + argnum + ' || undefined !== $' + (argnum + 1) + ') {' +
    '  throw new Error("unable to expand macro \'' +
          name + '\': wrong number of arguments passed ("' +
          '+ (arguments.length - 1) + " of ' +
          argnum + ' required) at " + (node.position.source || "")' +
          '+ ":" + node.position.start.line);' +
    '}');

  code = new Function( // jshint ignore:line
    'node', '$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9',
    assertion + '\n' + 'return [' + code.join(',') + '];');
  return code;
}

function quote(x) {
  return x[0] === '$' ? x : "'" + x + "'";
}
