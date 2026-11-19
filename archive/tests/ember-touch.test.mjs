import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {EmberTouch,EmberPool} from '../camp/ember-touch.js';
import {createFire,heatAt,FIRE,publicFire,addBranch} from '../camp/fire-state.js';
import {createFireVisual} from '../camp/fire-visual.js';
import {createWoodKit} from '../camp/wood.js';
import {fireSoundProfile,FireAudio} from '../camp/fire-audio.js';

function random(seed=42){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
test('touch has a short variable pause and a five-second break after five accepted touches',()=>{
 const t=new EmberTouch(random());let now=0;
 for(let i=0;i<5;i++){const e=t.touch(now,1);assert.equal(e.pause,i===4);assert.equal(t.touch(now+100,1),null);if(i<4)assert.ok(t.readyAt-now>=800&&t.readyAt-now<1200);now=t.readyAt;}
 assert.equal(now-t.readyAt,0);assert.equal(t.touch(now-1,1),null);assert.ok(t.touch(now,1));assert.equal(t.total,6);
});
test('heart events are approximately ten percent, with variable embers and weaker cold-fire strength',()=>{
 const t=new EmberTouch(random(100)),counts=new Set();let now=0;
 for(let i=0;i<10000;i++){const e=t.touch(now,.7);counts.add(e.count);assert.ok(e.count>=10&&e.count<=25);assert.ok(!e.heart||(e.heartCount>=20&&e.heartCount<=35));now=t.readyAt;}
 assert.ok(t.hearts>900&&t.hearts<1100);assert.ok(counts.size>10);
 const weak=new EmberTouch(()=>.5).touch(0,FIRE.min),hot=new EmberTouch(()=>.5).touch(0,FIRE.max);assert.ok(weak.strength<hot.strength/3);
});
test('heart rises, holds a camera-facing irregular outline, disperses and ends within three seconds',()=>{
 const p=new EmberPool(random()),e={count:15,heartCount:30,heart:true,strength:.8};p.emit(e,0,{x:0,z:1});
 p.update(1.05);const held=Array.from(p.positions);p.update(1.6);
 for(let i=15;i<45;i++){assert.ok(Math.abs(p.positions[i*3])<.001);assert.equal(p.positions[i*3+1],held[i*3+1]);assert.equal(p.positions[i*3+2],held[i*3+2]);}
 p.update(2.3);assert.notDeepEqual(Array.from(p.positions),held);p.update(2.99);assert.equal(p.active,0);assert.ok(p.fades.every(v=>v===0));
});
test('long repeated interactions keep the particle buffers bounded and trajectories finite',()=>{
 const p=new EmberPool(random()),positions=p.positions,fades=p.fades;
 for(let i=0;i<3000;i++){p.emit({count:25,heartCount:35,strength:1},i*.8,{x:1,z:0});p.update(i*.8+.4);assert.ok(p.active<=168);}
 assert.equal(p.positions,positions);assert.equal(p.fades,fades);assert.ok(p.positions.every(Number.isFinite));p.update(3000);assert.equal(p.active,0);
});
test('click targets firewood without touching fuel, food, or generating scene objects per stir',()=>{
 const scene=new T.Group(),f=createFireVisual(scene),fire=createFire(Date.now()),t=new EmberTouch(random());f.setState(fire);scene.updateMatrixWorld(true);
 const ray=new T.Raycaster(new T.Vector3(0,2,4),new T.Vector3(0,.4,0).sub(new T.Vector3(0,2,4)).normalize());assert.equal(f.pickWood(ray),true);
 ray.set(new T.Vector3(3,2,4),new T.Vector3(0,0,-1));assert.equal(f.pickWood(ray),false);
 const children=scene.children[0].children.length,before=JSON.stringify(fire);
 for(let i=0;i<500;i++){f.stir(t.touch(t.readyAt,1),i*5,{x:1,z:0});f.update(i*5+.5);}
 assert.equal(scene.children[0].children.length,children);assert.equal(JSON.stringify(fire),before);assert.ok(f.diagnostics.touchParticles<=168);f.dispose();
});
test('wood geometry and shared texture maps stay small, finite and dispose once',()=>{
 const k=createWoodKit();assert.ok(k.geometry.attributes.position.count<250);assert.ok(k.geometry.attributes.position.array.every(Number.isFinite));assert.equal(k.geometry.groups.length,2);
 assert.equal(k.materials[0].map.image.width,128);const resources=new Set([k.geometry,...k.materials,k.materials[0].map,k.materials[1].map]);let n=0;resources.forEach(r=>r.addEventListener('dispose',()=>n++));k.dispose();assert.equal(n,resources.size);
});
test('seven branches become a large fire, settle in ten seconds, then expose embers',()=>{
 let now=100000;const player={id:'a',room:'camp',x:0,z:2.55,seat:{group:'campfire-main'}},store={clients:new Map([['a',player]]),campfire:createFire(now),clock:()=>now};
 const levels=[];for(let i=0;i<7;i++){addBranch(store,'a');levels.push(store.campfire.heat);if(i<6)now+=1800;}
 assert.ok(levels[0]<levels[1]&&levels[1]<levels[2]&&levels[2]<levels[3]&&levels[3]<levels[4]);assert.equal(levels[6],FIRE.max);
 const end=now;assert.throws(()=>addBranch(store,'a'),/뜨겁/);now+=9999;assert.equal(publicFire(store.campfire,player,now).cooling,true);now++;
 assert.equal(publicFire(store.campfire,player,now).branches,0);assert.ok(heatAt(store.campfire,now)<1.1);assert.equal(heatAt(store.campfire,end+60000),FIRE.min);
 assert.doesNotThrow(()=>addBranch(store,'a'));
});
test('legacy cooling snapshots shorten the old pause without losing the shared sequence',()=>{
 const fire={...createFire(100),version:2,heat:1.68,sequence:17,branches:5,coolingUntil:35100,readyAt:35100,cycleUntil:35100,lastThrow:{at:100,branches:5,sequence:17}};
 const result=publicFire(fire,{},10101);assert.equal(result.cooling,false);assert.equal(result.branches,0);assert.equal(result.sequence,17);assert.equal(result.readyAt,10100);
});
test('hot flames have denser stronger crackles, while muted touch never starts audio',()=>{
 const cold=fireSoundProfile(FIRE.min),hot=fireSoundProfile(FIRE.max);assert.ok(hot.interval<cold.interval/4);assert.ok(hot.crackle>cold.crackle*4);assert.ok(hot.roar>cold.roar*4);
 const audio=new FireAudio();audio.stir(1);assert.equal(audio.context,null);assert.equal(audio.voices.size,0);audio.setVolume(4);assert.equal(audio.volume,.7);audio.dispose();
});
