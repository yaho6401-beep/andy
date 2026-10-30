import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {Blob,File} from 'node:buffer';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';

const id='11111111-1111-4111-8111-111111111111';
let row={id,storage_path:id+'.jpg',nickname:'사진 손님',caption:'나의 향수',created_at:'2026-10-30T00:00:00Z',password_hash:'private-hash',salt:'private-salt',iterations:210000};
const mutations=[];
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers});
const ctx=vm.createContext({URL,URLSearchParams,Blob,File,Response,crypto:webcrypto,fetch:async(url,options={})=>{
  if(url.includes('/storage/v1/object/')){mutations.push('storage');return json([]);}
  if(options.method==='DELETE'){mutations.push('metadata');row=null;return json([]);}
  const query=new URL(url).searchParams;
  if(query.has('id'))return json(row?[row]:[]);
  assert.equal(query.get('select'),'id,nickname,caption,storage_path,created_at');
  const {password_hash,salt,iterations,...publicRow}=row;
  return json([publicRow],200,{'content-range':'0-0/1'});
}});
const source=await readFile(new URL('../supabase/functions/feedback-wall/gallery.ts',import.meta.url),'utf8');
vm.runInContext(stripTypeScriptTypes(source).replace('export async function','async function'),ctx);
const deps={url:'https://test.invalid',dbHeaders:{apikey:'server-only'},reply:json,limited:async()=>true,sessionHash:async()=>null,passwordHash:async p=>p==='correct-password'?'private-hash':'wrong',equalHash:(a,b)=>a===b,cleanText:s=>typeof s==='string'?s.trim():''};
const listing=await ctx.handleGallery(new Request('https://test.invalid/gallery'),deps);
const publicData=await listing.json();
assert.equal(publicData.total,1);assert.ok(publicData.items[0].image_url.endsWith(id+'.jpg'));
assert.ok(!JSON.stringify(publicData).includes('private-'));
const request=password=>new Request('https://test.invalid/gallery/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,password})});
const wrong=await ctx.handleGallery(request('wrong-password'),deps);assert.equal(wrong.status,401);assert.deepEqual(mutations,[]);
const removed=await ctx.handleGallery(request('correct-password'),deps);assert.equal(removed.status,200);assert.deepEqual(mutations,['storage','metadata']);assert.equal(row,null);
const invalid=await ctx.handleGallery(new Request('https://test.invalid/gallery',{method:'POST',headers:{'Content-Type':'text/plain'},body:'not an image'}),deps);assert.equal(invalid.status,415);
const limited=await ctx.handleGallery(request('correct-password'),{...deps,limited:async()=>false});assert.equal(limited.status,429);
console.log('Gallery listing protects password fields; wrong password and rate limits block deletion; successful deletion removes photo before metadata.');
