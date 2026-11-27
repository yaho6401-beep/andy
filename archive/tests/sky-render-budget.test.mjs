import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {createObservingSky} from '../camp/sky-visual.js';
test('holding a recognized star keeps its highlight without repeated GPU uploads; looking away clears it',t=>{
 t.mock.method(Date,'now',()=>Date.parse('2026-11-27T12:00:00Z'));
 t.mock.method(T.TextureLoader.prototype,'load',function(url,ready){const texture=new T.Texture();ready?.(texture);return texture;});
 const scene=new T.Scene(),sky=createObservingSky(scene),camera=new T.PerspectiveCamera(60,1,.1,500);
 try{sky.setMode('tonight');sky.set(true);const p=sky.diagnostics.positions.polaris,a=p.azimuth*Math.PI/180,h=p.altitude*Math.PI/180;camera.lookAt(Math.sin(a)*Math.cos(h),Math.sin(h),-Math.cos(a)*Math.cos(h));camera.updateMatrixWorld();sky.update(0,camera);assert.equal(sky.target.id,'polaris');const points=scene.children[0].children.find(o=>o.isPoints),glow=points.geometry.attributes.glow,version=glow.version;assert.equal([...glow.array].filter(Boolean).length,1);
  for(let i=1;i<=120;i++)sky.update(i/60,camera);assert.equal(sky.target.id,'polaris');assert.equal(glow.version,version);assert.equal(Object.keys(sky.diagnostics.positions).length,3);
  camera.lookAt(0,-1,0);camera.updateMatrixWorld();sky.update(3,camera);assert.equal(sky.target,null);assert.equal(glow.version,version+1);assert(glow.array.every(v=>v===0));
  camera.lookAt(Math.sin(a)*Math.cos(h),Math.sin(h),-Math.cos(a)*Math.cos(h));camera.updateMatrixWorld();sky.update(4,camera);assert.equal(sky.target.id,'polaris');assert.equal(glow.version,version+2);
 }finally{sky.dispose();}assert.equal(scene.children.length,0);
});
