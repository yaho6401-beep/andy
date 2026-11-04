import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createCamp} from '../camp/world.js';
test('camp geometry builds and disposes without a GPU; static furnishings stay batched',()=>{
 const previous=globalThis.document;
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillText(){}})})};
 try{const scene=new T.Scene(),camp=createCamp(scene);let meshes=0,triangles=0;scene.traverse(o=>{if(o.isMesh){meshes++;const pos=o.geometry.attributes.position;assert.ok([...pos.array].every(Number.isFinite));triangles+=(o.geometry.index?.count||pos.count)/3;}});assert.ok(meshes<55,`${meshes} meshes`);assert.ok(triangles<30000,`${triangles} triangles`);camp.update(1);camp.update(2,true);camp.dispose();assert.equal(scene.children.length,0);console.log(JSON.stringify({campMeshes:meshes,campTriangles:triangles,note:'Scene construction test, not WebGL render or FPS verification'}));}finally{globalThis.document=previous;}
});
