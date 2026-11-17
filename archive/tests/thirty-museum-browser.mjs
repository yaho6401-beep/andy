import {chromium,expect} from '@playwright/test';import {mkdir,writeFile} from 'node:fs/promises';
import {MUSEUM_EXHIBITS} from '../src/museum-layout.js';import {findWalkPath} from '../src/navigation.js';
const base=process.env.GALLERY_BASE||'http://127.0.0.1:4184',out='.local/thirty-museum-review';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[],writes=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.method())&&/\/api\/|\/functions\/v1\//.test(r.url()))writes.push({method:r.method(),url:r.url()});});
const state=()=>page.evaluate(()=>ArchiveDiagnostics.state);
async function walk(x,z){let held=[];const start=Date.now();try{while(Date.now()-start<18000){const s=await state();if(Math.hypot(x-s.position[0],z-s.position[2])<.14)return;const dx=x-s.position[0],dz=z-s.position[2],sx=(dx-dz)*.707,sy=(dx+dz)*.707,len=Math.max(.001,Math.hypot(sx,sy)),keys=[];if(Math.abs(sx/len)>.37)keys.push(sx>0?'d':'a');if(Math.abs(sy/len)>.37)keys.push(sy>0?'s':'w');for(const k of held)if(!keys.includes(k))await page.keyboard.up(k);for(const k of keys)if(!held.includes(k))await page.keyboard.down(k);held=keys;await page.waitForTimeout(65);}throw Error('walk '+JSON.stringify({target:[x,z],state:await state()}));}finally{for(const k of held)await page.keyboard.up(k);}}
async function route(target){const s=await state(),start={x:s.position[0],z:s.position[2]},path=findWalkPath('scents',start,target);expect(path.length).toBeGreaterThan(0);for(const p of path)await walk(p.x,p.z);}
async function shot(name,mobile=false){if(mobile){await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);}await page.screenshot({path:out+'/'+name+'.png'});if(mobile){await page.setViewportSize({width:1200,height:800});await page.waitForTimeout(400);}}
try{
 await page.goto(base+'/archive/?start=scents');await page.waitForFunction(()=>globalThis.ArchiveDiagnostics?.state.artLoaded);await page.locator('[name=nickname]').fill('향기박물관 관람');await page.locator('[name=adult]').check();await page.locator('#entry-form [type=submit]').click();await page.waitForFunction(()=>ArchiveDiagnostics.state.joined&&ArchiveDiagnostics.state.space==='scents');await page.waitForTimeout(900);await shot('museum-entry');
 const visited=[];
 for(const s of MUSEUM_EXHIBITS){
  await route(s.approach);await page.waitForFunction(id=>ArchiveDiagnostics.state.nearbyExhibit===id,s.id);await expect(page.locator('#museum-guide')).toBeVisible();await expect(page.locator('.museum-guide-head b')).toHaveText(s.code);await expect(page.locator('.museum-guide-body')).toContainText(s.blind.description);await expect(page.locator('#museum-guide')).not.toContainText(s.name);await expect(page.locator('#museum-guide')).not.toContainText(s.english);
  if(s.code==='T1'){
   await shot('T1-blind');await shot('T1-blind-mobile',true);await page.locator('[data-read-ingredient]').click();await expect(page.locator('#detail-content')).toContainText(s.blind.blending);await expect(page.locator('#detail-content')).not.toContainText(s.name);
   await page.locator('#detail-content [data-reveal-ingredient]').click();await expect(page.locator('#detail-content')).toContainText(s.name);await expect(page.locator('#detail-content')).toContainText(s.english);await expect(page.locator('#detail-content')).toContainText(s.blending);await page.locator('[data-close=detail]').click();await expect(page.locator('#museum-guide .ingredient-answer')).toContainText(s.name);await shot('T1-revealed');
  }
  if(s.code==='T5'){
   await shot('T5-fruit-blind');await page.setViewportSize({width:390,height:844});await page.waitForTimeout(450);const reveal=page.locator('#museum-guide [data-reveal-ingredient]');await expect(reveal).toBeInViewport();await reveal.click();await expect(page.locator('#museum-guide .ingredient-answer')).toContainText(s.name);await shot('T5-fruit-revealed-mobile');await page.setViewportSize({width:1200,height:800});await page.waitForTimeout(350);
  }
  if(s.code==='M1'||s.code==='L10')await shot(s.code+'-exhibition');visited.push(s.code);
 }
 expect(await page.locator('#museum-guide').count()).toBe(1);
 await route({x:7,z:6.4});await page.waitForFunction(()=>ArchiveDiagnostics.state.nearbyBoard==='museum-public-board');await expect(page.locator('#museum-guide .public-post').first()).toBeVisible({timeout:18000});
 const response=await page.request.get(base+'/api/archive-public-board?page=1');expect(response.status()).toBe(200);const real=await response.json();expect(real.items.length).toBeGreaterThan(0);
 await expect(page.locator('#museum-guide')).toContainText(real.items[0].body);await shot('actual-posts-near-board');await shot('actual-posts-near-board-mobile',true);
 await page.locator('[data-read-public-board]').click();await expect(page.locator('#detail-content .public-post')).toHaveCount(real.items.length);await expect(page.locator('#detail-content')).toContainText(real.items[0].body);
 let nextPage=false;if(real.pages>1){await page.locator('[data-public-page="2"]').click();await expect(page.locator('#detail-content .note-pages')).toContainText('2 / '+real.pages);nextPage=true;}
 await shot('real-board-pages');await page.locator('[data-close=detail]').click();
 expect((await state()).corrections).toBe(0);expect(errors).toEqual([]);expect(writes).toEqual([]);
 const result={base,visited,uniqueExhibits:visited.length,blindUntilExplicitReveal:true,fullCardAlsoBlind:true,mobileRevealButtonInViewport:true,mobileViewport:'390×844',realPublishedPosts:real.total,pagination:nextPage,noProductionWrites:true,oneGuideOnly:true,final:await state(),errors};await writeFile(out+'/browser-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}catch(error){await page.screenshot({path:out+'/failure.png'});console.log(JSON.stringify({state:await state(),errors,writes,guide:await page.locator('#museum-guide').textContent()}));throw error;}finally{await browser.close();}
