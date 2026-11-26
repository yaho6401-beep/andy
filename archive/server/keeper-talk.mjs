import {routineKeeperPose,releaseKeeperPause} from '../camp/keeper-state.js';
import {activeTentFire,emergencyKeeperPose} from '../camp/tent-fire-state.js';
export function settleKeeperTalk(s){const f=s.campfire,now=s.clock();if(activeTentFire(f))return;
 const state=f.keeper??={offset:0},pose=routineKeeperPose(state,now);let until=0;
 for(const p of s.clients.values())if(p.room==='camp'&&p.keeperTalkUntil>now&&Math.hypot(p.x-pose.x,p.z-pose.z)<4)until=Math.max(until,p.keeperTalkUntil);
 if(state.pause){if(until)state.pause.until=until;else releaseKeeperPause(state,Math.min(now,state.pause.until));}
}
export function keeperTalkAction(s,id,input){if(input.type!=='camp-keeper-talk')return null;const p=s.clients.get(id),f=s.campfire,now=s.clock();settleKeeperTalk(s);
 if(input.active===false){p.keeperTalkUntil=0;settleKeeperTalk(s);return {ok:true,talking:false};}
 const pose=emergencyKeeperPose(f,now);if(p.room!=='camp'||p.seat||Math.hypot(p.x-pose.x,p.z-pose.z)>3.3)throw Error('온유 할아버지 가까이에서 말을 걸어주세요.');if(activeTentFire(f))throw Error('온유 할아버지가 먼저 불을 끄고 오실 거예요.');
 p.keeperTalkUntil=now+15000;const state=f.keeper??={offset:0};state.pause??={at:now,until:p.keeperTalkUntil,pose:{...pose,yaw:Math.atan2(p.x-pose.x,p.z-pose.z)}};state.pause.until=Math.max(state.pause.until,p.keeperTalkUntil);return {ok:true,talking:true};
}
