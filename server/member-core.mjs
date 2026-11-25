import {createRecord} from '../workshop/model.js';
import {cleanNotebook} from '../reading-notebook-model.js';
export const MEMBER_ITERATIONS=600000;
export const memberError=(message,status=400)=>Object.assign(Error(message),{status});
export const hex=data=>Array.from(new Uint8Array(data),n=>n.toString(16).padStart(2,'0')).join('');
export const randomToken=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export const digest=async value=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
export function normalizePhone(value){
 let phone=typeof value==='string'?value.replace(/[\s()-]/g,''):'';
 if(/^01[016789]\d{7,8}$/.test(phone))phone='+82'+phone.slice(1);
 if(!/^\+[1-9]\d{7,14}$/.test(phone))throw memberError('휴대폰 번호를 확인해 주세요. 해외 번호는 +국가번호부터 적어주세요.');return phone;
}
export function memberNickname(value){const s=typeof value==='string'?value.normalize('NFKC').trim():'';if([...s].length<2||[...s].length>16||/[<>\u0000-\u001f\u007f]/.test(s))throw memberError('닉네임은 2~16자로 적어주세요.');return s;}
export function checkPassword(value){if(typeof value!=='string'||value.length<8||value.length>72)throw memberError('비밀번호는 8~72자로 적어주세요.');return value;}
export async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:MEMBER_ITERATIONS,hash:'SHA-256'},key,256));}
export function equalHash(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==64||b.length!==64)return false;let n=0;for(let i=0;i<64;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
export function cleanRecord(kind,value){
 if(!value||typeof value!=='object'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.id||''))throw memberError('기록 번호를 확인해 주세요.');
 if(kind==='blending'){const date=new Date(value.createdAt);if(!Number.isFinite(date.getTime()))throw memberError('기록 날짜를 확인해 주세요.');return createRecord(value,value.name,{id:value.id,now:date});}
 if(!['reading','notebook'].includes(kind))throw memberError('기록 종류를 확인해 주세요.');
 const date=new Date(value.date);if(!Number.isFinite(date.getTime()))throw memberError('기록 날짜를 확인해 주세요.');
 if(kind==='notebook'){let record;try{record=cleanNotebook(value);}catch(e){throw memberError(e.message);}return {id:value.id,date:date.toISOString(),...record};}
 const text=(v,max)=>typeof v==='string'?v.replace(/[\u0000-\u0008\u000b-\u001f]/g,'').slice(0,max):'';
 return {id:value.id,date:date.toISOString(),category:['한 줄','두세 줄','몇 페이지','조금 더'].includes(value.category)?value.category:'한 줄',place:text(value.place,70),title:text(value.title,120),thought:text(value.thought,1000),durationMinutes:Math.min(1440,Math.max(0,Math.floor(Number(value.durationMinutes)||0)))};
}
