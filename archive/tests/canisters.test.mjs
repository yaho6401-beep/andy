import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {ArchiveStore} from '../server/room-store.mjs';
import {serializeStore,restoreStore} from '../server/persistence.mjs';
import {CANISTERS,OIL_HEAT,OIL_HOLD_MS} from '../camp/canisters.js';
import {CAMP_SEATS,campPosition} from '../camp/layout.js';
import {heatAt,FIRE} from '../camp/fire-state.js';
import {packFor} from '../server/snacks.mjs';
import {createCanisterModel} from '../camp/canister-model.js';
import {findWalkPath} from '../src/navigation.js';

function fixture(){let now=100000;const s=new ArchiveStore({clock:()=>now});for(const id of ['a','b']){s.seed(id,id);s.join(id);}const pick=(id,spot)=>{Object.assign(s.clients.get(id),{room:'camp',x:spot.x,z:spot.z,seat:null});return s.action(id,{type:'camp-can-pickup',spot:spot.id});};const sit=(id,i=0)=>{const seat=CAMP_SEATS[i];Object.assign(s.clients.get(id),{room:'camp',seat:null,x:seat.stand.x,z:seat.stand.z});s.action(id,{type:'sit',seat:seat.id});};return {s,pick,sit,advance:ms=>now+=ms};}
test('both tents offer reachable individual water and fuel props, with no wall crossing',()=>{
 assert.equal(CANISTERS.length,4);for(const c of CANISTERS){assert.ok(campPosition(c.x,c.z));assert.ok(findWalkPath('camp',{x:0,z:8.5},c).length);}
});
test('pickup validates admission, proximity, one of each held kind and one claim per prop',()=>{
 const {s,pick,sit,advance}=fixture();assert.throws(()=>s.action('a',{type:'camp-can-pickup',spot:CANISTERS[0].id}),/가까이/);
 pick('a',CANISTERS[0]);pick('a',CANISTERS[1]);assert.throws(()=>pick('a',CANISTERS[2]),/하나/);assert.equal(s.snapshot('b').players.find(p=>p.id==='a').heldCan,'water');assert.ok(!('canClaims' in s.snapshot('b').myPack));
 assert.throws(()=>s.action('a',{type:'camp-can-pour',kind:'water',heat:0}),/앉아서/);sit('a');assert.throws(()=>s.action('a',{type:'camp-can-pour',kind:'fake'}),/손에 든/);const receipt=s.action('a',{type:'camp-can-pour',kind:'fuel',heat:0});assert.equal(receipt.kind,'fuel');assert.equal(s.campfire.heat,OIL_HEAT);assert.equal(s.packs.get('a').can.kind,'water');assert.deepEqual(s.snapshot('b').players.find(p=>p.id==='a').heldCans,['water']);
 advance(2000);s.action('a',{type:'camp-can-pour',kind:'water'});advance(2000);assert.throws(()=>s.action('a',{type:'camp-can-pour'}),/손에 든/);assert.throws(()=>pick('a',CANISTERS[0]),/이미/);pick('b',CANISTERS[0]); // Claims belong to a visitor, not all guests.
});
test('oil exceeds normal maximum briefly, decays slowly, and server permits only missing ingredients until danger',()=>{
 const {s,pick,sit,advance}=fixture();pick('a',CANISTERS[0]);sit('a');s.action('a',{type:'camp-can-pour'});assert.ok(heatAt(s.campfire,s.clock())>FIRE.fuelMax);assert.equal(s.snapshot('a').campfire.fuelLocked,true);
 const pack=packFor(s,'a');pack.wood=2;advance(2000);assert.equal(s.action('a',{type:'campfire-branch'}).branches,1);advance(2000);s.action('a',{type:'campfire-log'});assert.equal(pack.wood,1);assert.equal(s.snapshot('a').campfire.branchLocked,false);
 const plain={...s.campfire,oilUntil:0};advance(20000);assert.ok(heatAt(s.campfire,s.clock())>heatAt(plain,s.clock())+.8);assert.equal(s.snapshot('a').campfire.fuelLocked,true);
 advance(OIL_HOLD_MS);assert.equal(s.snapshot('a').campfire.fuelLocked,false);assert.doesNotThrow(()=>s.action('a',{type:'campfire-log'}));
});
test('water sharply returns shared fire to its minimum and unlocks fuel, with no repeat consumption',()=>{
 const {s,pick,sit,advance}=fixture();pick('a',CANISTERS[0]);pick('b',CANISTERS[1]);sit('a');sit('b',1);s.action('a',{type:'camp-can-pour'});advance(2000);assert.throws(()=>s.action('b',{type:'camp-can-pour',kind:'fuel'}),/손에 든/);s.action('b',{type:'camp-can-pour',kind:'water'});const f=s.snapshot('a').campfire;assert.equal(f.heat,FIRE.min);assert.equal(f.fuelLocked,false);assert.equal(f.branches,0);assert.equal(f.logs,0);assert.equal(f.pourKind,'water');advance(2000);assert.doesNotThrow(()=>s.action('a',{type:'campfire-branch'}));assert.throws(()=>s.action('b',{type:'camp-can-pour'}),/손에 든/);
});
test('private can ownership and cooking/drink records survive JSON restore without overwrites',()=>{
 const {s,pick}=fixture();s.notes.push({id:'keep',text:'keep'});const p=s.clients.get('a');p.heldItem='coffee-americano';p.heldTakeout=true;p.sipsLeft=4;const pack=packFor(s,'a');pack.items.potato=2;pack.oils.orange=1;pick('a',CANISTERS[2]);const restored=restoreStore(JSON.parse(JSON.stringify(serializeStore(s))),s.clock);assert.deepEqual(restored.snapshot('a').myPack,s.snapshot('a').myPack);assert.equal(restored.clients.get('a').heldItem,'coffee-americano');assert.equal(restored.notes[0].text,'keep');assert.equal(restored.snapshot('b').players.find(p=>p.id==='a').heldCan,'fuel');assert.ok(!JSON.stringify(restored.snapshot('b').players).includes('canClaims'));
});
test('hand props contain finite original geometry and release owned GPU resources',()=>{
 for(const kind of ['fuel','water']){const g=createCanisterModel(kind),parent=new T.Group();parent.add(g);const resources=new Set();g.traverse(o=>{if(o.geometry){resources.add(o.geometry);for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));}if(o.material)resources.add(o.material);});let disposed=0;for(const r of resources)r.addEventListener('dispose',()=>disposed++);g.userData.dispose();assert.equal(disposed,resources.size);assert.equal(parent.children.length,0);}
});
test('ordinary fuel cannot reach the special oil ceiling; remote pickup cannot teleport through walls',()=>{
 const {s,pick,sit,advance}=fixture();sit('a');packFor(s,'a').wood=3;
 for(let i=0;i<7;i++){advance(1900);s.action('a',{type:'campfire-branch'});}
 for(let i=0;i<3;i++){advance(1900);s.action('a',{type:'campfire-log'});}
 assert.ok(s.campfire.heat<=FIRE.fuelMax);assert.ok(s.campfire.heat<OIL_HEAT);
 const p=s.clients.get('b'),c=CANISTERS[0];Object.assign(p,{room:'camp',x:0,z:8.5});assert.throws(()=>s.action('b',{type:'camp-can-pickup',spot:c.id,position:{room:'camp',x:c.x,z:c.z,epoch:p.epoch}}));assert.equal(s.packs.get('b')?.can,undefined);
});
