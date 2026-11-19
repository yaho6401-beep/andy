import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {ArchiveStore} from '../server/room-store.mjs';
import {packFor} from '../server/snacks.mjs';
import {serializeStore,restoreStore} from '../server/persistence.mjs';
import {WOOD_FINDS,SNACKS,ROAST,roastState,HARVEST_PAUSE} from '../camp/snack-data.js';
import {FIRE,createFire,heatAt} from '../camp/fire-state.js';
import {CAMP_SEATS} from '../camp/layout.js';
import {validPosition} from '../src/protocol.js';
import {findWalkPath} from '../src/navigation.js';
import {createFireVisual} from '../camp/fire-visual.js';
import {createMeteors} from '../camp/meteors.js';
import {fireSoundProfile} from '../camp/fire-audio.js';

function fixture(){let now=100000;const s=new ArchiveStore({clock:()=>now});for(const id of ['a','b']){s.seed(id,id);s.join(id);}const seat=(id='a',i=0)=>{const seat=CAMP_SEATS[i];Object.assign(s.clients.get(id),{room:'camp',x:seat.stand.x,z:seat.stand.z,seat:null});s.action(id,{type:'sit',seat:seat.id});};return {s,seat,advance:ms=>now+=ms};}

test('camp wood is reachable, privately capped at three, and cannot be remotely or repeatedly collected',()=>{
 const {s,advance}=fixture();assert.throws(()=>s.action('a',{type:'harvest',spot:WOOD_FINDS[0].id,count:99}),/가까이/);
 for(const spot of WOOD_FINDS){assert(validPosition('camp',spot.x,spot.z));assert(findWalkPath('camp',{x:0,z:8.5},spot).length);Object.assign(s.clients.get('a'),{room:'camp',x:spot.x,z:spot.z,seat:null});s.action('a',{type:'harvest',spot:spot.id});assert.throws(()=>s.action('a',{type:'harvest',spot:spot.id}),/방금|세 개/);}
 assert.equal(s.snapshot('a').myPack.wood,3);assert.equal(s.snapshot('b').myPack.wood||0,0);advance(HARVEST_PAUSE);assert.throws(()=>s.action('a',{type:'harvest',spot:WOOD_FINDS[2].id}),/세 개/);
 const restored=restoreStore(JSON.parse(JSON.stringify(serializeStore(s))),s.clock);assert.equal(restored.snapshot('a').myPack.wood,3);
});
test('additional logs consume one owned log each, preserve branch count, enforce shared pauses/cap and cool naturally',()=>{
 const {s,seat,advance}=fixture();seat();seat('b',1);packFor(s,'a').wood=3;packFor(s,'b').wood=1;
 assert.throws(()=>s.action('b',{type:'camp-snack-fuel'}),/너무 탄/);
 const levels=[];for(let i=0;i<3;i++){s.action('a',{type:'campfire-log',heat:999,count:999});levels.push(s.campfire.heat);assert.equal(s.snapshot('a').myPack.wood,2-i);assert.equal(s.snapshot('a').campfire.logs,i+1);assert.equal(s.snapshot('a').campfire.branches,0);assert.throws(()=>s.action('b',{type:'campfire-log'}),/천천히/);advance(1800);}
 assert(levels[0]<levels[1]&&levels[1]<levels[2]);assert(levels[2]>FIRE.max&&levels[2]<=FIRE.fuelMax);assert.throws(()=>s.action('b',{type:'campfire-log'}),/세 개/);assert.equal(packFor(s,'b').wood,1);
 advance(60000);assert(heatAt(s.campfire,s.clock())>.8);advance(31000);assert.equal(s.snapshot('b').campfire.logs,0);s.action('b',{type:'campfire-log'});assert.equal(packFor(s,'b').wood,0);
});
test('ready vegetables gradually scorch; burnt ones cannot be eaten or shared, but fuel reuse works exactly once',()=>{
 for(const kind of ['potato','sweetpotato']){const {s,seat,advance}=fixture();seat();packFor(s,'a').items[kind]=1;s.action('a',{type:'camp-snack',kind});const job=packFor(s,'a').job;
  assert.equal(roastState(job,s.clock()).stage,'cooking');for(let i=0;i<150&&!roastState(job,s.clock()).ready;i++){advance(1000);s.snapshot('a');}assert.equal(roastState(job,s.clock()).stage,'ready');assert.throws(()=>s.action('a',{type:'camp-snack-fuel',burnt:true}),/너무 탄/);
  for(let i=0;i<150&&roastState(job,s.clock()).scorch<.4;i++){advance(1000);s.snapshot('a');}assert.equal(roastState(job,s.clock()).stage,'scorching');assert(roastState(job,s.clock()).scorch>=.4&&roastState(job,s.clock()).scorch<1);
  for(let i=0;i<150&&!roastState(job,s.clock()).burnt;i++){advance(1000);s.snapshot('a');}assert.equal(roastState(job,s.clock()).stage,'burnt');for(const share of [false,true])assert.throws(()=>s.action('a',{type:'camp-snack-take',share,readyAt:0}),/너무 타/);
  assert.equal(s.sharedSnacks.length,0);assert.throws(()=>s.action('b',{type:'camp-snack-fuel',owner:'a'}),/앉아/);const heat=heatAt(s.campfire,s.clock());s.action('a',{type:'camp-snack-fuel'});assert(s.campfire.heat>heat+.2&&s.campfire.heat<heat+.6);assert.equal(packFor(s,'a').job,null);assert.equal(s.snapshot('a').campfire.branches,0);assert.throws(()=>s.action('a',{type:'camp-snack-fuel'}),/너무 탄/);
 }
});
test('burned food remains burned after reconnect, while served halves stay edible off the heat',()=>{
 const {s,seat,advance}=fixture();seat();packFor(s,'a').items.potato=1;s.action('a',{type:'camp-snack',kind:'potato'});advance(180000);const restored=restoreStore(JSON.parse(JSON.stringify(serializeStore(s))),s.clock);assert.throws(()=>restored.action('a',{type:'camp-snack-take'}),/너무 타/);
 const j={kind:'potato',startedAt:0,readyAt:1000,shared:true};assert.equal(roastState(j,1e9).scorch,0);
});
test('new visual baseline retains small flames and roasting changes colors without accumulating scene props',()=>{
 const root=new T.Group(),fire=createFireVisual(root),now=Date.now(),seat=CAMP_SEATS[0];fire.setState({...createFire(now),heat:FIRE.min});fire.update(1);assert(fire.diagnostics.flameHeight>=.95);
 for(const stage of ['raw','ready','burnt']){const end=stage==='raw'?now+20000:stage==='ready'?now-1000:now-100000;fire.setSnacks([{id:'food',kind:'potato',seat:seat.id,startedAt:end-25000,readyAt:end}]);fire.update(2);const d=fire.diagnostics.food[0];if(stage==='raw')assert.equal(d.scorch,0);if(stage==='burnt')assert.equal(d.scorch,1);}
 const count=root.children[0].children.length;for(let i=0;i<100;i++)fire.update(i/10);assert.equal(root.children[0].children.length,count);fire.setSnacks([]);assert.equal(fire.diagnostics.roasting,0);fire.dispose();assert.equal(root.children.length,0);
});
test('meteors remain rare, respect reduced motion and reuse the same GPU buffers across many appearances',()=>{
 const root=new T.Group(),sky=createMeteors(root,()=>.5),camera=new T.PerspectiveCamera(50,1,.1,80);camera.updateMatrixWorld();sky.update(1,camera);assert.equal(sky.diagnostics.visible,false);
 sky.update(14,camera);assert.equal(sky.diagnostics.visible,true);sky.update(14.5,camera);const geo=root.children[0].geometry,positions=geo.attributes.position.array;assert(positions.every(Number.isFinite));sky.update(16,camera);assert.equal(sky.diagnostics.visible,false);
 for(let i=1;i<100;i++){sky.update(14+i*34,camera);assert.equal(geo.attributes.position.array,positions);}sky.update(4000,camera,true);assert.equal(sky.diagnostics.visible,false);assert.equal(root.children.length,2);sky.dispose();assert.equal(root.children.length,0);
 for(const heat of [FIRE.min,FIRE.max,FIRE.fuelMax])assert(fireSoundProfile(heat).interval>=65);
});
