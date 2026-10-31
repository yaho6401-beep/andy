(function(g){
 'use strict';
 const VERSION=3,FPS=60,GOAL_TICKS=7200,GOAL_SCORE=500;
 function create(seed){return {v:VERSION,seed:seed>>>0,tick:0,active:0,score:0,run:0,y:338,vy:0,hp:3,shield:0,over:false,jump:false,spray:false,cool:0,spawn:65,nextId:1,bossStage:0,bosses:0,enemies:[],bolts:[],friends:[],deaths:0,combo:0,comboTTL:0,fever:0,perfects:0,notice:'',noticeTTL:0,finished:false,bestScore:0,round:1,invincible:0,items:[],itemSpawn:250,birdSpawn:500,lastScore:0,lastTicks:0};}
 function random(s){let n=s.seed||123456789;n^=n<<13;n^=n>>>17;n^=n<<5;s.seed=n>>>0;return s.seed/4294967296;}
 function upgrade(s){if(s.v===VERSION)return;const tick=s.tick||0,seed=s.seed;Object.assign(s,create(seed),{tick});}
 function resetRound(s){const keep={tick:s.tick,seed:s.seed,bestScore:s.bestScore,deaths:s.deaths,round:s.round+1,lastScore:s.over?s.lastScore:s.score,lastTicks:s.over?s.lastTicks:s.active};Object.assign(s,create(s.seed),keep);}
 function hit(s){if(s.shield>0||s.invincible>0)return;s.hp--;s.shield=100;s.combo=0;s.comboTTL=0;s.fever=0;if(s.hp<=0){s.bestScore=Math.max(s.bestScore,s.score);s.lastScore=s.score;s.lastTicks=s.active;s.score=0;s.active=0;s.run=0;s.over=true;s.deaths++;s.jump=false;s.spray=false;s.invincible=0;s.bolts=[];}} 
 function cheer(s,type){s.notice=type;s.noticeTTL=85;}
 function purify(s,e,perfect){
  const base=e.boss?350:e.type==='bear'?90:e.type==='rabbit'?70:e.type==='stink'?10:e.type==='pigeon'?80:e.type==='sparrow'?65:50;
  s.score+=base*(s.fever>0?2:1)+(perfect?25:0);s.friends.push({x:e.x,y:e.y,type:e.type,t:100,boss:e.boss});
  if(e.boss){s.bosses++;s.hp=Math.min(3,s.hp+1);cheer(s,'boss');}
  if(e.type!=='stink'){s.combo++;s.comboTTL=240;s.cleans=(s.cleans||0)+1;if(s.cleans%8===0)s.hp=Math.min(3,s.hp+1);if(s.combo%5===0){s.fever=480;cheer(s,'fever');}}
 }
 function step(s,input={}){
  upgrade(s);s.tick++;const wasSpray=s.spray;
  if(input.j!==undefined)s.jump=Boolean(input.j);if(input.s!==undefined)s.spray=Boolean(input.s);
  if(s.over||s.finished){if(input.r)resetRound(s);return s;}
  s.active++;s.run++;if(s.active%60===0)s.score++;
  if(s.shield>0)s.shield--;if(s.cool>0)s.cool--;if(s.invincible>0){s.invincible--;if(!s.invincible)s.shield=Math.max(s.shield,60);}if(s.fever>0)s.fever--;if(s.noticeTTL>0)s.noticeTTL--;if(s.comboTTL>0){s.comboTTL--;if(!s.comboTTL)s.combo=0;}
  if(s.jump&&s.y>=338)s.vy=-13.7;
  s.vy+=.66;s.y=Math.min(338,s.y+s.vy);if(s.y===338)s.vy=0;
  const speed=Math.min(8.8,4+s.active/1500);
  if(s.spray&&!wasSpray&&s.cool<=0){s.bolts.push({id:s.nextId++,x:164,y:s.y-35,age:0,life:22,hits:[],fever:s.fever>0});s.cool=s.fever>0?10:18;}
  const stage=s.active>=5700?3:s.active>=3600?2:s.active>=1500?1:0;
  if(stage>s.bossStage&&!s.enemies.some(e=>e.boss)){s.bossStage++;const type=['rat','rabbit','bear'][s.bossStage-1],hp=[5,7,10][s.bossStage-1];s.enemies.push({id:s.nextId++,x:960,y:338,type,boss:true,hp,maxHp:hp,attack:120});}
  s.spawn--;if(s.spawn<=0){const obstacle=random(s)<.25,type=obstacle?'obstacle':s.active>4200?'bear':s.active>2100?'rabbit':'rat',hp=type==='bear'?3:type==='rabbit'?2:1;s.enemies.push({id:s.nextId++,x:950,y:338,type,boss:false,hp,maxHp:hp,attack:0});s.spawn=Math.max(57,112-s.active/500)+Math.floor(random(s)*45);}
  s.birdSpawn--;if(s.birdSpawn<=0){const type=random(s)<.5?'pigeon':'sparrow',y=random(s)<.35?270+random(s)*15:195+random(s)*42,hp=type==='pigeon'?2:1;s.enemies.push({id:s.nextId++,x:960,y,type,boss:false,hp,maxHp:hp,attack:0});s.birdSpawn=330+Math.floor(random(s)*260);}
  s.itemSpawn--;if(s.itemSpawn<=0){s.items.push({id:s.nextId++,x:940,y:random(s)<.7?292:218});s.itemSpawn=850+Math.floor(random(s)*500);}
  for(const item of s.items){item.x-=speed;const reach=s.invincible>0?55:38;if(Math.abs(item.x-132)<reach&&Math.abs(item.y-(s.y-40))<60){s.invincible=480;s.shield=0;s.score+=25;item.taken=true;cheer(s,'aroma');}}s.items=s.items.filter(i=>i.x>-40&&!i.taken);
  for(const b of s.bolts){b.age++;b.x+=2.2;}
  for(const e of s.enemies){
   if(e.boss){e.x=Math.max(282,e.x-speed*.7);e.attack--;if(e.attack<=0){s.enemies.push({id:s.nextId++,x:e.x-50,y:333,type:'stink',boss:false,hp:1,maxHp:1,attack:0});e.attack=110;}}
   else e.x-=['pigeon','sparrow'].includes(e.type)?speed*1.18+1.5:e.type==='stink'?speed+2.5:speed;
   const size=e.boss?96:e.type==='bear'?68:e.type==='obstacle'?49:e.type==='stink'?33:e.type==='pigeon'?44:e.type==='sparrow'?32:49;
   if(e.type!=='obstacle')for(const b of s.bolts){
    const radius=Math.min(b.fever?95:78,14+b.age*4);
    if(b.age<=b.life&&!b.hits.includes(e.id)&&e.x>=132&&Math.abs(b.x-e.x)<radius+size*.4&&Math.abs(b.y-(e.y-size*.48))<radius*.65+size*.3){
     b.hits.push(e.id);const perfect=!e.boss&&e.type!=='stink'&&e.x<=245&&b.age<=9;
     e.hp-=perfect?3:2;if(perfect){s.perfects++;cheer(s,'perfect');}if(e.hp<=0){purify(s,e,perfect);break;}
    }
   }
   if(e.hp>0&&Math.abs(e.x-132)<size*.45+(s.invincible>0?35:20)&&Math.abs((s.y-40)-(e.y-size*.48))<size*.45+28){if(s.invincible>0){e.hp=0;if(e.type==='obstacle'){s.score+=15;s.friends.push({x:e.x,y:e.y,type:'stink',t:70,boss:false});}else purify(s,e,false);}else hit(s);}if(s.over)break;
  }
  s.enemies=s.enemies.filter(e=>e.x>-110&&e.hp>0).slice(-24);s.bolts=s.bolts.filter(b=>b.age<b.life).slice(-8);
  for(const f of s.friends){f.x+=1.6;f.y-=1.8;f.t--;}s.friends=s.friends.filter(f=>f.t>0).slice(-16);s.bestScore=Math.max(s.bestScore,s.score);if(!s.over&&s.active>=GOAL_TICKS){s.finished=true;s.jump=false;s.spray=false;s.lastScore=s.score;s.lastTicks=s.active;}return s;
 }
 function replay(state,toTick,events){const s=JSON.parse(JSON.stringify(state));if(!Number.isInteger(toTick)||toTick<=s.tick||toTick-s.tick>900||!Array.isArray(events)||events.length>600)throw Error('invalid checkpoint');let previous=s.tick;for(const e of events){if(!e||!Number.isInteger(e.t)||e.t<=s.tick||e.t>toTick||e.t<previous||Object.keys(e).some(k=>!['t','j','s','r'].includes(k))||['j','s','r'].some(k=>e[k]!==undefined&&e[k]!==0&&e[k]!==1))throw Error('invalid input');previous=e.t;}let i=0;while(s.tick<toTick){const input={};while(i<events.length&&events[i].t===s.tick+1)Object.assign(input,events[i++]);step(s,input);}return s;}
 function eligible(s){return s.v===VERSION&&s.finished&&!s.over&&s.active>=GOAL_TICKS&&s.score>=GOAL_SCORE;}
 g.PerfumeRunnerEngine={VERSION,FPS,GOAL_TICKS,GOAL_SCORE,create,upgrade,step,replay,eligible};
})(globalThis);
