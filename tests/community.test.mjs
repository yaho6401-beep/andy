import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{id,value:'',innerHTML:'',textContent:'',hidden:false,disabled:false,checked:true,dataset:{},listeners:{},addEventListener(k,f){this.listeners[k]=f;},querySelectorAll(){return [];},scrollIntoView(){},focus(){},showModal(){this.open=true;},close(){this.open=false;this.listeners.close?.();}});return elements.get(id);}
el('feedback-category').value='message';
let rows=Array.from({length:12},(_,i)=>({id:webcrypto.randomUUID(),body:'메모 '+i,nickname:'손님 '+i,animal:i%2?'dragon':'bunny',color:'sage',category:'message',created_at:new Date().toISOString(),hearts:0,liked:false,comments:0}));
let replies=[],settings={posting_open:true,comments_open:true,likes_open:true},heartCalls=0;
const context=vm.createContext({document:{getElementById:el},Intl,Date,Map,Set,AbortSignal,crypto:webcrypto,matchMedia:()=>({matches:false}),FeedbackConfig:{endpoint:'https://test.invalid/wall',key:'public'},fetch:async(url,options)=>{
  const parsed=new URL(url),path=parsed.pathname,payload=options.body?JSON.parse(options.body):{};
  const ok=data=>({ok:true,json:async()=>data});
  if(path.endsWith('/admin/login'))return ok({token:'mock-admin'});
  if(path.endsWith('/admin/logout'))return ok({loggedOut:true});
  if(path.endsWith('/admin/stats'))return ok({visitors:4,views:9,bookingClicks:2});
  if(path.endsWith('/admin/settings')){assert.equal(options.headers.Authorization,'Bearer mock-admin');settings=payload;return ok({settings});}
  if(path.endsWith('/admin/hearts')){assert.equal(options.headers.Authorization,'Bearer mock-admin');const row=rows.find(r=>r.id===payload.id);row.hearts=0;row.liked=false;return ok({hearts:0});}
  if(path.endsWith('/heart')){heartCalls++;const row=rows.find(r=>r.id===payload.id);row.hearts=payload.liked?1:0;row.liked=payload.liked;return ok({hearts:row.hearts,liked:row.liked});}
  if(path.endsWith('/comments')){
    if(options.method==='POST'){replies.push({...payload,created_at:new Date().toISOString()});return ok({item:replies.at(-1)});}
    const items=replies.filter(r=>r.feedback_id===parsed.searchParams.get('id'));return ok({items,page:1,pages:1,total:items.length});
  }
  if(options.method==='DELETE'){assert.equal(options.headers.Authorization,'Bearer mock-admin');if(parsed.searchParams.get('target')==='comment')replies=replies.filter(r=>r.id!==parsed.searchParams.get('id'));return ok({deleted:true});}
  const page=Math.min(Number(parsed.searchParams.get('page')||1),Math.max(1,Math.ceil(rows.length/9)));
  return ok({items:rows.slice((page-1)*9,page*9).map(r=>({...r})),page,pages:Math.ceil(rows.length/9),total:rows.length,settings});
}});
for(const name of ['feedback-animals.js','feedback.js'])vm.runInContext(await readFile(new URL('../'+name,import.meta.url),'utf8'),context);
const tick=()=>new Promise(r=>setTimeout(r,0));await tick();
assert.equal((el('feedback-notes').innerHTML.match(/class="feedback-note /g)||[]).length,9);
await el('feedback-next').listeners.click();
assert.equal((el('feedback-notes').innerHTML.match(/class="feedback-note /g)||[]).length,3);
await el('feedback-prev').listeners.click();
const id=rows[0].id;
const click=(selector,dataset)=>({target:{closest:s=>s===selector?{dataset}:null}});
await el('feedback-notes').listeners.click(click('[data-heart]',{heart:id}));
assert.equal(heartCalls,1);assert.equal(rows[0].hearts,1);
await el('feedback-notes').listeners.click(click('[data-heart]',{heart:id}));assert.equal(rows[0].hearts,0);
await el('feedback-notes').listeners.click(click('[data-thread]',{thread:id}));assert.equal(el('feedback-thread').open,true);
el('comment-nickname').value='<b>손님</b>';el('comment-body').value='<script>alert(1)</script> 공감해요';
await el('comment-form').listeners.submit({preventDefault(){}});
assert.equal(replies.length,1);assert.ok(el('comment-list').innerHTML.includes('&lt;script&gt;'));assert.ok(!el('comment-list').innerHTML.includes('<script>'));
el('feedback-admin-password').value='test-only-password';await el('feedback-admin-login').listeners.submit({preventDefault(){}});
assert.ok(el('comment-list').innerHTML.includes('data-comment-delete'));
const cid=replies[0].id;
await el('comment-list').listeners.click(click('[data-comment-delete]',{commentDelete:cid}));
await el('comment-list').listeners.click(click('[data-comment-confirm]',{commentConfirm:cid}));assert.equal(replies.length,0);
await el('feedback-notes').listeners.click(click('[data-reset-hearts]',{resetHearts:id}));
await el('feedback-admin-confirm-yes').listeners.click();assert.equal(rows[0].hearts,0);
el('admin-posting_open').checked=false;el('admin-comments_open').checked=false;el('admin-likes_open').checked=false;
await el('feedback-settings').listeners.submit({preventDefault(){}});
assert.equal(el('feedback-submit').disabled,true);assert.equal(el('comment-submit').disabled,true);
assert.ok(el('feedback-notes').innerHTML.includes('disabled'));
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
assert.equal((html.match(/data-reservation=/g)||[]).length,6);
assert.ok((await readFile(new URL('../app.js',import.meta.url),'utf8')).includes('data-reservation="blend-result"'));
assert.equal(Object.keys(context.FeedbackAnimals.labels).length,15);
console.log('Pagination, hearts, comments, nickname escaping, admin controls, 15 animals and booking links passed.');
