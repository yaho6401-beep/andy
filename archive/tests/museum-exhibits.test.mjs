import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {INGREDIENTS} from '../src/scent-exhibits.js';import {MUSEUM_EXHIBITS} from '../src/museum-layout.js';
import {validPosition,validMove} from '../src/protocol.js';import {findWalkPath} from '../src/navigation.js';
import * as T from 'three';import {createIngredientObject,INGREDIENT_OBJECT_CODES} from '../src/ingredient-objects.js';import {ingredientHTML} from '../src/museum-guide.js';
import {ingredientPhotoHTML} from '../src/ingredient-photos.js';
const catalog=JSON.parse(readFileSync(new URL('../../data/fragrance-catalog.json',import.meta.url),'utf8'));
test('photo atlas cells match all 30 codes and preserve the blind identity boundary',()=>{
 for(const s of INGREDIENTS){const h=ingredientPhotoHTML(s);assert.ok(h.includes('AI 연출 이미지'));assert.ok(!h.includes(s.name));assert.ok(!h.includes(s.english));assert.ok(ingredientPhotoHTML(s,true,true).includes(s.name));assert.ok(s.code==='T1'?h.includes('t1-soft-v2.jpg')&&h.includes('background-size:cover'):h.includes('background-position:'+((Number(s.code.slice(1))-1)%5)*25+'%'));}
 for(const zone of ['top','middle','base'])assert.ok(readFileSync(new URL('../../assets/ingredient-photos/'+zone+'-materials.jpg',import.meta.url)).length>10000);
 assert.ok(readFileSync(new URL('../../assets/ingredient-photos/t1-soft-v2.jpg',import.meta.url)).length>10000);
 assert.equal(ingredientPhotoHTML({code:'T11'}),'');
});
test('30 museum notes match every original store ID and keep T/M/L numbering',()=>{
 assert.equal(INGREDIENTS.length,30);assert.equal(new Set(INGREDIENTS.map(s=>s.id)).size,30);
 assert.deepEqual(INGREDIENTS.map(s=>s.id),catalog.singleScents.map(s=>s.id));
 for(const prefix of ['T','M','L'])assert.deepEqual(INGREDIENTS.filter(s=>s.code[0]===prefix).map(s=>s.code),Array.from({length:10},(_,i)=>prefix+(i+1)));
 assert.equal(INGREDIENTS[0].name,'버가못');assert.equal(INGREDIENTS[29].name,'밤부');
 for(const s of INGREDIENTS){assert.ok(s.description.length>50);assert.ok(s.blending.length>30);assert.ok(s.memory.length>10);for(const code of s.pairs)assert.ok(INGREDIENTS.some(n=>n.code===code));}
});
test('all blind explanations stay unnamed, including full cards and suggested pairings; reveal is per exhibit',()=>{
 for(const s of INGREDIENTS){
  for(const full of [false,true]){
   const blind=ingredientHTML(s,full);assert.ok(blind.includes(s.blind.description));
   for(const n of INGREDIENTS)for(const name of [n.name,n.english])assert.ok(!blind.toLowerCase().includes(name.toLowerCase()),s.code+' leaks '+name);
   assert.ok(!blind.includes('undefined'));if(full)assert.ok(blind.includes('data-reveal-ingredient="'+s.id+'"'));
   const revealed=ingredientHTML(s,full,true);assert.ok(revealed.includes(s.name));assert.ok(revealed.includes(s.english));assert.ok(!revealed.includes('data-reveal-ingredient'));
  }
 }
});
test('each of 30 numbered exhibits has finite, bounded botanical geometry and one shared render material',()=>{
 assert.deepEqual(INGREDIENT_OBJECT_CODES,INGREDIENTS.map(s=>s.code));const materials=new Set();let triangles=0;
 for(const s of INGREDIENTS){const object=createIngredientObject(s.code);const size=new T.Box3().setFromObject(object).getSize(new T.Vector3());assert.ok(size.x>.15&&size.x<1.1,s.code+' width');assert.ok(size.y>.1&&size.y<1.1,s.code+' height');assert.ok(size.z>.05&&size.z<1.1,s.code+' depth');
  object.traverse(o=>{if(!o.isMesh)return;materials.add(o.material);const g=o.geometry;triangles+=(g.index?.count||g.attributes.position.count)/3;for(const name of ['position','normal','color']){assert.ok(g.attributes[name]);assert.ok(g.attributes[name].array.every(Number.isFinite),s.code+' '+name);}});
 }
 assert.equal(materials.size,1);assert.ok(triangles<60000,triangles);assert.throws(()=>createIngredientObject('T11'));
});
test('every exhibit has a reachable safe approach and blocks walking through its pedestal',()=>{
 for(const s of MUSEUM_EXHIBITS){assert.ok(!validPosition('scents',s.x,s.z));assert.ok(validPosition('scents',s.approach.x,s.approach.z),s.code);let p={x:12,z:0};const path=findWalkPath('scents',p,s.approach);assert.ok(path.length,s.code);for(const q of path){assert.ok(validMove('scents',p.x,p.z,q.x,q.z));p=q;}assert.deepEqual(p,s.approach);}
});
