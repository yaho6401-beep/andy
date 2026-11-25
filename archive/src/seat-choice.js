// Proximity only offers a choice. It never sends a sit action.
export const isFireSeat=seat=>seat?.group==='campfire-main'||!!seat?.group?.startsWith('campfire-far-');
export function closestFreeSeat(seats,{joined,room,selfId,me},players=[],radius=1.35){
 if(!joined||!me?.mesh?.position||me.state?.seat||me.state?.seaRescue)return null;
 const occupied=new Set(players.filter(p=>p.id!==selfId).map(p=>p.seat?.id));
 const p=me.mesh.position;let result=null,distance=radius;
 for(const seat of seats){if(seat.room!==room||seat.staff||isFireSeat(seat)||occupied.has(seat.id))continue;const d=Math.hypot(p.x-seat.x,p.z-seat.z);if(d<distance){distance=d;result=seat;}}
 return result;
}
