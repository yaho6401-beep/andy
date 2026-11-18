import {SNACKS,HARVESTS,PACK_LIMIT,HARVEST_PAUSE,SERVICE_PAUSE,SHARE_TTL} from '../camp/snack-data.js';
export function availableShares(s){s.sharedSnacks=s.sharedSnacks.filter(item=>item.expiresAt>s.clock());return s.sharedSnacks;}
export function packFor(s,id){let pack=s.packs.get(id);if(!pack){pack={items:{potato:0,sweetpotato:0,marshmallow:0},harvested:{},serviceAt:null,job:null,updatedAt:s.clock()};s.packs.set(id,pack);}return pack;}
export function serviceAvailable(s,id){const pack=packFor(s,id);if(pack.items.marshmallow>=PACK_LIMIT)throw Error('마시멜로는 세 개까지 챙길 수 있어요. 먼저 캠핑장에서 구워보세요.');if(pack.serviceAt!==null&&s.clock()-pack.serviceAt<SERVICE_PAUSE)throw Error('서비스 마시멜로는 잠시 뒤 다시 준비해 드릴게요.');return pack;}
export function takeService(s,id){const pack=serviceAvailable(s,id);pack.items.marshmallow++;pack.serviceAt=pack.updatedAt=s.clock();return {ok:true,packed:'marshmallow'};}
export function ownPack(s,id){const pack=s.packs.get(id);return pack?structuredClone(pack):{items:{potato:0,sweetpotato:0,marshmallow:0},harvested:{},job:null};}
function seated(p){if(p.room!=='camp'||p.seat?.group!=='campfire-main'||Math.hypot(p.x,p.z)>3.3)throw Error('모닥불 앞 통나무에 앉아 천천히 구워주세요.');}
export function snackAction(s,id,input){const p=s.clients.get(id),now=s.clock();
 if(input.type==='harvest'){
  const spot=HARVESTS.find(h=>h.id===input.spot);if(!spot||p.room!=='garden'||p.seat||Math.hypot(p.x-spot.x,p.z-spot.z)>1.65)throw Error('정원의 작은 밭 가까이에서 발견한 것을 챙겨주세요.');
  const pack=packFor(s,id);if(pack.items[spot.kind]>=PACK_LIMIT)throw Error('같은 간식은 세 개까지 챙길 수 있어요. 모닥불에서 먼저 구워볼까요?');if(pack.harvested[spot.id]!==undefined&&now-pack.harvested[spot.id]<HARVEST_PAUSE)throw Error('이 자리에서는 방금 챙겼어요. 다른 이랑도 둘러보세요.');
  pack.items[spot.kind]++;pack.harvested[spot.id]=now;pack.updatedAt=now;return {ok:true,packed:spot.kind};
 }
 if(input.type==='camp-snack'){
  seated(p);const info=Object.hasOwn(SNACKS,input.kind)?SNACKS[input.kind]:null;if(!info)throw Error('구울 간식을 확인해 주세요.');const pack=packFor(s,id);if(pack.job)throw Error('먼저 굽고 있는 간식을 받아주세요.');if(!(pack.items[input.kind]>0))throw Error('먼저 정원의 밭이나 카페에서 간식을 챙겨주세요.');
  pack.items[input.kind]--;pack.updatedAt=now;pack.job={id:crypto.randomUUID(),kind:input.kind,startedAt:now,readyAt:now+info.seconds*1000,seat:p.seat.id};return {ok:true,kind:input.kind};
 }
 if(input.type==='camp-snack-take'){
  seated(p);const pack=s.packs.get(id),job=pack?.job;if(!job)throw Error('굽고 있는 간식이 없어요.');if(now<job.readyAt)throw Error('아직 속까지 익는 중이에요. 조금만 기다려주세요.');const kind=job.kind,shared=input.share===true;
  if(shared){const shares=availableShares(s);if(shares.some(item=>item.owner===id))throw Error('먼저 놓아둔 반쪽을 나눌 분을 기다려주세요. 혼자 먹기는 계속 가능해요.');if(shares.length>=30)throw Error('나눔 접시가 가득해요. 잠시 뒤 나눠주세요.');shares.push({id:crypto.randomUUID(),owner:id,nickname:p.nickname,kind,seat:p.seat.id,at:now,expiresAt:now+SHARE_TTL});}
  pack.job=null;pack.updatedAt=now;return {ok:true,kind,finished:true,shared};
 }
 if(input.type==='camp-snack-share-take'){
  seated(p);const shares=availableShares(s),item=shares.find(item=>item.id===input.id);if(!item)throw Error('이미 다른 분이 드셨거나 나눔 시간이 지난 간식이에요.');if(item.owner===id)throw Error('내가 남긴 반쪽은 다른 분에게 나눠주세요.');s.sharedSnacks=shares.filter(other=>other.id!==item.id);return {ok:true,kind:item.kind,finished:true,received:true,from:item.nickname};
 }
 return null;
}
