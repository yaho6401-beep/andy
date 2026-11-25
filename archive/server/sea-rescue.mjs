import {settleVoyage} from './sea-travel.mjs';
import {depthAt,onIsland} from '../camp/sea-adventure-state.js';
import {SEA,waterDepth,rescuePose,RESCUED_LINES} from '../camp/shore-state.js';
import {validPosition} from '../src/protocol.js';

export function settleSea(s,p){
 if(!p)return;if(settleVoyage(s,p))return;const now=s.clock();
 if(p.room!=='camp'){p.seaRescue=null;p.swimming=false;return;}
 if(p.swimming){if(depthAt(p.x,p.z)<.12){p.swimming=false;p.motion='idle';}else{if(!p.seat)p.motion='swim';return;}}
 if(p.seaRescue){const pose=rescuePose(p.seaRescue,now);Object.assign(p,{x:pose.player.x,z:pose.player.z,yaw:pose.stage==='struggle'?p.yaw:pose.boatYaw,motion:pose.stage==='struggle'?'struggle':pose.stage==='landing'?'walk':'ride'});if(pose.done){const shore=p.seaRescue.shore;p.seaRescue=null;Object.assign(p,{...shore,motion:'idle',epoch:(p.epoch||0)+1,seq:0,moveCredit:2.1,lastMove:now});p.seaNotice={at:now,text:RESCUED_LINES[Math.floor(s.random()*RESCUED_LINES.length)]};}return;}
 if(p.seat||onIsland(p.x,p.z)||depthAt(p.x,p.z)<SEA.rescueDepth)return;
 const x=Math.max(-38,Math.min(38,p.x));let shore={x,z:-14.3};for(const z of [-14.3,-13.8,-13.3])if(validPosition('camp',x,z)){shore={x,z};break;}
 p.seaRescue={at:now,from:{x:p.x,z:p.z},shore};Object.assign(p,{motion:'struggle',runUntil:0,travelDest:null,epoch:(p.epoch||0)+1,seq:0,moveCredit:0,lastMove:now});
 const effect=s.campEffects.get(p.id);if(effect){effect.wetness=1;effect.exposure=0;effect.at=now;}
}
