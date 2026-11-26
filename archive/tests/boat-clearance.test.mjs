import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {OFFSHORE_ISLANDS,headlandClearance,ROWBOAT_CLEARANCE} from '../camp/offshore-islands.js';
import {voyagePose,voyageDuration,voyageRoute,CRUISE} from '../camp/sea-travel-state.js';

test('regression: both old cruise approaches intersected the visible rotated headland',()=>{
 const obstacle=OFFSHORE_ISLANDS.find(o=>o.x===29);
 for(const [a,b]of [[{x:32,z:-65},{x:37,z:-90}],[{x:14,z:-79},{x:29,z:-90}]]){
  assert.ok(Array.from({length:101},(_,i)=>headlandClearance({x:a.x+(b.x-a.x)*i/100,z:a.z+(b.z-a.z)*i/100},obstacle,0)).some(d=>d<1));
 }
});
test('all six outbound/return routes clear every visible headland with hull and oar margin',()=>{
 for(const v of [{from:'shore',to:'cruise'},{from:'island',to:'cruise'},{from:'cruise',to:'shore'},{from:'cruise',to:'island'},{from:'shore'},{from:'island'}]){
  v.at=0;for(let i=0;i<=2000;i++){
   const p=voyagePose(v,voyageDuration(v)*i/2000);
   for(const o of OFFSHORE_ISLANDS){
    assert.ok(headlandClearance(p,o)>1,`${JSON.stringify(v)} at ${i}: ${o.id}`);
    // Sweep a full clearance circle, including turns and the outer oar tips.
    for(let k=0;k<24;k++)assert.ok(headlandClearance({x:p.x+ROWBOAT_CLEARANCE*Math.cos(k*Math.PI/12),z:p.z+ROWBOAT_CLEARANCE*Math.sin(k*Math.PI/12)},o,0)>1,`${o.id}: swept boat footprint`);
   }
   if(v.to==='cruise'||v.from==='cruise')assert.ok(p.z-2>CRUISE.z+1.8*CRUISE.scale,'boat stays outside the cruise hull');
  }
 }
});
test('clearance uses the same rotation and scale as the actual rendered island mesh',()=>{
 const geo=new T.IcosahedronGeometry(1,2),point=new T.Vector3();
 for(const o of OFFSHORE_ISLANDS){
  const matrix=new T.Matrix4().compose(new T.Vector3(o.x,o.y,o.z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),o.yaw),new T.Vector3(o.rx,o.ry,o.rz));
  for(let i=0;i<geo.attributes.position.count;i++){
   point.fromBufferAttribute(geo.attributes.position,i).applyMatrix4(matrix);
   assert.ok(headlandClearance(point,o,0)<=1.000001);
  }
 }
 geo.dispose();assert.ok(ROWBOAT_CLEARANCE>2);
});
test('declining cruise boarding follows the identical safe corridor in reverse',()=>{
 for(const from of ['shore','island'])assert.deepEqual(voyageRoute({from:'cruise',to:from}),[...voyageRoute({from,to:'cruise'})].reverse());
});
