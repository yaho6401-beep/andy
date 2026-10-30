import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const ctx=vm.createContext({});vm.runInContext(await readFile(new URL('../supabase/functions/feedback-wall/runner-engine.js',import.meta.url),'utf8'),ctx);const E=ctx.PerfumeRunnerEngine;
let direct=E.create(123),record=[],replayed=E.create(123);
for(let t=1;t<=19000;t++){
 const input={t,s:1,j:t%140<55?1:0};if(direct.over)input.r=1;
 E.step(direct,input);record.push(input);
 if(t%600===0){replayed=E.replay(replayed,t,record);record=[];assert.equal(JSON.stringify(replayed),JSON.stringify(direct));}
}
assert.ok(direct.active>=18000);assert.ok(direct.score>=1000);assert.ok(E.eligible(direct));
assert.equal(E.eligible({...direct,active:17999}),false);assert.equal(E.eligible({...direct,score:999}),false);
assert.throws(()=>E.replay(E.create(1),901,[]));assert.throws(()=>E.replay(E.create(1),10,[{t:11,s:1}]));assert.throws(()=>E.replay(E.create(1),10,[{t:1,score:99999}]));
const paused=E.create(1);paused.over=true;for(let i=0;i<300;i++)E.step(paused);assert.equal(paused.active,0);E.step(paused,{r:1});assert.equal(paused.hp,3);assert.equal(paused.active,0);
const jump=E.create(1);E.step(jump,{j:1});assert.ok(jump.y<338);E.step(jump,{s:1});assert.ok(jump.bolts.length>0);
const bossTypes=[];for(const ticks of [3600,10800,16200]){const s=E.create(1);s.active=ticks-1;s.bossStage=bossTypes.length;E.step(s);bossTypes.push(s.enemies.find(e=>e.boss).type);}assert.equal(bossTypes.join(','),'rat,rabbit,bear');
console.log('Five-minute deterministic replay, active-time eligibility, score threshold, restart, jumping, spray, boss sequence and forged-input rejection passed.');
