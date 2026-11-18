import {INGREDIENTS} from './scent-exhibits.js';
const sideZ=[-9.2,-7.3,-5.4,-3.5,-1.6,1.6,3.5,5.4,7.3,9.2];
export const MUSEUM_EXHIBITS=INGREDIENTS.map(s=>{
 const i=Number(s.code.slice(1))-1,front=s.note==='base';
 const x=front?-9.45+i*2.1:s.note==='top'?-11.6:11.6,z=front?10.3:sideZ[i];
 return {...s,x,z,w:front?1.2:1.05,d:front?.8:1.12,approach:{x:front?x:x+(s.note==='top'?1.1:-1.1),z:front?8.9:z}};
});
