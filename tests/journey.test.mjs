import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{hidden:true,textContent:'',listeners:{},addEventListener(k,f){this.listeners[k]=f;},scrollIntoView(){}});return elements.get(id);}
const buttons=['story','profile','selection'].map(id=>({dataset:{journey:id},pressed:'false',listeners:{},setAttribute(_k,v){this.pressed=v;},addEventListener(k,f){this.listeners[k]=f;}}));
const ctx=vm.createContext({document:{getElementById:el,querySelectorAll:()=>buttons,querySelector:()=>el('choices')},location:{hash:''},matchMedia:()=>({matches:true})});
vm.runInContext(await readFile(new URL('../journey.js',import.meta.url),'utf8'),ctx);
for(const button of buttons){button.listeners.click();assert.equal(ctx.ScentJourney.active,button.dataset.journey);for(const id of ['story','profile','selection'])assert.equal(el(id).hidden,id!==button.dataset.journey);assert.equal(button.pressed,'true');}
el('journey-back').listeners.click();assert.equal(ctx.ScentJourney.active,null);assert.ok(['story','profile','selection'].every(id=>el(id).hidden));
ctx.ScentJourney.show('selection',{scroll:false});assert.equal(el('selection').hidden,false);assert.equal(el('journey-toolbar').hidden,false);
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
for(const id of ['story','profile','selection'])assert.match(html,new RegExp('id="'+id+'" hidden'));
console.log('One journey is visible at a time, returning hides all flows, and shared blends can open the combination screen.');
