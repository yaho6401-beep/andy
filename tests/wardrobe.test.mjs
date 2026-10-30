import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const context=vm.createContext({});
for(const path of ['wardrobe.js','styling.js','engine.js'])vm.runInContext(await readFile(new URL('../'+path,import.meta.url),'utf8'),context);
const catalog=JSON.parse(await readFile(new URL('../data/fragrance-catalog.json',import.meta.url),'utf8'));
const accessories=catalog.singleScents.map(context.ScentStyling.descriptor);
for(const style of context.ScentStyle.styles){
  for(const kind of Object.keys(context.ScentWardrobe.labels)){
    const garment=context.ScentWardrobe.garment(style,kind);
    const scene=context.ScentStyling.scene(garment,accessories,style);
    assert.ok(!/undefined|NaN/.test(scene));
    assert.ok(garment.includes(`outfit-${kind}`));
    assert.equal((scene.match(/class="scent-detail /g)||[]).length,30);
    const bare=context.ScentStyling.scene(garment,[],style);
    assert.ok(!bare.includes('class="scent-detail '));
    assert.ok(scene.includes('viewBox="0 0 360 410"'));
  }
}
console.log('88 wardrobe combinations and all 30 removable scent details passed.');
