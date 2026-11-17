// Stable seat IDs are reserved for a future server-authoritative camp instance.
export const CAMP_SEATS=Array.from({length:6},(_,i)=>{
 const angle=i*Math.PI/3;
 return {id:`camp-main-${i}`,x:Math.sin(angle)*2.55,z:Math.cos(angle)*2.55,yaw:angle+Math.PI,stand:{x:Math.sin(angle)*3.55,z:Math.cos(angle)*3.55}};
});
export const CAMP_OBSTACLES=[
 {x:0,z:0,r:1.12}, {x:-5,z:-3.6,w:2.7,d:2.6}, {x:5,z:-3.7,w:2.6,d:2.5},
 {x:3.6,z:-5.8,w:2.8,d:.6}, {x:-4.8,z:2.5,w:1.7,d:.6},
 ...CAMP_SEATS.map(s=>({x:s.x,z:s.z,r:.5}))
];
export function campPosition(x,z){return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<7&&Math.abs(z)<6.8&&!CAMP_OBSTACLES.some(o=>o.r?Math.hypot(x-o.x,z-o.z)<o.r+.26:Math.abs(x-o.x)<o.w/2+.26&&Math.abs(z-o.z)<o.d/2+.26);}
export function campMove(x,z,nx,nz){if(![x,z,nx,nz].every(Number.isFinite))return false;const steps=Math.max(1,Math.ceil(Math.hypot(nx-x,nz-z)/.12));for(let i=1;i<=steps;i++)if(!campPosition(x+(nx-x)*i/steps,z+(nz-z)*i/steps))return false;return true;}
export function nearestSeat(x,z){return CAMP_SEATS.map(s=>({...s,distance:Math.hypot(s.x-x,s.z-z)})).filter(s=>s.distance<1.45).sort((a,b)=>a.distance-b.distance)[0]||null;}
