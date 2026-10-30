import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';

const elements=new Map();
function el(id){
  if(!elements.has(id))elements.set(id,{id,value:'',innerHTML:'',textContent:'',hidden:false,disabled:false,listeners:{},addEventListener(k,f){this.listeners[k]=f;},querySelectorAll(){return [];},scrollIntoView(){},focus(){}});
  return elements.get(id);
}
el('feedback-category').value='improvement';
let failWrite=false,writes=0,stored=[];
const context=vm.createContext({
  document:{getElementById:el},Intl,Date,Map,Set,AbortSignal,crypto:webcrypto,
  matchMedia:()=>({matches:false}),
  FeedbackConfig:{endpoint:'https://test.invalid/feedback',key:'public-test'},
  fetch:async(_url,options)=>{
    if(options.method==='POST'){
      writes++;const payload=JSON.parse(options.body);
      if(failWrite)throw Error('테스트 연결 오류');
      const item={...payload,created_at:new Date().toISOString()};stored.push(item);
      return {ok:true,json:async()=>({item})};
    }
    return {ok:true,json:async()=>({items:stored,next:null})};
  }
});
vm.runInContext(await readFile(new URL('../feedback.js',import.meta.url),'utf8'),context);
await new Promise(r=>setTimeout(r,0));
assert.equal((el('feedback-colors').innerHTML.match(/data-note-color=/g)||[]).length,6);
assert.equal((el('feedback-animals').innerHTML.match(/data-note-animal=/g)||[]).length,4);
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
