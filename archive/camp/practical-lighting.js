import * as T from 'three';
import {ALL_TENTS,campHeight,GATHERING_PATH,tentAt} from './layout.js';

// Three permanent cabin lights and a fixed pool of three nearby path lights.
// No shadows, full-screen effects, weather-dependent blackout or per-frame allocation.
export const CAMP_LAMPS=[
 ...[[-12,-10.8],[12,-10.8],[-3.8,5],[3.8,5],[-8,2.2],[8,2.2],[-2.1,10.3],[2.1,10.3]].map(([x,z])=>({x,z,y:1.08,power:13,range:4.8,radius:2.3})),
 ...Array.from({length:8},(_,i)=>{const x=-26+i*7.4,z=-8.1;return {x,z,y:campHeight(x,z)+2.58,power:34,range:7.2,radius:3.5};}),
 ...GATHERING_PATH.slice(1,4).flatMap((b,i)=>{const a=GATHERING_PATH[i],length=Math.hypot(b.x-a.x,b.z-a.z);return [.25,.8].flatMap(t=>[-1,1].map(side=>{const x=a.x+(b.x-a.x)*t-(b.z-a.z)/length*1.65*side,z=a.z+(b.z-a.z)*t+(b.x-a.x)/length*1.65*side;return {x,z,y:campHeight(x,z)+.49,power:7,range:3.6,radius:1.7};}));})
];

export function createCampPracticalLights(parent){
 const root=new T.Group();root.name='warm-lanterns-and-cabins';parent.add(root);
 const cabins=ALL_TENTS.map(t=>{const light=new T.PointLight('#ffddba',t.id==='gathering'?48:26,t.id==='gathering'?11:7.5,1.5);light.position.set(t.x,t.id==='gathering'?2.8:1.9,t.z-.35);light.castShadow=false;root.add(light);return {tent:t,light,base:light.intensity};});
 const paths=Array.from({length:3},()=>{const light=new T.PointLight('#ffdfa9',0,5,2);light.castShadow=false;root.add(light);return {light,index:-1};});
 const pixels=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),a=Math.max(0,1-r*r);pixels[i]=255;pixels[i+1]=224;pixels[i+2]=171;pixels[i+3]=Math.round(a*a*110);}
 const texture=new T.DataTexture(pixels,64,64);texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearFilter;texture.needsUpdate=true;
 const material=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:.4,depthWrite:false,blending:T.AdditiveBlending});
 const geometry=new T.PlaneGeometry(1,1);geometry.rotateX(-Math.PI/2);const pools=new T.InstancedMesh(geometry,material,CAMP_LAMPS.length),matrix=new T.Matrix4(),scale=new T.Vector3(),position=new T.Vector3(),rotation=new T.Quaternion();pools.name='soft-warm-path-pools';
 for(let i=0;i<CAMP_LAMPS.length;i++){const p=CAMP_LAMPS[i];position.set(p.x,campHeight(p.x,p.z)+.095,p.z);scale.set(p.radius*2,1,p.radius*2);matrix.compose(position,rotation,scale);pools.setMatrixAt(i,matrix);}pools.frustumCulled=false;root.add(pools);
 const chosen=new Int16Array(3),scores=new Float64Array(3);let disposed=false;
 return {update(viewer,dt=.05){
  const inside=viewer?tentAt(viewer.x,viewer.z):null;
  for(const c of cabins)c.light.intensity=T.MathUtils.damp(c.light.intensity,c.base*(inside?.id===c.tent.id?1.5:1),5,dt);
  chosen.fill(-1);scores.fill(Infinity);
  if(viewer)for(let i=0;i<CAMP_LAMPS.length;i++){const p=CAMP_LAMPS[i],score=(p.x-viewer.x)**2+(p.z-viewer.z)**2;if(score>225)continue;for(let slot=0;slot<3;slot++)if(score<scores[slot]){for(let j=2;j>slot;j--){scores[j]=scores[j-1];chosen[j]=chosen[j-1];}scores[slot]=score;chosen[slot]=i;break;}}
  // Keep matching fixtures in the same slot while walking to avoid visible flicker.
  for(const p of paths)if(!chosen.includes(p.index))p.index=-1;
  for(const index of chosen)if(index>=0&&!paths.some(p=>p.index===index))paths.find(p=>p.index<0).index=index;
  for(const p of paths){const f=CAMP_LAMPS[p.index];if(f){p.light.position.set(f.x,f.y,f.z);p.light.distance=f.range;p.light.intensity=f.power;}else p.light.intensity=0;}
 },get diagnostics(){return {cabins:cabins.map(c=>({id:c.tent.id,intensity:c.light.intensity,base:c.base})),pathLights:paths.filter(p=>p.index>=0).map(p=>({fixture:p.index,intensity:p.light.intensity})),lightBudget:6,shadowLights:0,pools:CAMP_LAMPS.length};},dispose(){if(disposed)return;disposed=true;root.removeFromParent();pools.dispose();geometry.dispose();material.dispose();texture.dispose();}};
}
