import test from 'node:test';import assert from 'node:assert/strict';
import {closestFreeSeat,isFireSeat} from '../src/seat-choice.js';import {SEATS} from '../src/seats.js';
import {NpcReplies,TOPIC_LINES,replyVariants,questionSample} from '../src/npc-dialogue.js';
import {casualReply,SMALL_TALK} from '../camp/keeper-dialogue.js';
test('seat proximity offers a free seat without changing the player; occupied, distant, staff and rescue seats are excluded',()=>{
 const seats=[{id:'a',room:'garden',x:0,z:0},{id:'b',room:'garden',x:1,z:0},{id:'staff',room:'garden',x:.1,z:0,staff:true}],state={joined:true,room:'garden',selfId:'me',me:{state:{},mesh:{position:{x:0,z:.5}}}},before=JSON.stringify(state);
 assert.equal(closestFreeSeat(seats,state).id,'a');assert.equal(JSON.stringify(state),before);assert.equal(closestFreeSeat(seats,state,[{id:'other',seat:{id:'a'}}]).id,'b');assert.equal(closestFreeSeat(seats,state,[{id:'other',seat:{id:'a'}},{id:'other2',seat:{id:'b'}}]),null);
 assert.equal(closestFreeSeat(seats,{...state,room:'scents'}),null);assert.equal(closestFreeSeat(seats,{...state,joined:false}),null);state.me.state.seat={id:'a'};assert.equal(closestFreeSeat(seats,state),null);state.me.state.seat=null;state.me.state.seaRescue={};assert.equal(closestFreeSeat(seats,state),null);state.me.state.seaRescue=null;state.me.mesh.position.z=10;assert.equal(closestFreeSeat(seats,state),null);
});
test('every existing public seating room has an explicit reachable ordinary chair choice',()=>{for(const room of ['garden','lobby','books','salon','camp']){const s=SEATS.find(s=>s.room===room&&!s.staff&&!isFireSeat(s));assert(s);const state={joined:true,room,selfId:'me',me:{state:{},mesh:{position:s.stand||s}}};assert(closestFreeSeat(SEATS,state),room);}});
test('each conversation topic has 96 authored combinations and avoids the last twelve replies',()=>{
 for(const topic of Object.keys(TOPIC_LINES)){const variants=replyVariants(topic);assert.equal(variants.length,96);assert.equal(new Set(variants).size,96);const replies=new NpcReplies(()=>0),heard=Array.from({length:13},()=>replies.reply(topic));assert.equal(new Set(heard).size,13);}
 const replies=new NpcReplies(()=>.2),heard=Array.from({length:12},()=>casualReply('고양이가 귀여워요',()=>.2,replies));assert.equal(new Set(heard).size,12);assert(heard.every(s=>s.includes('고양이')));
});
test('suggestions contain exactly three unique questions, refresh on each encounter and never mutate the catalog',()=>{let last=[],before=JSON.stringify(SMALL_TALK);for(let i=0;i<12;i++){const next=questionSample(SMALL_TALK,last,()=>.3);assert.equal(next.length,3);assert.equal(new Set(next.map(q=>q.id)).size,3);assert(!next.some(q=>last.some(p=>p.id===q.id)));last=next;}assert.equal(JSON.stringify(SMALL_TALK),before);});
