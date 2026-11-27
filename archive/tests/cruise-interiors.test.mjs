import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {buildPassengerInteriors} from '../cruise/passenger-interiors.js';
import {interiorView} from '../cruise/interior-camera.js';
import {CAMERA_COMPARTMENTS,passengerRegion} from '../cruise/interior-layout.js';
import {CABIN_Y,UPPER_Y,SHIP_ZONES,shipSurfaces,shipStep,findShipPath} from '../cruise/ship-layout.js';
test('closed stateroom blocks cannot be walked through; the real corridor and open suite door remain connected',()=>{
 for(const p of[[-7,-12],[8,-8],[-5,5],[7,14]])assert(!shipSurfaces(...p).includes(CABIN_Y));
 for(const[x,z]of[[0,-18],[0,13],[0,18],[-10,18],[6,6],[3.8,5.8]])assert(shipSurfaces(x,z).includes(CABIN_Y));
 assert.equal(shipStep({x:0,y:CABIN_Y,z:13},{x:7,y:CABIN_Y,z:13}),null);
 for(const to of[{x:0,z:13,y:CABIN_Y},{x:0,z:-18,y:CABIN_Y},SHIP_ZONES[8].target])assert(findShipPath(SHIP_ZONES[0].target,to).length>0);
 assert(findShipPath(SHIP_ZONES[4].target,SHIP_ZONES[8].target).length>0);
});
test('interior camera stays below ceilings and inside the active compartment across a complete orbit',()=>{
 for(const p of[{x:0,y:7,z:13},{x:0,y:7,z:-19},{x:-10,y:7,z:19},{x:6,y:7,z:6},{x:0,y:14.4,z:34},{x:-12,y:8,z:14}])for(let a=0;a<6.3;a+=.07){const v=interiorView(p,a),b=CAMERA_COMPARTMENTS[v.region];assert(v.eye.x>=b.minX&&v.eye.x<=b.maxX);assert(v.eye.z>=b.minZ&&v.eye.z<=b.maxZ);assert(v.eye.y<=(b.ceiling??Infinity));assert(v.eye.y>p.y);}
 assert.equal(passengerRegion({x:-13.5,y:10.2,z:10}),null);assert.equal(interiorView({x:0,y:10.2,z:0}),null);
});
test('actual geometry closes corridor ends, sides and ceiling, while a glazed suite window has a genuine opening',()=>{
 const scene=new T.Scene(),cube=new T.BoxGeometry(),cylinder=new T.CylinderGeometry(),materials=new Map();
 const mesh=(p,g,c,x,y,z,w,h,d)=>{if(!materials.has(c))materials.set(c,new T.MeshBasicMaterial({color:c}));const m=new T.Mesh(g,materials.get(c));m.position.set(x,y,z);m.scale.set(w,h,d);p.add(m);return m;},box=(p,c,...a)=>mesh(p,cube,c,...a),interiors=buildPassengerInteriors(scene,{box,mesh,cylinder});scene.updateMatrixWorld(true);
 const hits=(origin,direction)=>new T.Raycaster(new T.Vector3(...origin),new T.Vector3(...direction),.01,100).intersectObject(interiors.root,true);
 for(const dir of[[0,0,-1],[0,0,1],[-1,0,0],[1,0,0],[0,1,0]]){const hit=hits([0,8.8,13],dir)[0];assert(hit,'closed sightline '+dir);assert(!hit.object.material.transparent);assert(hit.distance<35);}
 const opening=hits([11,8.8,3],[1,0,0])[0];assert(opening.object.name.startsWith('window-cabin-starboard-shell'));assert(opening.object.material.transparent);assert(Math.abs(opening.point.x-12.55)<.01);
 const diningRoof=hits([0,16.5,34],[0,1,0])[0];assert(diningRoof&&diningRoof.point.y<18.5);assert(!diningRoof.object.material.transparent);
 assert.equal(interiors.state.realWindows,20);interiors.update(0,{x:0,y:CABIN_Y,z:13});assert.equal(interiors.root.children.filter(o=>o.isPointLight&&o.intensity>0).length,2);interiors.update(1,{x:0,y:10.2,z:0});assert(interiors.root.children.filter(o=>o.isPointLight).every(o=>o.intensity===0));
 const geos=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});interiors.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());
});
