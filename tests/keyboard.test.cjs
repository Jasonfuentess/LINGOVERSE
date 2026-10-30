const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
runInNewContext(ts.transpileModule(readFileSync('src/components/keyboardGeometry.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exportsObject});
const { revealDelta, viewportObstruction } = exportsObject;
test('keyboard reveal keeps visible input/action groups still and scrolls only the obscured portion',()=>{
  assert.equal(revealDelta(100,180,12,500),0);
  assert.equal(revealDelta(400,180,12,500),80);
  assert.equal(revealDelta(-10,180,12,500),-22);
  assert.equal(revealDelta(40,300,12,180),28);
  assert.equal(revealDelta(12,300,12,180),0);
  assert.equal(revealDelta(100,180,500,500),0);
});
test('visual viewport adds only keyboard obstruction, not zoom or a second Android resize inset',()=>{
  assert.equal(viewportObstruction(800,500,0,1),300);
  assert.equal(viewportObstruction(500,500,0,1),0);
  assert.equal(viewportObstruction(800,500,80,1),220);
  assert.equal(viewportObstruction(800,400,0,2),0);
});
