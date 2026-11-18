import {appearance,clean,COLORS,HAIR} from './protocol.js';
import {readRecord,readStored,writeStored} from './client-state.js';
export const IDENTITY_KEY='books-scents-identity-v1';
// JSONB/network objects need not preserve property order.
export function appearanceKey(value){return JSON.stringify(appearance(value));}
const adjectives=['햇살','달빛','별빛','포근한','다정한','산뜻한','느긋한','반짝이는'];
const friends=['너구리','토끼','여우','독서가','조향사','고양이','산책가','여행자'];
let memory;
export function randomIdentity(random=Math.random){const pick=a=>a[Math.min(a.length-1,Math.max(0,Math.floor(random()*a.length)))],kind=Math.floor(random()*8);return {nickname:pick(adjectives)+pick(friends)+' '+Math.floor(100+random()*900),appearance:appearance({kind,hairStyle:kind>=4?[1,2,0,1][kind%4]:0,hair:pick(HAIR),color:pick(COLORS)})};}
export function identityValue(input){return {nickname:clean(input?.nickname,16),appearance:appearance(input?.appearance)};}
export function saveIdentity(input){const value=identityValue(input);memory=value;const stored=writeStored('localStorage',IDENTITY_KEY,JSON.stringify(value)),lookStored=writeStored('localStorage','archive-look',JSON.stringify(value.appearance));return {value,stored:stored&&lookStored};}
export function loadIdentity(){
 if(memory)return memory;
 const stored=readRecord('localStorage',IDENTITY_KEY);
 try{if(stored.nickname){memory=identityValue(stored);return memory;}}catch{}
 const value=randomIdentity();if(readStored('localStorage','archive-look'))value.appearance=appearance(readRecord('localStorage','archive-look'));
 saveIdentity(value);return memory;
}
export function moveRelativeToCamera(x,z,heading=0){const length=Math.max(1,Math.hypot(x,z)),cos=Math.cos(heading),sin=Math.sin(heading);return {x:(x*cos+z*sin)/length,z:(z*cos-x*sin)/length};}
