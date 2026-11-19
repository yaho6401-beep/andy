import {weatherAt,weatherHeat} from '../camp/weather-state.js';
import {SNACKS,HARVESTS,WOOD_FINDS,roastState,PACK_LIMIT,HARVEST_PAUSE,SERVICE_PAUSE,SHARE_TTL} from '../camp/snack-data.js';
import {addCampFuel} from '../camp/fire-state.js';
import {newMallow,advanceMallow} from '../camp/marshmallow-state.js';
import {heatAt} from '../camp/fire-state.js';
export function updateRoasts(s){for(const pack of s.packs.values())settleMallow(s,pack.job);}
function settleMallow(s,job){if(job?.kind!=='marshmallow')return;const now=s.clock();if(!job.roast){const p=Math.min(1,Math.max(0,(now-job.startedAt)/Math.max(1,job.readyAt-job.startedAt)));job.roast={...newMallow(now),faces:Array(4).fill(p*.85),level:p>=1?3:1};}job.roast=advanceMallow(job,now,t=>weatherHeat(heatAt(s.campfire,t),s.publicLounge?weatherAt(t):null));}
export function availableShares(s){s.sharedSnacks=s.sharedSnacks.filter(item=>item.expiresAt>s.clock());return s.sharedSnacks;}
export function packFor(s,id){let pack=s.packs.get(id);if(!pack){pack={items:{potato:0,sweetpotato:0,marshmallow:0},wood:0,harvested:{},serviceAt:null,job:null,updatedAt:s.clock()};s.packs.set(id,pack);}pack.wood??=0;return pack;}
export function serviceAvailable(s,id){const pack=packFor(s,id);if(pack.items.marshmallow>=PACK_LIMIT)throw Error('마시멜로는 세 개까지 챙길 수 있어요. 먼저 캠핑장에서 구워보세요.');if(pack.serviceAt!==null&&s.clock()-pack.serviceAt<SERVICE_PAUSE)throw Error('서비스 마시멜로는 잠시 뒤 다시 준비해 드릴게요.');return pack;}
export function takeService(s,id){const pack=serviceAvailable(s,id);pack.items.marshmallow++;pack.serviceAt=pack.updatedAt=s.clock();return {ok:true,packed:'marshmallow'};}
export function ownPack(s,id){const pack=s.packs.get(id);return pack?structuredClone(pack):{items:{potato:0,sweetpotato:0,marshmallow:0},harvested:{},job:null};}
function seated(p){if(p.room!=='camp'||p.seat?.group!=='campfire-main'||Math.hypot(p.x,p.z)>3.3)throw Error('모닥불 앞 통나무에 앉아 천천히 구워주세요.');}
export function snackAction(s,id,input){const p=s.clients.get(id),now=s.clock();
 settleMallow(s,s.packs.get(id)?.job);
 if(input.type==='harvest'){
  const spot=[...HARVESTS,...WOOD_FINDS].find(h=>h.id===input.spot);if(!spot||p.room!==(spot.room||'garden')||p.seat||Math.hypot(p.x-spot.x,p.z-spot.z)>1.65)throw Error('밭이나 나무 가까이에서 발견한 것을 챙겨주세요.');
  const pack=packFor(s,id),wood=spot.kind==='firewood';if((wood?pack.wood:pack.items[spot.kind])>=PACK_LIMIT)throw Error(wood?'장작은 세 개까지 챙길 수 있어요. 모닥불에 먼저 보태주세요.':'같은 간식은 세 개까지 챙길 수 있어요. 모닥불에서 먼저 구워볼까요?');if(pack.harvested[spot.id]!==undefined&&now-pack.harvested[spot.id]<HARVEST_PAUSE)throw Error('이 자리에서는 방금 챙겼어요. 다른 나무나 이랑도 둘러보세요.');
  if(wood)pack.wood++;else pack.items[spot.kind]++;pack.harvested[spot.id]=now;pack.updatedAt=now;return {ok:true,packed:spot.kind};
 }
 if(input.type==='camp-snack'){
  seated(p);const info=Object.hasOwn(SNACKS,input.kind)?SNACKS[input.kind]:null;if(!info)throw Error('구울 간식을 확인해 주세요.');const pack=packFor(s,id);if(pack.job)throw Error('먼저 굽고 있는 간식을 받아주세요.');if(!(pack.items[input.kind]>0))throw Error('먼저 정원의 밭이나 카페에서 간식을 챙겨주세요.');
  pack.items[input.kind]--;pack.updatedAt=now;pack.job={id:crypto.randomUUID(),kind:input.kind,startedAt:now,readyAt:now+info.seconds*1000,seat:p.seat.id,...(input.kind==='marshmallow'?{roast:newMallow(now)}:{})};return {ok:true,kind:input.kind};
 }
 if(input.type==='camp-snack-adjust'){
  seated(p);const pack=s.packs.get(id),job=pack?.job;if(!job||job.kind!=='marshmallow'||input.jobId!==job.id)throw Error('굽고 있는 마시멜로를 확인해 주세요.');
  if(!['closer','higher','turn'].includes(input.control))throw Error('굽기 조작을 확인해 주세요.');if(now-(job.lastControlAt||0)<280)throw Error('천천히 돌려가며 구워주세요.');if(roastState(job,now).burnt)throw Error('타버렸어요. 불에 보태고 새로 구워볼까요?');
  const r=job.roast;if(input.control==='turn'){r.face=(r.face+1)%4;r.turns++;}else r.level=Math.max(0,Math.min(3,r.level+(input.control==='higher'?1:-1)));job.lastControlAt=now;pack.updatedAt=now;return {ok:true,jobId:job.id,control:input.control};
 }
 if(input.type==='camp-snack-take'){
  seated(p);const pack=s.packs.get(id),job=pack?.job;if(!job)throw Error('굽고 있는 간식이 없어요.');const state=roastState(job,now);if(state.burnt)throw Error('너무 타서 먹기는 어려워요. 불에 보태주세요.');if(state.onFire)throw Error('불이 붙었어요. 높이 들어 불을 꺼주세요.');if(!state.ready)throw Error(job.kind==='marshmallow'?'돌려가며 네 면을 조금 더 익혀주세요.':'아직 속까지 익는 중이에요. 조금만 기다려주세요.');const kind=job.kind,shared=input.share===true;
  if(shared){const shares=availableShares(s);if(shares.some(item=>item.owner===id))throw Error('먼저 놓아둔 반쪽을 나눌 분을 기다려주세요. 혼자 먹기는 계속 가능해요.');if(shares.length>=30)throw Error('나눔 접시가 가득해요. 잠시 뒤 나눠주세요.');shares.push({id:crypto.randomUUID(),owner:id,nickname:p.nickname,kind,seat:p.seat.id,at:now,expiresAt:now+SHARE_TTL});}
  pack.job=null;pack.updatedAt=now;return {ok:true,kind,finished:true,shared};
 }
 if(input.type==='campfire-log'){
  seated(p);const pack=packFor(s,id);if(pack.wood<1)throw Error('캠핑장 나무 아래에서 마른 장작을 찾아보세요.');
  const result=addCampFuel(s,id,'wood');pack.wood--;pack.updatedAt=now;return result;
 }
 if(input.type==='camp-snack-fuel'){
  seated(p);const pack=s.packs.get(id),job=pack?.job;if(!job||!roastState(job,now).burnt)throw Error('너무 탄 간식만 불에 보탤 수 있어요.');
  const result=addCampFuel(s,id,'burnt');pack.job=null;pack.updatedAt=now;return {...result,kind:job.kind};
 }
 if(input.type==='camp-snack-share-take'){
  seated(p);const shares=availableShares(s),item=shares.find(item=>item.id===input.id);if(!item)throw Error('이미 다른 분이 드셨거나 나눔 시간이 지난 간식이에요.');if(item.owner===id)throw Error('내가 남긴 반쪽은 다른 분에게 나눠주세요.');s.sharedSnacks=shares.filter(other=>other.id!==item.id);return {ok:true,kind:item.kind,finished:true,received:true,from:item.nickname};
 }
 return null;
}
