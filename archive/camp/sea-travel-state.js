// Shared routes: the server owns boarding, time and landing. Clients only interpolate.
export const UMBRELLAS=[{id:'amber',x:-5.8,z:-1.6},{id:'lavender',x:10.2,z:-1.6}];
export const BOAT_PORTS={shore:{x:24,z:-14.25,label:'해변'},island:{x:6.5,z:-77.2,label:'작은 섬'}};
const ROUTE=[BOAT_PORTS.shore,{x:24,z:-20},{x:16,z:-52},{x:13,z:-68},{x:10,z:-74},BOAT_PORTS.island];
export const BOAT_TIME=28000;
export function voyagePose(v,now){const progress=Math.max(0,Math.min(1,(now-v.at)/BOAT_TIME)),points=v.from==='shore'?ROUTE:[...ROUTE].reverse(),lengths=points.slice(1).map((b,i)=>Math.hypot(b.x-points[i].x,b.z-points[i].z)),total=lengths.reduce((a,b)=>a+b,0);let distance=progress*total,i=0;while(i<lengths.length-1&&distance>lengths[i])distance-=lengths[i++];const a=points[i],b=points[i+1],t=Math.min(1,distance/lengths[i]);return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,y:.04,yaw:Math.atan2(b.x-a.x,b.z-a.z),progress,done:progress===1};}
export function nearbyPort(p,r=2.25){return p&&Object.entries(BOAT_PORTS).find(([,o])=>Math.hypot(p.x-o.x,p.z-o.z)<r)?.[0]||null;}
