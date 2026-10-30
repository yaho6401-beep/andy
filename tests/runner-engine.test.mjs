import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const ctx=vm.createContext({});vm.runInContext(await readFile(new URL('../supabase/functions/feedback-wall/runner-engine.js',import.meta.url),'utf8'),ctx);const E=ctx.PerfumeRunnerEngine;
let direct=E.create(123),record=[],replayed=E.create(123);
for(let t=1;t<=19000;t++){
 const close=direct.enemies.some(e=>e.type!=='obstacle'&&e.x<290&&e.x>140),obstacle=direct.enemies.some(e=>e.type==='obstacle'&&e.x<310&&e.x>80);const input={t,s:!direct.spray&&close&&direct.cool<=1?1:0,j:obstacle?1:0};if(direct.over)input.r=1;
 E.step(direct,input);record.push(input);
 if(t%600===0){replayed=E.replay(replayed,t,record);record=[];assert.equal(JSON.stringify(replayed),JSON.stringify(direct));}
}
assert.ok(direct.active>=18000);assert.ok(direct.score>=1000);assert.ok(E.eligible(direct));
assert.equal(E.eligible({...direct,active:17999}),false);assert.equal(E.eligible({...direct,score:999}),false);
assert.throws(()=>E.replay(E.create(1),901,[]));assert.throws(()=>E.replay(E.create(1),10,[{t:11,s:1}]));assert.throws(()=>E.replay(E.create(1),10,[{t:1,score:99999}]));
const paused=E.create(1);paused.over=true;for(let i=0;i<300;i++)E.step(paused);assert.equal(paused.active,0);E.step(paused,{r:1});assert.equal(paused.hp,3);assert.equal(paused.active,0);
const jump=E.create(1);E.step(jump,{j:1});assert.ok(jump.y<338);E.step(jump,{s:1});assert.ok(jump.bolts.length>0);
const bossTypes=[];for(const ticks of [3600,10800,16200]){const s=E.create(1);s.active=ticks-1;s.bossStage=bossTypes.length;E.step(s);bossTypes.push(s.enemies.find(e=>e.boss).type);}assert.equal(bossTypes.join(','),'rat,rabbit,bear');
const far=E.create(3);far.spawn=9999;far.enemies=[{id:90,x:600,y:338,type:'bear',boss:false,hp:3,maxHp:3}];E.step(far,{s:1});for(let i=0;i<25;i++)E.step(far);assert.equal(far.enemies[0].hp,3);assert.equal(far.bolts.length,0);
const combo=E.create(4);combo.spawn=9999;for(let n=0;n<5;n++){combo.enemies=[{id:100+n,x:216,y:338,type:'rat',boss:false,hp:1,maxHp:1}];E.step(combo,{s:1});for(let t=0;t<24;t++)E.step(combo,{s:0});}assert.equal(combo.combo,5);assert.ok(combo.fever>0);assert.ok(combo.perfects>=5);
const old=E.create(2);old.v=1;old.active=100;old.score=50;old.bolts=[{x:600,y:300}];E.step(old);assert.equal(old.v,2);assert.equal(old.active,101);assert.equal(old.score,50);assert.equal(old.bolts.length,0);
console.log('Short mist range, single-press atomizer, perfect timing, combo fever, v1 progress migration; five-minute deterministic replay, active-time eligibility, score threshold, restart, jumping, spray, boss sequence and forged-input rejection passed.');
