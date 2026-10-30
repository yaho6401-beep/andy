import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{id,value:'',innerHTML:'',textContent:'',hidden:false,disabled:false,dataset:{},listeners:{},addEventListener(k,f){this.listeners[k]=f;},querySelectorAll(){return [];},focus(){},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;}});return elements.get(id);}
el('feedback-category').value='message';
let rows=[],posts=0;
const context=vm.createContext({document:{getElementById:el},Intl,Date,Map,Set,AbortSignal,crypto:webcrypto,matchMedia:()=>({matches:false}),FeedbackConfig:{endpoint:'https://test.invalid',key:'public'},fetch:async(url,options)=>{
  const ok=data=>({ok:true,json:async()=>data});
  if(url.endsWith('/edit')){const p=JSON.parse(options.body);if(p.password!=='test-only-password')return {ok:false,status:401,json:async()=>({error:'비밀번호가 맞지 않아요.'})};const row=rows.find(n=>n.id===p.id);Object.assign(row,{body:p.body,nickname:p.nickname,edited_at:new Date().toISOString()});return ok({item:row});}
  if(options.method==='POST'){posts++;const {password,...p}=JSON.parse(options.body);assert.equal(password,'test-only-password');const row={...p,created_at:new Date().toISOString(),editable:true,hearts:2,comments:1};rows.unshift(row);return ok({item:row});}
  return ok({items:rows,page:1,pages:1,total:rows.length,settings:{posting_open:true,comments_open:true,likes_open:true}});
}});
for(const file of ['feedback-animals.js','feedback.js'])vm.runInContext(await readFile(new URL('../'+file,import.meta.url),'utf8'),context);
await new Promise(r=>setTimeout(r,0));
el('feedback-text').value='나의 원래 메모';el('feedback-nickname').value='내 닉네임';el('feedback-edit-password').value='12';
await el('feedback-form').listeners.submit({preventDefault(){}});assert.equal(posts,0);
el('feedback-edit-password').value='test-only-password';await el('feedback-form').listeners.submit({preventDefault(){}});
assert.equal(posts,1);assert.equal(el('feedback-edit-password').value,'');assert.ok(el('feedback-notes').innerHTML.includes('data-edit-memo='));
const id=rows[0].id;
await el('feedback-notes').listeners.click({target:{closest:s=>s==='[data-edit-memo]'?{dataset:{editMemo:id}}:null}});
assert.equal(el('memo-edit-dialog').open,true);assert.equal(el('memo-edit-body').value,'나의 원래 메모');
el('memo-edit-body').value='수정한 내 메모';el('memo-edit-password').value='wrong';
await el('memo-edit-form').listeners.submit({preventDefault(){}});assert.equal(rows[0].body,'나의 원래 메모');assert.equal(el('memo-edit-dialog').open,true);assert.equal(el('memo-edit-password').value,'');
el('memo-edit-password').value='test-only-password';await el('memo-edit-form').listeners.submit({preventDefault(){}});
assert.equal(rows[0].body,'수정한 내 메모');assert.equal(rows[0].hearts,2);assert.equal(rows[0].comments,1);assert.equal(el('memo-edit-dialog').open,false);assert.ok(el('feedback-notes').innerHTML.includes('수정됨'));
assert.ok(!el('feedback-notes').innerHTML.includes('test-only-password'));
console.log('Personal edit-password validation, wrong password, private form clearing, editing and reaction preservation passed.');
