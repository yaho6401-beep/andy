import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {VOYAGE_ROUTES,homeVoyage,departVoyage,returnVoyage,updateVoyage,voyagePose,restoreVoyage,voyagePosition} from '../cruise/voyage-state.js';
import {createPortWorld} from '../cruise/port-world.js';
test('twelve compressed voyages leave the home world, move continuously and stop offshore',()=>{
 assert.equal(VOYAGE_ROUTES.length,12);assert.equal(new Set(VOYAGE_ROUTES.map(r=>r.id)).size,12);
 for(const route of VOYAGE_ROUTES){const state=departVoyage(homeVoyage(),route.id,1000);let last=voyagePose(state,1000);assert.equal(last.speed,0);assert.equal(last.x,0);assert.equal(last.z,0);
  for(let t=1100;t<=1000+route.seconds*1000;t+=100){const p=voyagePose(state,t);assert.ok(Math.hypot(p.x-last.x,p.z-last.z)<2.5,'no landscape teleport');assert.ok([p.x,p.z,p.heading,p.speed].every(Number.isFinite));assert.ok(p.speed>=0);last=p;}
  assert.ok(Math.hypot(last.x,last.z)>1000);const docked=updateVoyage(state,1000+route.seconds*1000);assert.equal(docked.phase,'port');assert.equal(voyagePose(docked,900000).speed,0);assert.deepEqual(voyagePosition(route.id,1).x,route.x);assert.throws(()=>departVoyage(docked,route.id,900000));
 }
});
test('return duration scales with distance, includes a gradual turn and persists through reload',()=>{
 for(const route of VOYAGE_ROUTES){const state=departVoyage(homeVoyage(),route.id,100000),near=returnVoyage(state,105000),far=returnVoyage(state,100000+route.seconds*1000);assert.ok(far.durationMs>near.durationMs);assert.equal(far.turnMs,6000);
  const now=far.at+3000,turn=voyagePose(far,now);assert.ok(turn.turning);assert.equal(turn.speed,0);assert.ok(turn.heading>1&&turn.heading<2);
  const restored=restoreVoyage({...far,returnURL:'https://evil.invalid'},now);assert.equal('returnURL'in restored,false);assert.equal(restored.phase,'returning');assert.equal(voyagePose(restored,now).u,1);
  const mid=voyagePose(far,far.at+far.turnMs+far.durationMs/2);assert.ok(mid.u>.49&&mid.u<.51);assert.equal(updateVoyage(far,far.at+far.turnMs+far.durationMs).phase,'home');
 }
});
test('the entire 140m ship clears the home coast instead of sailing through it',()=>{
 for(const r of VOYAGE_ROUTES)for(let i=0;i<=1500;i++){const p=voyagePosition(r.id,i/1500),dx=Math.max(0,Math.abs(p.x+10)-54),dz=Math.abs(p.z+280);assert.ok(Math.hypot(dx,dz)>72,'conservative hull circle clears the camp panorama and coast');}
});
test('only bounded, known personal voyage records resume; stale or forged data resets safely',()=>{
 const now=1000000;for(const v of [null,{}, {version:1,phase:'outbound',routeId:'bad',at:now},{version:1,phase:'outbound',routeId:'bergen',at:now+3000},{version:1,phase:'returning',routeId:'bergen',at:now,durationMs:Infinity,turnMs:6000,fromU:1}])assert.equal(restoreVoyage(v,now).phase,'home');
 const r=VOYAGE_ROUTES[0],s=departVoyage(homeVoyage(),r.id,now);assert.equal(restoreVoyage(s,now+r.seconds*1000+50000).phase,'port');assert.throws(()=>departVoyage(homeVoyage(),'https://evil.invalid',now));
});
test('each port is real bounded 3D geometry, separately batched and completely disposable',()=>{
 const parent=new T.Group();let previous;
 for(const r of VOYAGE_ROUTES){previous?.dispose();const port=createPortWorld(parent,r.id);assert.equal(parent.children.length,1);assert.equal(port.state.id,r.id);assert.ok(port.state.objects>150);assert.ok(port.state.triangles>4000&&port.state.triangles<100000);assert.ok(port.state.batchedMaterials<25);
  port.root.traverse(o=>{if(!o.geometry)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)assert.ok([p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite));});previous=port;
 }
 previous.dispose();assert.equal(parent.children.length,0);
});
