import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const root=resolve(import.meta.dirname,'..'),require=createRequire(resolve(root,'archive/package.json'));
const {chromium}=require('playwright'),{build}=require('esbuild');
// Execute the entire Edge router with fake environment/network, never production credentials.
const compiled=await build({entryPoints:[resolve(root,'supabase/functions/feedback-wall/index.ts')],bundle:true,format:'iife',platform:'browser',target:'es2022',write:false});
let handler;const calls=[];const fakeFetch=async(url,opts={})=>{calls.push({url,opts});if(String(url).includes('workshop_feedback_sessions'))return Response.json([{token_hash:'test'}]);if(String(url).includes('feedback_action_limit'))return Response.json(true);if(String(url).includes('workshop_analytics'))return Response.json({metrics:{visitors:75}});if(String(url).includes('workshop_site_events'))return new Response(null,{status:201});return Response.json({});};
new Function('Deno','fetch',compiled.outputFiles[0].text)({env:{get:k=>({SUPABASE_URL:'https://test.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-secret',SUPABASE_ANON_KEY:'test-public'}[k])},serve:fn=>handler=fn},fakeFetch);
const send=(path,body,token)=>handler(new Request('https://test.invalid/functions/v1/feedback-wall'+path,{method:body?'POST':'GET',headers:{apikey:'test-public',Origin:'https://andy-plum.vercel.app',...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})}));
assert.equal((await send('/management/analytics')).status,401);
assert.equal((await send('/management/analytics?days=365',null,'b'.repeat(64))).status,400);
assert.equal((await send('/management/analytics?days=30',null,'b'.repeat(64))).status,200);
assert.equal((await send('/management/analytics?visitor=oops',null,'b'.repeat(64))).status,400);
const payload={id:crypto.randomUUID(),visitor:crypto.randomUUID(),kind:'action',position:'story',sessionId:crypto.randomUUID(),utmSource:'instagram',utmCampaign:'profile',referrerHost:'l.instagram.com',page:'/?private=hidden',device:'mobile'};
assert.equal((await send('/visit',payload)).status,200);
const saved=JSON.parse(calls.findLast(x=>x.url.includes('workshop_site_events')).opts.body);assert.equal(saved.source,'instagram');assert.equal(saved.page,'/');assert.equal(saved.position,'story');assert.equal(saved.visitor_hash.length,64);assert(!JSON.stringify(saved).includes(payload.visitor));
assert.equal((await send('/visit',{...payload,position:'anything-private'})).status,400);
assert.equal((await send('/visit',{id:crypto.randomUUID(),visitor:crypto.randomUUID(),kind:'booking',position:'hero'})).status,200);
assert(!('source' in JSON.parse(calls.findLast(x=>x.url.includes('workshop_site_events')).opts.body)));
console.log('PASS: Edge admin authorization, invalid filters, source sanitization, action allowlist, HMAC, old-client compatibility.');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
const server=createServer(async(req,res)=>{try{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path.endsWith('/'))path+='index.html';const file=resolve(root,'.'+path);if(!file.startsWith(root+'\\')&&!file.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end('Not found');}});await new Promise(r=>server.listen(4193,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),events=[];
 await context.route('**/functions/v1/**',async route=>{const u=new URL(route.request().url());if(u.pathname.endsWith('/visit')){events.push(route.request().postDataJSON());return route.fulfill({json:{recorded:true}});}if(u.pathname.endsWith('/stats'))return route.fulfill({json:{visitors:75,views:349,totalViews:349}});return route.abort();});
 const p=await context.newPage();await p.goto('http://127.0.0.1:4193/?utm_source=instagram&utm_medium=social&utm_campaign=profile&utm_content=bio');await p.waitForTimeout(600);
 if(await p.locator('#solo-announcement').evaluate(e=>e.open))await p.locator('#solo-announcement [data-announcement-close]').first().click();
 assert.equal(events[0].kind,'visit');assert.equal(events[0].utmSource,'instagram');const visitor=events[0].visitor,session=events[0].sessionId;
 await p.locator('.site-navigation a[href="#make"]').click();await p.waitForTimeout(100);assert(events.some(x=>x.kind==='action'&&x.position==='make'));
 await p.reload();await p.waitForTimeout(300);assert.equal(events.filter(x=>x.kind==='visit').at(-1).visitor,visitor);assert.equal(events.filter(x=>x.kind==='visit').at(-1).sessionId,session);
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('books-scents-session-v2'));s.last-=31*60000;localStorage.setItem('books-scents-session-v2',JSON.stringify(s));});await p.reload();await p.waitForTimeout(300);assert.notEqual(events.filter(x=>x.kind==='visit').at(-1).sessionId,session);
 await p.evaluate(()=>localStorage.setItem('books-scents-analytics-exclude','1'));const before=events.length;await p.reload();await p.waitForTimeout(300);assert.equal(events.length,before);
 console.log('PASS: mobile client source labels, menu tracking, persistent browser identity, session expiry, opt-out.');
 await context.close();
 const admin=await browser.newContext({viewport:{width:390,height:844}}),apiCalls=[];
 const fixture={days:30,today:'2026-11-16',metrics:{visitors:75,new_visitors:60,returning_visitors:15,views:349,sessions:94,bookings:16},sources:[{name:'instagram',visitors:40,views:120,bookings:9},{name:'unrecorded',visitors:35,views:229,bookings:7}],campaigns:[{source:'instagram',medium:'social',campaign:'profile',content:'bio',views:120,bookings:9}],actions:[{name:'make',visitors:30,events:45}],devices:[{name:'mobile',visitors:65}],daily:Array.from({length:30},(_,i)=>({day:'2026-11-'+String(i+1).padStart(2,'0'),visitors:(i*7)%20,views:i*2,bookings:i%3})),browsers:[{code:'a'.repeat(12),key:'a'.repeat(64),first_at:'2026-10-30T12:00:00Z',last_at:new Date().toISOString(),sessions:3,lifetime_days:4,source:'instagram',device:'mobile',bookings:1}],total:1,page:1,pages:1,timeline:[{created_at:new Date().toISOString(),kind:'action',position:'make',source:'instagram',session:'test'}],trackingStartedAt:null};
 await admin.route('**/functions/v1/**',route=>{const u=new URL(route.request().url());apiCalls.push(u.pathname+u.search);if(u.pathname.endsWith('/admin/login'))return route.fulfill({json:{token:'b'.repeat(64)}});if(u.pathname.endsWith('/management/analytics'))return route.fulfill({json:fixture});if(u.pathname.endsWith('/management/summary'))return route.fulfill({json:{records:1,applications:2,memos:3}});if(u.pathname.endsWith('/admin/logout'))return route.fulfill({json:{loggedOut:true}});return route.fulfill({json:{items:[],page:1,pages:1,total:0}});});
 const ap=await admin.newPage(),errors=[];ap.on('pageerror',e=>errors.push(e.message));await ap.goto('http://127.0.0.1:4193/admin.html');assert.equal(await ap.locator('.analytics').count(),0);await ap.locator('#management-password').fill('test-only');await ap.locator('#management-login button').click();await ap.locator('#analytics-title').waitFor();
 assert.equal(await ap.locator('.analytics-metrics strong').first().textContent(),'75');assert.equal(await ap.locator('.admin-toolbar').isVisible(),false);
 assert(await ap.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await ap.screenshot({path:resolve(root,'.release/analytics-mobile.png'),fullPage:true});
 await ap.locator('#analytics-days').selectOption('7');await ap.waitForTimeout(100);assert(apiCalls.some(x=>x.includes('days=7')));
 await ap.locator('[data-analytics-visitor]').click();await ap.locator('#analytics-timeline h4').waitFor();assert(await ap.locator('#analytics-timeline').textContent());
 await ap.locator('#analytics-source').selectOption('store_qr');assert((await ap.locator('#analytics-link').inputValue()).includes('utm_source=store_qr'));
 await ap.locator('#analytics-exclude').check();assert.equal(await ap.evaluate(()=>localStorage.getItem('books-scents-analytics-exclude')),'1');
 await ap.locator('[data-tab="records"]').click();await ap.waitForTimeout(200);assert.equal(await ap.locator('.analytics').count(),0);assert(await ap.locator('.admin-toolbar').isVisible());
 await ap.locator('[data-tab="analytics"]').click();await ap.locator('#analytics-title').waitFor();await ap.setViewportSize({width:1440,height:1000});assert(await ap.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await ap.screenshot({path:resolve(root,'.release/analytics-desktop.png'),fullPage:true});
 await ap.locator('#management-logout').click();await ap.locator('#management-login').waitFor();assert.equal(await ap.locator('.analytics').count(),0);assert.deepEqual(errors,[]);
 console.log('PASS: admin login gate, analytics metrics, mobile/desktop overflow, period filter, visitor detail, campaign link generator, self exclusion, existing tabs and logout.');
 await admin.close();
}finally{await browser.close();await new Promise(r=>server.close(r));}


