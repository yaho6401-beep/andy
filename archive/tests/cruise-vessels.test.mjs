import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {buildVesselModel,VESSEL_SPECS,vesselHullGeometry} from '../cruise/vessel-models.js';
import {cruiseHullGeometry,hullDeckLevel} from '../cruise/exterior-hull.js';
import {hullHalfBeam} from '../cruise/ship-layout.js';
import {createHarborTraffic} from '../cruise/harbor-traffic.js';
import {COAST_FADE_FAR,harborAtmosphere} from '../cruise/coastal-scenery.js';
test('vessels have submerged keels, fair flared sides and finite normals at modest geometry cost',()=>{
 for(const[k,s]of Object.entries(VESSEL_SPECS)){const g=vesselHullGeometry(s),p=g.attributes.position,n=g.attributes.normal;assert.ok(g.boundingBox.min.y<-s.draft);assert.ok(g.boundingBox.max.y>s.deck);assert.ok(g.index.count/3<1800);for(let i=0;i<p.count;i++)assert.ok([p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i)].every(Number.isFinite),k);
  // Starboard midship must be outward facing, never an inside-out one-sided shell.
  const mid=24*17;assert.ok(n.getX(mid+2)>.7,k);assert.ok(n.getY(mid+8)<-.7,k);g.dispose();}
});
test('the cruise shell meets existing deck edges and has a continuous underwater body',()=>{const g=cruiseHullGeometry(),p=g.attributes.position,n=g.attributes.normal;assert.ok(g.boundingBox.min.y<-4.9);for(let z=-69;z<=69;z++){const i=(z+70)*17;assert.ok(Math.abs(p.getX(i)-hullHalfBeam(z))<.00001);assert.ok(Math.abs(p.getY(i)-(hullDeckLevel(z)-.15))<.00001);assert.ok(n.getX(i+2)>.2);assert.ok(n.getY(i+8)<-.7);}g.dispose();});
test('static vessel fittings batch by finish, share resources and fully release after a harbor closes',()=>{for(const k of Object.keys(VESSEL_SPECS)){const m=buildVesselModel(k),disposed=[];assert.ok(m.triangles<13000);assert.ok(m.parts.length<=10);for(const p of m.parts){for(const r of[p.geometry,p.material])r.addEventListener('dispose',()=>disposed.push(r));for(const x of p.geometry.attributes.position.array)assert.ok(Number.isFinite(x));}m.dispose();assert.equal(disposed.length,m.parts.length*2);}
 const root=new T.Group(),traffic=createHarborTraffic(root,'busan'),geos=new Set(),mats=new Set();root.traverse(o=>{if(o.isMesh){geos.add(o.geometry);mats.add(o.material);}});let disposed=0;for(const r of[...geos,...mats])r.addEventListener('dispose',()=>disposed++);const first=traffic.state;traffic.update(15);assert.ok(traffic.state.some((v,i)=>Math.abs(v.x-first[i].x)>20));assert.ok(traffic.state.reduce((n,v)=>n+v.triangles,0)<60000);traffic.dispose();assert.equal(root.children.length,0);assert.equal(disposed,geos.size+mats.size);
});
test('coast feathering is completely invisible before the 1200m clipping plane',()=>{assert.ok(COAST_FADE_FAR+55<1200);for(let d=1100;d<=1200;d++)assert.equal(harborAtmosphere(d-55).visibility,0);});
