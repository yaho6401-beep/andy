import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {EmberTouch} from '../camp/ember-touch.js';
import {createViewerEmbers} from '../camp/viewer-embers.js';
import {createMoonlitClouds} from '../camp/clouds.js';
import {CAMP_MOON_DIRECTION} from '../camp/moon.js';
import {moonlightAt} from '../camp/night-ambience.js';
import {FOREST_TREES,GATHERING_PATH,gatheringPathDistance,campMove,CAMP} from '../camp/layout.js';
import {findWalkPath} from '../src/navigation.js';
import {ArchiveStore} from '../server/room-store.mjs';
import {serializeStore,restoreStore} from '../server/persistence.mjs';
import {validPosition} from '../src/protocol.js';

function random(seed=42){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
test('lensward embers occur independently at thirty percent, without changing heart odds or touch cooldowns',()=>{
 const touch=new EmberTouch(random(63));let lens=0,heart=0;for(let i=0;i<20000;i++){const e=touch.touch(touch.readyAt,.8);lens+=e.towardViewer;heart+=e.heart;assert.equal(touch.touch(touch.readyAt-1,.8),null);}assert(lens>5700&&lens<6300);assert(heart>1800&&heart<2200);
});
test('lensward sparks travel from logs toward the camera then fade, with one fixed reusable GPU pool',()=>{
 const parent=new T.Group(),camera=new T.PerspectiveCamera(58,1,.1,140);camera.position.set(.4,2.2,4.6);camera.lookAt(0,.6,0);camera.updateMatrixWorld();const sparks=createViewerEmbers(parent,random()),mesh=parent.children[0],matrix=new T.Matrix4(),p=new T.Vector3();
 sparks.emit({towardViewer:true,strength:1},0,camera);sparks.update(.15,camera);mesh.getMatrixAt(0,matrix);p.setFromMatrixPosition(matrix);const before=p.distanceTo(camera.position);sparks.update(.58,camera);mesh.getMatrixAt(0,matrix);p.setFromMatrixPosition(matrix);assert(p.distanceTo(camera.position)<before);assert(sparks.diagnostics.active>0);assert(mesh.instanceMatrix.array.every(Number.isFinite));sparks.update(2,camera);assert.equal(sparks.diagnostics.active,0);
 const buffer=mesh.instanceMatrix.array;for(let i=0;i<1000;i++){sparks.emit({towardViewer:true},i,camera);sparks.update(i+.2,camera);}assert.equal(mesh.instanceMatrix.array,buffer);assert.equal(parent.children.length,1);assert(sparks.diagnostics.active<=48);sparks.update(1001,camera,true);assert.equal(mesh.visible,false);sparks.dispose();assert.equal(parent.children.length,0);
});
test('the cloud lighting uses the visible moon bearing and brightening yields to overcast skies',()=>{
 const parent=new T.Group(),clouds=createMoonlitClouds(parent),camera=new T.PerspectiveCamera(),bearing=new T.Vector3(-.2,.7,-.6).normalize();clouds.update(100,camera,{kind:'clear',cloudCover:.3},84000,bearing);assert.deepEqual(clouds.diagnostics.moonDirection,bearing.toArray());assert(parent.children[0].renderOrder<0);assert(CAMP_MOON_DIRECTION.y>0);assert(moonlightAt(84000,{kind:'clear',cloudCover:.03})>.9);assert.equal(moonlightAt(84000,{kind:'clear',cloudCover:.98}),0);assert(moonlightAt(84000,{kind:'rain',cloudCover:.98})<.01);clouds.dispose();
});
test('the big tent has an unobstructed broad lane and matching shared tree coordinates',()=>{
 for(const t of FOREST_TREES)assert(gatheringPathDistance(t.x,t.z)>3.2);for(let i=1;i<GATHERING_PATH.length;i++){const a=GATHERING_PATH[i-1],b=GATHERING_PATH[i];assert(campMove(a.x,a.z,b.x,b.z),'lane segment '+i);}
 assert(findWalkPath('camp',CAMP.spawn,GATHERING_PATH[0]).length);assert(findWalkPath('camp',CAMP.spawn,{x:-36,z:8}).length);
});
test('wetness and boost expiry tolerate legitimate in-flight steps, while teleport rejection stays authoritative',()=>{
 let now=100000;const store=new ArchiveStore({clock:()=>now});store.seed('a','걷는 손님');store.join('a');const p=store.clients.get('a');Object.assign(p,{room:'camp',x:0,z:6,moveCredit:0,lastMove:now});store.snapshot('a');const e=store.campEffects.get('a');e.joyUntil=now+100;now+=500;
 let result=store.action('a',{type:'move',room:'camp',epoch:0,path:[[1,2.4,6]],x:2.4,z:6,yaw:0,motion:'walk'});assert.equal(result.corrected,false);assert.equal(p.x,2.4);
 Object.assign(p,{x:22,z:-14,moveCredit:0,lastMove:now});e.wetness=0;e.exposure=0;e.at=now;now+=500;
 result=store.action('a',{type:'move',room:'camp',epoch:0,path:[[2,23.6,-14]],x:23.6,z:-14,yaw:0,motion:'walk'});assert.equal(result.corrected,false);assert(e.wetness>0);assert.equal(p.correction,0);
 now+=500;result=store.action('a',{type:'move',room:'camp',epoch:0,path:[[3,-30,8]],x:-30,z:8,yaw:0,motion:'walk'});assert.equal(result.corrected,true);assert.equal(p.x,23.6);
});
test('a layout upgrade only frees a walker trapped in a moved tree, preserving records and valid positions',()=>{
 const store=new ArchiveStore({clock:()=>100000});store.seed('a','이전 방문자');store.join('a');store.seed('b','그대로');store.join('b');Object.assign(store.clients.get('a'),{room:'camp',...FOREST_TREES[0]});Object.assign(store.clients.get('b'),{room:'camp',x:0,z:7});store.notes.push({id:'kept',text:'오늘의 기록'});const restored=restoreStore(JSON.parse(JSON.stringify(serializeStore(store))),()=>100100),a=restored.clients.get('a'),b=restored.clients.get('b');assert(validPosition('camp',a.x,a.z));assert(Math.hypot(a.x-FOREST_TREES[0].x,a.z-FOREST_TREES[0].z)<2);assert.equal(a.nickname,'이전 방문자');assert.equal(b.correction,0);assert.deepEqual([b.x,b.z],[0,7]);assert.equal(restored.notes[0].text,'오늘의 기록');
});
