export const KEEPER_NAME='텐트지기 온유 할아버지',RESTOCK_MS=30000;
export const KEEPER_ROUTE=[{x:-3.5,z:6},{x:-3.5,z:-8},{x:-3.5,z:-12.8},{x:3,z:-12.8},{x:3,z:-8},{x:3,z:6}];
export function keeperPose(at){let phase=((at/1000)%160+160)%160;for(let i=0;i<KEEPER_ROUTE.length;i++){const a=KEEPER_ROUTE[i],b=KEEPER_ROUTE[(i+1)%KEEPER_ROUTE.length],length=Math.hypot(b.x-a.x,b.z-a.z),duration=length/.7;if(phase<5)return {...a,yaw:Math.atan2(b.x-a.x,b.z-a.z),motion:'idle'};phase-=5;if(phase<duration){const t=phase/duration;return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:Math.atan2(b.x-a.x,b.z-a.z),motion:'walk'};}phase-=duration;}return {...KEEPER_ROUTE[0],yaw:0,motion:'idle'};}

export function walkKeeperRoute(route,distance,motion='walk'){
 for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],length=Math.hypot(b.x-a.x,b.z-a.z);if(length&&distance<length)return {x:a.x+(b.x-a.x)*Math.max(0,distance)/length,z:a.z+(b.z-a.z)*Math.max(0,distance)/length,yaw:Math.atan2(b.x-a.x,b.z-a.z),motion};distance-=length;}
 const p=route.at(-1)||{x:-3.5,z:6};return {...p,yaw:p.yaw||0,motion:'idle'};
}
export const keeperRouteLength=route=>route.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-route[i].x,p.z-route[i].z),0);
function unpausedTime(state,now){const p=state?.pause;return p?now-Math.max(0,Math.min(now,p.until)-p.at):now;}
export function keeperPatrolClock(state,now){now=unpausedTime(state,now);const r=state?.rejoin;return r?r.patrolAt+Math.max(0,now-r.at-keeperRouteLength(r.route)/r.speed*1000):now-(state?.offset||0);}
export function routineKeeperPose(state,now){
 const p=state?.pause;if(p&&now<=p.until)return {...p.pose,motion:'idle'};
 const at=unpausedTime(state,now),r=state?.rejoin;
 if(r&&at<r.at)return {...r.route[0],motion:'idle'};
 if(r&&at<r.at+keeperRouteLength(r.route)/r.speed*1000)return walkKeeperRoute(r.route,Math.max(0,at-r.at)/1000*r.speed);
 return keeperPose(keeperPatrolClock(state,now));
}
export function releaseKeeperPause(state,end){const p=state?.pause;if(!p)return;const duration=Math.max(0,end-p.at);if(state.rejoin)state.rejoin.at+=duration;else state.offset=(state.offset||0)+duration;state.pause=null;}
