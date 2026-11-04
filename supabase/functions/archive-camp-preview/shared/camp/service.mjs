import {CampStore,restoreCamp,serializeCamp} from './store.mjs';
import {clean} from '../src/protocol.js';
const fail=(message,status=400)=>Object.assign(Error(message),{status});
// Called only while holding the preview row lock. Raw tokens never enter stored data.
export function campRequest(data,input,auth){
 const {now,tokenHash,issuedHash,adminHash,ipHash}=auth;
 const s=restoreCamp(data?.store,()=>now),sessions=(data?.sessions||[]).filter(x=>x.expiresAt>now),limits=(data?.limits||[]).filter(x=>now-x.at<60000);
 for(const [id,p]of s.clients)if(now-(p.lastSeen||0)>45000)s.leave(id);
 s.messages=s.messages.filter(m=>now-m.at<3600000).slice(-200);s.reports=s.reports.filter(r=>now-r.at<7*86400000).slice(-100);
 const activeIds=new Set(sessions.map(x=>x.id));for(const [id,m]of s.members)if(!activeIds.has(id)&&!s.clients.has(id)&&!m.blocked){s.members.delete(id);s.preferences.delete(id);}
 let session=sessions.find(x=>x.hash===tokenHash),newSession=false;
 if(input.op==='join'){
  if(input.adult!==true)throw fail('성인 이용 동의를 확인해 주세요.');
  if(!session){const count=limits.filter(x=>x.ip===ipHash).length;if(count>=30)throw fail('입장 요청이 많아요. 잠시 후 다시 와주세요.',429);if(!issuedHash)throw fail('세션 정보를 확인해 주세요.');limits.push({ip:ipHash,at:now});session={hash:issuedHash,id:crypto.randomUUID(),nickname:clean(input.nickname,16),role:adminHash?'host':'guest',adminHash:adminHash||null,expiresAt:now+2*3600000};sessions.push(session);newSession=true;}
 }else if(!session)throw fail('입장 세션이 만료됐어요. 다시 입장해 주세요.',401);
 if(!session)throw fail('입장이 필요합니다.',401);
 const id=session.id;
 if(s.members.get(id)?.blocked)throw fail('진행자가 입장을 제한했어요.',403);
 const connectionId=clean(input.connectionId,60);
 if(input.op==='join'){
  const old=s.clients.get(id);if(old&&old.connectionId!==connectionId)throw fail('이미 다른 화면에서 접속 중이에요.',409);
  if(!old){s.seed(id,session.nickname,session.role);s.join(id,input.appearance);}
  Object.assign(s.clients.get(id),{connectionId,lastSeen:now,lastRequest:now,lastBatch:0,lastReceipts:[]});
 }else{const p=s.clients.get(id);if(!p)throw fail('연결이 오래 끊겼어요. 다시 입장해 주세요.',410);if(p.connectionId!==connectionId)throw fail('다른 화면의 접속 요청입니다.',409);if(input.op==='tick'&&now-p.lastRequest<180)throw fail('요청이 너무 빠릅니다.',429);p.lastSeen=now;p.lastRequest=now;}
 const p=s.clients.get(id);let out;
 if(input.op==='leave'){s.leave(id);out={ok:true};}
 else if(input.op==='admin'){s.host(id);out={reports:s.admin(id).reports,members:s.admin(id).members};}
 else if(input.op==='join'||input.op==='tick'){
  let receipts=[];
  if(input.op==='tick'){const batch=input.batch;if(!Number.isSafeInteger(batch)||batch<1||!Array.isArray(input.actions)||input.actions.length>12)throw fail('요청 순서를 확인해 주세요.');if(batch>p.lastBatch){for(const action of input.actions){try{const result=s.action(id,action);receipts.push({action:action?.type,...result});}catch(e){receipts.push({action:action?.type,error:e.message});}}p.lastBatch=batch;p.lastReceipts=receipts;}else if(batch===p.lastBatch)receipts=p.lastReceipts;}
  out={ok:true,id,newSession,snapshot:s.snapshot(id),batch:p.lastBatch,receipts,serverMode:'camp-preview'};
 }else throw fail('요청을 확인해 주세요.');
 return {data:{store:serializeCamp(s),sessions,limits:limits.slice(-1000)},out};
}
