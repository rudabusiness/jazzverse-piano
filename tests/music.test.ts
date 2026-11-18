import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateOnsets } from '../lib/music-engine';

const note=[{id:'n1',pitch:60,atMs:1000}];
test('perfect performance is 100',()=>{const r=evaluateOnsets(note,[{pitch:60,atMs:1000}]);assert.equal(r.score,100);assert.equal(r.hitCount,1);});
test('silence is 0 and missing target',()=>{const r=evaluateOnsets(note,[]);assert.equal(r.score,0);assert.equal(r.missCount,1);});
test('both inclusive boundaries match',()=>{for(const offset of [-150,150]){const r=evaluateOnsets(note,[{pitch:60,atMs:1000+offset}]);assert.equal(r.hitCount,1);assert.equal(r.score,70);}});
test('outside 151ms does not match',()=>{for(const offset of [-151,151]){const r=evaluateOnsets(note,[{pitch:60,atMs:1000+offset}]);assert.equal(r.hitCount,0);assert.equal(r.unexpectedCount,1);}});
test('duplicate event never gives duplicate credit',()=>{const r=evaluateOnsets(note,[{pitch:60,atMs:1000},{pitch:60,atMs:1000}]);assert.equal(r.hitCount,1);assert.equal(r.unexpectedCount,1);assert.equal(r.score,65);});
test('extra unexpected note lowers score',()=>{const r=evaluateOnsets(note,[{pitch:60,atMs:1000},{pitch:62,atMs:1000}]);assert.equal(r.score,65);});
test('permitted jazz color does not lower score or replace missing notes',()=>{
 const regions=[{fromMs:0,toMs:2000,chord:'C7',allowedExtraPitchClasses:[3]}];
 const r=evaluateOnsets(note,[{pitch:60,atMs:1000},{pitch:63,atMs:1100}],regions);
 assert.equal(r.score,100);assert.equal(r.allowedTensionCount,1);
 const missing=evaluateOnsets(note,[{pitch:63,atMs:1100}],regions);
 assert.equal(missing.score,0);assert.equal(missing.missCount,1);assert.equal(missing.allowedTensionCount,1);
});
test('same pitch color in disallowed region is unexpected',()=>{
 const regions=[{fromMs:0,toMs:1000,chord:'C7',allowedExtraPitchClasses:[3]},{fromMs:1000,toMs:2000,chord:'Dm7',allowedExtraPitchClasses:[]}];
 const r=evaluateOnsets([{id:'n',pitch:60,atMs:1100}],[{pitch:60,atMs:1100},{pitch:63,atMs:1200}],regions);
 assert.equal(r.unexpectedCount,1);
});
test('matches are deterministic with overlapping same pitch targets',()=>{
 const targets=[{id:'a',pitch:60,atMs:1000},{id:'b',pitch:60,atMs:1100}];
 const inputs=[{pitch:60,atMs:1040},{pitch:60,atMs:1080}];
 assert.deepEqual(evaluateOnsets(targets,inputs),evaluateOnsets(targets,inputs));assert.equal(evaluateOnsets(targets,inputs).hitCount,2);
});
test('rejects invalid data and zero target exercises',()=>{
 assert.throws(()=>evaluateOnsets([],[]));assert.throws(()=>evaluateOnsets(note,[{pitch:-1,atMs:0}]));assert.throws(()=>evaluateOnsets(note,[],[],0));
});
