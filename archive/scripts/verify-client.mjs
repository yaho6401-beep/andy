import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {validPosition,validMove,PORTALS} from '../src/protocol.js';
const output=resolve(import.meta.dirname,'../.local/refine');await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],results=[];
function route(room,start,end){
 const unit=.4,key=(x,z)=>x+','+z,grid=(v)=>Math.round(v/unit),sx=grid(start[0]),sz=grid(start[1]),ex=grid(end[0]),ez=grid(end[1]);
 const queue=[[sx,sz]],seen=new Map([[key(sx,sz),null]]);let finish;
 for(let at=0;at<queue.length;at++){const [x,z]=queue[at];if(x===ex&&z===ez){finish=[x,z];break;}for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz,k=key(xx,zz);if(seen.has(k)||!validPosition(room,xx*unit,zz*unit)||!validMove(room,x*unit,z*unit,xx*unit,zz*unit))continue;seen.set(k,[x,z]);queue.push([xx,zz]);}}
 assert.ok(finish,'route '+room);const points=[];for(let p=finish;p;p=seen.get(key(...p)))points.unshift(p.map(v=>v*unit));
 return points.filter((p,i)=>!i||i===points.length-1||Math.sign(p[0]-points[i-1][0])!==Math.sign(points[i+1][0]-p[0])||Math.sign(p[1]-points[i-1][1])!==Math.sign(points[i+1][1]-p[1]));
}
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('archive-look','{damaged');localStorage.setItem('archive-private-thoughts',JSON.stringify({lines:'bad'}));});
 await p.goto('http://127.0.0.1:4173/archive/');await p.waitForFunction(()=>globalThis.ArchiveDiagnostics);
 await p.waitForTimeout(1200);const before=await p.evaluate(()=>ArchiveDiagnostics.state);
 // Changing appearance many times used to leave old avatar buffers in GPU memory.
 for(let i=0;i<24;i++)await p.locator(`[data-kind="${i%8}"]`).click();
 await p.waitForTimeout(300);const after=await p.evaluate(()=>ArchiveDiagnostics.state);assert.ok(after.geometries<before.geometries+35,JSON.stringify({before,after}));
 await p.locator('[name=nickname]').fill('공간 점검');await p.locator('[name=adult]').check();await p.locator('#entry-form [type=submit]').click();await p.waitForFunction(()=>ArchiveDiagnostics.state.joined);
 console.log('Entry and 24 avatar changes passed.');const state=()=>p.evaluate(()=>ArchiveDiagnostics.state);let held=false;
 async function walk(end,expected){
  const initial=await state(),points=route(initial.space,[initial.position[0],initial.position[2]],end);let changed=false;
  for(const [tx,tz]of points){let steps=0;while(steps++<140){const s=await state();if(s.space!==initial.space){changed=true;break;}const dx=tx-s.position[0],dz=tz-s.position[2],d=Math.hypot(dx,dz);if(d<.16)break;
   if(await p.locator('dialog[open]').count())await p.locator('dialog[open] [data-close]').first().click();
   const x=(dx-dz)/d*.707,z=(dx+dz)/d*.707;
   const r=await p.locator('#joystick').boundingBox();await p.mouse.move(r.x+r.width/2+x*34,r.y+r.height/2+z*34);if(!held){await p.mouse.down();held=true;}
   await p.waitForTimeout(Math.min(100,Math.max(30,d/3.2*900)));
  }if(changed)break;if(steps>=140){await p.screenshot({path:resolve(output,'stuck.png')});console.log('Stuck UI',await p.evaluate(()=>{const e=document.getElementById('joystick'),r=e.getBoundingClientRect();return {top:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML,thumb:document.getElementById('joystick-thumb').style.transform,dialog:!!document.querySelector('dialog[open]'),chat:document.getElementById('chat-panel').hidden};}));}assert.ok(steps<140,'stuck '+JSON.stringify(await state()));}
  await p.mouse.up();held=false;
  if(expected)await p.waitForFunction(room=>ArchiveDiagnostics.state.space===room,expected,{timeout:8000});
  await p.waitForTimeout(550);console.log('Walk',end,expected||'',JSON.stringify((await state()).position));
 }
 await walk([0,-6.8],'lobby');results.push({check:'garden doorway',state:await state()});
 // Go around the central fountain, then through the scent wing.
 await walk([-2.8,3.8]);await walk([-6.8,0],'scents');await p.screenshot({path:resolve(output,'scents-mobile.png')});
 // Move away to arm the return doorway, then return.
 await walk([4.4,0]);await walk([6.8,0],'lobby');
 await walk([-2.8,3.8]);await walk([2.8,3.8]);await walk([6.8,0],'books');await p.screenshot({path:resolve(output,'books-mobile.png')});
 await walk([-5.8,2.5]);await walk([-6.8,0],'lobby');
 await walk([3,-3]);await walk([0,-6.8],'salon');
 await walk([0,3]);await walk([0,-2.4]);
 await p.waitForFunction(()=>document.getElementById('detail').open,{timeout:6000});
 await p.locator('[data-menu-item="coffee-0"]').click();await p.waitForFunction(()=>ArchiveDiagnostics.state.orderStatus==='preparing');
 const countdown1=await p.locator('#cafe-order-action').textContent();await p.waitForTimeout(2100);const countdown2=await p.locator('#cafe-order-action').textContent();assert.notEqual(countdown1,countdown2);
 await p.waitForFunction(()=>ArchiveDiagnostics.state.orderStatus==='ready',{timeout:35000});
 await p.locator('#cafe-order-action').click();await p.waitForFunction(()=>!!ArchiveDiagnostics.state.heldItem);
 const controls=await p.evaluate(()=>{const j=document.getElementById('joystick').getBoundingClientRect(),a=document.querySelector('.action-dock').getBoundingClientRect();return {joystickRight:j.right,actionsLeft:a.left};});assert.ok(controls.joystickRight<controls.actionsLeft,JSON.stringify(controls));await walk([1.3,-2.1]);await p.locator('#cafe-order-action').click();await p.waitForFunction(()=>ArchiveDiagnostics.state.placedCount===1);await p.screenshot({path:resolve(output,'cafe-mobile.png')});
 // Typing must release a previously held movement input.
 await p.keyboard.down('s');await p.locator('#chat-open').click();await p.keyboard.up('s');const stopped=(await state()).position;await p.waitForTimeout(700);const still=(await state()).position;assert.ok(Math.hypot(still[0]-stopped[0],still[2]-stopped[2])<.1);await p.locator('#chat-close').click();
 results.push({check:'cafe order, pickup, placement, focus',countdown1,countdown2,state:await state()});
 await context.close();
 // Safari/private modes may deny storage entirely. Entry UI should still work.
 const blocked=await browser.newPage({viewport:{width:1280,height:800}});blocked.on('pageerror',e=>errors.push(e.message));await blocked.addInitScript(()=>{for(const key of ['localStorage','sessionStorage'])Object.defineProperty(window,key,{get(){throw new DOMException('blocked','SecurityError');}});});await blocked.goto('http://127.0.0.1:4173/archive/');await blocked.waitForFunction(()=>globalThis.ArchiveDiagnostics);await blocked.locator('[data-kind="4"]').click();await blocked.locator('[name=adult]').check();await blocked.locator('#entry-form [type=submit]').click();await blocked.waitForFunction(()=>ArchiveDiagnostics.state.joined);results.push({check:'storage denied',state:await blocked.evaluate(()=>ArchiveDiagnostics.state)});await blocked.close();
 assert.deepEqual(errors,[]);await writeFile(resolve(output,'browser-results.json'),JSON.stringify({errors,results},null,2));console.log(JSON.stringify({errors,results},null,2));
}finally{await browser.close();}
