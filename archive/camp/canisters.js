import {CAMP} from './layout.js';

// Fictional camp props; their contents are never real-world fire instructions.
export const CANISTERS=CAMP.tents.flatMap(t=>[
 {id:t.id+'-fuel',tent:t.id,kind:'fuel',name:'기름통',x:t.x-.78,z:t.z+1.6},
 {id:t.id+'-water',tent:t.id,kind:'water',name:'물통',x:t.x+.78,z:t.z+1.6}
]);
export const CAN_NAMES={fuel:'기름통',water:'물통'};
export const OIL_HEAT=4.45, OIL_HOLD_MS=90000;
export const fuelLocked=(fire,now)=>now<(fire?.oilUntil||0)&&fire?.heat>.73;
