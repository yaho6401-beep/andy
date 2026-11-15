import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const root=resolve(import.meta.dirname,'..'),require=createRequire(resolve(root,'archive/package.json')),{chromium}=require('playwright');
await mkdir(resolve(root,'.release'),{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(req,res)=>{try{let p=new URL(req.url,'http://localhost').pathname;if(p.endsWith('/'))p+='index.html';const file=resolve(root,'.'+decodeURIComponent(p));if(!file.startsWith(root+sep))throw Error();res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}});await new Promise(r=>server.listen(4194,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const c=await browser.newContext({viewport:{width:390,height:844}}),rows=[],writes=[],errors=[];let failedOnce=false;
 await c.route('**/functions/v1/**',async route=>{const req=route.request(),p=new URL(req.url()).pathname,b=req.method()==='POST'?req.postDataJSON():null;
  if(p.endsWith('/journal/login')||p.endsWith('/journal/register'))return route.fulfill({json:{token:'a'.repeat(64),nickname:'테스트기록장'}});
  if(p.endsWith('/journal/records')&&b){writes.push(b);if(b.title==='재시도 테스트'&&!failedOnce){failedOnce=true;return route.fulfill({status:503,json:{error:'테스트 연결 실패'}});}rows.unshift({id:b.id,title:b.title,main_id:b.mainId,single_ids:b.singleIds,sentence:b.sentence,stage:b.stage,reflection:b.reflection,next_plan:b.nextPlan,created_at:new Date().toISOString()});return route.fulfill({status:201,json:{saved:true,id:b.id}});}
  if(p.endsWith('/journal/records/update')){Object.assign(rows.find(x=>x.id===b.id),{title:b.title,stage:b.stage,reflection:b.reflection,next_plan:b.nextPlan});writes.push(b);return route.fulfill({json:{updated:true}});}
  if(p.endsWith('/journal/records/delete')){rows.splice(rows.findIndex(x=>x.id===b.id),1);return route.fulfill({json:{deleted:true}});}
  if(p.endsWith('/journal/records'))return route.fulfill({json:{items:rows,page:1,pages:1,total:rows.length}});
  if(p.endsWith('/journal/logout'))return route.fulfill({json:{loggedOut:true}});
  if(p.endsWith('/stats'))return route.fulfill({json:{views:0,visitors:0,totalViews:0}});
  return route.abort();
 });
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4194/#explore');await p.waitForTimeout(200);if(await p.locator('#solo-announcement').evaluate(e=>e.open))await p.locator('#solo-announcement [data-announcement-close]').first().click();
 assert.equal(await p.locator('.site-navigation a[href="#explore"]').innerText(),'책과향기');
 await p.locator('[data-journal-open]').click();await p.locator('#journal-nickname').fill('테스트기록장');await p.locator('#journal-password').fill('test-pass');await p.locator('#journal-login-button').click();await p.locator('#journal-main-scent').waitFor();
 assert.equal(await p.locator('#journal-main-scent option[value^="main-"]').count(),72);assert.equal(await p.locator('[name="journal-single"]').count(),30);
 assert.equal(await p.locator('#journal-picker').getAttribute('disabled'),null);assert.equal(await p.locator('#journal-main-scent').inputValue(),'');
 await p.locator('#journal-record-title').fill('메인 미선택');await p.locator('#journal-save').click();assert.equal(writes.length,0);
 await p.locator('#journal-main-scent').selectOption('main-1');
 for(const id of ['single-top-1','single-middle-10','single-base-10'])await p.locator('[name="journal-single"][value="'+id+'"]').check({force:true});
 const preview=await p.locator('#journal-composition').innerText();assert(preview.includes('T1')&&preview.includes('M10')&&preview.includes('L10'));assert(!preview.includes('베르가못'));assert(!(await p.locator('#journal-picker').innerText()).includes('베르가못'));
 await p.locator('#journal-record-title').fill('나의 첫 향');await p.locator('#journal-reflection').fill('기록장에서 바로 선택했어요');
 await p.screenshot({path:resolve(root,'.release/journal-picker-mobile.png'),fullPage:true});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.locator('#journal-save').click();await p.locator('#journal-records .record-card').waitFor();assert.equal(rows[0].main_id,'main-1');assert.deepEqual(rows[0].single_ids,['single-top-1','single-middle-10','single-base-10']);assert(rows[0].sentence.length>10);assert((await p.locator('#journal-records').innerText()).includes('T1 · 베르가못'));
  await p.locator('[data-record-edit]').first().click();assert.equal(await p.locator('#journal-picker').isVisible(),false);assert(await p.locator('#journal-picker').evaluate(e=>e.disabled));await p.locator('#journal-reflection').fill('소감 수정');await p.locator('#journal-save').click();await p.waitForTimeout(100);assert.equal(rows[0].reflection,'소감 수정');assert.equal(rows[0].single_ids.length,3);
 await p.locator('#journal-new-record').click();await p.locator('#journal-main-scent').selectOption('main-72');for(const ch of await p.locator('[name="journal-single"]').all())await ch.check({force:true});await p.locator('#journal-record-title').fill('30개 선택 테스트');await p.locator('#journal-save').click();await p.waitForTimeout(100);assert.equal(rows[0].single_ids.length,30);
 // Preserve the normal page's selected blend while entering an independent journal recipe.
 await p.evaluate(()=>ScentJournal.setBlend({mainId:'main-3',singleIds:['single-top-2'],sentence:'기존 조합 저장 경로 확인'}));
 await p.locator('#journal-new-record').click();await p.locator('#journal-main-scent').selectOption('main-2');await p.locator('#journal-record-title').fill('재시도 테스트');await p.locator('#journal-save').click();await p.waitForTimeout(100);assert.equal(await p.locator('#journal-editor').isVisible(),true);const retryId=writes.at(-1).id;await p.locator('#journal-save').click();await p.waitForTimeout(100);assert.equal(writes.at(-1).id,retryId);
  await p.locator('#journal-current').click();assert(await p.locator('#journal-picker').evaluate(e=>e.disabled));await p.locator('#journal-save').click();await p.waitForTimeout(100);assert.equal(rows[0].main_id,'main-3');assert.deepEqual(rows[0].single_ids,['single-top-2']);assert.equal(rows[0].sentence,'기존 조합 저장 경로 확인');
 await p.locator('#journal-new-record').click();await p.setViewportSize({width:1440,height:1000});await p.screenshot({path:resolve(root,'.release/journal-picker-desktop.png'),fullPage:true});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.locator('#journal-logout').click();await p.locator('#journal-auth').waitFor();assert.equal(await p.locator('#journal-records').textContent(),'');assert.deepEqual(errors,[]);
 await p.locator('[data-journal-close]').click();await p.locator('#language-select').selectOption('en');assert((await p.locator('.site-navigation a[href="#explore"]').innerText()).includes('Books & Scents'));
 console.log('PASS: renamed menu; 72 numbered main scents; 30 blind T/M/L notes; no-name preview; validation; manual save; saved code/name display; metadata edit; all-note selection; stable retry ID; existing blend save; logout isolation; mobile/desktop widths; English navigation.');
 await c.close();
}finally{await browser.close();await new Promise(r=>server.close(r));}
