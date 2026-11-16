import test from 'node:test';
import assert from 'node:assert/strict';
import {findWalkPath} from '../src/navigation.js';
import {validMove,validPosition,ROOMS,PORTALS} from '../src/protocol.js';
function check(room,start,path){assert.ok(path.length);for(const p of path){assert.ok(validMove(room,start.x,start.z,p.x,p.z),`${room}: segment crosses furniture`);start=p;}}
test('tap walking routes around the lobby centerpiece instead of cutting through it',()=>{const start={x:-4,z:0},goal={x:4,z:0},p=findWalkPath('lobby',start,goal);check('lobby',start,p);assert.deepEqual(p.at(-1),goal);assert.ok(p.length>1);});
test('every room entrance can be reached with collision-safe segments',()=>{for(const room of ROOMS){let start={x:0,z:5.5};if(!validPosition(room,start.x,start.z))start={x:6,z:5};for(const gate of PORTALS[room])check(room,start,findWalkPath(room,start,{x:gate.x,z:gate.z}));}});
test('blocked targets resolve nearby and off-map taps are rejected',()=>{const start={x:0,z:5};const p=findWalkPath('garden',start,{x:4.8,z:3});check('garden',start,p);assert.ok(Math.hypot(p.at(-1).x-4.8,p.at(-1).z-3)<1.7);assert.deepEqual(findWalkPath('garden',start,{x:50,z:50}),[]);assert.deepEqual(findWalkPath('garden',start,{x:NaN,z:0}),[]);});
