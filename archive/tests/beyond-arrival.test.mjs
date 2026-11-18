import test from 'node:test';import assert from 'node:assert/strict';
import {safeArrival,BEYOND_ROUTE} from '../beyond/layout.js';
import {appearanceKey} from '../src/identity.js';
test('server JSON key order cannot rebuild or teleport an unchanged avatar',()=>{const a={kind:4,hairStyle:1,hair:'#554239',color:'#b7c6a1'},b={hair:a.hair,kind:a.kind,color:a.color,hairStyle:a.hairStyle};assert.equal(appearanceKey(a),appearanceKey(b));assert.notEqual(appearanceKey(a),appearanceKey({...a,kind:2}));});
test('old default, saved return-portal and blocked arrivals cannot instantly bounce out of reading world',()=>{for(const pos of [{x:0,z:8},{x:0,z:9.5},{x:NaN,z:0},null])assert.deepEqual(safeArrival(pos),BEYOND_ROUTE.arrival);assert.deepEqual(safeArrival({x:5,z:0},()=>true),BEYOND_ROUTE.arrival);assert.deepEqual(safeArrival({x:5,z:0}),{x:5,z:0});assert.ok(Math.hypot(BEYOND_ROUTE.arrival.x-BEYOND_ROUTE.portal.x,BEYOND_ROUTE.arrival.z-BEYOND_ROUTE.portal.z)>1.95);});
