import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {Blob} from 'node:buffer';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';
let admin=false,allowed=true,row=null,deleted=0;
const calls=[],json=(value,status=200)=>new Response(JSON.stringify(value),{status});
const ctx=vm.createContext({URL,Blob,crypto:webcrypto,fetch:async(url,o={})=>{
  if(o.method==='POST'){row=JSON.parse(o.body);return json({},201);}
  if(o.method==='DELETE'){assert.ok(url.includes('scent_id=eq.main-3'));deleted++;const item=row;row=null;return json(item?[item]:[]);}
  return json(row?[{password_hash:row.password_hash,salt:row.salt,iterations:210000}]:[]);
}});
vm.runInContext(stripTypeScriptTypes(await readFile(new URL('../supabase/functions/feedback-wall/scent.ts',import.meta.url),'utf8')).replace('export async function','async function'),ctx);
const deps={url:'https://test.invalid',dbHeaders:{apikey:'server-only'},reply:json,rpc:async(name,body)=>{calls.push({name,body});if(name==='feedback_login_attempt')return json(true);if(name==='workshop_scent_page')return json({staff:[],reviews:[]});return json({saved:true});},limited:async()=>allowed,sessionHash:async()=>admin?'admin-session':null,visitorHash:async()=> 'a'.repeat(64),passwordHash:async p=>p==='test-password'?'private-hash':'wrong-hash',equalHash:(a,b)=>a===b,rateKeyFor:async()=> 'hashed-address',cleanText:s=>typeof s==='string'?s.trim():''};
const post=(path,body)=>new Request('https://test.invalid/scent'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const base={scentId:'main-3'};
let r=await ctx.handleScent(post('/staff',{...base,role:'owner',body:'사장 코멘트'}),deps);assert.equal(r.status,401);assert.equal(calls.length,0);
admin=true;r=await ctx.handleScent(post('/staff',{...base,role:'manager',body:'매니저 코멘트'}),deps);assert.equal(r.status,200);assert.equal(calls.at(-1).name,'workshop_scent_staff_write');assert.equal(calls.at(-1).body.p_role,'manager');
r=await ctx.handleScent(post('/staff',{...base,role:'owner',body:'가'.repeat(501)}),deps);assert.equal(r.status,400);admin=false;
r=await ctx.handleScent(new Request('https://test.invalid/scent?scent=main-73'),deps);assert.equal(r.status,400);
const id='11111111-1111-4111-8111-111111111111';
r=await ctx.handleScent(post('/review',{...base,id,nickname:'손님',body:'시향 소감',password:'test-password',role:'owner'}),deps);assert.equal(r.status,201);assert.equal(row.scent_id,'main-3');assert.equal(row.password_hash,'private-hash');assert.ok(!('password' in row));assert.ok(!('role' in row));
r=await ctx.handleScent(post('/delete',{...base,id,password:'wrong-password'}),deps);assert.equal(r.status,401);assert.equal(deleted,0);
r=await ctx.handleScent(post('/delete',{...base,id,password:'test-password'}),deps);assert.equal(r.status,200);assert.equal(deleted,1);
r=await ctx.handleScent(post('/like',{...base,target:'scent',visitor:id,liked:true}),deps);assert.equal(r.status,200);assert.equal(calls.at(-1).body.p_visitor_hash,'a'.repeat(64));assert.ok(!JSON.stringify(calls.at(-1)).includes(id));
allowed=false;r=await ctx.handleScent(post('/like',{...base,target:'scent',visitor:id,liked:true}),deps);assert.equal(r.status,429);
console.log('Staff roles require admin authentication; reviews cannot impersonate staff; scent IDs, password deletion, visitor hashing and rate limits passed.');
