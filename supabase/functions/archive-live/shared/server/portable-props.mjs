import {CAMP_PROPS,propHeld,propAvailable,propPosition,propDropPoint} from '../camp/portable-props.js';
import {SPEAKER_DURATION} from '../camp/speaker-state.js';
import {heldCans} from '../camp/canisters.js';
import {packFor} from './snacks.mjs';
export function portablePropAction(s,id,input){if(!['camp-prop-pickup','camp-prop-drop'].includes(input.type))return null;const p=s.clients.get(id),pack=packFor(s,id),spot=CAMP_PROPS.find(c=>c.id===input.spot),now=s.clock();if(!spot||p.room!=='camp'||p.seat||p.swimming||p.voyage||p.seaRescue)throw Error('캠핑장의 열린 바닥에 서서 물품을 옮겨주세요.');if(now-(pack.propMovedAt??-Infinity)<500)throw Error('천천히 물품을 옮겨주세요.');
 if(input.type==='camp-prop-pickup'){
  const pos=propPosition(pack,spot),rescue=spot.kind==='water'&&(s.campfire.dangerAt||s.campfire.tentFire&&!s.campfire.tentFire.extinguishedAt)&&pack.rescueClaimAt!==(s.campfire.tentFire?.at||s.campfire.dangerAt);if(Math.hypot(p.x-pos.x,p.z-pos.z)>2.2||!propAvailable({...pack,rescueWater:rescue},spot))throw Error('챙길 물품 가까이 다가가 주세요.');
  if(spot.kind==='speaker'){if(pack.heldSpeaker)throw Error('스피커는 하나씩 들 수 있어요.');pack.heldSpeaker=spot.id;pack.speakerUntil=Math.max(pack.speakerUntil||0,now+SPEAKER_DURATION);}
  else {pack.cans??={...heldCans(pack)};if(pack.cans[spot.kind])throw Error('같은 종류의 통은 하나씩 들 수 있어요.');pack.cans[spot.kind]={kind:spot.kind,spot:spot.id};pack.can=pack.cans[spot.kind];pack.canClaims??={};pack.canClaims[spot.id]=true;if(rescue)pack.rescueClaimAt=s.campfire.tentFire?.at||s.campfire.dangerAt;}
  if(pack.propDropped)delete pack.propDropped[spot.id];pack.propCarried=spot.id;
 }else {
  if(!propHeld(pack,spot))throw Error('내가 챙긴 물품만 내려놓을 수 있어요.');const point=propDropPoint(pack,p,spot);if(!point)throw Error('조금 더 넓은 바닥에서 내려놓아 주세요.');
  pack.propPositions??={};pack.propDropped??={};pack.propPositions[spot.id]={...point,yaw:p.yaw||0};pack.propDropped[spot.id]=true;
  if(spot.kind==='speaker')pack.heldSpeaker=null;else {delete pack.cans[spot.kind];pack.can=Object.values(pack.cans)[0]||null;}
  pack.propCarried=pack.heldSpeaker||Object.values(heldCans(pack))[0]?.spot||null;
 }
 pack.updatedAt=pack.propMovedAt=now;return {ok:true,kind:spot.kind,name:spot.name,picked:input.type==='camp-prop-pickup',dropped:input.type==='camp-prop-drop'};
}
