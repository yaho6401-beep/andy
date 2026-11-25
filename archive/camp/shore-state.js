import {rescueCourse,alongCourse} from './sea-geometry.js';
// Shared by the coast, avatars and authoritative rescue. Metres, milliseconds.
export const SEA={surface:-.17,edge:-14.8,limit:-23.8,slope:.48,warnDepth:.85,rescueDepth:1.55,duration:10200};
const clamp=t=>Math.max(0,Math.min(1,t)),smooth=t=>{t=clamp(t);return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
export function seabedHeight(z){return -Math.min(3.3,Math.max(0,SEA.edge-z)*SEA.slope);}
export function waterDepth(z){return Math.max(0,SEA.surface-seabedHeight(z));}
export function shoreStage(z){const d=waterDepth(z);return d>=SEA.rescueDepth?'deep':d>=SEA.warnDepth?'warning':d>.08?'wading':'sand';}
export function rescuePose(rescue,now){
 const age=Math.max(0,now-rescue.at),from=rescue.from,shore=rescue.shore,course=rescueCourse(from,shore),landingAt=4600+course.rideMs,duration=landingAt+1400,approach=smooth(age/3500),ride=smooth((age-4600)/course.rideMs),step=smooth((age-landingAt)/1400),boarding=smooth((age-3500)/1100);
 const boat={x:mix(course.approachFrom.x,from.x,approach),z:mix(course.approachFrom.z,from.z,approach),y:SEA.surface+.15};
 const route=alongCourse(course.points,ride);if(age>=4600){boat.x=route.x;boat.z=route.z;}
 const player={x:age<4600?from.x:route.x,z:age<4600?from.z:route.z,y:mix(SEA.surface-1.34,SEA.surface+.18,boarding)};
 if(age>=landingAt){player.z=mix(-15.7,shore.z,step);player.y=mix(SEA.surface+.18,seabedHeight(shore.z),step);boat.x+=step*1.6;boat.z-=step*1.4;}
 const stage=age<3500?'struggle':age<4600?'boarding':age<landingAt?'aboard':age<duration?'landing':'safe';
 return {age,stage,boat,player,duration,boatYaw:age<4600?Math.atan2(from.x-boat.x,from.z-boat.z):route.yaw,done:age>=duration,boatOpacity:1-smooth((age-(duration-800))/800)};
}
export const RESCUED_LINES=['죽을 뻔했다… 조심해야지.','수영을 배워야겠다. 다음엔 안전한 곳에서만 놀자.','생명은 소중해… 물에서는 더 조심해야지.','물에 빠지니 무서웠어… 잠깐 쉬어야겠다.','휴… 무사해서 다행이다. 깊은 물은 조심하자.'];
