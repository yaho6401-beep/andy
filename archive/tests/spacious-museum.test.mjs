import test from 'node:test';import assert from 'node:assert/strict';
import {GALLERY,GALLERY_COLLIDERS} from '../src/gallery-layout.js';
import {MUSEUM_EXHIBITS,MUSEUM_REACH} from '../src/museum-layout.js';
import {PORTALS,validPosition,validMove} from '../src/protocol.js';
import {MuseumFocus} from '../src/museum-focus.js';
import {ingredientHTML} from '../src/museum-guide.js';
import {ArchiveStore} from '../server/room-store.mjs';
import {restoreStore,serializeStore} from '../server/persistence.mjs';
test('live visitors caught by moved plinths recover to the open entrance without losing data or privileges',()=>{
 const s=new ArchiveStore();s.seed('guest','전시 관람');s.join('guest');s.notes=[{id:'keep',text:'소중한 기억'}];s.choices.set('guest',{target:null,consent:false});
 Object.assign(s.clients.get('guest'),{room:'scents',x:11.6,z:-3.5,epoch:2,heldItem:{name:'커피'}});
 const restored=restoreStore(JSON.parse(JSON.stringify(serializeStore(s)))),p=restored.clients.get('guest');assert.equal(p.x,GALLERY.scents.entrance.spawn.x);assert.equal(p.z,0);assert.equal(p.epoch,3);assert.equal(p.role,'guest');assert.equal(p.heldItem.name,'커피');assert.equal(restored.notes[0].id,'keep');assert.equal(restored.choices.get('guest').consent,false);
 const again=restoreStore(JSON.parse(JSON.stringify(serializeStore(restored))));assert.equal(again.clients.get('guest').epoch,3);
});
test('museum entrance opens onto an unobstructed gallery without an exhibit or automatic commentary',()=>{
 const r=GALLERY.scents,{entrance:e}=r;
 assert.ok(r.width*r.depth>=28*24*2);assert.equal(PORTALS.scents[0].x,e.x);assert.deepEqual(PORTALS.lobby.find(p=>p.to==='scents').spawn,e.spawn);
 for(let x=e.clearToX;x<e.x;x+=.2)for(let z=-e.clearHalfWidth;z<=e.clearHalfWidth;z+=.2)assert.ok(validPosition('scents',x,z),`entrance ${x},${z}`);
 assert.ok(validMove('scents',e.spawn.x,0,0,0));
 for(const s of MUSEUM_EXHIBITS)assert.ok(Math.hypot(s.x-e.spawn.x,s.z-e.spawn.z)>MUSEUM_REACH+2);
 for(const o of GALLERY_COLLIDERS.scents)assert.ok(!validPosition('scents',o.x,o.z));
});
test('thirty exhibits have separated commentary radii and comfortable pedestrian aisles',()=>{
 assert.equal(MUSEUM_EXHIBITS.length,30);
 for(let i=0;i<30;i++)for(let j=i+1;j<30;j++)assert.ok(Math.hypot(MUSEUM_EXHIBITS[i].x-MUSEUM_EXHIBITS[j].x,MUSEUM_EXHIBITS[i].z-MUSEUM_EXHIBITS[j].z)>MUSEUM_REACH*2,`${i},${j}`);
});
test('exhibit commentary waits for a quiet stop, hides during movement, and cannot linger in another room',()=>{
 const focus=new MuseumFocus(),a={...MUSEUM_EXHIBITS[0],type:'ingredient'},b={...MUSEUM_EXHIBITS[1],type:'ingredient'},state={enabled:true,modal:false,room:'scents',position:a.approach,now:0};
 assert.equal(focus.update(a,state),null);assert.equal(focus.update(a,{...state,now:449}),null);assert.equal(focus.update(a,{...state,now:450}).id,a.id);
 assert.equal(focus.update(b,{...state,moving:true,now:500}),null);assert.equal(focus.update(b,{...state,position:b.approach,now:600}),null);assert.equal(focus.update(b,{...state,position:b.approach,now:1050}).id,b.id);
 assert.equal(focus.update(null,{...state,room:'lobby',now:2000}),null);assert.equal(focus.update(a,{...state,modal:true,now:2500}),null);
});
test('large explanation pages retain blind identities, all original text and accessible tap navigation',()=>{
 for(const s of MUSEUM_EXHIBITS){const h=ingredientHTML(s,true,false);for(const value of Object.values(s.blind))if(typeof value==='string')assert.ok(h.includes(value));for(const id of ['impression','blending','memory']){assert.ok(h.includes('data-ingredient-tab="'+id+'"'));assert.ok(h.includes('ingredient-panel-'+s.id+'-'+id));}assert.ok(h.includes('role="tablist"'));assert.ok(h.includes('aria-selected="true"'));assert.ok(h.includes('향 이름 확인하기'));const revealed=ingredientHTML(s,true,true,'blending');assert.ok(revealed.includes(s.name));assert.ok(revealed.includes(`aria-selected="true" tabindex="0" data-ingredient-tab="blending"`));}
});
