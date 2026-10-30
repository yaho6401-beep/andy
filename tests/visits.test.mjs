import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';
const source=await readFile(new URL('../visits.js',import.meta.url),'utf8');
const storage=new Map(),events=[],elements=new Map();let click;
function el(id){if(!elements.has(id))elements.set(id,{textContent:''});return elements.get(id);}
function open(){const context=vm.createContext({localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},crypto:webcrypto,AbortSignal,document:{getElementById:el,addEventListener(_type,f){click=f;}},FeedbackConfig:{endpoint:'https://test.invalid',key:'public'},fetch:async(url,options)=>{if(url.endsWith('/visit')){events.push(JSON.parse(options.body));return {ok:true};}return {ok:true,json:async()=>({visitors:1,views:events.filter(e=>e.kind==='visit').length})};}});vm.runInContext(source,context);return context;}
const first=open();await new Promise(r=>setTimeout(r,0));const second=open();await new Promise(r=>setTimeout(r,0));
assert.equal(first.FeedbackVisitor,second.FeedbackVisitor);
assert.equal(events.filter(e=>e.kind==='visit').length,2);
assert.notEqual(events[0].id,events[1].id);
click({target:{closest:()=>({dataset:{reservation:'hero'}})}});await new Promise(r=>setTimeout(r,0));
assert.equal(events.at(-1).kind,'booking');assert.equal(events.at(-1).position,'hero');
assert.equal(el('today-visitors').textContent,'1');assert.equal(el('today-views').textContent,'2');
console.log('Browser identity persistence, separate page views, visit labels and booking-click recording passed.');
