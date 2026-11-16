import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene} from 'three';
import {ArchiveWorld} from '../src/world.js';
import {ROOMS} from '../src/protocol.js';
test('every room preserves mixed indexed furnishings when batching materials',()=>{
 const original=globalThis.document,oldError=console.error,errors=[];
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({clearRect(){},fillText(){}})})};
 console.error=(...args)=>errors.push(args.join(' '));
 try{const world=new ArchiveWorld(new Scene());for(const room of [...ROOMS,'garden']){world.build(room);let meshes=0;world.group.traverse(o=>{if(o.isMesh){meshes++;const positions=o.geometry.attributes.position.array;for(const v of positions)assert.ok(Number.isFinite(v));}});assert.ok(meshes>10);assert.ok(meshes<120,'static batching must stay bounded');}assert.deepEqual(errors,[]);}finally{globalThis.document=original;console.error=oldError;}
});
