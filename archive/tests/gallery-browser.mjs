import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.GALLERY_BASE||'http://127.0.0.1:4184',out='.local/gallery-review';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function state(){return page.evaluate(()=>ArchiveDiagnostics.state);}
async function walk(x,z,room,next){let held=[];const start=Date.now();try{while(Date.now()-start<24000){const s=await state();if(next&&s.space===next)return;if(s.space!==room)throw Error('Wrong room '+JSON.stringify(s));if(!next&&Math.hypot(x-s.position[0],z-s.position[2])<.25)return;if(s.seat){await page.locator('#stand-up').click();await page.waitForFunction(()=>!ArchiveDiagnostics.state.seat);}if(await page.locator('#detail[open]').count())await page.locator('[data-close=detail]').click();const dx=x-s.position[0],dz=z-s.position[2],sx=(dx-dz)*.707,sy=(dx+dz)*.707,len=Math.max(.001,Math.hypot(sx,sy)),keys=[];if(Math.abs(sx/len)>.37)keys.push(sx>0?'d':'a');if(Math.abs(sy/len)>.37)keys.push(sy>0?'s':'w');for(const k of held)if(!keys.includes(k))await page.keyboard.up(k);for(const k of keys)if(!held.includes(k))await page.keyboard.down(k);held=keys;await page.waitForTimeout(90);}throw Error('Walk timeout '+JSON.stringify(await state()));}finally{for(const k of held)await page.keyboard.up(k);}}
try{
 await page.route('**/functions/v1/**',r=>r.abort());await page.goto(base+'/archive/');await page.waitForFunction(()=>globalThis.ArchiveDiagnostics?.state.artLoaded);
 await page.locator('[name=nickname]').fill('전시관 체험');await page.locator('[name=adult]').check();await page.locator('#entry-form [type=submit]').click();await page.waitForFunction(()=>ArchiveDiagnostics.state.joined);
 await expect(page.locator('#online-count')).toContainText('혼자');
 await walk(0,-7.3,'garden','lobby');await walk(-4,6,'lobby');await walk(-4,0,'lobby');await walk(-13.9,0,'lobby','scents');
 await page.waitForFunction(()=>ArchiveDiagnostics.state.cameraMode==='perspective');await walk(0,0,'scents');await page.waitForTimeout(1000);
 const museum=await state();await page.screenshot({path:out+'/museum-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:out+'/museum-mobile.png'});await page.setViewportSize({width:1200,height:800});
 await walk(0,-1.7,'scents');await page.locator('#interact').click();await expect(page.locator('#detail')).toBeVisible();await page.locator('[data-close=detail]').click();
 await walk(2.2,-1.7,'scents');await walk(12,-1.7,'scents');await walk(13.4,0,'scents','lobby');
 await walk(-4,0,'lobby');await walk(-4,4.8,'lobby');await walk(4,4.8,'lobby');await walk(4,0,'lobby');await walk(13.9,0,'lobby','books');
 await walk(-7.2,3.7,'books');await walk(0,6.4,'books');await page.waitForTimeout(900);const library=await state();await page.screenshot({path:out+'/library-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:out+'/library-mobile.png'});await page.setViewportSize({width:1200,height:800});
 await walk(-7.2,3.7,'books');await walk(-7.2,7.2,'books');await walk(-9.5,7.05,'books');await page.waitForFunction(()=>ArchiveDiagnostics.state.seat?.startsWith('books-window'));await page.locator('#stand-up').click();await page.waitForFunction(()=>!ArchiveDiagnostics.state.seat);
 expect(errors).toEqual([]);const result={isolatedPreview:true,museum,library,newReadingSeats:true,allWalksPhysical:true,errors};await writeFile(out+'/browser-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
