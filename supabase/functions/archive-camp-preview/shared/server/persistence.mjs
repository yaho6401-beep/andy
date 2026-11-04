import {ArchiveStore} from './room-store.mjs';
const maps=['members','clients','orders','choices'];
export function restoreStore(data,clock=()=>Date.now()){
 const s=new ArchiveStore({clock});s.members.clear();if(data?.meeting){for(const k of maps)s[k]=new Map((data[k]||[]).map(([id,p])=>[id,k==='clients'?{...p,send:()=>{}}:p]));for(const k of ['meeting','messages','notes','events','reports','placedItems','metrics','content'])if(data[k]!==undefined)s[k]=data[k];}
 else{s.meeting.name='책과향기 커뮤니티 라운지';s.meeting.id='community';s.meeting.endsAt=253402214400000;s.meeting.ageCondition='성인 이용 동의 · 공용 라운지';}
 return s;
}
export function serializeStore(s){const data={};for(const k of maps)data[k]=[...s[k]].map(([id,p])=>{if(k!=='clients')return [id,p];const {send,...safe}=p;return [id,safe];});for(const k of ['meeting','messages','notes','events','reports','placedItems','metrics','content'])data[k]=s[k];return data;}
export function expirePlayers(s,now){for(const [id,p]of s.clients)if(now-(p.lastSeen||0)>45000)s.leave(id);s.messages=s.messages.filter(m=>now-m.at<3600000).slice(-200);s.events=s.events.filter(m=>now-m.at<3600000).slice(-8);s.reports=s.reports.filter(m=>now-m.at<7*86400000).slice(-100);s.notes=s.notes.filter(n=>now-n.at<30*86400000).slice(-300);for(const id of [...s.members.keys()])if(!s.clients.has(id)&&!s.members.get(id).blocked)s.members.delete(id);for(const [id,o]of s.orders)if(!s.clients.has(id)&&now-o.readyAt>600000)s.orders.delete(id);}
