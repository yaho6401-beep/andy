import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const elements=new Map();let open;
function el(id){if(!elements.has(id)){const classes=new Set();elements.set(id,{id,hidden:false,innerHTML:'',textContent:'',dataset:{},offsetWidth:420,listeners:{},classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},contains:n=>classes.has(n)},addEventListener(k,f){this.listeners[k]=f;},showModal(){this.open=true;},close(){this.open=false;this.listeners.close?.();}});}return elements.get(id);}
const context=vm.createContext({document:{getElementById:el,addEventListener(_type,f){open=f;}},setTimeout:()=>1,clearTimeout(){}});
vm.runInContext(await readFile(new URL('../perfume-game.js',import.meta.url),'utf8'),context);
open({target:{closest:()=>({})}});assert.equal(el('spray-game').open,true);
function choose(choice){el('spray-game-choices').listeners.click({target:{closest:()=>({dataset:{sprayChoice:choice}})}});}
choose('face');assert.equal(el('spray-game-next').hidden,true);assert.ok(el('spray-game-tip').textContent.includes('얼굴'));
choose('neck');assert.equal(el('spray-game-next').hidden,false);assert.ok(el('spray-game-art').classList.contains('is-happy'));
el('spray-game-next').listeners.click();assert.ok(el('spray-game-title').textContent.includes('두 번째'));
choose('lots');assert.equal(el('spray-game-next').hidden,true);
choose('light');el('spray-game-next').listeners.click();
choose('rub');assert.equal(el('spray-game-next').hidden,true);
choose('dry');el('spray-game-next').listeners.click();
assert.ok(el('spray-game-title').textContent.includes('성공'));
assert.equal(el('spray-game-booking').hidden,false);
assert.equal((el('spray-game-progress').innerHTML.match(/is-complete/g)||[]).length,3);
el('spray-game-restart').listeners.click();assert.equal(el('spray-game-booking').hidden,true);
choose('wrist');assert.equal(el('spray-game-art').dataset.point,'wrist');
el('spray-game-close').listeners.click();assert.equal(el('spray-game').open,false);
const engine=vm.createContext({});vm.runInContext(await readFile(new URL('../engine.js',import.meta.url),'utf8'),engine);
const catalog=JSON.parse(await readFile(new URL('../data/fragrance-catalog.json',import.meta.url),'utf8'));
assert.ok(engine.ScentStyle.recommendForProfile(catalog.mainScents,{gender:'any',age:'any',hair:'medium',styles:[]}).length>0);
console.log('Three spray missions, wrong-answer tips, reaction, restart, popup close and medium hair passed.');
