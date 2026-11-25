import test from 'node:test';import assert from 'node:assert/strict';
import {closestFreeSeat,isFireSeat} from '../src/seat-choice.js';import {SEATS} from '../src/seats.js';
import {fireSeatGroup,fireSeatChoices,fireApproachState} from '../camp/fire-seating.js';
const state=seat=>({joined:true,room:'camp',selfId:'me',snapshot:{players:[]},me:{state:{epoch:3,seat:null},mesh:{position:{...seat.stand}}}});
test('main logs and both distant benches never offer the separate manual sit button; sea benches and tent cushions do',()=>{
 for(const seat of SEATS.filter(s=>s.room==='camp')){const s=state(seat),choice=closestFreeSeat(SEATS,s);if(isFireSeat(seat))assert.equal(choice,null,seat.id);else assert(choice,seat.id);}
});
test('the central button chooses the nearby distant bench or a main log, excludes occupied seats and never steals another bench',()=>{
 const main=SEATS.find(s=>s.group==='campfire-main');assert.equal(fireSeatGroup(main.stand),'campfire-main');const far=SEATS.filter(s=>s.group?.startsWith('campfire-far-'));for(const seat of far){assert.equal(fireSeatGroup(seat.stand),seat.group);assert.equal(fireSeatChoices(seat.stand,[],'me')[0].id,seat.id);assert.equal(fireSeatChoices(seat.stand,[{id:'other',seat}], 'me').length,0);}
 const choices=fireSeatChoices({x:0,z:8},[{id:'other',seat:main}],'me');assert.equal(choices.length,5);assert(choices.every(s=>s.group==='campfire-main'&&s.id!==main.id));
});
test('proximity alone is inactive; explicit fire intent waits for safe distance and cancels on manual input, modal, room change, rescue or occupied seat',()=>{
 const seat=SEATS.find(s=>s.group==='campfire-main'),s=state(seat),intent={seat,epoch:3};assert.equal(fireApproachState(null,s),'inactive');assert.equal(fireApproachState(intent,s),'ready');s.me.mesh.position={x:0,z:8};assert.equal(fireApproachState(intent,s),'walking');s.me.mesh.position={...seat.stand};
 for(const change of [{joined:false},{room:'books'},{manual:true},{blocked:true},{snapshot:{players:[{id:'other',seat}]}}])assert.equal(fireApproachState(intent,{...s,...change}),'cancelled');
 s.me.state.seaRescue={};assert.equal(fireApproachState(intent,s),'cancelled');s.me.state.seaRescue=null;s.me.state.epoch=4;assert.equal(fireApproachState(intent,s),'cancelled');s.me.state.seat=seat;assert.equal(fireApproachState(intent,s),'seated');
});
