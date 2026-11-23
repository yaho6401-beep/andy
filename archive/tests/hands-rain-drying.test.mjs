import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {createWarmingHands} from '../camp/warming-hands.js';
import {createSoftRain} from '../camp/rain-visual.js';
import {fireDryDuration,DRY_FIRE,DRY_NATURAL} from '../camp/comfort-state.js';
import {ArchiveStore} from '../server/room-store.mjs';
import {CAMP_SEATS} from '../camp/layout.js';
import {restoreStore,serializeStore} from '../server/persistence.mjs';

test('slow hand assets never reveal a procedural fallback; ready hands enter smoothly with only two planes',()=>{
 const root=new T.Group(),camera=new T.PerspectiveCamera(46,390/844),texture=new T.Texture();let ready;const hands=createWarmingHands(root,{loadTexture:ok=>{ready=ok;return texture;}});hands.set(true);for(let i=0;i<180;i++)hands.update(i/60,camera);assert.equal(hands.diagnostics.visible,false);assert.equal(hands.diagnostics.amount,0);assert.equal(hands.diagnostics.meshes,2);ready(texture);hands.update(3,camera);assert(hands.diagnostics.visible);assert(hands.diagnostics.amount<.2);for(let i=1;i<60;i++)hands.update(3+i/60,camera);assert(hands.diagnostics.amount>.9);hands.set(false);for(let i=0;i<30;i++)hands.update(4+i/60,camera);assert(!hands.diagnostics.visible);hands.set(true,0,false);hands.update(4.6,camera);assert(hands.diagnostics.amount<.4);hands.dispose();assert.equal(root.children.length,0);
});
test('failed or late hand loads never show the former shape or attach objects after disposal',()=>{
 const root=new T.Group(),camera=new T.PerspectiveCamera();let fail,ready;const texture=new T.Texture(),h=createWarmingHands(root,{loadTexture:(ok,no)=>{ready=ok;fail=no;return texture;}});h.set(true);fail();h.update(1,camera);assert.equal(h.diagnostics.loadFailed,true);assert.equal(h.diagnostics.visible,false);h.dispose();ready(texture);assert.equal(root.children.length,0);
});
test('more legible rain keeps a fixed pool, near-field width and visible stationary rain in reduced motion',()=>{
 const root=new T.Group(),r=createSoftRain(root);r.update(1,{x:0,z:0},true,1);assert.equal(r.diagnostics.capacity,240);assert(r.diagnostics.opacity>=.59);assert.equal(r.diagnostics.streakWidth,2.2);const mesh=root.getObjectByName('soft-tapered-rain'),positions=mesh.geometry.attributes.aDrop.array,before=positions.slice();r.update(2,{x:0,z:0},true,1,true);assert.equal(r.diagnostics.rain,true);assert.deepEqual(positions,before);assert(r.diagnostics.activeDrops<=240);r.update(3,null,false);assert.equal(r.diagnostics.rain,false);r.dispose();assert.equal(root.children.length,0);
});
test('drying rate follows authoritative heat, stays bounded and preserves natural drying',()=>{
 assert.equal(fireDryDuration(.16),DRY_FIRE);assert.equal(fireDryDuration(.72),DRY_FIRE);assert(fireDryDuration(1.8)<fireDryDuration(.72));assert(fireDryDuration(3.35)<=12001);assert.equal(fireDryDuration(99),12000);assert.equal(fireDryDuration(NaN),DRY_FIRE);
 function fixture(heat){let now=100000;const s=new ArchiveStore({clock:()=>now});s.seed('a','손님');s.join('a');const p=s.clients.get('a'),seat=CAMP_SEATS[0];Object.assign(p,{room:'camp',x:seat.x,z:seat.z,seat});Object.assign(s.campfire,{at:now,heat,holdUntil:now+60000});s.snapshot('a');const e=s.campEffects.get('a');e.wetness=1;return {s,advance:ms=>now+=ms};}
 const weak=fixture(.72),strong=fixture(3.35);weak.advance(10000);strong.advance(10000);const a=weak.s.snapshot('a').myComfort,b=strong.s.snapshot('a').myComfort;assert(b.wetness<a.wetness-.25);assert(b.dryRemaining<a.dryRemaining);assert(b.drySeconds<20);strong.advance(10000);assert.equal(strong.s.snapshot('a').myComfort.wetness,0);weak.advance(10000);assert(weak.s.snapshot('a').myComfort.wetness>0);const restored=restoreStore(JSON.parse(JSON.stringify(serializeStore(weak.s))),weak.s.clock);assert.equal(restored.snapshot('a').myComfort.wetness,weak.s.snapshot('a').myComfort.wetness);const p=restored.clients.get('a');p.seat=null;p.room='books';assert.equal(restored.snapshot('a').myComfort.drySeconds,DRY_NATURAL/1000);
});
