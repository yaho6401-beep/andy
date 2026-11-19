import postgres from 'npm:postgres@3.4.8';
import {memberService} from './shared/server/member-service.mjs';
const keys=new Set([...Object.values(JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}')),Deno.env.get('SUPABASE_ANON_KEY')].filter(Boolean));
Deno.serve(async req=>{
 const headers={'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 // Browser credentials stay on the site's same-origin HttpOnly cookie proxy.
 if(req.method!=='POST')return reply({error:'POST 요청만 지원해요.'},405);
 if(!keys.has(req.headers.get('apikey')||''))return reply({error:'접속 정보를 확인해 주세요.'},401);
 const sql=postgres(Deno.env.get('SUPABASE_DB_URL')!,{max:1,idle_timeout:2,connect_timeout:10,prepare:false,ssl:'require',connection:{application_name:'books_scents_members',statement_timeout:6000}});
 try{const raw=await req.text();if(raw.length>28000)return reply({error:'내용이 너무 길어요.'},413);const input=JSON.parse(raw);if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'요청을 확인해 주세요.'},400);
  const result=await memberService({input,token:req.headers.get('authorization')?.replace(/^Bearer /,'')||'',ip:req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown',sql});return reply(result.body,result.status||200);
 }catch(e){if(e.code==='23505')return reply({error:'이미 가입된 번호예요. 로그인해 주세요.'},409);if(e.code){console.error('workshop account database error',e.code);return reply({error:'회원 서버 연결이 지연되고 있어요. 잠시 후 다시 시도해 주세요.'},503);}return reply({error:e.status?e.message:'요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'},e.status||400);}finally{await sql.end({timeout:1});}
});
