// Metres shared by scene geometry, walking, authoritative validation and seating.
export const CAMP={
 width:30,depth:26,bounds:{x:14.5,z:12.3},
 gate:{x:0,z:11.2},spawn:{x:0,z:8.5},
 board:{x:4.8,z:-9.8,w:2.8,d:.6},
 bookshelf:{x:-5.4,z:6.4,w:1.7,d:.6},
 tents:[
  {id:'amber',name:'문장의 텐트',x:-8,z:-3.3,w:6,d:6.4,h:4.2,door:2.6,color:'#d8b6a7',rug:'#bd9a85'},
  {id:'lavender',name:'달빛 텐트',x:8,z:-3.3,w:6,d:6.4,h:4.2,door:2.6,color:'#b6bdcd',rug:'#9fa6bb'}
 ]
};
export const CAMP_SEATS=[
 ...Array.from({length:6},(_,i)=>{
  const angle=i*Math.PI/3;
  return {id:`camp-main-${i}`,x:Math.sin(angle)*2.55,z:Math.cos(angle)*2.55,yaw:angle+Math.PI,stand:{x:Math.sin(angle)*3.55,z:Math.cos(angle)*3.55},group:'campfire-main',height:.72,label:'모닥불 통나무 의자'};
 }),
 ...CAMP.tents.flatMap(t=>[-1,1].map((side,i)=>({id:`camp-tent-${t.id}-${i}`,x:t.x+side*1.55,z:t.z-.4,yaw:0,stand:{x:t.x+side*1.55,z:t.z+.55},group:'camp-tent-'+t.id,height:.35,label:t.name+' · 독서 쿠션'})))
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
export const CAMP_OBSTACLES=[
 {x:0,z:0,r:1.12},CAMP.board,CAMP.bookshelf,
 ...CAMP.tents.flatMap(t=>[...tentWalls(t),tentTable(t)]),
 ...CAMP_SEATS.map(s=>({x:s.x,z:s.z,r:s.id.startsWith('camp-tent')?.44:.5}))
];
export function tentAt(x,z,margin=0){return CAMP.tents.find(t=>Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x-t.x)<t.w/2-.12+margin&&Math.abs(z-t.z)<t.d/2-.12+margin)||null;}
export function campPosition(x,z){return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<CAMP.bounds.x&&Math.abs(z)<CAMP.bounds.z&&!CAMP_OBSTACLES.some(o=>o.r?Math.hypot(x-o.x,z-o.z)<o.r+.26:Math.abs(x-o.x)<o.w/2+.26&&Math.abs(z-o.z)<o.d/2+.26);}
export function campMove(x,z,nx,nz){if(![x,z,nx,nz].every(Number.isFinite))return false;const steps=Math.max(1,Math.ceil(Math.hypot(nx-x,nz-z)/.12));for(let i=1;i<=steps;i++)if(!campPosition(x+(nx-x)*i/steps,z+(nz-z)*i/steps))return false;return true;}
export function nearestSeat(x,z){return CAMP_SEATS.map(s=>({...s,distance:Math.hypot(s.x-x,s.z-z)})).filter(s=>s.distance<1.35).sort((a,b)=>a.distance-b.distance)[0]||null;}
