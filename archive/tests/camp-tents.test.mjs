import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMP,CAMP_SEATS,tentAt,tentWalls,campPosition,campMove} from '../camp/layout.js';
import {validMove,PORTALS,ROOM_BOUNDS} from '../src/protocol.js';
import {findWalkPath} from '../src/navigation.js';
import {ArchiveStore} from '../server/room-store.mjs';
function route(start,target){const path=findWalkPath('camp',start,target);assert.ok(path.length);let p=start;for(const q of path){assert.ok(campMove(p.x,p.z,q.x,q.z));p=q;}assert.deepEqual(p,target);}
test('expanded coast is walkable beyond old bounds and all shared destinations stay inside land',()=>{
 assert.ok(CAMP.width*CAMP.depth/(15.8*14.8)>3);
 assert.deepEqual(ROOM_BOUNDS.camp,{...CAMP.bounds,z:91});
 for(const [x,z] of [[12,5],[-12,5],[0,-11.5],[13,-8]])assert.ok(campPosition(x,z));
 assert.ok(!campPosition(CAMP.bounds.x,0));assert.ok(!campPosition(0,-92));
 const spawn=PORTALS.garden.find(p=>p.to==='camp').spawn;
 assert.deepEqual({x:spawn.x,z:spawn.z},CAMP.spawn);assert.equal(spawn.yaw,Math.PI);
 route(CAMP.spawn,CAMP.gate);
});
test('both tents admit a real walk through the opening and block side, back and front-wing shortcuts',()=>{
 for(const t of CAMP.tents){
  const front=t.z+t.d/2,entry={x:t.x,z:front+1.3},inside={x:t.x,z:t.z+1.5};
  route(CAMP.spawn,entry);route(entry,inside);route(inside,entry);
  assert.equal(tentAt(inside.x,inside.z)?.id,t.id);assert.equal(tentAt(entry.x,entry.z),null);
  assert.ok(validMove('camp',entry.x,entry.z,inside.x,inside.z));
  assert.ok(!validMove('camp',t.x-4,t.z+1,t.x-2,t.z+1));
  assert.ok(!validMove('camp',t.x+1.6,t.z-t.d/2-1,t.x+1.6,t.z-t.d/2+1));
  assert.ok(!validMove('camp',t.x-2.1,front+1,t.x-2.1,front-1));
  for(const wall of tentWalls(t))assert.ok(!campPosition(wall.x,wall.z));
  for(const s of CAMP_SEATS.filter(s=>s.group==='camp-tent-'+t.id)){assert.ok(campPosition(s.stand.x,s.stand.z));route(inside,s.stand);}
 }
 assert.equal(tentAt(NaN,0),null);
});
test('tent cushions retain separate whisper audiences and authoritative wall rejection',()=>{
 let now=100000;const store=new ArchiveStore({clock:()=>now});store.join('host');
 for(const id of ['a','b','c']){store.seed(id,id);store.join(id);}
 const [left,right]=CAMP.tents,group=id=>CAMP_SEATS.filter(s=>s.group==='camp-tent-'+id);
 for(const [id,seat] of [['a',group(left.id)[0]],['b',group(left.id)[1]],['c',group(right.id)[0]]]){
  const p=store.clients.get(id);Object.assign(p,{room:'camp',...seat.stand});store.action(id,{type:'sit',seat:seat.id});
 }
 store.action('a',{type:'chat',scope:'whisper',text:'이 텐트에서만 나누는 책 이야기'});
 assert.equal(store.snapshot('b').messages.length,1);assert.equal(store.snapshot('c').messages.length,0);assert.equal(store.snapshot('host').messages.length,0);
 const p=store.clients.get('host');Object.assign(p,{room:'camp',x:left.x-4,z:left.z+1});now+=1800;
 assert.throws(()=>store.action('host',{type:'move',x:left.x-2,z:left.z+1,yaw:0}),/위치/);
 assert.equal(p.x,left.x-4);
});
