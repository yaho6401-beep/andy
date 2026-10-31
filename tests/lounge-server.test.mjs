import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';
let admin=false,saved=null;const mutations=[];
const json=(v,s=200,headers={})=>new Response(JSON.stringify(v),{status:s,headers});
const ctx=vm.createContext({URL,URLSearchParams,Response,Blob,crypto:webcrypto,fetch:async(url,opts={})=>{
 if(opts.method==='DELETE'){mutations.push('delete');return json([]);}
 if(opts.method==='POST'){saved=JSON.parse(opts.body);mutations.push('insert');return json([]);}
 if(opts.method==='PATCH'){mutations.push('status');assert.deepEqual(JSON.parse(opts.body),{status:'invited'});return json([{id:'11111111-1111-4111-8111-111111111111'}]);}
 if(url.includes('contact_hash=eq.'))return json([{receipt:saved.receipt}]);
 return json([{id:'11111111-1111-4111-8111-111111111111',contact_value:'private_contact',status:'pending'}],200,{'content-range':'0-0/1'});
}});
vm.runInContext(stripTypeScriptTypes(await readFile(new URL('../supabase/functions/feedback-wall/lounge.ts',import.meta.url),'utf8')).replace('export async function','async function'),ctx);
const deps={url:'https://test.invalid',dbHeaders:{apikey:'server-only'},reply:json,limited:async()=>true,sessionHash:async()=>admin?'valid-admin':null,visitorHash:async s=>'hashed-'+s,cleanText:v=>typeof v==='string'?v.trim():''};
const request=(path,body)=>new Request('https://test.invalid/lounge/'+path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
for(const [p,b]of [['applications',undefined],['applications/status',{id:'11111111-1111-4111-8111-111111111111',status:'invited'}],['applications/delete',{id:'11111111-1111-4111-8111-111111111111'}]])assert.equal((await ctx.handleLounge(request(p,b),deps)).status,401);
assert.equal(mutations.length,0);
const input={nickname:'향기 손님',ageGroup:'late_teens',contactType:'instagram',contact:'@Scent_Friend',message:'나의 이야기',singleConsent:true,privacyConsent:true,status:'invited'};
assert.equal((await ctx.handleLounge(request('apply',{...input,privacyConsent:false}),deps)).status,400);
assert.equal((await ctx.handleLounge(request('apply',{...input,contact:'https://instagram.com/user'}),deps)).status,400);
assert.equal((await ctx.handleLounge(request('apply',{...input,contactType:'phone',contact:'invalid'}),deps)).status,400);
assert.equal((await ctx.handleLounge(request('apply',null),deps)).status,400);
for(const patch of [{ageGroup:undefined},{ageGroup:'forged'},{message:''},{message:'   '}])assert.equal((await ctx.handleLounge(request('apply',{...input,...patch}),deps)).status,400);
const response=await ctx.handleLounge(request('apply',input),deps),body=await response.json();assert.equal(response.status,201);assert.match(body.receipt,/^SOLO-[A-F0-9]{12}$/);assert.equal(saved.contact_value,'scent_friend');assert.equal(saved.age_group,'late_teens');assert.equal(saved.consent_version,'solo-2026-10-v2');assert.equal(saved.status,undefined);assert.equal(saved.expires_at,undefined);assert.equal(JSON.stringify(body).includes('scent_friend'),false);
admin=true;const listing=await ctx.handleLounge(request('applications'),deps);assert.equal(listing.status,200);assert.equal((await listing.json()).items[0].contact_value,'private_contact');
assert.equal((await ctx.handleLounge(request('applications/status',{id:'11111111-1111-4111-8111-111111111111',status:'invited',contact_value:'forged'}),deps)).status,200);
assert.equal((await ctx.handleLounge(request('apply',input),{...deps,limited:async()=>false})).status,429);
console.log('Lounge contacts require admin auth; consent, contact validation, normalization, rate limiting and server-controlled status/expiry passed.');
