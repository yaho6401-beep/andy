import {CAMP} from './layout.js';
export const SPEAKER_DURATION=180000;
export const SPEAKERS=CAMP.tents.map(t=>({id:'speaker-'+t.id,x:t.x+.55,z:t.z-1.85,tent:t.id}));
export function speakerAvailable(pack,now){return Number.isFinite(pack?.speakerUntil)&&pack.speakerUntil>now;}
