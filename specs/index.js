var macro = require('../index'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    css = require('css');

function transform(fname) {
  fname = path.join(__dirname, fname);
  var src = fs.readFileSync(fname, 'utf8')
  return css.stringify({stylesheet: macro(css.parse(src).stylesheet)}) + '\n';
}

function assertTransforms(fixture, assertion) {
  assertion = fs.readFileSync(path.join(__dirname, assertion), 'utf8');
  assert.equal(transform(fixture), assertion);
}

describe('rework-macro', function() {

  it('works', function() {
    assertTransforms('test.css', 'assert.css');
  });

});
