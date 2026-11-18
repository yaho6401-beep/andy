import test from 'node:test';import assert from 'node:assert/strict';
import {SCENTS,GROUPS,DEFAULT_TARGET,validateRecipe,blendRecipe,createRecord,readRecords,saveRecord,deleteRecord,RECORD_KEY} from '../../workshop/model.js';
import {directEntry} from '../src/room-entry.js';import {validPosition} from '../src/protocol.js';
const make=(ingredients=[{code:'T1',drops:25},{code:'M1',drops:25},{code:'L5',drops:20}],targetTotal=70)=>({ingredients,targetTotal});
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),data};};
test('workshop reuses all store IDs, exactly T1–10/M1–10/L1–10, with complete preview families',()=>{
 assert.equal(DEFAULT_TARGET,70);assert.equal(SCENTS.length,30);for(const g of GROUPS)assert.deepEqual(SCENTS.filter(s=>s.note===g.note).map(s=>s.code),Array.from({length:10},(_,i)=>g.prefix+(i+1)));assert.ok(SCENTS.every(s=>s.family));assert.equal(SCENTS[0].name,'버가못');
});
test('only 3–8 distinct known notes with positive integer drops and exact editable total pass',()=>{
 assert.equal(validateRecipe(make()).valid,true);
 for(const recipe of [make([]),make([{code:'T1',drops:35},{code:'M1',drops:35}]),make(SCENTS.slice(0,9).map(s=>({code:s.code,drops:10})),90),make([{code:'T1',drops:30},{code:'T1',drops:20},{code:'L1',drops:20}]),make([{code:'T11',drops:30},{code:'M1',drops:20},{code:'L1',drops:20}])])assert.equal(validateRecipe(recipe).valid,false);
 for(const bad of ['',0,-2,1.5,'NaN','Infinity','2e1']){const recipe=make();recipe.ingredients[0].drops=bad;assert.equal(validateRecipe(recipe).valid,false,String(bad));}
 for(const target of ['',0,-1,70.5,10000,'NaN'])assert.equal(validateRecipe(make(undefined,target)).valid,false);
 assert.equal(validateRecipe(make(undefined,71)).valid,false);assert.equal(validateRecipe(make([{code:'T1',drops:10},{code:'M1',drops:10},{code:'L5',drops:10}],30)).valid,true);
 assert.throws(()=>blendRecipe(make(undefined,69)));assert.equal(validateRecipe(make()).total,70);
});
test('weighted rule preview and table use actual drops; editing dominance changes mood and color',()=>{
 const a=blendRecipe(make()),b=blendRecipe(make([{code:'T1',drops:1},{code:'M1',drops:1},{code:'L5',drops:68}]));
 assert.deepEqual(a.noteTotals,{top:25,middle:25,base:20});assert.equal(a.totalDrops,70);assert.equal(a.description.length,3);assert.notEqual(a.color,b.color);assert.equal(b.families[0].id,'soft');assert.match(b.description[2],/잔향/);assert.ok(a.description.some(s=>s.includes('버가못')&&s.includes('장미')));assert.equal(a.base,null);assert.equal(a.kind,'individual');
});
test('local records round-trip dates, names, all drop counts and descriptions without touching existing journals',()=>{
 const storage=memory();storage.setItem('existing-journal','keep');const r=createRecord(blendRecipe(make()),'나의 첫 향',{id:'one',now:new Date('2026-11-18T02:00:00Z')});
 assert.equal(saveRecord(storage,r).length,1);assert.equal(saveRecord(storage,r).length,1);assert.deepEqual(readRecords(storage)[0],r);assert.equal(r.targetTotal,70);assert.equal(r.ingredients[2].drops,20);assert.equal(r.name,'나의 첫 향');assert.ok(r.createdAt.endsWith('Z'));assert.equal(storage.getItem('existing-journal'),'keep');assert.equal(deleteRecord(storage,'one').length,0);
 assert.throws(()=>createRecord(blendRecipe(make()),'   '));assert.throws(()=>createRecord(blendRecipe(make()),'a'.repeat(41)));
});
test('blocked/full/corrupt storage fails visibly and never overwrites previous records',()=>{
 assert.throws(()=>saveRecord({getItem:()=>null,setItem:()=>{throw Error('quota');}},createRecord(blendRecipe(make()),'향')));
 const storage=memory();storage.setItem(RECORD_KEY,'broken');assert.throws(()=>saveRecord(storage,createRecord(blendRecipe(make()),'향')));assert.equal(storage.getItem(RECORD_KEY),'broken');
});
test('direct public-room entry uses server-owned safe positions and rejects unknown/private coordinates',()=>{
 for(const room of ['scents','books','lobby','salon','camp']){const entry=directEntry(room);assert.ok(entry);assert.ok(validPosition(entry.room,entry.x,entry.z));}
 for(const room of ['admin','__proto__','constructor','garden','../../',null,{room:'scents',x:9999,z:9999}])assert.equal(directEntry(room),null);
});
