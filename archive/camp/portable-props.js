import {CANISTERS,heldCans} from './canisters.js';
import {SPEAKERS} from './speaker-state.js';
import {campPosition,campMove} from './layout.js';
export const CAMP_PROPS=[...CANISTERS];
// Speakers have returned to their original fixed tables, including for old saves.
export const propPosition=(pack,spot)=>SPEAKERS.some(s=>s.id===spot.id)?{...spot}:{...spot,...pack?.propPositions?.[spot.id]};
export const propHeld=(pack,spot)=>spot.kind==='speaker'?false:heldCans(pack)[spot.kind]?.spot===spot.id;
export function propAvailable(pack,spot){if(propHeld(pack,spot))return false;if(spot.kind==='speaker')return true;return !!pack?.propDropped?.[spot.id]||!pack?.canClaims?.[spot.id]||spot.kind==='water'&&!!pack?.rescueWater;}
export function nearbyCampProp(pack,p){if(!p)return null;return CAMP_PROPS.filter(s=>propAvailable(pack,s)&&!(s.kind==='speaker'?pack?.heldSpeaker:heldCans(pack)[s.kind])).map(s=>({...propPosition(pack,s),distance:Math.hypot(p.x-propPosition(pack,s).x,p.z-propPosition(pack,s).z)})).filter(s=>s.distance<1.9).sort((a,b)=>a.distance-b.distance)[0]||null;}
export function propDropPoint(pack,p,spot){
 const yaw=p.yaw||0,candidates=[0,.65,-.65,1.3,-1.3,Math.PI].map(a=>({x:p.x+Math.sin(yaw+a)*1.05,z:p.z+Math.cos(yaw+a)*1.05}));
 return candidates.find(q=>q.z> -12.8&&Math.hypot(q.x,q.z)>3.45&&campPosition(q.x,q.z)&&campMove(p.x,p.z,q.x,q.z)&&CAMP_PROPS.every(other=>other.id===spot.id||!propAvailable(pack,other)||Math.hypot(q.x-propPosition(pack,other).x,q.z-propPosition(pack,other).z)>.65))||null;
}
