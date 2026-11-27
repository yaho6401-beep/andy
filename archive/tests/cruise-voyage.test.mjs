import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ArchiveStore} from '../server/room-store.mjs';
import {serializeStore,restoreStore} from '../server/persistence.mjs';
import {BOAT_PORTS,BOAT_TIME,CRUISE,CRUISE_TIME,ISLAND_CRUISE_TIME,voyagePose,voyageDuration,voyageDestination} from '../camp/sea-travel-state.js';
import {directEntry} from '../src/room-entry.js';
import {validPosition} from '../src/protocol.js';
function fixture(from='shore'){let now=100000;const s=new ArchiveStore({clock:()=>now,publicLounge:true});for(const id of ['a','b']){s.seed(id,id);s.join(id);}const p=s.clients.get('a');Object.assign(p,{room:'camp',x:BOAT_PORTS[from].x,z:BOAT_PORTS[from].z});return {s,p,advance:ms=>now+=ms,now:()=>now};}
test('cruise boarding requires a completed server-owned voyage, not a forged URL or coordinate',()=>{
 const f=fixture();assert.throws(()=>f.s.action('a',{type:'sea-cruise-board',url:'https://evil.invalid'}));
 f.s.action('a',{type:'sea-boat',destination:'cruise'});assert.equal(f.p.voyage.to,'cruise');
 assert.throws(()=>f.s.action('a',{type:'sea-cruise-board'}));f.advance(CRUISE_TIME-1);assert.throws(()=>f.s.action('a',{type:'sea-cruise-board'}));
 f.advance(1);const peer=f.s.snapshot('b').players.find(p=>p.id==='a');assert.equal(peer.x,CRUISE.dock.x);assert.equal(peer.z,CRUISE.dock.z);assert.equal(peer.seaRescue,null);assert.ok(peer.voyage);
 const r=f.s.action('a',{type:'sea-cruise-board',url:'https://evil.invalid'});assert.equal(r.url,CRUISE.url);assert.ok(r.cruiseBoarded);assert.equal(f.p.voyage,null);assert.equal(f.p.x,BOAT_PORTS.shore.x);assert.equal(f.p.z,BOAT_PORTS.shore.z);assert.throws(()=>f.s.action('a',{type:'sea-cruise-board'}));
});
test('docked rowboat remains afloat and cannot walk or teleport through the cruise',()=>{
 const f=fixture();f.s.action('a',{type:'sea-boat',destination:'cruise'});f.advance(CRUISE_TIME+60000);f.s.snapshot('a');
 const before={x:f.p.x,z:f.p.z};assert.ok(f.s.action('a',{type:'move',x:0,z:0,yaw:0}).voyage);assert.ok(f.s.action('a',{type:'room',room:'lobby'}).voyage);assert.equal(f.p.seaRescue,null);assert.deepEqual({x:f.p.x,z:f.p.z},before);
 const r=f.s.action('a',{type:'sea-cruise-return'});assert.ok(r.returning);f.advance(CRUISE_TIME);f.s.snapshot('a');assert.equal(f.p.voyage,null);assert.equal(f.p.z,BOAT_PORTS.shore.z);
});
test('cruise route from the island returns to that island if boarding is declined',()=>{
 const f=fixture('island');f.s.action('a',{type:'sea-boat',destination:'cruise'});f.advance(ISLAND_CRUISE_TIME);f.s.snapshot('a');assert.equal(f.p.z,CRUISE.dock.z);f.s.action('a',{type:'sea-cruise-return'});assert.equal(voyageDestination(f.p.voyage),'island');f.advance(ISLAND_CRUISE_TIME);f.s.snapshot('a');assert.equal(f.p.x,BOAT_PORTS.island.x);assert.equal(f.p.z,BOAT_PORTS.island.z);assert.equal(f.p.seaRescue,null);
});
test('all new boat paths are continuous and avoid the island interior and boarding hull',()=>{
 for(const v of [{from:'shore',to:'cruise',at:0},{from:'island',to:'cruise',at:0},{from:'cruise',to:'shore',at:0},{from:'cruise',to:'island',at:0}]){let last;for(let t=0;t<=voyageDuration(v);t+=100){const p=voyagePose(v,t);assert.ok([p.x,p.z,p.yaw].every(Number.isFinite));if(last)assert.ok(Math.hypot(p.x-last.x,p.z-last.z)<.95);if(t>1500&&t<voyageDuration(v)-1500)assert.ok(Math.hypot(p.x/8.5,(p.z+80)/6.5)>1.05);assert.ok(p.z>CRUISE.z+3.3);last=p;}}
});
test('docked cruise survives persistence and accepts a late boarding request',()=>{
 const f=fixture();f.s.action('a',{type:'sea-boat',destination:'cruise'});f.advance(CRUISE_TIME+10000);const s=restoreStore(JSON.parse(JSON.stringify(serializeStore(f.s))),f.now);s.snapshot('a');assert.ok(s.action('a',{type:'sea-cruise-board'}).cruiseBoarded);
});
test('camp return accepts only a fixed safe public spawn; legacy island destination remains intact',()=>{
 assert.deepEqual(directEntry('camp-shore'),{room:'camp',x:24,z:-14.25});assert.ok(validPosition('camp',24,-14.25));assert.equal(directEntry({room:'camp-shore',x:100}),null);
 const f=fixture();f.s.action('a',{type:'sea-boat',destination:{x:999,z:999}});assert.equal(voyageDuration(f.p.voyage),BOAT_TIME);assert.equal(voyageDestination(f.p.voyage),'island');
});
test('cruise is independently bundled and uses no remote CDN or arbitrary return URLs',async()=>{
 const [build,page,main]=await Promise.all(['../scripts/build.mjs','../cruise/index.html','../cruise/main.js'].map(x=>readFile(new URL(x,import.meta.url),'utf8')));
 assert.match(build,/entryPoints:\['cruise\/main.js'\]/);assert.match(page,/start=camp-shore/);assert.doesNotMatch(main,/cdn\.jsdelivr|params\.get\(['"]return/);assert.match(main,/app\?\.dispose/);
});
