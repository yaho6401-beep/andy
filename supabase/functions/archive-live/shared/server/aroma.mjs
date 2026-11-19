import {MUSEUM_EXHIBITS} from '../src/museum-layout.js';
import {NPCS} from '../src/cafe-data.js';
import {packFor} from './snacks.mjs';
export function settleHands(s,p){const now=s.clock(),pack=s.packs.get(p.id);if(pack?.handsHot&&now>=(pack.handsHotUntil||Infinity)){pack.handsHot=false;}if(p?.warmStarted!=null&&now-p.warmStarted>=18000){const own=packFor(s,p.id);own.handsHot=true;own.handsHotUntil=now+90000;p.warmStarted=null;}}
export function aromaAction(s,id,input){const p=s.clients.get(id),now=s.clock();settleHands(s,p);
 if(input.type==='warm-hands'){
  if(input.active===false){p.warmStarted=null;return {ok:true};}if(p.room!=='camp'||p.seat?.group!=='campfire-main')throw Error('모닥불 앞에 앉아서 손을 쬐어주세요.');if(packFor(s,id).handsHot)throw Error('손을 잠시 쉬게 해주세요.');if(p.warmStarted==null)p.warmStarted=now;return {ok:true,startedAt:p.warmStarted,at:now};
 }
 if(input.type==='museum-oil'){
  if(p.room!=='scents'||!['lavender','orange'].includes(input.kind))throw Error('향기박물관에서 향 이야기를 먼저 만나주세요.');
  const lavender=input.kind==='lavender',spot=lavender?MUSEUM_EXHIBITS.find(e=>e.code==='M7'):NPCS.scents.reach;
  if(Math.hypot(p.x-spot.x,p.z-spot.z)>(lavender?3:2.4))throw Error(lavender?'M7 라벤더 전시 가까이에서 해설을 읽어주세요.':'큐레이터 가까이에서 이야기를 나눠주세요.');
  if(lavender&&input.phase==='read'){p.lavenderReadAt=now;return {ok:true,read:true,kind:'lavender'};}
  if(input.phase!=='claim')throw Error('선물 받기를 선택해주세요.');if(lavender&&(p.lavenderReadAt==null||now-p.lavenderReadAt>180000))throw Error('M7 전시 해설을 먼저 열어 읽어주세요.');
  const pack=packFor(s,id);pack.oils??={lavender:0,orange:0};if(pack.oils[input.kind]>0)throw Error('이미 한 병을 챙겼어요. 꾸러미에서 만나보세요.');pack.oilGiftAt??={};if(now-(pack.oilGiftAt[input.kind]??-Infinity)<10000)throw Error('잠시 향 이야기를 더 나누고 받아주세요.');pack.oils[input.kind]=1;pack.oilGiftAt[input.kind]=now;pack.updatedAt=now;return {ok:true,received:true,kind:input.kind};
 }
 if(input.type==='use-oil'){
  const pack=packFor(s,id);if(p.room!=='camp'||p.seat?.group!=='campfire-main'||!['lavender','orange'].includes(input.kind))throw Error('모닥불 앞에서 잠시 쉬어가요.');if(!(pack.oils?.[input.kind]>0))throw Error('향기박물관에서 먼저 선물을 받아주세요.');
  if(input.kind==='lavender'&&!pack.handsHot)throw Error('손이 뜨거워진 뒤에만 열리는 향 체험이에요.');if(input.kind==='orange'&&now-(p.seatedAt??p.lastMove)<10000)throw Error('잠시 불을 바라본 뒤 향을 만나보세요.');
  pack.oils[input.kind]--;if(input.kind==='lavender')pack.handsHot=false;pack.updatedAt=now;return {ok:true,kind:input.kind,used:true};
 }
 return null;
}
