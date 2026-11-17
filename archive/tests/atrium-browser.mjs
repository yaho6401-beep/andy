import {CAMP} from '../camp/layout.js';
import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.GALLERY_BASE||'http://127.0.0.1:4184',out='.local/atrium-review';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('**/functions/v1/**',r=>{requests.push(r.request().url());return r.abort();});
const state=()=>page.evaluate(()=>ArchiveDiagnostics.state);
async function enter(room){await page.goto(base+'/archive/?start='+room);await page.waitForFunction(()=>globalThis.ArchiveDiagnostics?.state.artLoaded);await page.locator('[name=nickname]').fill('넓어진 향기 산책');await page.locator('[name=adult]').check();await page.locator('#entry-form [type=submit]').click();await page.waitForFunction(room=>ArchiveDiagnostics.state.joined&&ArchiveDiagnostics.state.space===room,room);await page.waitForTimeout(900);}
async function walk(x,z,room,next){let held=[];const start=Date.now();try{while(Date.now()-start<22000){const s=await state();if(next&&s.space===next)return;if(s.space!==room)throw Error('Wrong room '+JSON.stringify(s));if(!next&&Math.hypot(x-s.position[0],z-s.position[2])<.25)return;if(s.seat){await page.locator('#stand-up').click();await page.waitForFunction(()=>!ArchiveDiagnostics.state.seat);}if(await page.locator('#detail[open]').count())await page.locator('[data-close=detail]').click();const dx=x-s.position[0],dz=z-s.position[2],sx=(dx-dz)*.707,sy=(dx+dz)*.707,len=Math.max(.001,Math.hypot(sx,sy)),keys=[];if(Math.abs(sx/len)>.37)keys.push(sx>0?'d':'a');if(Math.abs(sy/len)>.37)keys.push(sy>0?'s':'w');for(const k of held)if(!keys.includes(k))await page.keyboard.up(k);for(const k of keys)if(!held.includes(k))await page.keyboard.down(k);held=keys;await page.waitForTimeout(90);}throw Error('Walk timeout '+JSON.stringify(await state()));}finally{for(const k of held)await page.keyboard.up(k);}}
async function tap(x,z){await page.waitForTimeout(300);const p=await page.evaluate(({x,z})=>ArchiveDiagnostics.projectPoint(x,z),{x,z});expect(p.visible).toBe(true);await page.mouse.click(p.x,p.y);}
async function shots(room){await page.waitForTimeout(700);await page.screenshot({path:out+'/'+room+'-desktop.png'});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:out+'/'+room+'-mobile.png'});await page.setViewportSize({width:1200,height:800});await page.waitForTimeout(300);}
try{
 await enter('lobby');const originalId=(await state()).id;await shots('lobby');
 await walk(9,5.5,'lobby');await walk(9,8.4,'lobby','camp');await page.waitForFunction(()=>ArchiveDiagnostics.state.portalArmed);expect((await state()).id).toBe(originalId);await shots('camp');
 // Actually approach a log, auto-sit, keep private thoughts local, then walk back.
 await walk(1,3.6,'camp');await tap(.25,3.5);await page.waitForFunction(()=>ArchiveDiagnostics.state.seat?.startsWith('camp-main'),null,{timeout:8000});
 await expect(page.locator('.private-thought').first()).toBeVisible();await page.locator('#stand-up').click();await page.waitForFunction(()=>!ArchiveDiagnostics.state.seat);
 await walk(CAMP.gate.x,CAMP.gate.z,'camp','lobby');expect((await state()).id).toBe(originalId);
 await walk(4,5.5,'lobby');await walk(4,-10.7,'lobby');await walk(0,-12.9,'lobby','salon');await walk(0,4.5,'salon');await shots('salon');
 // A real order, real 30-second preparation and pickup at the relocated bar.
 await walk(0,-5.5,'salon');await expect(page.locator('[data-menu-item=coffee-0]')).toBeVisible({timeout:4000});await page.locator('[data-menu-item=coffee-0]').click();await page.waitForFunction(()=>ArchiveDiagnostics.state.orderStatus==='preparing');
 await page.waitForFunction(()=>ArchiveDiagnostics.state.orderStatus==='ready',null,{timeout:35000});await page.locator('#cafe-order-action').click();await page.waitForFunction(()=>ArchiveDiagnostics.state.heldItem==='coffee-0');
 await walk(3,-3.5,'salon');await walk(3.9,-1.8,'salon');await page.locator('#interact').click();await page.waitForFunction(()=>ArchiveDiagnostics.state.heldItem===null);await page.waitForTimeout(900);
 // Two-seater round table: same existing sit/stand and whisper controls.
 await walk(3,2.3,'salon');await walk(6.8,4.25,'salon');await page.waitForFunction(()=>ArchiveDiagnostics.state.seat?.startsWith('cafe-4'),null,{timeout:8000});await page.locator('#stand-up').click();await page.waitForFunction(()=>!ArchiveDiagnostics.state.seat);
 await walk(0,10,'salon');await walk(0,12.9,'salon','lobby');
 expect((await state()).corrections).toBe(0);expect(errors).toEqual([]);expect(requests).toEqual([]);
 const result={base,physicalLobbyCampRoundTrip:true,sameAvatar:true,campLogSeating:true,cafeRoundTrip:true,cafeOrder30Seconds:true,pickupAndNearPlacement:true,roundTableSeat:true,mobileViewport:'390×844',zeroProductionApiRequests:true,final:await state(),errors};await writeFile(out+'/browser-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}catch(e){await page.screenshot({path:out+'/failure.png'});console.log(JSON.stringify({state:await state(),toast:await page.locator('#toast').textContent(),errors}));throw e;}finally{await browser.close();}
