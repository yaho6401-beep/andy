import postgres from 'npm:postgres@3.4.8';
import {readingRequest} from './shared/reading-service.mjs';
const ROW='camp-reading-preview-v1';
const keys=new Set([...Object.values(JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}')),Deno.env.get('SUPABASE_ANON_KEY')].filter(Boolean));
const allowedOrigin=(origin:string)=>/^https:\/\/andy-[a-z0-9-]+-asdf-15dc\.vercel\.app$/.test(origin)||/^http:\/\/(localhost|127\.0\.0\.1):417[34]$/.test(origin);
const digest=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(v=>v.toString(16).padStart(2,'0')).join('');
Deno.serve(async req=>{
 const origin=req.headers.get('origin'),headers:Record<string,string>={'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
 if(origin&&allowedOrigin(origin))Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'apikey,content-type,authorization,x-region,x-reader-token','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Max-Age':'3600'});
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!allowedOrigin(origin))return reply({error:'미리보기 주소에서만 접속할 수 있어요.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'POST 요청만 지원해요.'},405);
 if(!keys.has(req.headers.get('apikey')||''))return reply({error:'접속 정보를 확인해 주세요.'},401);
 let sql;
 try{
  const raw=await req.text();if(raw.length>16000)return reply({error:'요청이 너무 큽니다.'},413);
  const input=JSON.parse(raw);if(input.op!=='reading'||typeof input.action!=='string')return reply({error:'책장 요청을 확인해 주세요.'},400);
  const readerToken=req.headers.get('x-reader-token')||'',readerHash=/^[0-9a-f]{64}$/.test(readerToken)?await digest(readerToken):'';
  const token=req.headers.get('authorization')?.replace(/^Bearer /,'')||'',adminHash=/^[0-9a-f]{64}$/.test(token)?await digest(token):'';
  const ipHash=await digest((req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown')+new Date().toISOString().slice(0,10));
  sql=postgres(Deno.env.get('SUPABASE_DB_URL')!,{max:1,idle_timeout:2,connect_timeout:10,prepare:false,ssl:'require',connection:{application_name:'books_scents_reading_preview'}});
  const out=await sql.begin(async tx=>{
   await tx.unsafe("set local statement_timeout='6000ms'");await tx.unsafe("set local lock_timeout='4000ms'");
   let adminVerified=false;
   if(input.action.startsWith('admin-')&&adminHash){const valid=await tx.unsafe('select token_hash from public.workshop_feedback_sessions where token_hash=$1 and expires_at>now()',[adminHash]);adminVerified=valid.length>0;}
   const rows=await tx.unsafe('select state from archive_private.rooms where id=$1 for update',[ROW]);if(!rows.length)throw Object.assign(Error('책장을 준비하고 있어요.'),{status:503});
   const data=typeof rows[0].state==='string'?JSON.parse(rows[0].state):rows[0].state;
   const result=readingRequest(data,input,{now:Date.now(),readerHash,adminVerified,ipHash});
   await tx.unsafe('update archive_private.rooms set state=$1::text::jsonb,updated_at=now() where id=$2',[JSON.stringify(result.data),ROW]);
   return result.out;
  });return reply(out);
 }catch(e){if(e.code){console.error('reading preview database error',e.code);return reply({error:'책장 연결이 지연되고 있어요. 잠시 후 다시 시도해 주세요.'},503);}return reply({error:e.message||'책장 연결 오류'},e.status||400);}finally{if(sql)await sql.end({timeout:1});}
});
