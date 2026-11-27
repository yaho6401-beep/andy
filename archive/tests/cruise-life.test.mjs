import test from 'node:test';import assert from 'node:assert/strict';
import {CruiseDining,CRUISE_MENU} from '../cruise/dining-state.js';
import {GUEST_ROOMS,NPCS,VENUE_SEATS,RESTAURANT_SEATS,guestRoomAt} from '../cruise/leisure-layout.js';
import {SHIP_ZONES,findShipPath,shipStep,shipSurfaces} from '../cruise/ship-layout.js';
import {seatApproach} from '../cruise/deck-fixtures.js';
import {DIALOGUE,dialogueReply,dialogueOptions} from '../cruise/ship-dialogue.js';
import {readingPages,turnReadingPage} from '../camp/reading-pages.js';
test('open guest rooms, both venues, host stations and dining chairs are reachable through continuous floors',()=>{
 const start=SHIP_ZONES[8].target;
 const targets=[...GUEST_ROOMS.filter(r=>r.open).map(r=>({x:-5.8,z:r.doorZ,y:7})),...SHIP_ZONES.slice(9).map(z=>z.target),...NPCS.map(n=>({...n,z:n.z+1.5})),...RESTAURANT_SEATS.map(seatApproach),...VENUE_SEATS.map(seatApproach)];
 for(const target of targets){const path=findShipPath(start,target);assert(path.length,JSON.stringify(target));assert(path.every((p,i)=>!i||shipStep(path[i-1],p)));assert(Math.hypot(path.at(-1).x-target.x,path.at(-1).z-target.z)<.1);}
 assert.equal(guestRoomAt({x:-5.8,y:7,z:-16.5}).id,'201');assert.equal(guestRoomAt({x:-5.8,y:7,z:11.6}),null);assert(!shipSurfaces(-7,11.6).includes(7));
});
test('orders cannot be duplicated or picked up early; plated food belongs to its table and is consumed once',()=>{
 let now=0;const d=new CruiseDining(()=>now),a=RESTAURANT_SEATS[0],same=RESTAURANT_SEATS[1],other=RESTAURANT_SEATS[2];assert(!d.orderItem('invalid'));assert(d.orderItem('pasta'));assert(!d.orderItem('tea'));assert(!d.pickup());now=19999;assert(!d.pickup());now=20000;assert(d.pickup());assert(!d.pickup());assert(d.place(a));assert(Number.isFinite(d.plate.x));assert.equal(d.eat(other),null);assert(d.eat(same));assert(d.eat(a));assert(d.take());assert(d.eat());assert(d.eat());assert.equal(d.eat(),null);assert.equal(d.state.held,null);assert.equal(d.state.plate,null);assert(d.orderItem('tea'));
 for(const item of CRUISE_MENU){const x=new CruiseDining(()=>now);assert(x.orderItem(item.id));now+=item.seconds*1000;assert(x.pickup());for(let i=0;i<item.bites;i++)assert(x.eat());assert.equal(x.eat(),null);}
});
test('each crew or guest role offers varied replies and three non-duplicate prompts',()=>{
 for(const role of Object.keys(DIALOGUE)){const replies=new Set();for(let i=0;i<5;i++)for(let v=0;v<3;v++)replies.add(dialogueReply(role,i,v));assert(replies.size>=15,role);const options=dialogueOptions(role,()=>.2);assert.equal(options.length,3);assert.equal(new Set(options.map(x=>x[0])).size,3);}
 assert.match(dialogueReply('solas',0),/1914|타이타닉|SOLAS/);assert(DIALOGUE.navigation.some(x=>/좌현/.test(x[1])));assert(DIALOGUE.safety.some(x=>/승무원/.test(x[1])));
});
test('pagination preserves every verse and notebook key across single/spread and font changes',()=>{
 const units=Array.from({length:100},(_,i)=>({key:'verse-'+i,text:'기억할 문장 '.repeat(i%8+1)}));for(const size of[120,240,700]){const pages=readingPages(units,size);assert.deepEqual(pages.flat(),units);let page=0,seen=[];while(page<pages.length){seen.push(...pages.slice(page,page+2).flat());const n=turnReadingPage(page,pages.length,1,true);if(n.chapter)break;page=n.page;}assert.deepEqual(seen,units);assert.equal(turnReadingPage(0,pages.length,-1,true).chapter,-1);}
});
