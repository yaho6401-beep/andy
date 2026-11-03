import assert from 'node:assert/strict';import {readFile,writeFile} from 'node:fs/promises';import {SEATS} from '../src/seats.js';
const cfg=JSON.parse((await readFile('../feedback-config.js','utf8')).split('=')[1].trim().replace(/;$/,'')),url=cfg.endpoint.replace('feedback-wall','archive-live')+'?forceFunctionRegion=eu-west-1';
const headers={apikey:cfg.key,'Content-Type':'application/json','x-region':'eu-west-1'},clients=[],latencies=[];let adminToken=process.env.ARCHIVE_TEST_ADMIN_TOKEN||await new Promise(resolve=>{let token='';process.stdin.on('data',b=>token+=b);process.stdin.on('end',()=>resolve(token.trim()));});
async function request(body,token,extra={}){const started=performance.now(),r=await fetch(url,{method:'POST',headers:{...headers,...(token?{Authorization:'Bearer '+token}:{}),...extra},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)}),data=await r.json();return {status:r.status,data,ms:performance.now()-started};}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function tick(c,actions=[]){const r=await request({op:'tick',connectionId:c.conn,batch:++c.batch,actions,contentVersion:c.contentVersion,notesVersion:c.notesVersion},c.token);assert.equal(r.status,200,JSON.stringify(r.data));c.snap=r.data.snapshot;c.contentVersion=r.data.contentVersion;c.notesVersion=r.data.notesVersion;return r;}
try{
 assert.equal((await request({op:'tick',batch:1})).status,401);
 assert.equal((await request({op:'join',nickname:'권한 검증',adult:false,connectionId:'minor'})).status,400);
 assert.equal((await request({op:'join',nickname:'가짜 관리자',adult:true,connectionId:'fake',adminToken:'forged'})).status,403);
 assert.equal((await request({op:'join',nickname:'출처 검증',adult:true,connectionId:'origin'},null,{Origin:'https://attacker.invalid'})).status,403);
 assert.ok(adminToken,'test administrator token required');
 const joins=await Promise.all(Array.from({length:20},async(_,i)=>{const conn=crypto.randomUUID(),r=await request({op:'join',nickname:'검증 '+i,adult:true,connectionId:conn,adminToken:i===19?adminToken:undefined,appearance:{kind:i%8}});assert.equal(r.status,200,JSON.stringify(r.data));const c={id:r.data.id,token:r.data.token,conn,batch:0,snap:r.data.snapshot};clients[i]=c;return c;}));
 console.log('20 joins complete');await wait(300);const count=await tick(clients[0]);assert.equal(count.data.snapshot.players.length,20);
 assert.equal((await request({op:'join',nickname:'초과 입장',adult:true,connectionId:crypto.randomUUID()})).status,409);
 assert.equal((await request({op:'join',nickname:'중복 입장',adult:true,connectionId:crypto.randomUUID()},clients[0].token)).status,409);
 assert.equal((await request({op:'admin',connectionId:clients[0].conn},clients[0].token)).status,403);
 await wait(250);let denied=await tick(clients[0],[{type:'host',command:'close'},{type:'barista-duty'}]);assert.ok(denied.data.receipts.every(r=>/권한/.test(r.error)));
 const hostView=await request({op:'admin',connectionId:clients[19].conn},clients[19].token);assert.equal(hostView.status,200);assert.ok(hostView.data.members.length>=20);assert.equal(JSON.stringify(hostView.data).includes('token_hash'),false);
 // Ten seconds at twenty participants, two snapshots per second each.
 await Promise.all(clients.map(async c=>{for(let i=0;i<20;i++){const start=performance.now();const r=await tick(c);latencies.push(r.ms);assert.equal(r.data.snapshot.players.length,20);assert.equal(JSON.stringify(r.data.snapshot).includes('connectionId'),false);await wait(Math.max(0,500-(performance.now()-start)));}}));
 console.log('400 load requests complete');
 // Walk two real server-authorized avatars to one garden bench.
 const [a,b,outside]=clients;
 for(const c of [a,b]){let seq=c.snap.players.find(p=>p.id===c.id).seq;for(const [x,z]of [[1.2,5.5],[2.4,5.5],[3.6,5.5],[c===a?4.3:5.3,4.3]]){await wait(500);const me=c.snap.players.find(p=>p.id===c.id);await tick(c,[{type:'move',room:me.room,epoch:me.epoch,path:[[ ++seq,x,z]],x,z,yaw:0,motion:'walk'}]);}const seat=SEATS.find(s=>s.room==='garden'&&s.group==='garden-bench-1'&&s.id.endsWith(c===a?'-1':'1')&&s.x===(c===a?4.3:5.3));await wait(300);const sit=await tick(c,[{type:'sit',seat:seat.id}]);assert.ok(!sit.data.receipts.some(r=>r.error),JSON.stringify(sit.data.receipts));}
 await wait(1300);const text='공유서버 비밀 SHARED-PRIVATE-851';await tick(a,[{type:'chat',scope:'whisper',text}]);await wait(300);const privateView=await tick(b);assert.ok(privateView.data.snapshot.messages.some(m=>m.text===text));const outsideView=await tick(outside);assert.equal(outsideView.data.snapshot.messages.some(m=>m.text===text),false);
 await wait(300);const me=outside.snap.players.find(p=>p.id===outside.id);const teleport=await tick(outside,[{type:'move',room:me.room,epoch:me.epoch,path:[[1,7.4,-7.4]],x:7.4,z:-7.4,yaw:0}]);assert.ok(teleport.data.snapshot.players.find(p=>p.id===outside.id).correction>0);
 const sorted=latencies.toSorted((a,b)=>a-b),report={passed:true,participants:20,loadRequests:latencies.length,p50ms:Math.round(sorted[Math.floor(sorted.length*.5)]),p95ms:Math.round(sorted[Math.floor(sorted.length*.95)]),security:['missing session','minor consent','forged admin','origin','capacity','duplicate connection','guest admin rejection','host authorization','private whisper isolation','teleport rejection','private server fields excluded']};await writeFile('.local/shared-server-result.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await Promise.all(clients.filter(Boolean).map(c=>request({op:'leave',connectionId:c.conn},c.token).catch(()=>{})));}
