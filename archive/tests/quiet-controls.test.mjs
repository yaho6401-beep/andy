import test from 'node:test';import assert from 'node:assert/strict';
import * as T from 'three';
import {VisitChat} from '../src/visit-chat.js';import {roomRoute,roomLanding} from '../src/auto-walk.js';
import {findWalkPath} from '../src/navigation.js';import {PORTALS,ROOMS,validPosition,validMove} from '../src/protocol.js';
import {ArchiveStore} from '../server/room-store.mjs';import {serializeStore,restoreStore,expirePlayers} from '../server/persistence.mjs';import {CHAT_RETENTION} from '../server/chat-history.mjs';
import {EmberTouch} from '../camp/ember-touch.js';import {createFireVisual} from '../camp/fire-visual.js';import {FireAudio} from '../camp/fire-audio.js';

test('conversation starts empty each visit, keeps four fresh lines and clears when closed or changing rooms',()=>{
 const chat=new VisitChat(),m=(id,at,room='camp')=>({id,at,room,text:id});
 assert.deepEqual(chat.accept({at:100,messages:[m('old',90)]},'camp'),[]);
 const lines=Array.from({length:8},(_,i)=>m('m'+i,101+i));assert.deepEqual(chat.accept({at:110,messages:lines},'camp').map(m=>m.id),['m4','m5','m6','m7']);
 chat.clear(111);assert.deepEqual(chat.accept({at:112,messages:lines},'camp'),[]);assert.equal(chat.accept({at:113,messages:[...lines,m('new',113)]},'camp').length,1);
 assert.deepEqual(chat.accept({at:120,messages:[m('old-room',119),m('library-old',115,'books')]},'books'),[]);
 assert.deepEqual(chat.accept({at:130,messages:[m('old-room',119)]},'camp'),[]);chat.reset();assert.deepEqual(chat.accept({at:140,messages:[m('new',113)]},'camp'),[]);
});
test('every shortcut uses the real portal graph and collision-safe walking paths, including long gallery wings',()=>{
 for(const from of ROOMS)for(const to of ROOMS){const route=roomRoute(from,to);assert(route&&route[0]===from&&route.at(-1)===to);let start=roomLanding(from);
  for(let i=0;i<route.length-1;i++){const room=route[i],gate=PORTALS[room].find(g=>g.to===route[i+1]);assert(gate);const path=findWalkPath(room,start,gate);assert(path.length,room+'→'+gate.to);let point=start;for(const next of path){assert(validMove(room,point.x,point.z,next.x,next.z));point=next;}assert(Math.hypot(point.x-gate.x,point.z-gate.z)<1.85);start=gate.spawn;}
  const landing=roomLanding(to);assert(validPosition(to,landing.x,landing.z));const path=findWalkPath(to,start,landing);assert(path.length||Math.hypot(start.x-landing.x,start.z-landing.z)<.4);
 }
 assert.equal(roomRoute('camp','__proto__'),null);
});
test('chat history survives reconnect and public expiry, and is only returned behind host authorization',()=>{
 let now=100000;const s=new ArchiveStore({clock:()=>now});for(const [id,role]of [['a','guest'],['b','guest'],['h','host']]){s.seed(id,id,role);s.join(id);s.clients.get(id).room='camp';}
 s.action('a',{type:'chat',text:'camp note'});assert.throws(()=>s.admin('a'),/권한/);assert.equal(s.snapshot('b').chatHistory,undefined);assert.equal(s.admin('h').chatHistory.length,1);
 now+=3600001;const restored=restoreStore(JSON.parse(JSON.stringify(serializeStore(s))),()=>now);expirePlayers(restored,now);assert.equal(restored.messages.length,0);assert.equal(restored.chatHistory[0].text,'camp note');
 now+=CHAT_RETENTION.days*86400000;expirePlayers(restored,now);assert.equal(restored.chatHistory.length,0);
});
test('private whispers remain absent from other visitors, while host records are bounded and escaped at rendering',()=>{
 let now=100000;const s=new ArchiveStore({clock:()=>now});for(const [id,role]of [['a','guest'],['b','guest'],['h','host']]){s.seed(id,id,role);s.join(id);s.clients.get(id).room='camp';}
 s.clients.get('a').seat={group:'isolated'};s.action('a',{type:'chat',scope:'whisper',text:'<private>'});assert.equal(s.snapshot('b').messages.length,0);assert.equal(s.admin('h').chatHistory[0].scope,'whisper');
 for(let i=0;i<550;i++){now+=1201;s.action('a',{type:'chat',text:'line '+i});}assert.equal(s.admin('h').chatHistory.length,500);assert.equal(s.snapshot('a').messages.length,45);assert(!JSON.stringify(s.snapshot('b')).includes('chatHistory'));
});
test('more frequent large stirs have stronger varied motion, without changing the heart probability or creating sound when muted',()=>{
 let seed=24;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},touch=new EmberTouch(random);let big=0;
 for(let i=0;i<10000;i++){const event=touch.touch(touch.readyAt,1);if(event.big){big++;assert.equal(event.motion,1.85);}else assert.equal(event.motion,1.25);}
 assert(big>4800&&big<5200);assert(touch.hearts>900&&touch.hearts<1100);
 const scene=new T.Group(),fire=createFireVisual(scene);fire.stir({big:true,motion:1.3,strength:1,count:20,heartCount:0},1,{x:1,z:0});fire.update(1.1);assert.equal(fire.diagnostics.bigStirs,1);assert.equal(fire.diagnostics.stirMotion,1.3);assert(fire.diagnostics.touchParticles<=168);fire.dispose();
 const audio=new FireAudio();audio.stir(1,true);assert.equal(audio.context,null);assert.equal(audio.voices.size,0);audio.dispose();
});
