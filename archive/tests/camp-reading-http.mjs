// Explicit integration check for the isolated reading preview. No real user records are changed.
import assert from 'node:assert/strict';
const endpoint='https://jqlrwwheiwjdrobluifx.supabase.co/functions/v1/archive-reading-preview?forceFunctionRegion=eu-west-1',key='sb_publishable_jQ8AERL_i5ecVFbM0NgX_g_rAxIBPTb';
const owner=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(n=>n.toString(16).padStart(2,'0')).join('');
const a=owner(),b=owner(),records=[];
async function call(action,data={},token=a,expected=200){const r=await fetch(endpoint,{method:'POST',headers:{apikey:key,'content-type':'application/json','x-region':'eu-west-1','x-reader-token':token,origin:'https://andy-git-feat-camp-reading-and-graphics-asdf-15dc.vercel.app'},body:JSON.stringify({op:'reading',action,...data}),signal:AbortSignal.timeout(20000)});const d=await r.json();assert.equal(r.status,expected,JSON.stringify({status:r.status,error:d.error}));return d;}
const started=Date.now();
try{
 await call('register');await call('register',{},b);const today=await call('today');assert.ok(today.quote.text);assert.ok(today.quote.author);assert.ok(today.quote.source);assert.equal(today.tags.length,5);
 const bookmark=await call('bookmark',{quoteId:today.quote.id,tag:'woody'});records.push({kind:'bookmark',id:bookmark.id});await call('bookmark',{quoteId:today.quote.id,tag:'musk'});let own=await call('shelf');assert.equal(own.bookmarks.length,1);assert.equal(own.bookmarks[0].tag,'musk');
 const note=await call('reflection',{quoteId:today.quote.id,text:'비공개 검수 감상',tag:'lavender'});records.push({kind:'reflection',id:note.id});assert.equal((await call('today',{},b)).reflections.some(r=>r.id===note.id),false);
 const book=await call('book-save',{title:'검수용 책 기록',author:'검수 작가',note:'비공개 검수 기록입니다.',tag:'floral'});records.push({kind:'book',id:book.id});assert.equal((await call('shelf',{},b)).books.some(r=>r.id===book.id),false);
 await call('book-save',{id:book.id,title:'수정 시도',author:'',note:'',tag:'musk'},b,403);await call('delete',{kind:'book',id:book.id},b,403);
 await call('visibility',{kind:'reflection',id:note.id,visibility:'public'});assert.ok((await call('today',{},b)).reflections.some(r=>r.id===note.id&&r.tag==='lavender'));
 await call('visibility',{kind:'reflection',id:note.id,visibility:'private'});assert.equal((await call('today',{},b)).reflections.some(r=>r.id===note.id),false);
 const restored=await call('shelf');assert.ok(restored.books.some(r=>r.id===book.id));assert.equal(JSON.stringify(restored).includes(a),false);assert.equal(JSON.stringify(restored).includes('"hash"'),false);
 await call('admin-list',{},b,403);
 console.log(JSON.stringify({result:'PASS',checks:['daily quote and attribution','five scent tags','idempotent bookmark','private reflection','private book','ownership rejection','public/private reversal','persistent shelf','admin rejection','token redaction'],durationMs:Date.now()-started}));
}finally{let cleaned=0;for(const record of records){try{await call('delete',record);cleaned++;}catch{}}console.log(JSON.stringify({ownTestRecordsCleaned:cleaned,ownTestRecords:records.length}));}
