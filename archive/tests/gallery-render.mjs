import {chromium,expect} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const out='.local/gallery-review',base=process.env.GALLERY_BASE||'http://127.0.0.1:4184';await mkdir(out,{recursive:true});
const baseline=execFileSync('G:/github/.tools/git/cmd/git.exe',['show','d18890ceb154e52872175ceb622567d7293009f8:archive/src/world.js'],{encoding:'utf8'});
const html=`<!doctype html><meta charset="utf-8"><style>body{margin:0;overflow:hidden}canvas{display:block}</style><script type="importmap">{"imports":{"three":"/archive/node_modules/three/build/three.module.js","three/addons/":"/archive/node_modules/three/examples/jsm/"}}</script><script type="module">
import * as T from 'three';import {ArchiveWorld} from '/archive/src/world.js';import {ArchiveWorld as BaselineWorld} from '/archive/src/baseline-world.js';
const scene=new T.Scene(),camera=new T.PerspectiveCamera(48,1.5,.1,160),renderer=new T.WebGLRenderer({antialias:true});renderer.setSize(1200,800);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;document.body.append(renderer.domElement);const ambient=new T.HemisphereLight('#fff8e7','#b4aa9c',1.7),sun=new T.DirectionalLight('#fff1d8',2.1);sun.position.set(-5,14,9);scene.add(ambient,sun);let world;
window.renderRoom=(room,old=false)=>{if(world){world.build('garden');scene.remove(world.group);}world=old?new BaselineWorld(scene):new ArchiveWorld(scene);world.build(room);if(room==='camp')world.update(1);scene.background=new T.Color('#e7e3da');camera.position.set(23,22,29);camera.lookAt(0,1,0);renderer.render(scene,camera);return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures};};
window.cycle=()=>{world??=new ArchiveWorld(scene);for(const room of ['scents','books','garden','lobby','salon','camp']){world.build(room);world.update(1,room==='camp'?{x:-8,z:-1.8}:null);renderer.render(scene,camera);}world.build('scents');renderer.render(scene,camera);return {...renderer.info.memory,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};};
window.sampleFrames=()=>new Promise(resolve=>{let frames=0;const start=performance.now();function frame(now){renderer.render(scene,camera);frames++;if(now-start<2000)requestAnimationFrame(frame);else resolve({fps:frames*1000/(now-start),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});}requestAnimationFrame(frame);});window.ready=true;
</script>`;
const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.route('**/archive/src/baseline-world.js',r=>r.fulfill({contentType:'text/javascript',body:baseline}));await page.route('**/__gallery-render',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto(base+'/__gallery-render');await page.waitForFunction(()=>window.ready);
 const before=[],after=[];
 for(const room of ['scents','books','lobby','salon','camp']){if(room==='scents'||room==='books')before.push({room,...await page.evaluate(room=>renderRoom(room,true),room)});after.push({room,...await page.evaluate(room=>renderRoom(room),room)});await page.screenshot({path:out+'/'+room+'-overview.png'});}
 const campFrames=await page.evaluate(()=>sampleFrames());
 // Render every room to exercise GPU allocation and disposal, not just scene construction.
 const cycles=[];for(let i=0;i<5;i++)cycles.push(await page.evaluate(()=>cycle()));expect(cycles[4].geometries).toBe(cycles[0].geometries);expect(cycles[4].textures).toBe(cycles[0].textures);
 const frames=await page.evaluate(()=>sampleFrames());expect(errors).toEqual([]);for(const r of after){expect(r.calls).toBeLessThan(90);expect(r.triangles).toBeLessThan(120000);}
 const result={before,after,cycles,frames,campFrames,errors,device:'Headless Edge on development PC, not physical-phone certification'};await writeFile(out+'/render-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
