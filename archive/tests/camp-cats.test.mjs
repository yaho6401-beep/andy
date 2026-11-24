import test from 'node:test';
import assert from 'node:assert/strict';
import {CampCatsState,MILK_SPOTS} from '../camp/cat-state.js';
import {findWalkPath} from '../src/navigation.js';
import {campInviteURL,shareCampInvite} from '../camp/invite-share.js';
import * as T from 'three';
import {createCampCats} from '../camp/cat-visual.js';
import {createWaterPour} from '../camp/water-pour.js';

test('milk is collected once per tent, near the prop; one bowl at a time',()=>{
 const s=new CampCatsState();assert.equal(s.collect('amber',{x:0,z:0}),false);for(const spot of MILK_SPOTS){assert.equal(s.collect(spot.id,spot),true);assert.equal(s.collect(spot.id,spot),false);}assert.equal(s.milk,2);assert.equal(s.place({x:0,z:0},0),false);assert.equal(s.place({x:0,z:5},0),true);assert.equal(s.place({x:1,z:5},1),false);assert.equal(s.milk,1);
});
test('a cat reaches milk, drinks ten seconds, follows for one minute, and can be petted',()=>{
 const s=new CampCatsState({route:(a,b)=>findWalkPath('camp',a,b),random:()=>.4}),player={x:0,z:4};s.milk=1;s.place(player,0);
 let at=0;while(s.bowl.drinkingAt===null&&at<30000){at+=100;s.tick(at,.1,{player});}assert.ok(s.bowl.drinkingAt!==null,'arrives within thirty seconds');const began=s.bowl.drinkingAt;s.tick(began+9999,0,{player});assert.equal(s.followId,null);s.tick(began+10000,0,{player});assert.notEqual(s.followId,null);const cat=s.cats[s.followId];assert.equal(s.pet(cat.id,began+10000,cat),true);assert.equal(s.pet(cat.id,began+10100,cat),false);cat.x=.9;cat.z=player.z*.72;s.tick(began+11000,.1,{player,focused:true});assert.equal(cat.mode,'sit');s.tick(began+70000,.1,{player});assert.equal(s.followId,null);
});
test('all three cats shelter in rain/high heat and resume after it passes',()=>{
 for(const situation of [{rain:true},{heat:4}]){const s=new CampCatsState({route:(a,b)=>findWalkPath('camp',a,b)});s.cats[0].x=0;s.cats[0].z=4;s.tick(1000,.1,{player:{x:0,z:5},...situation});assert.equal(s.cats.length,3);assert.ok(s.cats.every(c=>c.mode==='shelter'));assert.ok(s.cats[0].path.length);s.tick(2000,.1,{});assert.ok(s.cats.every(c=>c.mode==='rest'));}
});
test('invite URL contains only the public camp route, never login/room tokens',async()=>{
 const url=campInviteURL('https://andy-plum.vercel.app/archive/?token=secret&admin=1&soloPreview=1');assert.equal(url,'https://andy-plum.vercel.app/archive/?start=camp');let sent;assert.equal(await shareCampInvite({href:url,nav:{share:async d=>{sent=d;}},doc:{}}),'shared');assert.equal(sent.url,url);let copied;assert.equal(await shareCampInvite({href:url,nav:{clipboard:{writeText:async s=>copied=s}},doc:{}}),'copied');assert.equal(copied,url);assert.equal(await shareCampInvite({href:url,nav:{share:async()=>{throw Object.assign(Error(),{name:'AbortError'});}},doc:{}}),'cancelled');
});
test('milk at the distant walking route is still reached within thirty seconds',()=>{
 const s=new CampCatsState({route:(a,b)=>findWalkPath('camp',a,b),random:()=>.4}),player={x:35,z:20};s.milk=1;assert(s.place(player,0));for(let at=100;at<=30000&&s.bowl.drinkingAt===null;at+=100)s.tick(at,.1,{player});assert.notEqual(s.bowl.drinkingAt,null);
});
test('cat animations and repeated oil/water pours reuse finite GPU buffers and release all resources',()=>{
 const parent=new T.Group(),visual=createCampCats(parent),state=new CampCatsState(),pour=createWaterPour(parent),resources=new Set();parent.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)resources.add(m);});const before=parent.children.length;for(let i=0;i<200;i++){state.tick(i*100,.1,{player:{x:0,z:4}});visual.set(state,i/10);pour.setState({pourSequence:i+1,pourKind:i%2?'water':'fuel',pouredAt:1000,pourFrom:{x:0,z:2.55}});pour.update(2000,i/10);assert.equal(pour.diagnostics.kind,i%2?'water':'fuel');assert(pour.diagnostics.flow);assert.equal(parent.children.length,before);}let disposed=0;resources.forEach(r=>r.addEventListener('dispose',()=>disposed++));visual.dispose();pour.dispose();assert.equal(parent.children.length,0);assert.equal(disposed,resources.size);
});
