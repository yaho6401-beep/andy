import test from 'node:test';
import {CAMP} from '../camp/layout.js';
import assert from 'node:assert/strict';
import {GALLERY} from '../src/gallery-layout.js';
import {GARDEN} from '../src/garden-layout.js';
import {PORTALS,validPosition,validMove} from '../src/protocol.js';
import {CAFE_TABLES,SEATS} from '../src/seats.js';
import {NPCS} from '../src/cafe-data.js';
import {findWalkPath} from '../src/navigation.js';
import {ArchiveStore} from '../server/room-store.mjs';
function route(room,start,target){let p=start;const path=findWalkPath(room,start,target);assert.ok(path.length,`${room} ${JSON.stringify(target)}`);for(const q of path){assert.ok(validMove(room,p.x,p.z,q.x,q.z));p=q;}assert.ok(Math.hypot(p.x-target.x,p.z-target.z)<.02);}
test('atrium reaches four indoor doors and garden reaches both outdoor destinations safely',()=>{
 assert.equal(GALLERY.lobby.width*GALLERY.lobby.depth,840);
 assert.equal(GALLERY.salon.width*GALLERY.salon.depth,840);
 for(const [room,gates] of Object.entries(PORTALS))for(const gate of gates){assert.ok(validPosition(gate.to,gate.spawn.x,gate.spawn.z),room+' → '+gate.to);assert.ok(validPosition(room,gate.x,gate.z),room+' threshold');}
 for(const gate of PORTALS.lobby)route('lobby',{x:0,z:8},gate);
 assert.equal(PORTALS.lobby.length,4);assert.equal(PORTALS.lobby.some(g=>g.to==='camp'),false);
 for(const gate of PORTALS.garden)route('garden',{x:0,z:5.5},gate);
 route('garden',{x:0,z:5.5},{x:0,z:GARDEN.trail.junctionZ});
 route('garden',{x:0,z:GARDEN.trail.junctionZ},{x:GARDEN.trail.x,z:GARDEN.trail.junctionZ});
 route('garden',{x:GARDEN.trail.x,z:GARDEN.trail.junctionZ},GARDEN.campGate);
 route('lobby',{x:0,z:8},{x:-9,z:9.2});
});
test('expanded cafe retains all table groups, reachable seats and counter',()=>{
 const entry={x:0,z:11};
 assert.deepEqual(CAFE_TABLES.map(t=>t.capacity),[8,6,4,2,4]);
 for(const seat of SEATS.filter(s=>['salon','lobby','camp'].includes(s.room))){assert.ok(validPosition(seat.room,seat.stand.x,seat.stand.z),seat.id);route(seat.room,seat.room==='camp'?{x:0,z:4}:seat.room==='lobby'?{x:0,z:8}:entry,seat.stand);}
 route('salon',entry,NPCS.salon.reach);route('salon',NPCS.salon.reach,PORTALS.salon[0]);
});
test('garden ↔ camp keeps forward travel, opposite return direction, safe spawn and the same avatar',()=>{
 const store=new ArchiveStore();store.join('host',{kind:6});const p=store.clients.get('host');
 const id=p.id,look={...p.appearance},entry=PORTALS.garden.find(g=>g.to==='camp'),exit=PORTALS.camp[0];
 assert.equal(exit.to,'garden');assert.equal(entry.yaw,0);assert.equal(exit.yaw,Math.PI);
 assert.ok(entry.z<GARDEN.campReturn.z);assert.ok(CAMP.spawn.z<CAMP.gate.z);
 for(let visit=0;visit<3;visit++){
  Object.assign(p,{room:'garden',x:entry.x,z:entry.z+1,yaw:Math.PI,shoutUsed:true});
  store.action(id,{type:'room',room:'camp'});assert.equal(p.room,'camp');assert.equal(p.yaw,Math.PI);assert.equal(p.id,id);assert.deepEqual(p.appearance,look);assert.ok(validMove('camp',p.x,p.z,p.x,p.z-1));
  assert.ok(Math.hypot(p.x-exit.x,p.z-exit.z)>2);assert.throws(()=>store.action(id,{type:'room',room:'garden'}),/문/);
  Object.assign(p,{x:CAMP.gate.x,z:CAMP.gate.z-.9});store.action(id,{type:'room',room:'garden'});assert.equal(p.room,'garden');assert.equal(p.yaw,0);assert.equal(p.shoutUsed,false);assert.ok(validMove('garden',p.x,p.z,p.x,p.z+1));
  assert.ok(Math.hypot(p.x-entry.x,p.z-entry.z)>2);assert.throws(()=>store.action(id,{type:'room',room:'camp'}),/문/);
 }
 Object.assign(p,{room:'lobby',x:9,z:7});assert.throws(()=>store.action(id,{type:'room',room:'camp'}),/문/);
});
