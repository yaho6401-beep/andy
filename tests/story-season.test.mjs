import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const catalog=JSON.parse(await readFile(new URL('../data/fragrance-catalog.json',import.meta.url),'utf8'));
const context=vm.createContext({});
vm.runInContext(await readFile(new URL('../story-engine.js',import.meta.url),'utf8'),context);
const engine=context.StoryScent;
for(const theme of engine.themes){
  for(const season of ['winter','summer','autumn','spring']){
    const results=engine.buildRecommendations(catalog,engine.analyze('',[theme.id,season]));
    for(const {main} of results){
      assert.ok(engine.seasonFit(main,season)>0,`${main.name}: ${season}`);
      if(season==='winter')assert.notEqual(main.id,'main-20');
      if(theme.id==='love')assert.ok(Object.values(main.notes).flat().some(n=>/장미|로즈/.test(n)&&!n.includes('로즈마리')));
    }
  }
}
assert.ok(engine.buildRecommendations(catalog,engine.analyze('겨울')).length>0);
assert.ok(engine.seasonFit(catalog.mainScents.find(s=>s.id==='main-20'),'summer')>0);
assert.equal(engine.buildRecommendations(catalog,engine.analyze('겨울',['summer'])).length,0);
assert.ok(engine.analyze('가을').every(p=>p.theme.id!=='winter'));
assert.ok(engine.analyze('여름').some(p=>p.theme.id==='summer'));
const fruit={mainScents:[{id:'test',number:'1',noteSource:{},notes:{key:['프루티','앰버그리스']},accords:['프루티']}],singleScents:[]};
assert.equal(engine.buildRecommendations(fruit,engine.analyze('',['calm'])).length,0);
assert.equal(engine.buildRecommendations(fruit,engine.analyze('',['winter'])).length,0);
console.log('Season/story recommendation checks passed.');
