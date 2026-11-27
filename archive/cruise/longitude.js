export const longitudeDelta=(from,to)=>((to-from+540)%360)-180;
export const normalizeLongitude=lon=>((lon+540)%360)-180;
export const interpolateLongitude=(a,b,t)=>t<=0?a:t>=1?b:normalizeLongitude(a+longitudeDelta(a,b)*t);
export function unwrapLongitudes(points,reference=points[0]?.lon||0){let previous=reference;return points.map(p=>{previous+=longitudeDelta(previous,p.lon);return{...p,lon:previous};});}
