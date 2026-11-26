import {depthAt} from './sea-adventure-state.js';
import {SEA} from './shore-state.js';
export class DolphinEncounter{
 constructor(random=Math.random){this.random=random;this.nextAt=0;this.trip=null;this.event=null;this.count=0;}
 update(now,player){
  if(!player?.swimming){this.trip=null;this.event=null;return null;}
  if(this.trip!==player.swimAt){this.trip=player.swimAt;this.nextAt=Math.max(this.nextAt,now+20000+this.random()*40000);}
  if(this.event&&now-this.event.at>=14000)this.event=null;
  if(!this.event&&now>=this.nextAt&&player.z< -24){
   this.nextAt=now+95000+this.random()*85000;
   if(this.random()<.25){const side=this.random()<.5?-1:1;
    // Cross the water ahead of the default quarter-view, never orbit the swimmer.
    for(const offset of [-5,-3]){const from={x:player.x+offset+side*6,z:player.z-8-side*4},to={x:player.x+offset-side*6,z:player.z-8+side*4};if(Array.from({length:17},(_,i)=>depthAt(from.x+(to.x-from.x)*i/16,from.z+(to.z-from.z)*i/16)).every(d=>d>1.1)){this.event={at:now,from,to};this.count++;this.nextAt=now+180000;break;}}
   }
  }
  return this.event?dolphinPose(this.event,now):null;
 }
}
export function dolphinPose(event,now){const p=Math.max(0,Math.min(1,(now-event.at)/14000)),breath=Math.exp(-(((p-.48)/.17)**2)),{from,to}=event;return {x:from.x+(to.x-from.x)*p,z:from.z+(to.z-from.z)*p,y:SEA.surface-.86+breath*.83,yaw:Math.atan2(to.x-from.x,to.z-from.z),pitch:-Math.sin((p-.48)*Math.PI*2)*breath*.10,tail:Math.sin((now-event.at)/1000*4.2)*.22,surface:breath>.63};}
