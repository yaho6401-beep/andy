import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const ctx=vm.createContext({URL,location:{href:'https://example.com/?lang=en'},localStorage:{getItem(){return null},setItem(){}},history:{replaceState(){}}});
for(const f of ['i18n-data.js','i18n-catalog.js','i18n.js','story-engine.js'])vm.runInContext(await readFile(new URL('../'+f,import.meta.url),'utf8'),ctx);
const catalog=JSON.parse(await readFile(new URL('../data/fragrance-catalog.json',import.meta.url),'utf8'));
const snapshot=JSON.stringify(catalog);
for(const lang of ['en','zh','ja']){ctx.ScentI18n.setLanguage(lang);for(const scent of catalog.mainScents){assert.ok(!/[가-힣]/.test(ctx.ScentI18n.text(scent.name)));assert.ok(!/[가-힣]/.test(ctx.ScentI18n.text(scent.shortDescription)));for(const notes of Object.values(scent.notes))assert.ok(!/[가-힣]/.test(ctx.ScentI18n.text(notes.join(' · '))));}}
assert.equal(JSON.stringify(catalog),snapshot);
assert.ok(ctx.StoryScent.analyze('A calm winter day').some(p=>p.theme.id==='winter'));
assert.ok(!ctx.StoryScent.analyze('training').some(p=>p.theme.id==='rainy'));
assert.ok(ctx.StoryScent.analyze('雨天想要平静').some(p=>p.theme.id==='rainy'));
assert.ok(ctx.StoryScent.analyze('春の日に幸せなデート').some(p=>p.theme.id==='love'));
ctx.ScentI18n.setLanguage('ko');assert.equal(ctx.ScentI18n.text('메인향을 골라주세요'),'메인향을 골라주세요');
console.log('Three languages, 72 scent names/descriptions/notes, multilingual story matching and unchanged catalog passed.');
