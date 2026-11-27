import {passengerRegion,clampInteriorEye} from './interior-layout.js';
// Camera and player remain in the same compartment. Never expose the ocean by
// moving the camera through a bulkhead or above an enclosed deck's ceiling.
export function interiorView(p,turn=0){
 const region=passengerRegion(p);if(!region||region==='bridge')return null;
 const stair=region==='cabin-stair',dining=region==='dining',suite=region==='suite',distance=stair?2.5:dining?4.7:4.4,side=stair?.15:suite?1:.9,fx=-Math.sin(turn),fz=-Math.cos(turn);
 const eye=clampInteriorEye({x:p.x-fx*distance+Math.cos(turn)*side,y:p.y+(stair?1.65:dining?1.95:1.75),z:p.z-fz*distance-Math.sin(turn)*side},region);
 return{region,eye,look:{x:p.x+fx*(stair?3:4.5)+(suite?Math.cos(turn):0),y:p.y+1.0,z:p.z+fz*(stair?3:4.5)-(suite?Math.sin(turn):0)},fov:dining?66:68};
}
