export const CAFE_TABLES=[
 {id:1,x:-3.8,z:-.3,w:3.6,d:1.5,capacity:8,shape:'rectangle',label:'함께하는 긴 테이블 · 4:4',top:.82},
 {id:2,x:3.9,z:-.3,w:2.8,d:1.5,capacity:6,shape:'rectangle',label:'이야기 테이블 · 3:3',top:.82},
 {id:3,x:-3.8,z:4.3,w:1.8,d:1.8,capacity:4,shape:'round',label:'꽃잎 원형 테이블 · 2:2',top:.82},
 {id:4,x:3.8,z:4.3,w:1.3,d:1.3,capacity:2,shape:'round',label:'둘만의 티테이블 · 1:1',top:.82},
 {id:5,x:0,z:-4.65,w:5.8,d:.65,capacity:4,shape:'bar',label:'모아의 바테이블 · 2~4인',top:1.35}
];
const seats=[];
for(const room of ['garden','lobby'])for(const side of [-1,1])for(const i of [-1,1])seats.push({id:room+'-bench-'+side+'-'+i,room,x:side*(room==='garden'?4.8:5)+i*.5,z:room==='garden'?3.2:2.2,yaw:0,height:.55,group:room+'-bench-'+side,label:'벤치',stand:{x:side*(room==='garden'?4.8:5)+i*.5,z:room==='garden'?4.2:3.3}});
for(const side of [-1,1])for(const i of [-1,1])seats.push({id:'books-sofa-'+side+'-'+i,room:'books',x:side*4+i*.55,z:.16,yaw:0,height:.78,group:'books-sofa-'+side,label:'북라운지 소파',stand:{x:side*4+i*.55,z:1.18}});
for(const t of CAFE_TABLES){
 const offsets=t.shape==='bar'?[-2.1,-.7,.7,2.1].map(x=>({x,z:1,yaw:Math.PI})):t.shape==='rectangle'?[-1,1].flatMap(side=>Array.from({length:t.capacity/2},(_,i)=>({x:(i-(t.capacity/2-1)/2)*.88,z:side*1.4,yaw:side>0?Math.PI:0}))):Array.from({length:t.capacity},(_,i)=>{const a=i*2*Math.PI/t.capacity;return {x:Math.sin(a)*(t.w/2+.65),z:Math.cos(a)*(t.d/2+.65),yaw:Math.atan2(-Math.sin(a),-Math.cos(a))};});
 offsets.forEach((o,i)=>seats.push({id:'cafe-'+t.id+'-'+i,room:'salon',x:t.x+o.x,z:t.z+o.z,yaw:o.yaw,height:t.shape==='bar'?1:.48,group:t.id===5?'cafe-bar':'cafe-table-'+t.id,table:t.id,label:t.label,stand:{x:t.x+o.x,z:t.z+o.z+(o.z>=0?.85:-.85)}}));
}
export const SEATS=seats;
export function tableReach(t,p){return Math.hypot(Math.max(0,Math.abs(p.x-t.x)-t.w/2),Math.max(0,Math.abs(p.z-t.z)-t.d/2));}
export function menuSpot(t,n){if(t.shape==='bar')return {x:t.x-2.1+n*1.4,z:t.z+.08,y:t.top+.05};if(t.shape==='rectangle'){const count=t.capacity/2;return {x:t.x+(n%count-(count-1)/2)*.75,z:t.z+(n<count?-.4:.4),y:t.top+.05};}const a=n*2*Math.PI/t.capacity;return {x:t.x+Math.sin(a)*t.w*.26,z:t.z+Math.cos(a)*t.d*.26,y:t.top+.05};}
