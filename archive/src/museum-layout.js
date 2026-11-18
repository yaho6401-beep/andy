import {INGREDIENTS} from './scent-exhibits.js';
export const MUSEUM_REACH=1.75;
const topZ=[-13,-7.8,-2.6,2.6,7.8],middleZ=[-13,-8.6,-4.2,5.4,9.8];
export const MUSEUM_EXHIBITS=INGREDIENTS.map(s=>{
 const i=Number(s.code.slice(1))-1,front=s.note==='base',top=s.note==='top';
 const x=front?-16.2+i*3.6:top?[-16,-11][i%2]:[11,16][i%2],z=front?14.3:(top?topZ:middleZ)[Math.floor(i/2)];
 return {...s,x,z,w:1.2,d:1.12,approach:{x:front?x:x+(top?1.45:-1.45),z:front?z-1.45:z}};
});
