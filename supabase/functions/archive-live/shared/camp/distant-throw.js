export const DISTANT_MISS_LINES=['너무 멀어서 엉뚱한 곳으로 갔다…','바람을 탔나? 불 옆으로 살짝 빗나갔다.','조금 짧았네… 다음엔 살짝 더 멀리 던져볼까.','가지가 옆으로 데굴데굴… 이 거리에서는 쉽지 않네.'];
export function isDistantFireSeat(seat){return !!seat?.group?.startsWith('campfire-far-');}
export function distantOutcome(p,random){const landed=random()<.5;if(landed)return {landed:true,flightMs:1550};const side=random()<.5?-1:1,a=Math.atan2(p.x,p.z)+side*(.65+random()*.5),r=2.8+random()*1.2;return {landed:false,flightMs:1550,endX:Math.sin(a)*r,endZ:Math.cos(a)*r,line:DISTANT_MISS_LINES[Math.min(3,Math.floor(random()*4))]};}
