import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',recordA='33333333-3333-4333-8333-333333333333',recordB='44444444-4444-4444-8444-444444444444';
const tokenA='a'.repeat(64),tokenB='b'.repeat(64);let admin=false,lastInsert,lastPatch;let rows=[{id:recordA,account_id:A,title:'A 기록',staff_note:'직원 전용'},{id:recordB,account_id:B,title:'B 기록'}];
const json=(v,status=200,headers={})=>new Response(JSON.stringify(v),{status,headers});
const ctx=vm.createContext({URL,URLSearchParams,Response,Blob,crypto:webcrypto,fetch:async(url,opts={})=>{
 const u=new URL(url),p=u.searchParams,table=u.pathname.split('/').pop();
 if(table==='workshop_scent_sessions'){if(opts.method==='POST')return json([{}]);assert.ok(p.get('expires_at')?.startsWith('gt.'));const hash=p.get('token_hash');return json(hash==='eq.hash-'+tokenA?[{account_id:A}]:hash==='eq.hash-'+tokenB?[{account_id:B}]:[]);}
 if(table==='workshop_scent_accounts')return json([{id:A,nickname:'테스트',salt:'salt',password_hash:'hash-correct-password'}]);
 if(table==='workshop_scent_records'){
  if(opts.method==='POST'){lastInsert=JSON.parse(opts.body);rows.push(lastInsert);return json([{id:lastInsert.id}],201);}
  const matched=rows.filter(r=>(!p.get('id')||p.get('id')==='eq.'+r.id)&&(!p.get('account_id')||p.get('account_id')==='eq.'+r.account_id));
  if(opts.method==='PATCH'){lastPatch=JSON.parse(opts.body);for(const row of matched)Object.assign(row,lastPatch);return json(matched.map(r=>({id:r.id})));}
  if(opts.method==='DELETE'){rows=rows.filter(r=>!matched.includes(r));return json(matched.map(r=>({id:r.id})));}
  return json(matched.map(r=>p.get('select')?.includes('staff_note')?r:Object.fromEntries(Object.entries(r).filter(([k])=>k!=='staff_note'))),200,{'content-range':'0-0/'+matched.length});
 }
 if(table==='workshop_feedback')return json([]);
 throw Error('Unexpected database call '+table);
}});
vm.runInContext(stripTypeScriptTypes(await readFile(new URL('../supabase/functions/feedback-wall/journal.ts',import.meta.url),'utf8')).replace('export async function','async function'),ctx);
const deps={url:'https://test.invalid',dbHeaders:{apikey:'private'},reply:json,limited:async()=>true,sessionHash:async()=>admin?'admin-session':null,digest:async s=>'hash-'+s,passwordHash:async s=>'hash-'+s,equalHash:(a,b)=>a===b,cleanText:s=>typeof s==='string'?s.trim():''};
const req=(path,body,token)=>new Request('https://test.invalid/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
for(const path of ['journal/records','management/summary','management/records','management/memos'])assert.equal((await ctx.handleJournal(req(path),deps)).status,401);
assert.equal((await ctx.handleJournal(req('journal/records',undefined,'bad'),deps)).status,401);
const mine=await ctx.handleJournal(req('journal/records',undefined,tokenA),deps);assert.equal(mine.status,200);const own=await mine.json();assert.equal(own.items.length,1);assert.equal(own.items[0].id,recordA);assert.equal(own.items[0].staff_note,undefined);
const update={id:recordB,title:'도용',stage:'made',reflection:'changed',nextPlan:'next',account_id:B,staffNote:'forged'};
assert.equal((await ctx.handleJournal(req('journal/records/update',update,tokenA),deps)).status,404);
assert.equal((await ctx.handleJournal(req('journal/records/delete',{id:recordB},tokenA),deps)).status,404);
assert.equal(rows.find(r=>r.id===recordB).title,'B 기록');
assert.equal((await ctx.handleJournal(req('journal/records/update',{...update,id:recordA},tokenA),deps)).status,200);assert.equal(lastPatch.account_id,undefined);assert.equal(lastPatch.staff_note,undefined);
const save={id:'55555555-5555-4555-8555-555555555555',title:'새 조합',mainId:'main-3',singleIds:['single-top-1','single-top-1','single-base-10'],sentence:'부드러운 향',stage:'saved',reflection:'',nextPlan:'',account_id:B,staff_note:'forged'};
assert.equal((await ctx.handleJournal(req('journal/records',{...save,mainId:'main-73'},tokenA),deps)).status,400);
assert.equal((await ctx.handleJournal(req('journal/records',{...save,singleIds:['single-top-11']},tokenA),deps)).status,400);
assert.equal((await ctx.handleJournal(req('journal/records',save,tokenA),deps)).status,201);assert.equal(lastInsert.account_id,A);assert.equal(lastInsert.staff_note,undefined);assert.equal(lastInsert.single_ids.length,2);
assert.equal((await ctx.handleJournal(req('journal/login',{nickname:'테스트',password:'incorrect-password'}),deps)).status,401);
assert.equal((await ctx.handleJournal(req('journal/register',{nickname:'테스트',password:'correct-password',consent:false}),deps)).status,400);
const login=await ctx.handleJournal(req('journal/login',{nickname:'테스트',password:'correct-password'}),deps);assert.equal(login.status,200);const body=await login.json();assert.match(body.token,/^[a-f0-9]{64}$/);assert.equal(body.password_hash,undefined);
admin=true;const all=await ctx.handleJournal(req('management/records'),deps);assert.equal((await all.json()).items.length,3);
assert.equal((await ctx.handleJournal(req('management/records/update',{id:recordA,stage:'next',staffNote:'상담 메모'}),deps)).status,200);assert.equal(lastPatch.staff_note,'상담 메모');
assert.equal((await ctx.handleJournal(req('journal/records',save,tokenB),{...deps,limited:async()=>false})).status,429);
console.log('Journal ownership, private staff notes, cross-user edit/delete rejection, catalog validation, duplicate-note normalization, login, consent and administrator controls passed.');
