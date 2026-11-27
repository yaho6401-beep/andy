import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {BOAT_PORTS,voyageDuration,voyagePose} from '../camp/sea-travel-state.js';
import {OFFSHORE_ISLANDS,headlandClearance} from '../camp/offshore-islands.js';
const base=process.env.BOAT_BASE||'http://127.0.0.1:4179',tag=base.includes('andy-plum')?'production':base.includes('vercel')?'preview':'local',out=`.local/boat-clearance-${tag}`;
await mkdir(out,{recursive:true});const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[],samples=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/Shader|WebGL|GL_INVALID/.test(m.text()))errors.push(m.text());});
await p.route('**/visits.js*',r=>r.abort());await p.route('**/api/**',r=>r.request().url().includes('/api/workshop-account')?r.fulfill({json:{profile:null}}):r.abort());
await p.route('**/*public-demo-transport*.js',async r=>{const res=await r.fetch();await r.fulfill({response:res,body:(await res.text()).replace("this.id='visitor';","this.id='visitor';globalThis.__fixture=this;").replace('this.id="visitor",','this.id="visitor",globalThis.__fixture=this,')});});
try{
 await p.goto(base+'/archive/?start=camp-shore&soloPreview=1');await p.waitForFunction(()=>globalThis.ArchiveDiagnostics?.state.joined);await expect(p.locator('#sea-cruise')).toBeVisible();
 // Start with the real action button, then sample the isolated authoritative clock.
 await p.locator('#sea-cruise').tap();await p.waitForFunction(()=>ArchiveDiagnostics.state.adventure.voyage?.to==='cruise');
 for(const from of ['shore','island']){
  if(from==='island')await p.evaluate(port=>{const f=__fixture,q=f.store.clients.get(f.id);f.store.clock=()=>Date.now();Object.assign(q,{x:port.x,z:port.z,voyage:null,seaRescue:null,seat:null,swimming:false,epoch:q.epoch+1,seq:0});f.emit();f.send({type:'sea-boat',destination:'cruise'});},BOAT_PORTS.island);
  for(const returning of [false,true]){
   if(returning){await p.locator('#sea-cruise-return').tap();await p.waitForFunction(()=>ArchiveDiagnostics.state.adventure.voyage?.from==='cruise');}
   const v=await p.evaluate(()=>({...__fixture.store.clients.get(__fixture.id).voyage}));expect(v.from).toBe(returning?'cruise':from);const duration=voyageDuration(v);
   for(const progress of [.25,.5,.73,.85,1]){
    const at=v.at+duration*progress;await p.evaluate(at=>{__fixture.store.clock=()=>at;__fixture.emit();},at);await p.waitForTimeout(1100);
    const q=await p.evaluate(()=>{const f=__fixture,q=f.store.clients.get(f.id);return {x:q.x,z:q.z};}),expected=voyagePose(v,at);expect(Math.hypot(q.x-expected.x,q.z-expected.z)).toBeLessThan(.01);
    for(const o of OFFSHORE_ISLANDS)expect(headlandClearance(q,o)).toBeGreaterThan(1);
    samples.push({from,returning,progress,...q});if(progress===.73||progress===1)await p.screenshot({path:`${out}/${from}-${returning?'return':'out'}-${progress}.png`});
   }
   if(!returning)await expect(p.locator('#cruise-arrival')).toBeVisible();else expect(Math.hypot(samples.at(-1).x-BOAT_PORTS[from].x,samples.at(-1).z-BOAT_PORTS[from].z)).toBeLessThan(.01);
  }
 }
 // Complete a normal boarding after the route checks; only one renderer survives.
 await p.evaluate(port=>{const f=__fixture,q=f.store.clients.get(f.id);f.store.clock=()=>Date.now();Object.assign(q,{x:port.x,z:port.z,voyage:null,seaRescue:null,seat:null,swimming:false,epoch:q.epoch+1,seq:0});f.emit();f.send({type:'sea-boat',destination:'cruise'});const v=q.voyage;f.store.clock=()=>v.at+15001;f.emit();},BOAT_PORTS.shore);
 await expect(p.locator('#sea-cruise-board')).toBeVisible();await p.locator('#sea-cruise-board').tap();await p.waitForURL('**/archive/cruise/**');await p.waitForFunction(()=>globalThis.BlueHorizonDiagnostics?.state.drawCalls>0);await expect(p.locator('body > canvas')).toHaveCount(1);expect(errors).toEqual([]);
 await writeFile(out+'/result.json',JSON.stringify({pass:true,branches:4,authoritativeSamples:samples.length,mobile:true,boarding:true,errors,samples},null,2));console.log(JSON.stringify({pass:true,samples:samples.length,boarding:true,errors}));
}catch(e){await p.screenshot({path:out+'/failure.png'}).catch(()=>{});console.log(JSON.stringify({error:e.message,errors}));throw e;}finally{await b.close();}
