import postgres from 'npm:postgres@3.4.8';
import {restoreStore,serializeStore,expirePlayers} from './shared/server/persistence.mjs';
import {clean} from './shared/src/protocol.js';
const createSql=()=>postgres(Deno.env.get('SUPABASE_DB_URL')!,{max:1,idle_timeout:2,connect_timeout:10,prepare:false,ssl:'require',connection:{application_name:'books_scents_archive'}});
const keys=new Set([...Object.values(JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}')),Deno.env.get('SUPABASE_ANON_KEY')].filter(Boolean));
const allowedOrigin=(o:string)=>o==='https://andy-plum.vercel.app'||/^https:\/\/andy-[a-z0-9-]+-asdf-15dc\.vercel\.app$/.test(o)||o==='http://127.0.0.1:4174';
const hex=(a:ArrayBuffer)=>Array.from(new Uint8Array(a)).map(b=>b.toString(16).padStart(2,'0')).join('');
const digest=async(t:string)=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)));
const fail=(message:string,status=400)=>Object.assign(Error(message),{status});
const receiptTypes=new Set(['note','delete-note','order','pickup','place-order','clear-order','sit','stand','barista-duty','like','report']);
const allowed=new Set(['move','room','chat','emote','note','delete-note','order','pickup','place-order','clear-order','sit','stand','barista-duty','profile','balance','report','like','host']);
Deno.serve(async req=>{
 const origin=req.headers.get('origin'),headers:Record<string,string>={'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
 if(origin&&allowedOrigin(origin))Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'apikey,content-type,authorization,x-region','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Max-Age':'3600'});
 const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(origin&&!allowedOrigin(origin))return reply({error:'허용되지 않은 접속 주소입니다.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'POST 요청만 지원해요.'},405);
 if(!keys.has(req.headers.get('apikey')||''))return reply({error:'접속 정보를 확인해 주세요.'},401);
 const sql=createSql();
 try{
 const raw=await req.text();if(raw.length>32000)throw fail('요청이 너무 큽니다.',413);const input=JSON.parse(raw),op=input.op;
 if(!['join','tick','leave','admin'].includes(op))throw fail('요청을 확인해 주세요.');
 const token=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 const tokenHash=/^[0-9a-f]{64}$/.test(token)?await digest(token):'';
 let issuedToken:string|null=null;
 const result=await sql.begin(async tx=>{
 const q=(query:string,params:any[]=[])=>tx.unsafe(query,params);
 await q("set local statement_timeout='6000ms'");await q("set local lock_timeout='4000ms'");
 let session=tokenHash?(await q('select * from archive_private.sessions where token_hash=$1 and expires_at>now()',[tokenHash]))[0]:null;
 if(op==='join'&&!session){
  if(input.adult!==true)throw fail('성인 이용 동의를 확인해 주세요.');
  const nickname=clean(input.nickname,16),ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown',limitKey=await digest(new Date().toISOString().slice(0,16)+ip);
  const limits=await q("insert into archive_private.join_limits(key,expires_at) values($1,now()+interval '2 minutes') on conflict(key) do update set count=archive_private.join_limits.count+1 returning count",[limitKey]);if(limits[0].count>30)throw fail('입장 요청이 많아요. 잠시 후 다시 시도해 주세요.',429);
  let role='guest',adminHash=null;
  if(input.adminToken){adminHash=await digest(String(input.adminToken));const valid=await q('select token_hash from public.workshop_feedback_sessions where token_hash=$1 and expires_at>now()',[adminHash]);if(!valid.length)throw fail('관리자 로그인이 만료됐어요.',403);role='host';}
  issuedToken=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
  session={token_hash:await digest(issuedToken),player_id:crypto.randomUUID(),nickname,role,admin_hash:adminHash};
  await q("insert into archive_private.sessions(token_hash,player_id,nickname,role,admin_hash,expires_at) values($1,$2,$3,$4,$5,now()+interval '2 hours')",[session.token_hash,session.player_id,nickname,role,adminHash]);
 }
 if(!session)throw fail('입장 세션이 만료됐어요. 다시 입장해 주세요.',401);
 if(session.role==='host'){const valid=await q('select token_hash from public.workshop_feedback_sessions where token_hash=$1 and expires_at>now()',[session.admin_hash]);if(!valid.length)throw fail('관리자 인증이 만료됐어요.',403);}
 const row=(await q("select state from archive_private.rooms where id='community' for update"))[0];
 const now=Date.now(),s=restoreStore(typeof row.state==='string'?JSON.parse(row.state):row.state),id=session.player_id;expirePlayers(s,now);
 if(s.members.get(id)?.blocked)throw fail('진행자가 이 라운지의 입장을 제한했어요.',403);
 if(op==='join'){
  const active=s.clients.get(id);if(active&&active.connectionId!==input.connectionId)throw fail('이미 다른 화면에서 접속 중이에요.',409);
  if(!active){const guests=[...s.clients.values()].filter(p=>p.role==='guest').length;if(session.role==='guest'&&guests>=19)throw fail('손님 좌석이 가득 찼어요. 잠시 후 입장해 주세요.',409);s.seed(id,session.nickname,session.role);s.join(id,input.appearance);}
  const p=s.clients.get(id);p.connectionId=clean(input.connectionId,60);p.lastSeen=now;p.lastRequest=now;p.lastBatch=0;p.lastReceipts=[];
 }else{
  const p=s.clients.get(id);if(!p)throw fail('연결이 오래 끊겼어요. 다시 입장해 주세요.',410);
  if(p.connectionId!==input.connectionId)throw fail('다른 화면의 접속 요청입니다.',409);
  if(op==='tick'&&now-(p.lastRequest||0)<180)throw fail('요청이 너무 빠릅니다.',429);p.lastRequest=now;p.lastSeen=now;
 }
 const p=s.clients.get(id);let out:any;
 if(op==='leave'){s.leave(id);out={ok:true};}
 else if(op==='admin'){s.host(id);out=s.admin(id);}
 else{
  let receipts:any[]=[];
  if(op==='tick'){
   const actions=Array.isArray(input.actions)?input.actions:[];if(actions.length>12)throw fail('한 번에 요청이 너무 많아요.');
   const batch=Number(input.batch);if(!Number.isSafeInteger(batch)||batch<1)throw fail('요청 순서를 확인해 주세요.');
   if(batch>p.lastBatch){for(const action of actions){try{if(!allowed.has(action?.type))throw fail('허용되지 않은 동작이에요.');const value=s.action(id,action);if(receiptTypes.has(action.type))receipts.push({action:action.type,...value});}catch(e){receipts.push({action:action?.type,error:e.message});}}p.lastBatch=batch;p.lastReceipts=receipts;}
   else if(batch===p.lastBatch)receipts=p.lastReceipts||[];
  }
  const snapshot=s.snapshot(id),notesVersion=s.notes.length+':'+(s.notes.at(-1)?.id||'');
  if(input.notesVersion===notesVersion)delete snapshot.notes;
  if(input.contentVersion===s.meeting.version)delete snapshot.content;
  out={ok:true,id,token:issuedToken||undefined,snapshot,receipts,notesVersion,contentVersion:s.meeting.version,batch:p.lastBatch,serverMode:'shared'};
 }
 s.metrics.httpRequests=(s.metrics.httpRequests||0)+1;s.metrics.sent++;s.metrics.bytes+=JSON.stringify(out).length;
 await q("update archive_private.rooms set state=$1::text::jsonb,updated_at=now() where id='community'",[JSON.stringify(serializeStore(s))]);
 if(op==='join'){await q('delete from archive_private.sessions where expires_at<now()');await q('delete from archive_private.join_limits where expires_at<now()');}
 return out;
 });
 return reply(result);
 }catch(e){const status=e.status||(/권한|승인|관리자/.test(e.message)?403:400);if(e.code){console.error('archive database error',e.code);return reply({error:'라운지 서버 연결이 지연되고 있어요. 잠시 후 다시 시도해 주세요.',code:String(e.code)},503);}return reply({error:e.message||'연결 오류'},status);}finally{await sql.end({timeout:1});}
});
