import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {CAMP} from '../camp/layout.js';
const base=process.env.GALLERY_BASE||'http://127.0.0.1:4184',out='.local/camp-tents-review';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('**/functions/v1/**',r=>{requests.push(r.request().url());return r.abort();});
const state=()=>page.evaluate(()=>ArchiveDiagnostics.state);
async function walk(x,z,room='camp',next){let held=[];const start=Date.now();try{while(Date.now()-start<22000){const s=await state();if(next&&s.space===next)return;if(s.space!==room)throw Error('Wrong room '+JSON.stringify(s));if(!next&&Math.hypot(x-s.position[0],z-s.position[2])<.22)return;if(s.seat){await page.locator('#stand-up').click();await page.waitForFunction(()=>!ArchiveDiagnostics.state.seat);}if(await page.locator('#detail[open]').count())await page.locator('[data-close=detail]').click();const dx=x-s.position[0],dz=z-s.position[2],sx=(dx-dz)*.707,sy=(dx+dz)*.707,len=Math.max(.001,Math.hypot(sx,sy)),keys=[];if(Math.abs(sx/len)>.37)keys.push(sx>0?'d':'a');if(Math.abs(sy/len)>.37)keys.push(sy>0?'s':'w');for(const k of held)if(!keys.includes(k))await page.keyboard.up(k);for(const k of keys)if(!held.includes(k))await page.keyboard.down(k);held=keys;await page.waitForTimeout(90);}throw Error('Walk timeout '+JSON.stringify(await state()));}finally{for(const k of held)await page.keyboard.up(k);}}
async function shots(name){await page.waitForTimeout(900);await page.screenshot({path:out+'/'+name+'-desktop.png'});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:out+'/'+name+'-mobile.png'});await page.setViewportSize({width:1200,height:800});await page.waitForTimeout(400);}
try{
 await page.goto(base+'/archive/?start=lobby');await page.waitForFunction(()=>globalThis.ArchiveDiagnostics?.state.artLoaded);await page.locator('[name=nickname]').fill('텐트 안의 책 한 권');await page.locator('[name=adult]').check();await page.locator('#entry-form [type=submit]').click();await page.waitForFunction(()=>ArchiveDiagnostics.state.joined&&ArchiveDiagnostics.state.space==='lobby');
 await walk(9,5.5,'lobby');await walk(9,8.4,'lobby','camp');await page.waitForFunction(()=>ArchiveDiagnostics.state.portalArmed);const id=(await state()).id;await shots('expanded-camp');
 const tents=[];
 for(const t of CAMP.tents){
  await walk(t.x<0?-3:3,4.2);await walk(t.x,4.2);await walk(t.x,1.3);await walk(t.x,-1.8);
  await page.waitForFunction(id=>ArchiveDiagnostics.state.campTent===id&&ArchiveDiagnostics.state.campCutaway.find(t=>t.id===id).opacity<.15,t.id);
  await expect(page.locator('#space-name')).toContainText(t.name);await shots('inside-'+t.id);
  // Each tent has its own pair of seats and private-thought controls.
  await walk(t.x-1.55,t.z+.55);await page.waitForFunction(id=>ArchiveDiagnostics.state.seat===`camp-tent-${id}-0`,t.id,{timeout:7000});await expect(page.locator('.private-thought').first()).toBeVisible();await page.locator('#stand-up').click();await page.waitForFunction(()=>!ArchiveDiagnostics.state.seat);
  tents.push({id:t.id,inside:true,cushion:true,cutaway:true});
  await walk(t.x,-1.8);await walk(t.x,1.3);await walk(t.x,4.2);
  await page.waitForFunction(id=>!ArchiveDiagnostics.state.campTent&&ArchiveDiagnostics.state.campCutaway.find(t=>t.id===id).opacity>.98,t.id);await walk(t.x<0?-3:3,4.2);
 }
 // New coast area well beyond the old 7 × 6.8 bounds.
 await walk(3,6.5);await walk(12.2,6.5);await walk(12.2,-8.5);await walk(10.8,-10.8);await shots('coast-promenade');
 await walk(12.2,-8.5);await walk(12.2,6.5);await walk(3,6.5);await walk(0,8.5);await walk(CAMP.gate.x,CAMP.gate.z,'camp','lobby');expect((await state()).id).toBe(id);expect((await state()).corrections).toBe(0);expect(errors).toEqual([]);expect(requests).toEqual([]);
 const result={base,expandedCoast:true,tents,physicalEnterExit:true,roofRestoredOnExit:true,lobbyRoundTrip:true,sameAvatar:true,mobileViewport:'390×844',zeroProductionRequests:true,final:await state(),errors};await writeFile(out+'/browser-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}catch(e){await page.screenshot({path:out+'/failure.png'});console.log(JSON.stringify({state:await state(),toast:await page.locator('#toast').textContent(),errors}));throw e;}finally{await browser.close();}
