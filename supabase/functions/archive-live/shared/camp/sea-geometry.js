export const ISLAND={x:0,z:-80,rx:8.5,rz:6.5,rod:{x:3.1,z:-79.2},fish:{x:3.8,z:-82.4},limit:-91};
export const FISHING_WATER={nearZ:-91.3,farZ:-99.3,x:4.3};
export function fishingFloat(job,time=0){const distance=job.stage==='fight'?Math.max(.08,Math.min(1,job.distance??1)):1;return {x:FISHING_WATER.x+Math.sin(time*1.2)*(job.stage==='fight'?.25:0),z:FISHING_WATER.nearZ+(FISHING_WATER.farZ-FISHING_WATER.nearZ)*distance};}
function segmentHitsIsland(a,b){const dx=b.x-a.x,dz=b.z-a.z;for(let i=0;i<=80;i++){const t=i/80;if(Math.hypot((a.x+dx*t)/12.4,(a.z+dz*t-ISLAND.z)/10.3)<1)return true;}return false;}
export function rescueCourse(from,shore){const landing={x:shore.x,z:-15.7},radial={x:from.x,z:from.z-ISLAND.z},len=Math.hypot(radial.x,radial.z)||1,approachFrom=from.z< -60?{x:from.x+radial.x/len*7,z:from.z+radial.z/len*7}:{x:from.x+5,z:from.z-7};
 const side=from.x<0?-1:1,points=segmentHitsIsland(from,landing)?[from,{x:side*15,z:Math.max(-90.9,Math.min(from.z,-90.7))},{x:side*15,z:-65},landing]:[from,landing],length=points.slice(1).reduce((sum,b,i)=>sum+Math.hypot(b.x-points[i].x,b.z-points[i].z),0);return {points,approachFrom,length,rideMs:Math.max(4200,length/7.5*1000)};
}
export function alongCourse(points,t){const lengths=points.slice(1).map((b,i)=>Math.hypot(b.x-points[i].x,b.z-points[i].z)),total=lengths.reduce((a,b)=>a+b,0);let d=Math.max(0,Math.min(1,t))*total,i=0;while(i<lengths.length-1&&d>lengths[i])d-=lengths[i++];const a=points[i],b=points[i+1],f=lengths[i]?d/lengths[i]:0;return {x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f,yaw:Math.atan2(b.x-a.x,b.z-a.z)};}
