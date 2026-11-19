import test from 'node:test';
import assert from 'node:assert/strict';
import {ArchiveStore} from '../server/room-store.mjs';
import {serializeStore,restoreStore} from '../server/persistence.mjs';
import {GARDEN} from '../src/garden-layout.js';
import {BEYOND_ROUTE} from '../beyond/layout.js';
import {directEntry} from '../src/room-entry.js';
import {findWalkPath} from '../src/navigation.js';
import {validPosition,MAX_PEOPLE} from '../src/protocol.js';
import {randomIdentity,identityValue,moveRelativeToCamera} from '../src/identity.js';
import {CAMP_SEATS} from '../camp/layout.js';
import {FIRE} from '../camp/fire-state.js';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('public engagement translations execute and retain the existing catalog in all three languages',()=>{
 const context={ScentLocaleData:{}};
 new vm.Script(readFileSync(new URL('../../i18n-engagement.js',import.meta.url),'utf8')).runInNewContext(context);
 assert.ok(Object.keys(context.ScentLocaleData).length>30);
 for(const key of ['별빛캠핑장 바로가기','바로 입장 · 프로필은 나중에'])for(const language of ['en','zh','ja'])assert.ok(context.ScentLocaleData[key][language]);
});
test('public auto-entry is guest-only and never substitutes for approved adult meetings',()=>{
 const s=new ArchiveStore({publicLounge:true});s.seed('visitor','산책자','guest',{publicVisitor:true,adultConfirmed:false});s.join('visitor');
 assert.throws(()=>s.action('visitor',{type:'like',target:'host',consent:true}),/성인|승인/);
 s.seed('waiting','대기','guest',{status:'waiting',publicVisitor:true,adultConfirmed:false});assert.throws(()=>s.join('waiting'),/승인/);
 s.seed('blocked','차단','guest',{blocked:true,publicVisitor:true,adultConfirmed:false});assert.throws(()=>s.join('blocked'),/승인/);
 const privateMeeting=new ArchiveStore();privateMeeting.seed('minor','미확인','guest',{publicVisitor:true,adultConfirmed:false});assert.throws(()=>privateMeeting.join('minor'),/성인/);
});
test('profile edits change only the authenticated player with a bounded canonical appearance',()=>{
 let now=10000;const s=new ArchiveStore({clock:()=>now});for(const id of ['a','b']){s.seed(id,id);s.join(id);}
 const result=s.action('a',{type:'identity',nickname:'달빛 독서가',appearance:{kind:6,hairStyle:2,color:'invalid'},role:'host',target:'b',adultConfirmed:true});
 assert.equal(result.identity.nickname,'달빛 독서가');assert.equal(result.identity.appearance.kind,6);assert.equal(s.clients.get('a').role,'guest');assert.equal(s.clients.get('b').nickname,'b');
 assert.equal(s.members.get('a').nickname,'달빛 독서가');assert.equal('lastIdentityAt' in s.snapshot('b').players.find(p=>p.id==='a'),false);
 assert.throws(()=>s.action('a',{type:'identity',nickname:'가',appearance:{}}),/잠시/);now+=1000;
 assert.throws(()=>s.action('a',{type:'identity',nickname:' ',appearance:{}}),/입력/);
 assert.throws(()=>s.action('a',{type:'identity',nickname:'가',appearance:null}),/캐릭터/);
 const restored=restoreStore(JSON.parse(JSON.stringify(serializeStore(s))),s.clock);assert.equal(restored.members.get('a').nickname,'달빛 독서가');
});
test('seven gentle shared branches grow in stages and cool before the next cycle',()=>{
 let now=100000;const s=new ArchiveStore({clock:()=>now});s.seed('a','불멍');s.join('a');const p=s.clients.get('a'),seat=CAMP_SEATS[0];Object.assign(p,{room:'camp',x:seat.stand.x,z:seat.stand.z});s.action('a',{type:'sit',seat:seat.id});
 let previous=0;for(let count=1;count<=7;count++){
  const result=s.action('a',{type:'campfire-branch'}),state=s.snapshot('a').campfire;
  assert.equal(state.branches,count);assert.ok(state.heat>previous);previous=state.heat;
  assert.equal(result.tooHot,count>=6);assert.equal(result.cooling,count===7);now+=1800;
 }
 assert.throws(()=>s.action('a',{type:'campfire-branch'}),/뜨겁/);assert.equal(s.snapshot('a').campfire.branches,7);
 now+=FIRE.coolingMs;const left=s.snapshot('a').campfire.branches;assert(left>0&&left<7);assert.equal(s.action('a',{type:'campfire-branch'}).branches,left+1);
});
test('larger garden routes reach both portals without crossing props; return spawns do not bounce back',()=>{
 assert.equal(MAX_PEOPLE,30);assert.ok(GARDEN.bounds.x>13);assert.ok(GARDEN.trees.length>=10);assert.ok(GARDEN.beds.length>=10);
 for(const key of ['camp','beyond']){const gate=GARDEN[key+'Gate'],back=GARDEN[key+'Return'];assert.ok(validPosition('garden',gate.x,gate.z));assert.ok(validPosition('garden',back.x,back.z));assert.ok(findWalkPath('garden',{x:0,z:5.5},gate).length);assert.ok(Math.hypot(gate.x-back.x,gate.z-back.z)>1.9);}
 assert.deepEqual(directEntry('garden-beyond'),{room:'garden',...GARDEN.beyondReturn});assert.ok(BEYOND_ROUTE.portal.z-BEYOND_ROUTE.arrival.z>1.9);
});
test('random profiles, nickname validation and shared camera controls stay consistent',()=>{
 for(let i=0;i<100;i++){const p=randomIdentity();assert.ok(p.nickname.length<=16);assert.deepEqual(identityValue(p),p);assert.ok(p.appearance.kind>=0&&p.appearance.kind<8);}
 assert.throws(()=>identityValue({nickname:'x'.repeat(17)}));const movement=moveRelativeToCamera(1,1,Math.PI/4);assert.ok(Math.abs(Math.hypot(movement.x,movement.z)-1)<1e-9);assert.ok(Math.abs(movement.z)<1e-9);
});
