import {ISLAND,seaFloor} from './sea-adventure-state.js';
import {SEA,seabedHeight} from './shore-state.js';
// Metres shared by scene geometry, walking, authoritative validation and seating.
export const CAMP={
 width:88,depth:80,bounds:{x:43,z:39},
 gate:{x:0,z:11.2},spawn:{x:0,z:8.5},
 board:{x:4.8,z:-9.8,w:2.8,d:.6},
 tents:[
  {id:'amber',name:'문장의 텐트',x:-8,z:-3.3,w:6,d:6.4,h:4.2,door:2.6,color:'#d8b6a7',rug:'#bd9a85'},
  {id:'lavender',name:'달빛 텐트',x:8,z:-3.3,w:6,d:6.4,h:4.2,door:2.6,color:'#b6bdcd',rug:'#9fa6bb'}
 ]
};
export const GATHERING_TENT={id:'gathering',name:'별빛 모임 텐트',x:-36,z:5,w:10,d:11,h:5.6,door:4,color:'#d5cbb5',rug:'#b9ab92'};
export const ALL_TENTS=[...CAMP.tents,GATHERING_TENT];
export const SEA_BENCHES=[-32,-21,21,32,-10,10,-39,39].map((x,i)=>({id:'camp-sea-'+i,x,z:-11.9,yaw:Math.PI,stand:{x,z:-10.85},group:'camp-sea-'+i,height:.65,label:'달빛 바다 벤치'}));
export const FAR_FIRE_BENCHES=[-1,1].map((side,i)=>({id:'camp-far-fire-'+i,x:side*5.6,z:5.7,yaw:Math.atan2(-side*5.6,-5.7),stand:{x:side*6.35,z:6.45},group:'campfire-far-'+i,height:.65,label:'멀리서 불멍 벤치'}));
export const CAMP_SEATS=[
 ...Array.from({length:6},(_,i)=>{
  const angle=i*Math.PI/3;
  return {id:`camp-main-${i}`,x:Math.sin(angle)*2.55,z:Math.cos(angle)*2.55,yaw:angle+Math.PI,stand:{x:Math.sin(angle)*3.55,z:Math.cos(angle)*3.55},group:'campfire-main',height:.72,label:'모닥불 통나무 의자'};
 }),
 {id:'camp-island-rock',x:-3,z:-79,yaw:Math.PI,stand:{x:-2.2,z:-78.3},group:'island-rest',height:1.1,label:'작은 섬의 쉼돌'},
 ...SEA_BENCHES,
 ...FAR_FIRE_BENCHES,
 ...ALL_TENTS.flatMap(t=>[-1,1].map((side,i)=>({id:`camp-tent-${t.id}-${i}`,x:t.x+side*1.55,z:t.z-.4,yaw:0,stand:{x:t.x+side*1.55,z:t.z+.55},group:'camp-tent-'+t.id,height:.35,label:t.name+' · 독서 쿠션'})))
];
export function tentWalls(t){
 const wing=(t.w-t.door)/2;
 return [
  ...[-1,1].map(side=>({x:t.x+side*(t.w/2-.08),z:t.z,w:.16,d:t.d})),
  {x:t.x,z:t.z-t.d/2+.08,w:t.w,d:.16},
  ...[-1,1].map(side=>({x:t.x+side*(t.door/2+wing/2),z:t.z+t.d/2-.08,w:wing,d:.16}))
 ];
}
export function tentTable(t){return {x:t.x,z:t.z-1.85,w:1.6,d:.75};}
export function campHeight(x,z){if(z<SEA.edge)return seaFloor(x,z);const ramp=Math.max(0,Math.min(1,(z-13)/12));return ramp*ramp*(3-2*ramp)*(1.5+1.6*Math.exp(-Math.pow((x-19)/12,2)));}
// One shared route and tree list for both rendering and collision. The broad
// westward lane reaches the big tent's south-facing door without a canopy wall.
export const GATHERING_PATH=[{x:-4,z:8},{x:-12,z:9},{x:-23,z:10},{x:-36,z:11.8},{x:-36,z:8}];
export function gatheringPathDistance(x,z){let nearest=Infinity;for(let i=1;i<GATHERING_PATH.length;i++){const a=GATHERING_PATH[i-1],b=GATHERING_PATH[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));nearest=Math.min(nearest,Math.hypot(x-a.x-dx*t,z-a.z-dz*t));}return nearest;}
export const FOREST_TREES=Array.from({length:64},(_,i)=>{const x=(i%2?1:-1)*(16+(i%7)*2);let z=i<30?-8+Math.floor(i/2)*1.7:14+(i%15)*1.05;if(gatheringPathDistance(x,z)<3.6)z-=7;return {x,z};});
export const SHORE_WADE_Z=SEA.limit;
export const CAMP_OBSTACLES=[

 ...FOREST_TREES.map(p=>({...p,r:.2})),
 {x:0,z:0,r:1.12},CAMP.board,
 ...ALL_TENTS.flatMap(t=>[...tentWalls(t),tentTable(t)]),
 ...CAMP_SEATS.map(s=>({x:s.x,z:s.z,r:s.id.startsWith('camp-tent')?.44:.5}))
];
export function tentAt(x,z,margin=0){return ALL_TENTS.find(t=>Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x-t.x)<t.w/2-.12+margin&&Math.abs(z-t.z)<t.d/2-.12+margin)||null;}
export function campPosition(x,z){return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<CAMP.bounds.x&&z<CAMP.bounds.z&&z>=ISLAND.limit&&!CAMP_OBSTACLES.some(o=>o.r?Math.hypot(x-o.x,z-o.z)<o.r+.26:Math.abs(x-o.x)<o.w/2+.26&&Math.abs(z-o.z)<o.d/2+.26);}
export function campMove(x,z,nx,nz){if(![x,z,nx,nz].every(Number.isFinite))return false;const steps=Math.max(1,Math.ceil(Math.hypot(nx-x,nz-z)/.12));for(let i=1;i<=steps;i++)if(!campPosition(x+(nx-x)*i/steps,z+(nz-z)*i/steps))return false;return true;}
export function nearestSeat(x,z){return CAMP_SEATS.map(s=>({...s,distance:Math.hypot(s.x-x,s.z-z)})).filter(s=>s.distance<1.35).sort((a,b)=>a.distance-b.distance)[0]||null;}
