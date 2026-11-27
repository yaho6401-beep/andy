// Shared routes: the server owns boarding, time and landing. Clients only interpolate.
export const UMBRELLAS=[{id:'amber',x:-5.6,z:-1.05},{id:'lavender',x:10.4,z:-1.05}];
export const BOAT_PORTS={shore:{x:24,z:-14.25,label:'해변'},island:{x:6.5,z:-77.2,label:'작은 섬'}};
const ROUTE=[BOAT_PORTS.shore,{x:24,z:-20},{x:16,z:-52},{x:13,z:-68},{x:10,z:-74},BOAT_PORTS.island];
export const BOAT_TIME=11500;
// A separate moored cruiser is approachable; the distant shipping lanes remain scenery.
export const CRUISE={x:37,z:-131,scale:1.3,dock:{x:37,z:-126.4},label:'BLUE HORIZON',url:'/archive/cruise/'};
// Move the full-size ship 30 m offshore; crossing duration stays 15/11 seconds.
export const CRUISE_TIME=15000,ISLAND_CRUISE_TIME=11000;
export function voyageDestination(v){return v.to==='cruise'?'cruise':v.from==='cruise'?(v.to==='island'?'island':'shore'):v.from==='shore'?'island':'shore';}
// Pass north of the headlands, then through the clear eastern waterway.
// The old diagonal crossed the rotated headland at (29,-86). Use the same
// corridor in reverse on return, including when departing from the small island.
const CRUISE_APPROACH=[{x:42,z:-68},{x:42,z:CRUISE.dock.z},CRUISE.dock];
export function voyageRoute(v){const to=voyageDestination(v);if(to==='cruise')return v.from==='island'?[BOAT_PORTS.island,{x:10,z:-74},{x:13,z:-68},...CRUISE_APPROACH]:[BOAT_PORTS.shore,{x:26,z:-22},{x:32,z:-60},...CRUISE_APPROACH];if(v.from==='cruise')return [...voyageRoute({from:to,to:'cruise'})].reverse();return v.from==='shore'?ROUTE:[...ROUTE].reverse();}
export function voyageDuration(v){return v.to==='cruise'||v.from==='cruise'?(v.from==='island'||v.to==='island'?ISLAND_CRUISE_TIME:CRUISE_TIME):BOAT_TIME;}
export function voyagePose(v,now){const progress=Math.max(0,Math.min(1,(now-v.at)/voyageDuration(v))),points=voyageRoute(v),lengths=points.slice(1).map((b,i)=>Math.hypot(b.x-points[i].x,b.z-points[i].z)),total=lengths.reduce((a,b)=>a+b,0);let distance=progress*total,i=0;while(i<lengths.length-1&&distance>lengths[i])distance-=lengths[i++];const a=points[i],b=points[i+1],t=Math.min(1,distance/lengths[i]);return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,y:.04,yaw:Math.atan2(b.x-a.x,b.z-a.z),progress,done:progress===1};}
export function nearbyPort(p,r=2.25){return p&&Object.entries(BOAT_PORTS).find(([,o])=>Math.hypot(p.x-o.x,p.z-o.z)<r)?.[0]||null;}
