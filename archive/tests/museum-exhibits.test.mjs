import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {INGREDIENTS} from '../src/scent-exhibits.js';import {MUSEUM_EXHIBITS} from '../src/museum-layout.js';
import {validPosition,validMove} from '../src/protocol.js';import {findWalkPath} from '../src/navigation.js';
const catalog=JSON.parse(readFileSync(new URL('../../data/fragrance-catalog.json',import.meta.url),'utf8'));
test('30 museum notes match every original store ID and keep T/M/L numbering',()=>{
 assert.equal(INGREDIENTS.length,30);assert.equal(new Set(INGREDIENTS.map(s=>s.id)).size,30);
 assert.deepEqual(INGREDIENTS.map(s=>s.id),catalog.singleScents.map(s=>s.id));
 for(const prefix of ['T','M','L'])assert.deepEqual(INGREDIENTS.filter(s=>s.code[0]===prefix).map(s=>s.code),Array.from({length:10},(_,i)=>prefix+(i+1)));
 assert.equal(INGREDIENTS[0].name,'버가못');assert.equal(INGREDIENTS[29].name,'밤부');
 for(const s of INGREDIENTS){assert.ok(s.description.length>50);assert.ok(s.blending.length>30);assert.ok(s.memory.length>10);for(const code of s.pairs)assert.ok(INGREDIENTS.some(n=>n.code===code));}
});
test('every exhibit has a reachable safe approach and blocks walking through its pedestal',()=>{
 for(const s of MUSEUM_EXHIBITS){assert.ok(!validPosition('scents',s.x,s.z));assert.ok(validPosition('scents',s.approach.x,s.approach.z),s.code);let p={x:12,z:0};const path=findWalkPath('scents',p,s.approach);assert.ok(path.length,s.code);for(const q of path){assert.ok(validMove('scents',p.x,p.z,q.x,q.z));p=q;}assert.deepEqual(p,s.approach);}
});
