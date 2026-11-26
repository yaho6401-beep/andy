import {settleVoyage} from './sea-travel.mjs';
import {depthAt,onIsland} from '../camp/sea-adventure-state.js';
import {SEA,waterDepth,rescuePose,RESCUED_LINES} from '../camp/shore-state.js';
import {validPosition} from '../src/protocol.js';
import {weatherAt} from '../camp/weather-state.js';

export function settleSea(s,p){
 if(!p)return;if(settleVoyage(s,p))return;const now=s.clock();
 if(p.room!=='camp'){p.seaRescue=null;p.swimming=false;return;}
 if(p.swimming){if(depthAt(p.x,p.z)<.12){p.swimming=false;p.motion='idle';}else{const weather=s.publicLounge?weatherAt(now):null,window=Math.floor(now/8000),chance=weather?.kind==='rain'?.16+(weather.intensity||0)*.2:weather?.kind==='wind'?.12:0;if(chance&&depthAt(p.x,p.z)>.6&&now-(p.swimAt||now)>10000&&now-(p.lastWaveRescueAt||-Infinity)>120000&&p.waveWindow!==window){p.waveWindow=window;if(s.random()<chance){p.swimming=false;p.lastWaveRescueAt=now;p.waveRescue=true;}}if(p.swimming){if(!p.seat)p.motion='swim';return;}}}
 if(p.seaRescue){const pose=rescuePose(p.seaRescue,now);Object.assign(p,{x:pose.player.x,z:pose.player.z,yaw:pose.stage==='struggle'?p.yaw:pose.boatYaw,motion:pose.stage==='struggle'?'struggle':pose.stage==='landing'?'walk':'ride'});if(pose.done){const shore=p.seaRescue.shore;p.seaRescue=null;Object.assign(p,{...shore,motion:'idle',epoch:(p.epoch||0)+1,seq:0,moveCredit:2.1,lastMove:now});p.seaNotice={at:now,text:RESCUED_LINES[Math.floor(s.random()*RESCUED_LINES.length)]};}return;}
 if(p.seat||onIsland(p.x,p.z)||!p.waveRescue&&depthAt(p.x,p.z)<SEA.rescueDepth)return;
 const x=Math.max(-38,Math.min(38,p.x));let shore={x,z:-14.3};for(const z of [-14.3,-13.8,-13.3])if(validPosition('camp',x,z)){shore={x,z};break;}
 p.seaRescue={at:now,from:{x:p.x,z:p.z},shore,reason:p.waveRescue?'wave':'depth'};p.waveRescue=false;Object.assign(p,{motion:'struggle',runUntil:0,travelDest:null,epoch:(p.epoch||0)+1,seq:0,moveCredit:0,lastMove:now});
 const effect=s.campEffects.get(p.id);if(effect){effect.wetness=1;effect.exposure=0;effect.at=now;}
}
