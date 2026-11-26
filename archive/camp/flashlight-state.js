import {CAMP} from './layout.js';
export const FLASHLIGHTS=CAMP.tents.map(t=>({id:'flashlight-'+t.id,x:t.x-2.25,z:t.z+.9,tent:t.id}));
export const FLASHLIGHT_ANGLE=64,FLASHLIGHT_RANGE=17,FLASHLIGHT_INTENSITY=58;
export function nearbyFlashlight(pack,p){return !pack?.flashlight&&p?FLASHLIGHTS.find(o=>Math.hypot(p.x-o.x,p.z-o.z)<1.9)||null:null;}
