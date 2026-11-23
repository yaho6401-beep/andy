import {effectiveFireHeat} from '../camp/fire-state.js';
import {weatherAt} from '../camp/weather-state.js';
import {tentAt} from '../camp/layout.js';
import {tideEdge,fireDryDuration,DRY_NATURAL,JOY_TIME,comfortSpeed} from '../camp/comfort-state.js';
function effectFor(s,id){s.campEffects??=new Map();let e=s.campEffects.get(id);if(!e){e={at:s.clock(),wetness:0,exposure:0,joyUntil:0,notice:null};s.campEffects.set(id,e);}return e;}
export function settleComfort(s,p){if(!p)return;const e=effectFor(s,p.id),now=s.clock(),old=comfortSpeed({wetness:e.wetness,joyRemaining:Math.max(0,e.joyUntil-e.at)});let at=Math.max(e.at,now-3600000);
 while(at<now){const end=Math.min(now,at+1000),dt=end-at,fire=p.room==='camp'&&p.seat?.group==='campfire-main',outdoor=['camp','garden'].includes(p.room)&&!(p.room==='camp'&&tentAt(p.x,p.z)),rain=s.publicLounge&&outdoor?weatherAt((at+end)/2):null;
  if(e.wetness>0){e.wetness=Math.max(0,e.wetness-dt/(fire?fireDryDuration(effectiveFireHeat(s.campfire,(at+end)/2,s.publicLounge)):DRY_NATURAL));if(e.wetness<1e-8)e.wetness=0;if(!e.wetness)e.notice={text:'옷이 다 말랐다. 다시 편하게 걸어보자.',at:end};e.exposure=0;}
  else if(!fire){const wave=p.room==='camp'&&!p.seat&&p.z<tideEdge((at+end)/2),r=rain?.kind==='rain'?rain.intensity:0;e.exposure=wave?12000:Math.max(0,e.exposure+dt*(r||-.5));if(e.exposure>=12000){e.wetness=1;e.exposure=0;e.notice={text:wave?'파도에 바지가 젖었다. 불을 쬐며 말려야겠다…':'비에 옷이 젖었다. 불을 쬐며 말려야겠다…',at:end};}}
  at=end;
 }
 e.at=now;e.fire=p.room==='camp'&&p.seat?.group==='campfire-main';const speed=comfortSpeed({wetness:e.wetness,joyRemaining:Math.max(0,e.joyUntil-now)});if(speed!==old){p.moveCredit=0;p.lastMove=now;}return e;
}
export function comfortView(s,p){const e=settleComfort(s,p),duration=e.fire?fireDryDuration(effectiveFireHeat(s.campfire,s.clock(),s.publicLounge)):DRY_NATURAL;return {wetness:e.wetness,dryRemaining:Math.ceil(e.wetness*duration),drySeconds:duration/1000,fire:e.fire,joyRemaining:Math.max(0,e.joyUntil-s.clock()),notice:e.notice};}
export function movementFactor(s,p){const e=settleComfort(s,p);return comfortSpeed({wetness:e.wetness,joyRemaining:Math.max(0,e.joyUntil-s.clock())});}
export function grantJoy(s,p){const e=settleComfort(s,p);e.joyUntil=s.clock()+JOY_TIME;return {joy:true};}
