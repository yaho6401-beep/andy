import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';

const elements=new Map();
function el(id){
  if(!elements.has(id))elements.set(id,{id,value:'',innerHTML:'',textContent:'',hidden:false,disabled:false,listeners:{},addEventListener(k,f){this.listeners[k]=f;},querySelectorAll(){return [];},scrollIntoView(){},focus(){},showModal(){this.open=true;},close(){this.open=false;}});
  return elements.get(id);
}
el('feedback-category').value='improvement';
el('feedback-edit-password').value='test-only-memo-password';
let failWrite=false,writes=0,stored=[];
const context=vm.createContext({
  document:{getElementById:el},Intl,Date,Map,Set,AbortSignal,crypto:webcrypto,
  matchMedia:()=>({matches:false}),
  FeedbackConfig:{endpoint:'https://test.invalid/feedback',key:'public-test'},
  fetch:async(_url,options)=>{
    if(_url.endsWith('/admin/stats'))return {ok:true,json:async()=>({visitors:3,views:4,bookingClicks:2})};
    if(_url.endsWith('/admin/login')){const payload=JSON.parse(options.body);return payload.password==='test-only-password'?{ok:true,json:async()=>({token:'test-session'})}:{ok:false,status:401,json:async()=>({error:'비밀번호가 맞지 않아요.'})};}
    if(_url.endsWith('/admin/logout'))return {ok:true,json:async()=>({loggedOut:true})};
    if(options.method==='DELETE'){assert.equal(options.headers.Authorization,'Bearer test-session');const id=new URL(_url).searchParams.get('id');stored=stored.filter(n=>n.id!==id);return {ok:true,json:async()=>({deleted:true})};}

    if(options.method==='POST'){
      writes++;const payload=JSON.parse(options.body);
      if(failWrite)throw Error('테스트 연결 오류');
      const item={...payload,created_at:new Date().toISOString()};stored.push(item);
      return {ok:true,json:async()=>({item})};
    }
    const page=Number(new URL(_url).searchParams.get('page')||1);return {ok:true,json:async()=>({items:stored.slice((page-1)*9,page*9),page,pages:Math.max(1,Math.ceil(stored.length/9)),total:stored.length,settings:{posting_open:true,comments_open:true,likes_open:true}})};
  }
});
vm.runInContext(await readFile(new URL('../feedback-animals.js',import.meta.url),'utf8'),context);
vm.runInContext(await readFile(new URL('../feedback.js',import.meta.url),'utf8'),context);
await new Promise(r=>setTimeout(r,0));
assert.equal((el('feedback-colors').innerHTML.match(/data-note-color=/g)||[]).length,6);
assert.equal((el('feedback-animals').innerHTML.match(/data-note-animal=/g)||[]).length,15);
el('feedback-nickname').value='<b>봄</b>';
el('feedback-nickname').listeners.input();
assert.ok(el('feedback-preview').innerHTML.includes('&lt;b&gt;봄&lt;/b&gt;'));
el('feedback-text').value='<img src=x onerror=alert(1)> 예쁜 메모';
el('feedback-text').listeners.input();
assert.ok(el('feedback-preview').innerHTML.includes('&lt;img'));
assert.ok(!el('feedback-preview').innerHTML.includes('<img src=x'));
el('feedback-colors').listeners.click({target:{closest:()=>({dataset:{noteColor:'lavender'}})}});
el('feedback-animals').listeners.click({target:{closest:()=>({dataset:{noteAnimal:'bunny'}})}});
assert.ok(el('feedback-preview').innerHTML.includes('note-lavender'));
failWrite=true;
await el('feedback-form').listeners.submit({preventDefault(){}});
assert.ok(el('feedback-text').value.includes('예쁜 메모'));
assert.equal(el('feedback-submit').disabled,false);
failWrite=false;
await el('feedback-form').listeners.submit({preventDefault(){}});
assert.equal(stored.length,1);
assert.equal(stored[0].animal,'bunny');assert.equal(stored[0].color,'lavender');
assert.equal(el('feedback-text').value,'');
assert.ok(el('feedback-notes').innerHTML.includes('&lt;img'));
assert.ok(!el('feedback-notes').innerHTML.includes('<img src=x'));
assert.ok(el('feedback-submit-status').textContent.includes('메모를 붙였어요'));
el('feedback-text').value=' ';await el('feedback-form').listeners.submit({preventDefault(){}});
assert.equal(writes,2);
el('feedback-text').value='🍋'.repeat(101);el('feedback-text').listeners.input();
assert.equal([...el('feedback-text').value].length,100);
console.log('Feedback preview, decorations, escaping, save, retry and validation checks passed.');

assert.ok(!el('feedback-notes').innerHTML.includes('data-feedback-delete='));
el('feedback-admin-password').value='wrong-test';await el('feedback-admin-login').listeners.submit({preventDefault(){}});
assert.ok(el('feedback-admin-status').textContent.includes('비밀번호가 맞지'));
assert.equal(el('feedback-admin-password').value,'');
el('feedback-admin-password').value='test-only-password';await el('feedback-admin-login').listeners.submit({preventDefault(){}});
assert.ok(el('feedback-notes').innerHTML.includes('data-feedback-delete='));
assert.equal(el('feedback-admin-login').hidden,true);
const deleteId=stored[0].id;
await el('feedback-notes').listeners.click({target:{closest:s=>s==='[data-feedback-delete]'?{dataset:{feedbackDelete:deleteId}}:null}});
assert.ok(el('feedback-notes').innerHTML.includes('이 메모를 삭제할까요?'));
await el('feedback-notes').listeners.click({target:{closest:s=>s==='[data-feedback-cancel-delete]'?{}:null}});
assert.ok(!el('feedback-notes').innerHTML.includes('이 메모를 삭제할까요?'));
await el('feedback-notes').listeners.click({target:{closest:s=>s==='[data-feedback-delete]'?{dataset:{feedbackDelete:deleteId}}:null}});
await el('feedback-notes').listeners.click({target:{closest:s=>s==='[data-feedback-confirm-delete]'?{dataset:{feedbackConfirmDelete:deleteId}}:null}});
assert.equal(stored.length,0);
assert.ok(el('feedback-notes').innerHTML.includes('첫 번째 향기 메모'));
await el('feedback-admin-logout').listeners.click();assert.equal(el('feedback-admin-login').hidden,false);
console.log('Nickname escaping, admin login, delete confirmation, deletion and logout checks passed.');
