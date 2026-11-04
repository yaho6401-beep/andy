import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMP_SEATS,campPosition,campMove,nearestSeat} from '../camp/layout.js';
test('six stable seats face the fire and have collision-free exits',()=>{assert.equal(CAMP_SEATS.length,6);assert.equal(new Set(CAMP_SEATS.map(s=>s.id)).size,6);for(const s of CAMP_SEATS){assert.ok(campPosition(s.stand.x,s.stand.z),s.id);assert.equal(nearestSeat(s.stand.x,s.stand.z)?.id,s.id);assert.equal(campPosition(s.x,s.z),false);assert.ok(Math.abs(Math.sin(s.yaw)+s.x/2.55)<1e-8);}});
test('walking cannot tunnel through the campfire, tents or world bounds',()=>{assert.equal(campMove(-1.8,0,1.8,0),false);assert.equal(campMove(-5,-1.4,-5,-5.8),false);assert.equal(campPosition(NaN,0),false);assert.equal(campMove(0,5.8,0,8),false);assert.equal(campPosition(0,5.8),true);assert.equal(campMove(0,5.8,.5,5.8),true);});
