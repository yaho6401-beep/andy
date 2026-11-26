import {packFor} from './snacks.mjs';
import {grantHiddenJoy} from './camp-comfort.mjs';
import {emergencyKeeperPose,activeTentFire} from '../camp/tent-fire-state.js';
import {tentAt} from '../camp/layout.js';

// Called ONLY after accepted walking segments. No client-supplied loot or rolls.
export function exploreWithTorch(s,p,distance,random=s.random||Math.random){
 if(p.room!=='camp'||!p.flashlightOn||p.seat||p.swimming||p.voyage||p.seaRescue||tentAt(p.x,p.z)||!(distance>0))return;
 const pack=s.packs.get(p.id);if(!pack?.flashlight)return;
 const now=s.clock(),search=pack.torchSearch??={distance:0,at:now};
 if(now<(search.until||0))return;
 search.distance=Math.min(20,search.distance+Math.min(distance,6));
 if(search.distance<16||now-search.at<12000)return;
 search.distance=0;search.at=now;
 if(random()>=.28)return;
 const kind=random()<.5?'tuna':'noodles',items=pack.hiddenSnacks??={tuna:0,noodles:0,hotWater:0};
 if((items[kind]||0)>=2)return;
 items[kind]=(items[kind]||0)+1;search.until=now+120000;
 pack.hiddenFind={id:crypto.randomUUID(),kind,at:now};pack.updatedAt=now;
}
export function hiddenSnackAction(s,id,input){
 if(!['camp-hidden-eat','camp-noodle-water'].includes(input.type))return null;
 const p=s.clients.get(id),pack=packFor(s,id),items=pack.hiddenSnacks;
 if(p.room!=='camp'||p.swimming||p.voyage||p.seaRescue)throw Error('캠핑장의 안전한 자리에서 간식을 준비해 주세요.');
 if(input.type==='camp-noodle-water'){
  const npc=emergencyKeeperPose(s.campfire,s.clock());
  if(p.seat||Math.hypot(p.x-npc.x,p.z-npc.z)>3.3||activeTentFire(s.campfire))throw Error('온유 할아버지 가까이에서 부탁해 주세요.');
  if(!(items?.noodles>0))throw Error('컵라면을 발견하면 뜨거운 물을 부탁할 수 있어요.');
  if((items.hotWater||0)>=items.noodles)throw Error('컵라면에 필요한 뜨거운 물은 이미 받았어요.');
  items.hotWater=(items.hotWater||0)+1;pack.updatedAt=s.clock();return {ok:true,hotWater:true};
 }
 const kind=input.kind;
 if(!['tuna','noodles'].includes(kind)||!(items?.[kind]>0))throw Error('직접 발견한 간식을 골라주세요.');
 if(kind==='noodles'&&!(items.hotWater>0))throw Error('온유 할아버지에게 컵라면용 뜨거운 물을 먼저 받아주세요.');
 items[kind]--;if(kind==='noodles')items.hotWater--;pack.updatedAt=s.clock();grantHiddenJoy(s,p);
 return {ok:true,hiddenEaten:true,kind,boostSeconds:600};
}
