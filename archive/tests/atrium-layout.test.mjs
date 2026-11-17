import test from 'node:test';
import assert from 'node:assert/strict';
import {GALLERY} from '../src/gallery-layout.js';
import {PORTALS,validPosition,validMove} from '../src/protocol.js';
import {CAFE_TABLES,SEATS} from '../src/seats.js';
import {NPCS} from '../src/cafe-data.js';
import {findWalkPath} from '../src/navigation.js';
import {ArchiveStore} from '../server/room-store.mjs';
function route(room,start,target){let p=start;const path=findWalkPath(room,start,target);assert.ok(path.length,`${room} ${JSON.stringify(target)}`);for(const q of path){assert.ok(validMove(room,p.x,p.z,q.x,q.z));p=q;}assert.ok(Math.hypot(p.x-target.x,p.z-target.z)<.02);}
test('atrium reaches all five doors, and every incoming portal has a safe destination',()=>{
 assert.equal(GALLERY.lobby.width*GALLERY.lobby.depth,840);
 assert.equal(GALLERY.salon.width*GALLERY.salon.depth,840);
 for(const [room,gates] of Object.entries(PORTALS))for(const gate of gates){assert.ok(validPosition(gate.to,gate.spawn.x,gate.spawn.z),room+' → '+gate.to);assert.ok(validPosition(room,gate.x,gate.z),room+' threshold');}
 for(const gate of PORTALS.lobby)route('lobby',{x:0,z:8},gate);
 route('lobby',{x:0,z:8},{x:-9,z:9.2});
});
test('expanded cafe retains all table groups, reachable seats and counter',()=>{
 const entry={x:0,z:11};
 assert.deepEqual(CAFE_TABLES.map(t=>t.capacity),[8,6,4,2,4]);
 for(const seat of SEATS.filter(s=>['salon','lobby','camp'].includes(s.room))){assert.ok(validPosition(seat.room,seat.stand.x,seat.stand.z),seat.id);route(seat.room,seat.room==='camp'?{x:0,z:4}:seat.room==='lobby'?{x:0,z:8}:entry,seat.stand);}
 route('salon',entry,NPCS.salon.reach);route('salon',NPCS.salon.reach,PORTALS.salon[0]);
});
test('lobby ↔ camp changes rooms under server doorway validation and preserves avatar identity',()=>{
 const store=new ArchiveStore();store.join('host',{kind:6});const p=store.clients.get('host');
 Object.assign(p,{room:'lobby',x:9,z:7});const id=p.id,look={...p.appearance};
 store.action('host',{type:'room',room:'camp'});assert.equal(p.room,'camp');assert.equal(p.id,id);assert.deepEqual(p.appearance,look);assert.ok(validPosition('camp',p.x,p.z));
 assert.throws(()=>store.action('host',{type:'room',room:'books'}),/문/);
 Object.assign(p,{x:0,z:5.3});store.action('host',{type:'room',room:'lobby'});assert.equal(p.room,'lobby');assert.equal(p.shoutUsed,false);assert.ok(validPosition('lobby',p.x,p.z));
});
