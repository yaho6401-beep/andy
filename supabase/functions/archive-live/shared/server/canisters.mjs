import {CANISTERS,OIL_HEAT,OIL_HOLD_MS,fuelLocked} from '../camp/canisters.js';
import {packFor,updateRoasts} from './snacks.mjs';
import {settleFire,FIRE} from '../camp/fire-state.js';

export function canisterAction(s,id,input){
 if(!['camp-can-pickup','camp-can-pour'].includes(input.type))return null;
 const p=s.clients.get(id),now=s.clock(),pack=packFor(s,id);
 pack.canClaims??={};
 if(input.type==='camp-can-pickup'){
  const spot=CANISTERS.find(c=>c.id===input.spot);
  if(!spot||p.room!=='camp'||p.seat||Math.hypot(p.x-spot.x,p.z-spot.z)>1.4)throw Error('텐트 안 통 가까이에서 챙겨주세요.');
  if(pack.can)throw Error('통은 한 번에 하나만 들 수 있어요. 먼저 모닥불에서 사용해 주세요.');
  const rescue=spot.kind==='water'&&s.campfire.dangerAt&&pack.rescueClaimAt!==s.campfire.dangerAt;
  if(pack.canClaims[spot.id]&&!rescue)throw Error('이 통은 이미 챙겼어요. 다른 텐트도 둘러보세요.');
  pack.can={kind:spot.kind,spot:spot.id};pack.canClaims[spot.id]=true;if(rescue)pack.rescueClaimAt=s.campfire.dangerAt;pack.updatedAt=now;
  return {ok:true,kind:spot.kind,picked:true};
 }
 if(p.room!=='camp'||p.seat?.group!=='campfire-main'||Math.hypot(p.x,p.z)>3.3)throw Error('모닥불 앞 통나무에 앉아서 사용해 주세요.');
 if(!pack.can||!CANISTERS.some(c=>c.id===pack.can.spot&&c.kind===pack.can.kind)||!pack.canClaims[pack.can.spot])throw Error('텐트에서 챙겨 손에 든 통이 없어요.');
 updateRoasts(s); // Accrue at the old trajectory before settling or mutating heat.
 const fire=settleFire(s),kind=pack.can.kind;
 if(now-(fire.pouredAt??-Infinity)<1800)throw Error('모닥불의 변화를 잠시 바라봐 주세요.');
 if(kind==='fuel'&&fuelLocked(fire,now))throw Error('불이 한참 타오르고 있어요. 잦아들 때까지 기다려주세요.');
 if(kind==='fuel'){if(now<(fire.logPeakUntil||0)&&now<(fire.branchPeakUntil||0))fire.dangerAt=now;fire.heat=OIL_HEAT;fire.oilUntil=now+OIL_HOLD_MS;fire.holdUntil=Math.max(fire.holdUntil||0,fire.oilUntil);}
 else{const rescue=!!fire.dangerAt;fire.heat=rescue?OIL_HEAT/2:FIRE.min;fire.rescuedAt=rescue?now:0;fire.dangerAt=0;fire.branchPeakUntil=0;fire.logPeakUntil=0;fire.branchLoad=0;fire.branches=0;fire.logs=0;fire.logCycleUntil=0;fire.holdUntil=fire.rescuedAt===now?now+20000:0;fire.oilUntil=0;fire.readyAt=now+1800;fire.lastThrow=null;}
 fire.pourFrom={x:p.x,z:p.z};fire.pouredAt=now;fire.pourSequence=(fire.pourSequence||0)+1;fire.pourKind=kind;fire.at=now;
 pack.can=null;pack.updatedAt=now;p.emote='toss';p.emoteAt=now;
 return {ok:true,kind,poured:true,dangerous:!!fire.dangerAt,rescued:fire.rescuedAt===now};
}
