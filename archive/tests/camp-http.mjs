// Explicit preview-only integration check. Never call archive-live.
import assert from 'node:assert/strict';
const endpoint='https://jqlrwwheiwjdrobluifx.supabase.co/functions/v1/archive-camp-preview?forceFunctionRegion=eu-west-1';
const key='sb_publishable_jQ8AERL_i5ecVFbM0NgX_g_rAxIBPTb';
const clients=[];const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function request(c,body,expected=200){const r=await fetch(endpoint,{method:'POST',headers:{apikey:key,'content-type':'application/json','x-region':'eu-west-1',origin:'https://andy-git-feat-starlight-camp-social-asdf-15dc.vercel.app',...(c?.token?{authorization:'Bearer '+c.token}:{})},body:JSON.stringify({connectionId:c?.connectionId||crypto.randomUUID(),...body}),signal:AbortSignal.timeout(20000)});const data=await r.json();assert.equal(r.status,expected,JSON.stringify({status:r.status,error:data.error}));return data;}
async function join(i){const c={connectionId:crypto.randomUUID(),batch:0};const d=await request(c,{op:'join',nickname:'검수 '+i,adult:true,appearance:{kind:i%8}});c.token=d.token;c.id=d.id;c.snapshot=d.snapshot;clients.push(c);return c;}
async function tick(c,actions=[]){const d=await request(c,{op:'tick',batch:++c.batch,actions});c.snapshot=d.snapshot;return d;}
const start=Date.now();
try{
 const a=await join(0),b=await join(1);assert.equal(a.snapshot.serverMode,undefined);assert.ok(a.token);assert.equal(JSON.stringify(a.snapshot).includes(a.token),false);
 await delay(500);
 for(const c of [a,b]){const p=c.snapshot.players.find(p=>p.id===c.id);const d=await tick(c,[{type:'move',room:p.room,epoch:p.epoch,x:0,z:3.6,yaw:Math.PI,motion:'walk',path:[[1,0,3.6]]}]);assert.equal(d.receipts[0].error,undefined);}
 const room=a.snapshot.players.find(p=>p.id===a.id).room;
 const race=await Promise.all([a,b].map(c=>tick(c,[{type:'sit',seat:room+'-seat-0'}])));assert.equal(race.filter(d=>!d.receipts[0].error).length,1);assert.equal(race.filter(d=>d.receipts[0].error?.includes('이미')).length,1);
 const message='미리보기 소셜 검수 '+crypto.randomUUID().slice(0,8);await tick(a,[{type:'chat',text:message}]);let d=await tick(b);assert.ok(d.snapshot.messages.some(m=>m.text===message));
 d=await tick(b,[{type:'mute',target:a.id,value:true}]);assert.equal(d.snapshot.messages.some(m=>m.text===message),false);
 d=await tick(b,[{type:'block',target:a.id,value:true}]);assert.equal(d.snapshot.players.some(p=>p.id===a.id),false);
 d=await tick(a);assert.equal(d.snapshot.players.some(p=>p.id===b.id),false);
 d=await tick(b,[{type:'listen',value:true},{type:'chat',text:'듣기모드 검증'}]);assert.match(d.receipts[1].error,/듣기/);
 d=await tick(b,[{type:'host',command:'camp-question',value:{question:'권한 거절 검수'}}]);assert.match(d.receipts[0].error,/권한/);
 d=await tick(b,[{type:'report',target:a.id,reason:'검수용 신고 · 실제 위반 아님'}]);assert.equal(d.receipts[0].error,undefined);
 await request(b,{op:'admin'},403);
 for(let i=2;i<20;i++){await join(i);if(i%4===0)await Promise.all(clients.map(c=>tick(c)));}
 d=await tick(a);assert.deepEqual(d.snapshot.rooms.map(r=>r.people),[6,6,6,2]);
 await request(null,{op:'join',nickname:'정원초과 검수',adult:true,appearance:{}},400);
 console.log(JSON.stringify({result:'PASS',clients:20,camps:d.snapshot.rooms.map(r=>r.people),checks:['shared chat','atomic seat race','mute','bilateral block','listen','report','host authorization','capacity','token redaction'],durationMs:Date.now()-start,note:'Real preview HTTP/DB requests; not a mobile FPS or sustained load benchmark'}));
}finally{const cleanup=await Promise.allSettled(clients.map(c=>request(c,{op:'leave'})));console.log(JSON.stringify({leaveSucceeded:cleanup.filter(r=>r.status==='fulfilled').length,ownTestClients:clients.length}));}
