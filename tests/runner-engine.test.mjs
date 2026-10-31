import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const ctx=vm.createContext({});vm.runInContext(await readFile(new URL('../supabase/functions/feedback-wall/runner-engine.js',import.meta.url),'utf8'),ctx);const E=ctx.PerfumeRunnerEngine;
let direct=E.create(123),record=[],replayed=E.create(123);
for(let t=1;t<=19000;t++){
 const close=direct.enemies.some(e=>e.type!=='obstacle'&&e.x<290&&e.x>140),obstacle=direct.enemies.some(e=>e.type==='obstacle'&&e.x<310&&e.x>80);
 const input={t,s:!direct.spray&&close&&direct.cool<=1?1:0,j:obstacle?1:0};if(direct.over||direct.finished)input.r=1;
 E.step(direct,input);record.push(input);if(t%600===0){replayed=E.replay(replayed,t,record);record=[];assert.equal(JSON.stringify(replayed),JSON.stringify(direct));}
}
assert.equal(E.GOAL_TICKS,7200);assert.equal(E.GOAL_SCORE,500);assert.ok(direct.bestScore>0);
const finish=E.create(1);finish.active=7199;finish.score=500;finish.spawn=9999;finish.birdSpawn=9999;finish.itemSpawn=9999;E.step(finish);assert.ok(finish.finished);assert.ok(E.eligible(finish));const endScore=finish.score;E.step(finish);assert.equal(finish.active,7200);assert.equal(finish.score,endScore);E.step(finish,{r:1});assert.equal(finish.active,0);assert.equal(finish.score,0);assert.equal(finish.bestScore,endScore);
assert.equal(E.eligible({...finish,finished:true,active:7200,score:499}),false);assert.equal(E.eligible({...finish,finished:false,active:7200,score:500}),false);
const death=E.create(2);Object.assign(death,{hp:1,score:420,active:1234,spawn:9999,birdSpawn:9999,itemSpawn:9999,enemies:[{id:900,x:136,y:338,type:'rat',hp:1,boss:false}]});E.step(death);assert.ok(death.over);assert.equal(death.score,0);assert.equal(death.active,0);assert.equal(death.bestScore,420);assert.equal(E.eligible(death),false);E.step(death,{r:1});assert.equal(death.hp,3);assert.equal(death.active,0);assert.equal(death.score,0);
const oil=E.create(3);oil.items=[{id:44,x:133,y:292}];oil.enemies=[{id:45,x:136,y:338,type:'bear',hp:3,boss:false}];E.step(oil);assert.ok(oil.invincible>0);assert.equal(oil.hp,3);assert.equal(oil.items.length,0);assert.equal(oil.enemies.length,0);oil.invincible=1;E.step(oil);assert.equal(oil.invincible,0);assert.ok(oil.shield>0);
const birds=E.create(4);birds.birdSpawn=1;E.step(birds);assert.ok(birds.enemies.some(e=>['pigeon','sparrow'].includes(e.type)));birds.enemies=[{id:99,x:135,y:200,type:'pigeon',hp:2,boss:false}];E.step(birds);assert.equal(birds.hp,3);
const bossTypes=[];for(const ticks of [1500,3600,5700]){const s=E.create(1);s.active=ticks-1;s.bossStage=bossTypes.length;E.step(s);bossTypes.push(s.enemies.find(e=>e.boss).type);}assert.equal(bossTypes.join(','),'rat,rabbit,bear');
const far=E.create(3);far.spawn=9999;far.enemies=[{id:90,x:600,y:338,type:'bear',boss:false,hp:3,maxHp:3}];E.step(far,{s:1});for(let i=0;i<25;i++)E.step(far);assert.equal(far.enemies[0].hp,3);assert.equal(far.bolts.length,0);
const combo=E.create(4);combo.spawn=9999;for(let n=0;n<8;n++){combo.enemies=[{id:100+n,x:216,y:338,type:'rat',boss:false,hp:1,maxHp:1}];E.step(combo,{s:1});for(let t=0;t<24;t++)E.step(combo,{s:0});}assert.equal(combo.combo,8);assert.ok(combo.fever>0);assert.ok(combo.perfects>=8);
const old=E.create(2);old.v=2;old.active=1000;old.score=9000;old.tick=1000;E.step(old);assert.equal(old.v,4);assert.equal(old.tick,1001);assert.equal(old.active,1);assert.equal(old.score,0);assert.equal(old.bestScore,0);
assert.throws(()=>E.replay(E.create(1),901,[]));assert.throws(()=>E.replay(E.create(1),10,[{t:11,s:1}]));assert.throws(()=>E.replay(E.create(1),10,[{t:1,score:99999}]));
const portal=E.create(12);Object.assign(portal,{y:265,spawn:9999,birdSpawn:9999,itemSpawn:9999,items:[{id:777,x:137,y:225,type:'portal'}]});E.step(portal);assert.equal(portal.hidden,720);portal.items=[];for(let i=0;i<720;i++)E.step(portal);assert.equal(portal.hidden,0);
const groundNozzle=E.create(2);groundNozzle.items=[{id:8,x:137,y:165,type:'nozzle'}];E.step(groundNozzle);assert.equal(groundNozzle.nozzle,0);const flyingNozzle=E.create(2);Object.assign(flyingNozzle,{y:205,items:[{id:8,x:137,y:165,type:'nozzle'}]});E.step(flyingNozzle);assert.equal(flyingNozzle.nozzle,720);
const ordinaryReach=164+2.2*20+E.mistRadius({age:20,boost:false,fever:false})-132,longReach=164+2.2*3*30+E.mistRadius({age:30,boost:true,fever:false})-132;assert.ok(longReach>ordinaryReach*2);
const normal=E.create(2),hidden=E.create(2);for(const x of [normal,hidden]){x.spawn=9999;x.enemies=[{id:99,x:700,y:338,type:'rat',hp:100,maxHp:100}];}hidden.hidden=100;E.step(normal);E.step(hidden);assert.ok(Math.abs((700-hidden.enemies[0].x)/(700-normal.enemies[0].x)-2)<.001);
const noFreeJump=E.create(7);for(let i=0;i<80;i++)E.step(noFreeJump,{j:1});assert.equal(noFreeJump.y,338);assert.equal(noFreeJump.vy,0);
console.log('Hidden map entry/exit, double speed, airborne nozzle pickup, >2x range, tap jumping and recalibrated score passed.');
console.log('Deterministic multi-round replay, 2-minute stop, 500-point eligibility, death reset, best record, birds, aroma invincibility, short mist and legacy reset passed.');
