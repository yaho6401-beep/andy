import test from 'node:test';
import assert from 'node:assert/strict';
import {readRecord,readStored,writeStored,thoughtSettings,orderSeconds} from '../src/client-state.js';
import {createAvatar,animateAvatar,disposeAvatar} from '../src/avatar.js';
import {SharedTransport} from '../src/shared-transport.js';

test('damaged or disabled browser storage never prevents entry or saving preferences',()=>{
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>'{broken',setItem:()=>{throw Error('quota');}}});
 assert.deepEqual(readRecord('localStorage','look'),{});assert.equal(writeStored('localStorage','look','{}'),false);
 globalThis.localStorage.getItem=()=> 'null';assert.deepEqual(readRecord('localStorage','look'),{});
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('security');}});
 assert.equal(readStored('localStorage','session'),null);assert.deepEqual(readRecord('localStorage','look'),{});
 assert.deepEqual(thoughtSettings({lines:'wrong'}),{enabled:true,lines:[]});
 assert.deepEqual(thoughtSettings({enabled:false,lines:[null,4,' hello ']}),{enabled:false,lines:['hello']});
});
test('preparation countdown advances between server snapshots and respects clock skew',()=>{
 assert.equal(orderSeconds(130000,10000,100000),20);
 assert.equal(orderSeconds(130000,10000,105000),15);
 assert.equal(orderSeconds(130000,10000,130000),0);
});
test('avatar batches retain animation and dispose owned resources without destroying shared materials',()=>{
 for(let kind=0;kind<8;kind++){
  const avatar=createAvatar({kind,hairStyle:kind%3});let meshes=0,geometries=0,owned=0,shared=0;
  avatar.traverse(o=>{if(o.isMesh){meshes++;o.geometry.addEventListener('dispose',()=>geometries++);o.material.addEventListener('dispose',()=>o.material.userData.avatarOwned?owned++:shared++);}});
  assert.ok(meshes<30,`avatar ${kind}: ${meshes} draws`);
  animateAvatar(avatar,{motion:'walk',emoteAt:0},12);assert.notEqual(avatar.userData.legs[0].rotation.x,0);
  disposeAvatar(avatar);assert.equal(geometries,meshes);assert.equal(owned,1);assert.equal(shared,0);
 }
});
function browserStubs(){
 const storage={getItem:()=>null,setItem:()=>{throw Error('blocked');}};
 for(const key of ['localStorage','sessionStorage'])Object.defineProperty(globalThis,key,{configurable:true,value:storage});
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}});
 globalThis.window={addEventListener(){},removeEventListener(){}};globalThis.document={hidden:false};globalThis.fetch=async()=>({ok:true,json:async()=>({})});
}
function snapshot(id){return {players:[{id,role:'guest',correction:0}],notes:[],content:{scents:[]}};}
test('late responses from a closed connection cannot overwrite a fresh session',async()=>{
 browserStubs();const snapshots=[];const t=new SharedTransport(s=>snapshots.push(s),()=>{});t.schedule=()=>{};
 let join=0,finish;t.request=async op=>op==='join'?{id:'p'+(++join),token:'x',snapshot:snapshot('p'+join)}:await new Promise(r=>finish=r);
 await t.connect({nickname:'test'});const oldTick=t.tick();t.close();await t.connect({nickname:'test'});
 finish({snapshot:snapshot('old')});await oldTick;
 assert.equal(snapshots.length,2);assert.equal(snapshots.at(-1).players[0].id,'p2');assert.equal(t.closed,false);assert.equal(t.busy,false);t.close();
});
test('network retries preserve the same action batch instead of duplicating orders',async()=>{
 browserStubs();const t=new SharedTransport(()=>{},()=>{});t.schedule=()=>{};t.closed=false;let attempts=[];
 t.queue=[{type:'order',item:'coffee-0'}];t.request=async(_op,data)=>{attempts.push(structuredClone(data));if(attempts.length===1)throw Error('offline');return {batch:1,receipts:[]};};
 await t.tick();assert.equal(t.pending.batch,1);await t.tick();assert.equal(t.pending,null);assert.deepEqual(attempts[0],attempts[1]);t.close();
});
