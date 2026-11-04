import {ArchiveStore} from '../server/room-store.mjs';
import {serializeStore,restoreStore} from '../server/persistence.mjs';
import {campMove,campPosition,CAMP_SEATS} from './layout.js';
import {clean} from '../src/protocol.js';
export const CAMP_ROOMS=['camp','camp-2','camp-3','camp-4'];
const questions=['오늘 하루 가장 감사했던 일은?','지금 가장 듣고 싶은 말은?','나에게 힘이 되었던 책은?','평생 잊지 못할 한 문장은?','어린 시절 가장 행복했던 기억은?','다시 만나고 싶은 사람이 있다면?'];
export function koreaDay(now){return new Date(now+9*3600000).toISOString().slice(0,10);}
export function dailyTopic(now){const day=koreaDay(now),n=Math.floor((Date.parse(day+'T00:00:00Z'))/86400000);return {day,text:questions[n%questions.length]};}
export function moderateText(value){const text=clean(value,180),compact=text.normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu,'').toLowerCase();if(/씨발|시발|병신|개새끼|좆/.test(compact))throw Error('서로를 존중하는 표현으로 바꿔주세요.');if(/(.)\1{10}/u.test(compact))throw Error('반복 문자는 조금 줄여주세요.');return text;}
export class CampStore extends ArchiveStore{
 constructor(options={}){super(options);this.validMove=(room,...args)=>CAMP_ROOMS.includes(room)&&campMove(...args);this.validPosition=(room,x,z)=>CAMP_ROOMS.includes(room)&&campPosition(x,z);this.seatDefinitions=CAMP_ROOMS.flatMap(room=>CAMP_SEATS.map((s,i)=>({...s,id:`${room}-seat-${i}`,room,group:room+'-fire',label:'모닥불 통나무 의자',height:.55})));this.preferences=new Map();this.topics={};this.meeting.name='별빛 캠핑장 · 미리보기';this.meeting.endsAt=253402214400000;}
 prefs(id){if(!this.preferences.has(id))this.preferences.set(id,{muted:[],blocked:[]});return this.preferences.get(id);}
 blocked(a,b){return this.prefs(a).blocked.includes(b)||this.prefs(b).blocked.includes(a);}
 join(id,look={},send=()=>{}){const room=CAMP_ROOMS.find(r=>[...this.clients.values()].filter(p=>p.room===r).length<6);if(!room)throw Error('모닥불이 가득 찼어요. 잠시 후 다시 와주세요.');super.join(id,look,send);const p=this.clients.get(id);Object.assign(p,{room,x:0,z:5.8,listening:false});this.prefs(id);return this.publicPlayer(p);}
 topic(room){const daily=dailyTopic(this.clock()),custom=this.topics[room];return custom?.day===daily.day?custom:daily;}
 snapshot(id){const s=super.snapshot(id),me=this.clients.get(id),prefs=this.prefs(id);s.players=s.players.filter(p=>p.room===me.room&&!this.blocked(id,p.id));s.messages=s.messages.filter(m=>!prefs.muted.includes(m.from)&&!this.blocked(id,m.from));return {...s,events:[],topic:this.topic(me.room),preferences:structuredClone(prefs),rooms:CAMP_ROOMS.map((room,i)=>({id:room,label:`모닥불 ${i+1}`,people:[...this.clients.values()].filter(p=>p.room===room).length})),moderationTargets:[...new Set([...prefs.muted,...prefs.blocked])].map(target=>({id:target,nickname:this.members.get(target)?.nickname||'이전 방문자'}))};}
 action(id,input){this.member(id);const p=this.clients.get(id);if(!p)throw Error('입장이 필요합니다.');if(!input||typeof input!=='object')throw Error('요청을 확인해 주세요.');
 if(input.type==='camp-switch'){const room=input.room;if(!CAMP_ROOMS.includes(room))throw Error('모닥불을 확인해 주세요.');if(p.room===room)return {ok:true};if([...this.clients.values()].filter(q=>q.room===room).length>=6)throw Error('이 모닥불은 6명이 함께하고 있어요.');Object.assign(p,{room,x:0,z:5.8,yaw:Math.PI,seat:null,standFrom:null,motion:'idle',epoch:p.epoch+1,seq:0,lastMove:this.clock(),moveCredit:2.1});return {ok:true};}
 if(input.type==='listen'){p.listening=input.value===true;return {ok:true};}
 if(input.type==='mute'||input.type==='block'){const target=input.target;if(target===id||!this.members.has(target))throw Error('대상을 확인해 주세요.');const list=this.prefs(id)[input.type==='mute'?'muted':'blocked'];if(input.value===false){const n=list.indexOf(target);if(n>=0)list.splice(n,1);}else if(!list.includes(target)){if(list.length>=100)throw Error('목록이 가득 찼어요.');list.push(target);}return {ok:true};}
 if(input.type==='host'&&input.command==='camp-question'){this.host(id);this.topics[p.room]={day:koreaDay(this.clock()),text:moderateText(input.value?.question)};return {ok:true};}
 if(input.type==='chat'){if(p.listening)throw Error('듣기 모드를 끄면 이야기할 수 있어요.');const text=moderateText(input.text);if(this.messages.some(m=>m.from===id&&m.text===text&&this.clock()-m.at<30000))throw Error('같은 내용은 잠시 후 다시 보내주세요.');return super.action(id,{...input,text,scope:input.scope==='whisper'?'whisper':'public'});}
 if(!['move','sit','stand','emote','report','host'].includes(input.type))throw Error('캠핑장에서 지원하지 않는 동작이에요.');
 if(input.type==='host'&&!['kick'].includes(input.command))throw Error('캠핑장 관리 동작을 확인해 주세요.');
 return super.action(id,input);
 }
}
export function serializeCamp(s){return {...serializeStore(s),preferences:[...s.preferences],topics:s.topics};}
export function restoreCamp(data,clock=()=>Date.now()){const s=new CampStore({clock});if(data?.meeting){const restored=restoreStore(data,clock);for(const k of ['members','clients','orders','choices','meeting','messages','notes','events','reports','placedItems','metrics','content'])s[k]=restored[k];s.preferences=new Map(data.preferences||[]);s.topics=data.topics||{};}return s;}
