import test from 'node:test';import assert from 'node:assert/strict';
import {DECK_Y,UPPER_Y,LOWER_Y,SHIP_LENGTH,SHIP_BEAM,POOL,DINING_TABLES,SHIP_ZONES,findShipPath,shipSurfaces} from '../cruise/ship-layout.js';
import {mooredCruisePose} from '../camp/cruise-dimensions.js';
import {CRUISE,voyagePose,voyageDuration} from '../camp/sea-travel-state.js';
import {SHIPPING_LANES,shippingPose} from '../camp/shipping-lanes.js';
test('larger hull supports long promenades, tapered bow, pool exclusion and both physical upper decks',()=>{
 assert.ok(SHIP_LENGTH>=140&&SHIP_BEAM>=28);assert.ok(DECK_Y>9);
 assert.ok(!shipSurfaces(POOL.x,POOL.z).includes(DECK_Y));
 assert.ok(shipSurfaces(0,-64).includes(LOWER_Y));assert.ok(shipSurfaces(0,64).includes(LOWER_Y));assert.deepEqual(shipSurfaces(13,-66),[]);
 const p=findShipPath(SHIP_ZONES[1].target,SHIP_ZONES[2].target);assert.ok(p.length>100);assert.ok(p.every(q=>q.y>=LOWER_Y&&q.y<=DECK_Y));
 assert.equal(DINING_TABLES.length,9);for(const q of DINING_TABLES)assert.ok(!shipSurfaces(q.x,q.z+SHIP_ZONES[4].z).includes(UPPER_Y));
});
test('full-size exterior clears the unchanged dock, all voyages, visible headlands and background traffic',()=>{
 const hull=mooredCruisePose(CRUISE.dock),near=hull.z+SHIP_BEAM/2+.4;
 assert.ok(CRUISE.dock.z-near>3.5);
 for(const v of [{from:'shore',to:'cruise'},{from:'island',to:'cruise'},{from:'cruise',to:'shore'},{from:'cruise',to:'island'}])for(let t=0;t<=1000;t++){const q=voyagePose({...v,at:0},voyageDuration(v)*t/1000);assert.ok(q.z-2.6>near,'entire rowboat remains outside enlarged hull');}
 for(let i=0;i<SHIPPING_LANES.length;i++)for(let t=0;t<800000;t+=2000){const p=shippingPose(i,t),l=SHIPPING_LANES[i];assert.ok(p.z+(l.width+l.length)*p.scale/2<hull.z-SHIP_BEAM/2-10,'shipping lane stays behind the whole vessel even when turning');}
});
