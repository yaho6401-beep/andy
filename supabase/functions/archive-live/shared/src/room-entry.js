import {CAMP} from '../camp/layout.js';
import {validPosition} from './protocol.js';
const POINTS={scents:{x:0,z:0},books:{x:0,z:5.5},lobby:{x:0,z:8},salon:{x:0,z:9.5},camp:CAMP.spawn};
// Only fixed public-room spawns are accepted; no user-supplied coordinates.
export function directEntry(room){if(typeof room!=='string'||!Object.hasOwn(POINTS,room))return null;const p=POINTS[room];return validPosition(room,p.x,p.z)?{room,x:p.x,z:p.z}:null;}
