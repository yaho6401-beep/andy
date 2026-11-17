import test from 'node:test';
import assert from 'node:assert/strict';
import {GALLERY,GALLERY_COLLIDERS} from '../src/gallery-layout.js';
import {PORTALS,ROOM_BOUNDS,validPosition,validMove} from '../src/protocol.js';
import {SEATS} from '../src/seats.js';
import {findWalkPath} from '../src/navigation.js';
function reachable(room,start,target){const path=findWalkPath(room,start,target);assert.ok(path.length,room+' route to '+JSON.stringify(target));let p=start;for(const q of path){assert.ok(validMove(room,p.x,p.z,q.x,q.z));p=q;}return p;}
test('larger rooms retain clear doorways, swept collisions and reachable exhibition approaches',()=>{
  assert.equal(GALLERY.scents.width*GALLERY.scents.depth/256,2.625);
  for(const room of ['scents','books']){
    const start=PORTALS.lobby.find(p=>p.to===room).spawn;
    assert.ok(validPosition(room,start.x,start.z));
    assert.ok(!validPosition(room,ROOM_BOUNDS[room].x+.01,0));
    for(const o of GALLERY_COLLIDERS[room])assert.ok(!validPosition(room,o.x,o.z));
    reachable(room,start,{x:PORTALS[room][0].x,z:PORTALS[room][0].z});
  }
  const start={x:12,z:0};for(const p of GALLERY.scents.plinths)reachable('scents',start,{x:p.x,z:p.z+1.9});
  reachable('scents',start,{x:0,z:-8.3});reachable('scents',start,{x:-7.6,z:7});reachable('scents',start,{x:0,z:6.4});
  for(const p of GALLERY.books.shelves)reachable('books',{x:-13,z:0},{x:p.x,z:p.z+1.6});
  reachable('books',{x:-13,z:0},{x:-11.5,z:4.5});reachable('books',{x:-13,z:0},{x:11.2,z:10});
});
test('every reading seat has a clear standing position and a reachable approach',()=>{
  for(const seat of SEATS.filter(s=>s.room==='books')){assert.ok(validPosition('books',seat.stand.x,seat.stand.z),seat.id);reachable('books',{x:-13,z:0},seat.stand);}
});
