import {CAMP} from './layout.js';
import {keeperPose} from './keeper-state.js';
import {findWalkPath} from '../src/navigation.js';
export const TENT_FIRE_COOLDOWN=180000;
export const activeTentFire=f=>!!f?.tentFire&&!f.tentFire.extinguishedAt;
export function finishTentFire(f,now,cause){
 if(!activeTentFire(f))return false;
 Object.assign(f.tentFire,{extinguishedAt:now,cause});
 Object.assign(f,{dangerAt:0,rescuedAt:now,oilUntil:cause==='rain'?f.oilUntil:0,branchPeakUntil:0,logPeakUntil:0,heat:Math.min(2.15,f.heat),branchLoad:Math.min(3,f.branchLoad||0),at:now,holdUntil:now+12000});return true;
}
export function tentFireView(f,now){const e=f?.tentFire;if(!e||now-(e.extinguishedAt||now)>10000)return null;
 const age=Math.max(0,now-e.at),out=!!e.extinguishedAt,foam=!out&&now>=e.arrivesAt;
 return {...e,active:!out,phase:out?'out':foam?'foam':'burning',strength:out?Math.max(0,1-(now-e.extinguishedAt)/1400):foam?Math.max(.12,1-(now-e.arrivesAt)/3500):Math.min(1,.22+age/22000)};
}
export function emergencyKeeperPose(f,now){const e=f?.tentFire;if(!e||e.extinguishedAt&&now-e.extinguishedAt>4000)return keeperPose(now);
 const points=e.route,runAt=e.runAt;let distance=Math.max(0,(now-runAt)/1000)*e.speed;
 if(now<runAt)return {...points[0],yaw:0,motion:'idle'};
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.z-a.z);if(distance<length)return {x:a.x+(b.x-a.x)*distance/length,z:a.z+(b.z-a.z)*distance/length,yaw:Math.atan2(b.x-a.x,b.z-a.z),motion:'run'};distance-=length;}
 const p=points.at(-1),t=CAMP.tents.find(t=>t.id===e.tent);return {...p,yaw:Math.atan2(t.x-p.x,t.z-p.z),motion:'idle',extinguishing:!e.extinguishedAt&&now>=e.arrivesAt};
}
export function settleTentFire(store,weather){const f=store.campfire,now=store.clock();
 if(weather?.kind==='rain'){
  if(f.oilUntil>now&&f.rainOilCycle!==weather.cycle){f.rainOilCycle=weather.cycle;f.oilUntil=now+(f.oilUntil-now)*.5;f.holdUntil=Math.min(f.holdUntil||0,f.oilUntil);f.heat=.72+Math.max(0,f.heat-.72)*.5;}
  if(f.dangerAt){f.dangerAt=0;f.rescuedAt=now;f.heat=Math.min(f.heat,2.15);}
  finishTentFire(f,now,'rain');return;
 }
 if(activeTentFire(f)){if(now>=f.tentFire.arrivesAt+3500)finishTentFire(f,now,'onyu');return;}
 if(weather?.kind!=='wind'||f.tentFire&&now-(f.tentFire.extinguishedAt||f.tentFire.at)<TENT_FIRE_COOLDOWN)return;
 const logs=now<(f.logCycleUntil||0)?f.logs||0:0,branches=Math.ceil(f.branchLoad??f.branches??0);
 if(logs<2||branches<3||now>=(f.oilUntil||0)||f.heat<2.2)return;
 // One authoritative chance per four seconds; polling by more guests adds no rolls.
 const window=Math.floor(now/4000);if(f.tentRoll===window)return;f.tentRoll=window;
 if((store.random||Math.random)()>=.3)return;
 const tent=CAMP.tents[1],from=keeperPose(now),goal={x:tent.x,z:tent.z+tent.d/2+1.25},path=findWalkPath('camp',from,goal);
 if(!path.length)return;
 const route=[{x:from.x,z:from.z},...path],length=route.slice(1).reduce((sum,b,i)=>sum+Math.hypot(b.x-route[i].x,b.z-route[i].z),0),speed=3.2,travel=length/speed*1000;
 const runAt=now+Math.max(800,22000-travel),arrivesAt=runAt+travel;
 f.tentFire={id:(f.tentFire?.id||0)+1,at:now,tent:tent.id,route,speed,runAt,arrivesAt};f.dangerAt||=now;
}
