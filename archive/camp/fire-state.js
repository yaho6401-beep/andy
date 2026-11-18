// A slow shared campfire, never a score, deadline or failure state.
export const FIRE={min:.24,max:.98,initial:.72,decayPerSecond:.0045,branchWarmth:.38,settleMs:12000,personalPauseMs:18000,flightMs:1100};
export const clampHeat=value=>Math.max(FIRE.min,Math.min(FIRE.max,Number.isFinite(value)?value:FIRE.initial));
export function heatAt(fire,now){return clampHeat(clampHeat(fire?.heat)-Math.max(0,now-(Number.isFinite(fire?.at)?fire.at:now))/1000*FIRE.decayPerSecond);}
export function createFire(now){return {version:1,heat:FIRE.initial,at:now,sequence:0,readyAt:0,lastThrow:null};}
export function fireMood(heat){return heat<.42?'embers':heat<.73?'gentle':'bright';}
export function publicFire(fire,player,now){
 const event=fire.lastThrow;
 return {heat:heatAt(fire,now),at:now,sequence:fire.sequence||0,readyAt:Math.max(fire.readyAt||0,(player.lastCampfireAt??-Infinity)+FIRE.personalPauseMs),lastThrow:event&&now-event.at>=0&&now-event.at<6500?{...event}:null};
}
export function addBranch(store,id){
 const p=store.clients.get(id),now=store.clock();
 if(!p||p.room!=='camp'||p.seat?.group!=='campfire-main'||Math.hypot(p.x,p.z)>3.3)throw Error('모닥불 둘레 통나무에 앉아 가지를 보태주세요.');
 const fire=store.campfire;
 if(now<(fire.readyAt||0)||now<(p.lastCampfireAt??-Infinity)+FIRE.personalPauseMs)throw Error('불길을 잠시 바라본 뒤, 천천히 가지를 보태주세요.');
 fire.heat=clampHeat(heatAt(fire,now)+FIRE.branchWarmth);fire.at=now;fire.readyAt=now+FIRE.settleMs;fire.sequence=(fire.sequence||0)+1;
 fire.lastThrow={sequence:fire.sequence,at:now,x:p.x,z:p.z,playerId:p.id,nickname:p.nickname};
 p.lastCampfireAt=now;p.emote='toss';p.emoteAt=now;
 return {ok:true,sequence:fire.sequence};
}
