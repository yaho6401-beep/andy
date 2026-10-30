import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const ctx=vm.createContext({URL,location:{href:'https://example.com/'},localStorage:{getItem(){return null},setItem(){}},history:{replaceState(){}}});
for(const file of ['i18n-data.js','i18n-catalog.js','i18n.js','engine.js'])vm.runInContext(await readFile(new URL('../'+file,import.meta.url),'utf8'),ctx);
const catalog=JSON.parse(await readFile(new URL('../data/fragrance-catalog.json',import.meta.url),'utf8'));
const floral=catalog.mainScents.find(s=>s.accords[0]==='플로럴'),single=(note,n)=>catalog.singleScents.find(s=>s.note===note&&s.number===n);
assert.equal(ctx.ScentStyle.describeBlend(floral,[single('top',9)]).sentence,'꽃향에 모과의 은은함이 어우러져, 다정한 분위기를 전해요.');
assert.match(ctx.ScentStyle.describeBlend(floral,[single('middle',3),single('middle',4)]).sentence,/자스민과 일랑일랑의 풍성함이/);
assert.match(ctx.ScentStyle.describeBlend(floral,[single('base',2),single('base',8)]).sentence,/패츌리의 깊이와 코튼의 포근함이/);
const groups=[[]];for(let i=0;i<catalog.singleScents.length;i++){groups.push([catalog.singleScents[i]]);for(let j=i+1;j<catalog.singleScents.length;j++)groups.push([catalog.singleScents[i],catalog.singleScents[j]]);}
const stems=['화사','풍성','부드러','포근','달콤','산뜻','상큼','싱그러','차분','깊이','시원','따뜻','보송','담백','경쾌','은은','밝은'];
let checked=0;
for(const main of catalog.mainScents)for(const notes of groups){
  const result=ctx.ScentStyle.describeBlend(main,notes);assert.ok(result.sentence.endsWith('.'));
  for(const stem of stems)assert.ok(result.sentence.split(stem).length<=2,`${stem} repeated: ${result.sentence}`);
  for(const lang of ['en','zh','ja']){ctx.ScentI18n.setLanguage(lang);const translated=ctx.ScentI18n.text(result.sentence);assert.ok(!/[가-힣]/.test(translated),`${lang}: ${translated}`);}
  ctx.ScentI18n.setLanguage('ko');checked++;
}
console.log(`${checked} blend descriptions checked for repeated descriptors, Korean conjunctions and three language translations.`);
