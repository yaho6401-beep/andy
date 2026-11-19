// Five unhurried branches, followed by a quiet cooling pause. No score or failure.
export const FIRE={min:.16,max:2.5,fuelMax:4.1,initial:.72,decayPerSecond:.018,hotDecayPerSecond:.16,branchWarmth:.24,settleMs:1600,personalPauseMs:1800,flightMs:1100,maxBranches:5,coolingMs:10000,cycleMs:60000,maxLogs:3,logCycleMs:30000};
export const clampHeat=value=>Math.max(FIRE.min,Math.min(FIRE.fuelMax,Number.isFinite(value)?value:FIRE.initial));
export function heatAt(fire,now){const start=clampHeat(fire?.heat),elapsed=Math.max(0,now-(Number.isFinite(fire?.at)?fire.at:now))/1000,strongTime=Math.min(elapsed,Math.max(0,start-FIRE.max)/.3),afterStrong=start-strongTime*.3,remaining=elapsed-strongTime,hotTime=Math.min(remaining,Math.max(0,afterStrong-.98)/FIRE.hotDecayPerSecond);return clampHeat(afterStrong-hotTime*FIRE.hotDecayPerSecond-(remaining-hotTime)*FIRE.decayPerSecond);}
export function createFire(now){return {version:3,heat:FIRE.initial,at:now,sequence:0,readyAt:0,branches:0,cycleUntil:0,coolingUntil:0,lastThrow:null};}
export function fireMood(heat){return heat>1.35?'hot':heat<.42?'embers':heat<.73?'gentle':'bright';}
// Old room snapshots may still carry the former 35-second pause.
const coolingEnds=fire=>(fire.version||0)<3&&fire.lastThrow?.branches===5?Math.min(fire.coolingUntil||0,fire.lastThrow.at+FIRE.coolingMs):fire.coolingUntil||0;
export function branchCount(fire,now){return now>=((fire.branches===5?coolingEnds(fire):fire.cycleUntil)||0)?0:Math.min(FIRE.maxBranches,Math.max(0,Math.floor(fire.branches||0)));}
export function publicFire(fire,player,now){
 const event=fire.lastThrow,cooling=now<coolingEnds(fire),ready=fire.branches===5?coolingEnds(fire):fire.readyAt||0;
 return {heat:heatAt(fire,now),at:now,sequence:fire.sequence||0,branches:branchCount(fire,now),maxBranches:FIRE.maxBranches,cooling,logs:now<(fire.logCycleUntil||0)?fire.logs||0:0,maxLogs:FIRE.maxLogs,fuelReadyAt:Math.max(0,(fire.lastThrow?.at??-Infinity)+FIRE.settleMs,(player.lastCampfireAt??-Infinity)+FIRE.personalPauseMs),readyAt:Math.max(ready,(player.lastCampfireAt??-Infinity)+FIRE.personalPauseMs),lastThrow:event&&now-event.at>=0&&now-event.at<6500?{...event}:null};
}

// Inventory is checked by the caller before this shared, bounded fuel transaction.
export function addCampFuel(store,id,kind){
 const p=store.clients.get(id),now=store.clock(),fire=store.campfire;
 if(!p||p.room!=='camp'||p.seat?.group!=='campfire-main'||Math.hypot(p.x,p.z)>3.3)throw Error('모닥불 앞 통나무에 앉아 장작을 보태주세요.');
 if(now<(fire.lastThrow?.at??-Infinity)+FIRE.settleMs||now<(p.lastCampfireAt??-Infinity)+FIRE.personalPauseMs)throw Error('불에 닿을 때까지, 천천히 바라봐 주세요.');
 const logs=now<(fire.logCycleUntil||0)?fire.logs||0:0;
 if(kind==='wood'&&logs>=FIRE.maxLogs)throw Error('장작 세 개가 타고 있어요. 불길이 가라앉으면 다시 보태주세요.');
 if(kind!=='wood'&&heatAt(fire,now)>3.6)throw Error('불길이 아주 뜨거워요. 조금 가라앉은 뒤 보태주세요.');
 if(kind==='wood'){fire.logs=logs+1;fire.logCycleUntil=now+FIRE.logCycleMs;}
 fire.heat=clampHeat(Math.max(heatAt(fire,now)+(kind==='wood'?.95:.85),kind==='wood'?[0,2.7,3.4,4.1][fire.logs]:1.85));fire.at=now;fire.sequence=(fire.sequence||0)+1;
 fire.readyAt=Math.max(fire.readyAt||0,now+FIRE.settleMs);
 fire.lastThrow={sequence:fire.sequence,at:now,x:p.x,z:p.z,playerId:p.id,nickname:p.nickname,branches:branchCount(fire,now),kind};
 p.lastCampfireAt=now;p.emote='toss';p.emoteAt=now;
 return {ok:true,fuel:kind,logs:kind==='wood'?fire.logs:logs,sequence:fire.sequence};
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
