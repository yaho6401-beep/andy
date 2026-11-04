import {MENU,NPCS} from '../src/cafe-data.js';
import {SEATS,CAFE_TABLES,tableReach,menuSpot} from '../src/seats.js';
import {validPosition} from '../src/protocol.js';
export function updateCafe(s){const now=s.clock();for(const [id,o]of s.orders){if(o.status==='preparing'&&now>=o.readyAt)o.status='ready';if(o.status==='ready'&&!o.announced&&s.clients.get(id)?.room==='salon'){o.announced=true;s.messages.push({id:'order-ready-'+o.id,from:'barista',nickname:'바리스타 모아',text:o.nickname+'님, '+o.name+' 준비됐어요! 카운터에서 받아가세요.',room:'salon',scope:'public',table:0,at:now});s.messages=s.messages.slice(-200);}}}
export function socialAction(s,id,input){const p=s.clients.get(id),now=s.clock();
 if(input.type==='barista-duty'){
  s.host(id);if(p.room!=='salon')throw Error('향기카페에 들어온 후 바리스타 자리로 이동해 주세요.');
  if([...s.clients.values()].some(q=>q.id!==id&&q.seat?.staff))throw Error('다른 진행자가 바리스타 자리에서 대화 중이에요.');
  if(p.seat?.staff)return {ok:true};
  const home=p.seat?.stand||{x:p.x,z:p.z};
  p.standFrom=home;p.seat={id:'barista-duty',room:'salon',x:NPCS.salon.x,z:NPCS.salon.z,yaw:0,height:.7,group:'cafe-bar',table:5,label:'바테이블 · 바리스타 자리',staff:true,stand:home};
  p.x=p.seat.x;p.z=p.seat.z;p.yaw=0;p.motion='idle';p.table=5;p.epoch++;p.seq=0;p.lastMove=now;return {ok:true};
 }
 if(input.type==='sit'){
  const seat=(s.seatDefinitions||SEATS).find(x=>x.id===input.seat&&x.room===p.room);if(!seat||Math.hypot(p.x-seat.x,p.z-seat.z)>1.35)throw Error('의자 가까이에서 앉아주세요.');if([...s.clients.values()].some(q=>q.id!==id&&q.seat?.id===seat.id))throw Error('이미 누군가 앉아 있어요.');if(p.seat)return {ok:true};
  p.seat={...seat};p.standFrom={x:p.x,z:p.z};p.x=seat.x;p.z=seat.z;p.yaw=seat.yaw;p.motion='sit';p.table=seat.table||0;p.epoch++;p.seq=0;p.lastMove=now;return {ok:true};
 }
 if(input.type==='stand'){
  if(!p.seat)return {ok:true};const seat=p.seat,candidates=[p.standFrom,seat.stand];for(let radius=.9;radius<2.2;radius+=.3)for(let i=0;i<12;i++)candidates.push({x:seat.x+Math.cos(i*Math.PI/6)*radius,z:seat.z+Math.sin(i*Math.PI/6)*radius});const spot=candidates.find(c=>c&&(s.validPosition||validPosition)(p.room,c.x,c.z));if(!spot)throw Error('잠시 후 다시 일어나 주세요.');p.x=spot.x;p.z=spot.z;p.seat=null;p.standFrom=null;p.table=0;p.motion='idle';p.epoch++;p.seq=0;p.lastMove=now;return {ok:true};
 }
 if(input.type==='order'){
  const npc=NPCS.salon;if(p.room!=='salon'||Math.hypot(p.x-npc.reach.x,p.z-npc.reach.z)>2.4)throw Error('바리스타 카운터에서 주문해 주세요.');const item=MENU.find(m=>m.id===input.item);if(!item)throw Error('메뉴를 확인해 주세요.');const old=s.orders.get(id);if(old&&['preparing','ready','held'].includes(old.status))throw Error('먼저 주문하신 메뉴를 받아 테이블에 놓아주세요.');const order={id:crypto.randomUUID(),item:item.id,name:item.name,nickname:p.nickname,status:'preparing',readyAt:now+30000};s.orders.set(id,order);return {ok:true,order:{...order}};
 }
 if(input.type==='pickup'){
  updateCafe(s);const order=s.orders.get(id),npc=NPCS.salon;if(!order||order.status!=='ready')throw Error('메뉴가 준비되면 닉네임을 불러드릴게요.');if(p.room!=='salon'||Math.hypot(p.x-npc.reach.x,p.z-npc.reach.z)>2.4)throw Error('카운터 가까이에서 받아주세요.');order.status='held';p.heldItem=order.item;return {ok:true};
 }
 if(input.type==='place-order'){
  const order=s.orders.get(id),table=CAFE_TABLES.find(t=>t.id===Number(input.table));if(!order||order.status!=='held')throw Error('먼저 카운터에서 메뉴를 받아주세요.');if(p.room!=='salon'||!table||tableReach(table,p)>1.6)throw Error('가까운 카페 테이블에 놓아주세요.');if(s.placedItems.filter(i=>i.table===table.id).length>=table.capacity)throw Error('이 테이블은 메뉴가 가득해요. 다른 테이블을 골라주세요.');const occupied=new Set(s.placedItems.filter(i=>i.table===table.id).map(i=>i.slot));const slots=Array.from({length:table.capacity},(_,n)=>({n,...menuSpot(table,n)})).filter(o=>!occupied.has(o.n)).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));s.placedItems.push({id:order.id,owner:id,nickname:p.nickname,item:order.item,name:order.name,table:table.id,slot:slots[0].n});s.orders.delete(id);p.heldItem=null;return {ok:true};
 }
 if(input.type==='clear-order'){
  const item=s.placedItems.find(i=>i.id===input.id);if(!item||item.owner!==id&&!['host','admin'].includes(p.role))throw Error('본인 메뉴만 정리할 수 있어요.');s.placedItems=s.placedItems.filter(i=>i.id!==input.id);return {ok:true};
 }
 return null;
}

export function baristaReply(s,p,audience,text){
 if(p.seat?.group!=='cafe-bar'||[...s.clients.values()].some(q=>q.room==='salon'&&q.seat?.staff))return;
 const reply=/커피|아메리카노|라테/.test(text)?'커피의 고소한 향처럼 편안한 시간이 되면 좋겠어요. 평소 어떤 커피를 좋아하세요?':/차|티|얼그레이/.test(text)?'차 한 잔과 어울리는 책 이야기도 좋겠네요. 요즘 마음에 남은 이야기가 있나요?':/안녕|반가/.test(text)?'어서 오세요! 저는 모아예요. 이 바에 함께 앉은 분들과만 조용히 이야기할 수 있어요.':/향|향수/.test(text)?'오늘의 기분을 향으로 표현하면 어떤 향일까요? 저는 포근한 나무 향이 떠올라요.':'들려주셔서 고마워요. 이곳에서 잠시 쉬어가세요. 오늘 하루 마음에 남은 순간이 있었나요?';
 s.messages.push({id:crypto.randomUUID(),from:'barista',nickname:'바리스타 모아 · NPC',text:reply,room:'salon',scope:'whisper',audience:[...audience],table:5,at:s.clock()});
}
