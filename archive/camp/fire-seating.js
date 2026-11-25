import {CAMP_SEATS} from './layout.js';
// Nearby distant benches keep their own view; everywhere else approaches the main logs.
export function fireSeatGroup(position,seats=CAMP_SEATS){
 if(!position)return 'campfire-main';
 const far=seats.filter(s=>s.group?.startsWith('campfire-far-')).map(s=>({seat:s,d:Math.hypot(position.x-s.stand.x,position.z-s.stand.z)})).sort((a,b)=>a.d-b.d)[0];
 return far&&far.d<2.4?far.seat.group:'campfire-main';
}
export function fireSeatChoices(position,players=[],selfId,seats=CAMP_SEATS){
 const group=fireSeatGroup(position,seats),occupied=new Set(players.filter(p=>p.id!==selfId).map(p=>p.seat?.id));
 return seats.filter(s=>s.group===group&&!occupied.has(s.id)).sort((a,b)=>Math.hypot(a.stand.x-position.x,a.stand.z-position.z)-Math.hypot(b.stand.x-position.x,b.stand.z-position.z));
}
// A seat can only be requested while an explicit central-button intent is active.
export function fireApproachState(intent,{joined,room,me,selfId,snapshot,manual=false,blocked=false}){
 if(!intent)return 'inactive';
 const player=me?.state,p=me?.mesh?.position;
 if(!joined||room!=='camp'||!p||player?.seaRescue||manual||blocked)return 'cancelled';
 if(player?.seat)return player.seat.id===intent.seat.id?'seated':'cancelled';
 if(player?.epoch!==intent.epoch||(snapshot?.players||[]).some(p=>p.id!==selfId&&p.seat?.id===intent.seat.id))return 'cancelled';
 return Math.hypot(p.x-intent.seat.stand.x,p.z-intent.seat.stand.z)<.3&&Math.hypot(p.x-intent.seat.x,p.z-intent.seat.z)<1.28?'ready':'walking';
}
