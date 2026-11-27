import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {CRUISE,BOAT_PORTS,voyageDuration,voyagePose,voyageRoute} from '../camp/sea-travel-state.js';
import {mooredCruisePose,SHIP_LENGTH,SHIP_BEAM} from '../camp/cruise-dimensions.js';
import {ArchiveStore} from '../server/room-store.mjs';
import {restoreStore,serializeStore} from '../server/persistence.mjs';

test('full-size cruise is 30 metres farther offshore, while both crossing times stay unchanged',()=>{
 assert.equal(CRUISE.dock.z,-126.4);assert.equal(SHIP_LENGTH,140);assert.equal(SHIP_BEAM,28);
 const center=mooredCruisePose(CRUISE.dock),old=mooredCruisePose({x:37,z:-96.4});
 assert.ok(Math.abs(old.z-center.z-30)<1e-9);
 assert.ok(Math.hypot(center.x-BOAT_PORTS.shore.x,center.z-BOAT_PORTS.shore.z)>130);
 for(const [from,duration]of [['shore',15000],['island',11000]]){
  const v={from,to:'cruise',at:1000};assert.equal(voyageDuration(v),duration);assert.equal(voyagePose(v,1000+duration).done,true);assert.equal(voyagePose(v,1000+duration).z,CRUISE.dock.z);
  assert.deepEqual(voyageRoute({from:'cruise',to:from}),voyageRoute(v).reverse());
 }
});
test('perspective makes the actual unchanged hull smaller from shore and larger on approach',()=>{
 const camera=new T.PerspectiveCamera(58,390/844,.1,280);camera.position.set(24,5.5,4);camera.lookAt(24,1,-14.25);camera.updateMatrixWorld();
 const newCenter=mooredCruisePose(CRUISE.dock),oldCenter=mooredCruisePose({x:37,z:-96.4});
 function projectedHeight(point){const a=new T.Vector3(point.x,0,point.z).project(camera),b=new T.Vector3(point.x,22,point.z).project(camera);return Math.abs(a.y-b.y);}
 const distant=projectedHeight(newCenter),previous=projectedHeight(oldCenter);assert.ok(distant<previous*.85);
 camera.position.set(CRUISE.dock.x,5.5,CRUISE.dock.z+17);camera.lookAt(CRUISE.dock.x,1,CRUISE.dock.z-4.5);camera.updateMatrixWorld();assert.ok(projectedHeight(newCenter)>distant*2);
});
test('persisting every shared-server tick never relocates an offshore rowboat onto land',()=>{
 for(const from of ['shore','island']){let now=100000,s=new ArchiveStore({clock:()=>now,publicLounge:true});s.seed('rider','항로 점검');s.join('rider');Object.assign(s.clients.get('rider'),{room:'camp',...BOAT_PORTS[from]});s.action('rider',{type:'sea-boat',destination:'cruise'});
  for(const returning of [false,true]){const v={...s.clients.get('rider').voyage},epoch=s.clients.get('rider').epoch;for(let step=0;step<=voyageDuration(v);step+=500){now=v.at+step;s.snapshot('rider');const p=s.clients.get('rider'),position={x:p.x,z:p.z};s=restoreStore(JSON.parse(JSON.stringify(serializeStore(s))),()=>now);const restored=s.clients.get('rider');assert.equal(restored.correction,0);assert.equal(restored.x,position.x);assert.equal(restored.z,position.z);if(step<voyageDuration(v))assert.equal(restored.epoch,epoch);}if(!returning)s.action('rider',{type:'sea-cruise-return'});}
 }
});
