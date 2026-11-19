// Five unhurried branches, followed by a quiet cooling pause. No score or failure.
export const FIRE={min:.16,max:2.5,initial:.72,decayPerSecond:.018,hotDecayPerSecond:.16,branchWarmth:.24,settleMs:1600,personalPauseMs:1800,flightMs:1100,maxBranches:5,coolingMs:10000,cycleMs:60000};
export const clampHeat=value=>Math.max(FIRE.min,Math.min(FIRE.max,Number.isFinite(value)?value:FIRE.initial));
export function heatAt(fire,now){const start=clampHeat(fire?.heat),elapsed=Math.max(0,now-(Number.isFinite(fire?.at)?fire.at:now))/1000,hotTime=Math.min(elapsed,Math.max(0,start-.98)/FIRE.hotDecayPerSecond);return clampHeat(start-hotTime*FIRE.hotDecayPerSecond-(elapsed-hotTime)*FIRE.decayPerSecond);}
export function createFire(now){return {version:3,heat:FIRE.initial,at:now,sequence:0,readyAt:0,branches:0,cycleUntil:0,coolingUntil:0,lastThrow:null};}
export function fireMood(heat){return heat>1.35?'hot':heat<.42?'embers':heat<.73?'gentle':'bright';}
// Old room snapshots may still carry the former 35-second pause.
const coolingEnds=fire=>(fire.version||0)<3&&fire.lastThrow?.branches===5?Math.min(fire.coolingUntil||0,fire.lastThrow.at+FIRE.coolingMs):fire.coolingUntil||0;
export function branchCount(fire,now){return now>=((fire.branches===5?coolingEnds(fire):fire.cycleUntil)||0)?0:Math.min(FIRE.maxBranches,Math.max(0,Math.floor(fire.branches||0)));}
export function publicFire(fire,player,now){
 const event=fire.lastThrow,cooling=now<coolingEnds(fire),ready=fire.branches===5?coolingEnds(fire):fire.readyAt||0;
 return {heat:heatAt(fire,now),at:now,sequence:fire.sequence||0,branches:branchCount(fire,now),maxBranches:FIRE.maxBranches,cooling,readyAt:Math.max(ready,(player.lastCampfireAt??-Infinity)+FIRE.personalPauseMs),lastThrow:event&&now-event.at>=0&&now-event.at<6500?{...event}:null};
}
export function addBranch(store,id){
 const p=store.clients.get(id),now=store.clock();
 if(!p||p.room!=='camp'||p.seat?.group!=='campfire-main'||Math.hypot(p.x,p.z)>3.3)throw Error('모닥불 둘레 통나무에 앉아 가지를 보태주세요.');
 const fire=store.campfire;
 if(now<coolingEnds(fire))throw Error('불이 너무 뜨겁다. 조금 기다리자…');
 if(now<(fire.branches===5?coolingEnds(fire):fire.readyAt||0)||now<(p.lastCampfireAt??-Infinity)+FIRE.personalPauseMs)throw Error('가지가 불에 닿을 때까지, 천천히 바라봐 주세요.');
 const branches=branchCount(fire,now)+1;if(branches>FIRE.maxBranches)throw Error('불이 너무 뜨겁다. 조금 기다리자…');
 fire.version=3;fire.branches=branches;fire.heat=clampHeat(Math.max(heatAt(fire,now)+FIRE.branchWarmth,[0,.9,1.18,1.65,2.05,2.5][branches]));fire.at=now;
 fire.coolingUntil=branches===FIRE.maxBranches?now+FIRE.coolingMs:0;fire.cycleUntil=fire.coolingUntil||now+FIRE.cycleMs;
 fire.readyAt=fire.coolingUntil||now+FIRE.settleMs;fire.sequence=(fire.sequence||0)+1;
 fire.lastThrow={sequence:fire.sequence,at:now,x:p.x,z:p.z,playerId:p.id,nickname:p.nickname,branches};
 p.lastCampfireAt=now;p.emote='toss';p.emoteAt=now;
 return {ok:true,sequence:fire.sequence,branches,tooHot:branches>=4,cooling:branches===FIRE.maxBranches};
}
