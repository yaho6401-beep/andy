import {keeperPose,RESTOCK_MS} from '../camp/keeper-state.js';
import {checkFuelDanger} from '../camp/fuel-danger.js';
import {CANISTERS,OIL_HEAT,OIL_HOLD_MS,fuelLocked,heldCans} from '../camp/canisters.js';
import {packFor,updateRoasts} from './snacks.mjs';
import {settleFire,FIRE} from '../camp/fire-state.js';

export function canisterAction(s,id,input){
 if(!['camp-keeper','camp-can-pickup','camp-can-pour'].includes(input.type))return null;
 const p=s.clients.get(id),now=s.clock(),pack=packFor(s,id);
 pack.canClaims??={};pack.refillAt??={};for(const [kind,at]of Object.entries(pack.refillAt))if(at<=now){for(const spot of CANISTERS.filter(c=>c.kind===kind))delete pack.canClaims[spot.id];delete pack.refillAt[kind];}
 if(input.type==='camp-keeper'){const npc=keeperPose(now);if(p.room!=='camp'||p.seat||Math.hypot(p.x-npc.x,p.z-npc.z)>2.7)throw Error('텐트지기 가까이에서 이야기해 주세요.');const kind=input.kind;if(!['fuel','water'].includes(kind))throw Error('필요한 통을 골라주세요.');if(heldCans(pack)[kind])throw Error('그 통은 이미 챙기셨어요. 먼저 사용하고 찾아와 주세요.');if(CANISTERS.filter(c=>c.kind===kind).every(c=>!pack.canClaims[c.id]))return {ok:true,kind,available:true};if(!pack.refillAt[kind])pack.refillAt[kind]=now+RESTOCK_MS;pack.updatedAt=now;return {ok:true,kind,refillAt:pack.refillAt[kind]};}
 pack.canClaims??={};
 pack.cans??={...heldCans(pack)};
 if(input.type==='camp-can-pickup'){
  const spot=CANISTERS.find(c=>c.id===input.spot);
  if(!spot||p.room!=='camp'||p.seat||Math.hypot(p.x-spot.x,p.z-spot.z)>1.4)throw Error('텐트 안 통 가까이에서 챙겨주세요.');
  if(pack.cans[spot.kind])throw Error('같은 종류의 통은 하나씩 챙길 수 있어요. 물과 기름은 함께 들 수 있어요.');
  const rescue=spot.kind==='water'&&s.campfire.dangerAt&&pack.rescueClaimAt!==s.campfire.dangerAt;
  if(pack.canClaims[spot.id]&&!rescue)throw Error('이 통은 이미 챙겼어요. 다른 텐트도 둘러보세요.');
  pack.can=pack.cans[spot.kind]={kind:spot.kind,spot:spot.id};pack.canClaims[spot.id]=true;if(rescue)pack.rescueClaimAt=s.campfire.dangerAt;pack.updatedAt=now;
  return {ok:true,kind:spot.kind,picked:true};
 }
 if(p.room!=='camp'||p.seat?.group!=='campfire-main'||Math.hypot(p.x,p.z)>3.3)throw Error('모닥불 앞 통나무에 앉아서 사용해 주세요.');
 const kind=input.kind??pack.can?.kind??Object.keys(pack.cans)[0],can=pack.cans[kind];
 if(!['fuel','water'].includes(kind)||!can||!CANISTERS.some(c=>c.id===can.spot&&c.kind===kind)||!pack.canClaims[can.spot])throw Error('텐트에서 챙겨 손에 든 통이 없어요.');
 updateRoasts(s); // Accrue at the old trajectory before settling or mutating heat.
 const fire=settleFire(s);
 if(now-(fire.pouredAt??-Infinity)<1800)throw Error('모닥불의 변화를 잠시 바라봐 주세요.');
 if(kind==='fuel'&&fuelLocked(fire,now))throw Error('불이 한참 타오르고 있어요. 잦아들 때까지 기다려주세요.');
 if(kind==='fuel'){fire.heat=OIL_HEAT;fire.oilUntil=now+OIL_HOLD_MS;fire.holdUntil=Math.max(fire.holdUntil||0,fire.oilUntil);checkFuelDanger(fire,now);}
 else{const rescue=!!fire.dangerAt;fire.heat=rescue?OIL_HEAT/2:FIRE.min;fire.rescuedAt=rescue?now:0;fire.dangerAt=0;fire.branchPeakUntil=0;fire.logPeakUntil=0;fire.branchLoad=0;fire.branches=0;fire.logs=0;fire.logCycleUntil=0;fire.holdUntil=fire.rescuedAt===now?now+20000:0;fire.oilUntil=0;fire.readyAt=now+1800;fire.lastThrow=null;}
 fire.pourFrom={x:p.x,z:p.z};fire.pouredAt=now;fire.pourSequence=(fire.pourSequence||0)+1;fire.pourKind=kind;fire.at=now;
 delete pack.cans[kind];pack.can=Object.values(pack.cans)[0]??null;pack.updatedAt=now;p.emote='toss';p.emoteAt=now;
 return {ok:true,kind,poured:true,dangerous:!!fire.dangerAt,rescued:fire.rescuedAt===now};
}
