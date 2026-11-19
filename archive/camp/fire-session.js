import {WarmingState} from './warming-hands.js';
import {FireCaptions} from './fire-captions.js';
import {MALLOW} from './marshmallow-state.js';
import {FireAudio} from './fire-audio.js';
import {heatAt,fireMood,FIRE} from './fire-state.js';
import {SNACKS,biteLine,roastState} from './snack-data.js';
import {ScreenAwake} from '../src/screen-awake.js';
import {EmberTouch} from './ember-touch.js';

const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const moods={hot:'불이 너무 뜨겁다. 조금 기다리자…',embers:'불씨가 조용히 숨 쉬고 있어요. 가지 하나를 보태볼까요?',gentle:'가만히 타오르는 불과, 잠시 쉬어가는 시간.',bright:'따뜻한 불길이 피어올라요. 천천히 바라보세요.'};

// One renderer, one shared fire, and sound that starts only after a tap.
export class CampfireSession{
 constructor(api){
  this.api=api;this.audio=new FireAudio();this.emberTouch=new EmberTouch();this.focused=false;this.waiting=false;this.pending=0;this.offset=0;this.fire=null;this.sequence=0;this.lastPaint=0;this.audioBusy=false;
  document.body.insertAdjacentHTML('beforeend',`<aside id="campfire-invite" class="campfire-invite" hidden><button id="campfire-open"><span class="fire-mark" aria-hidden="true">♨</span><span><b>모닥불 가까이, 불멍하기</b><small>잠시 앉아 쉬어가요</small></span><span aria-hidden="true">↗</span></button></aside><section id="campfire-view" class="campfire-view" aria-label="별빛 캠핑장 불멍" hidden><header><span>STARLIGHT · A LITTLE PAUSE</span><button id="campfire-awake" aria-pressed="false">화면 켜두기</button></header><p id="campfire-subtitle" class="fire-subtitle" role="status" aria-live="polite" hidden></p><p id="campfire-status" class="sr-only"></p><div id="camp-bite" class="camp-bite" role="status" hidden><span id="camp-bite-line"></span><small id="camp-bite-note"></small></div><div class="campfire-controls"><section id="camp-roast-tools" class="camp-roast-tools" aria-label="마시멜로 굽기 조작" hidden><div class="roast-indicator"><span id="camp-roast-level"></span><span id="camp-roast-faces" aria-label="네 면의 익음"></span></div><div class="roast-buttons"><button data-roast-control="closer">가까이 ↓</button><button data-roast-control="higher">높이 ↑</button><button data-roast-control="turn">돌리기 ↻</button></div></section><div class="campfire-action-row"><button id="campfire-branch" class="campfire-branch"><span aria-hidden="true">↝</span><span><b>가지 하나 보태기</b><small id="campfire-branch-hint">앉은 자리에서 가볍게 던져요</small><em id="campfire-branches" class="campfire-branches">나뭇가지 0 / 7</em></span></button><details id="camp-snack-box" class="camp-snack-box"><summary id="camp-pack-title">작은 꾸러미 · 간식 찾기</summary><div class="camp-snack-panel"><div id="camp-snack-buttons"><button data-roast="potato"><span>🥔</span><b>감자</b><small data-snack-count="potato">0개</small></button><button data-roast="sweetpotato"><span>🍠</span><b>고구마</b><small data-snack-count="sweetpotato">0개</small></button><button data-roast="marshmallow"><span>☁</span><b>마시멜로</b><small data-snack-count="marshmallow">0개</small></button></div><p id="camp-snack-status" role="status">정원의 작은 밭에서 감자·고구마를, 카페 서비스 메뉴에서 마시멜로를 챙겨보세요.</p><progress id="camp-snack-progress" max="100" value="0" aria-label="간식 익는 정도" hidden></progress><div class="camp-eat-actions"><button id="camp-snack-take" hidden>혼자 먹기</button><button id="camp-snack-share" hidden>반쪽 나눠 먹기</button></div><button id="camp-snack-fuel" class="camp-snack-fuel" hidden>탄 간식을 불에 보태기 ↝</button><div id="camp-shares" aria-label="모닥불 나눔 접시"></div></div></details></div><div class="campfire-sound"><button id="campfire-sound" aria-pressed="false">불소리 켜기</button><label for="campfire-volume">소리 크기</label><input id="campfire-volume" type="range" min="0" max="0.7" step="0.01" value="0.32"></div><nav aria-label="불멍 중 활동"><button id="campfire-hands" aria-pressed="false">손 쬐기</button><button id="campfire-log" class="campfire-log" title="캠핑장 둘레 나무 아래에서 장작을 찾아보세요."><span>장작 던지기</span><small id="campfire-log-count">0개</small></button><button id="campfire-chat">함께 이야기</button></nav></div></section>`);
  this.warming=new WarmingState();$('campfire-open').onclick=()=>this.focused?this.onBack():this.begin();$('campfire-hands').onclick=()=>{if(this.warming.active)this.warming.stop();else if(!this.warming.start(performance.now()))this.say('손을 잠깐 식히고 다시 쬐어요.');this.paint(performance.now(),true);};
  this.captions=new FireCaptions($('campfire-subtitle'));this.lastRoastStage='';$('camp-roast-tools').onclick=e=>{const b=e.target.closest('[data-roast-control]');if(b&&!b.disabled&&!this.snackPending&&this.pack?.job){this.snackPending=performance.now();this.api.send({type:'camp-snack-adjust',jobId:this.pack.job.id,control:b.dataset.roastControl});this.paint(performance.now(),true);}};
  this.awake=new ScreenAwake($('campfire-awake'),{notify:api.toast});
  this.onSnack=e=>{const b=e.target.closest('[data-roast]');if(b&&!b.disabled&&!this.snackPending){this.snackPending=performance.now();api.send({type:'camp-snack',kind:b.dataset.roast});this.paint(performance.now(),true);}};$('camp-snack-buttons').addEventListener('click',this.onSnack);this.take=share=>{if(this.snackPending)return;this.snackPending=performance.now();api.send({type:'camp-snack-take',share});this.paint(performance.now(),true);};$('camp-snack-take').onclick=()=>this.take(false);$('camp-snack-share').onclick=()=>this.take(true);$('camp-snack-fuel').onclick=()=>{if(this.snackPending)return;this.snackPending=performance.now();api.send({type:'camp-snack-fuel'});this.paint(performance.now(),true);};$('campfire-log').onclick=()=>this.feedLog();$('camp-shares').onclick=e=>{const b=e.target.closest('[data-share-take]');if(!b||b.disabled||this.snackPending)return;this.snackPending=performance.now();api.send({type:'camp-snack-share-take',id:b.dataset.shareTake});this.paint(performance.now(),true);};
  this.onBack=()=>{const seated=this.seated;this.close();if(seated)api.stand();};this.onBranch=()=>this.feed();this.onSound=()=>this.toggleSound();this.onVolume=e=>this.audio.setVolume(e.target.value);this.onStand=()=>{this.close();api.stand();};this.onChat=()=>$('chat-open').click();
  for(const [id,event,fn]of [['campfire-branch','click',this.onBranch],['campfire-sound','click',this.onSound],['campfire-volume','input',this.onVolume],['campfire-chat','click',this.onChat]])$(id).addEventListener(event,fn);
  this.onKey=e=>{if(e.key==='Escape'&&this.focused&&!document.querySelector('dialog[open]')&&$('chat-panel').hidden){e.preventDefault();this.onBack();}};
  this.onVisibility=()=>{if(document.hidden){this.audio.stop();this.paint(performance.now(),true);}};
  document.addEventListener('keydown',this.onKey);document.addEventListener('visibilitychange',this.onVisibility);
 }
 get seated(){return this.api.state().me?.state.seat?.group==='campfire-main';}
 async soundOn(){if(this.audioBusy||document.hidden)return;this.audioBusy=true;try{await this.audio.start();}catch(e){this.api.toast(e.message);}finally{this.audioBusy=false;this.paint(performance.now(),true);}}
 toggleSound(){if(this.audio.enabled||this.audioBusy){this.audio.stop();this.paint(performance.now(),true);}else this.soundOn();}
 begin(){
  const state=this.api.state();if(!state.joined||state.room!=='camp')return;
  // Invoked synchronously by the click, before waiting for a seat or a network reply.
  this.soundOn();this.api.stopInputs();
  if(this.seated){this.open();return;}
  if(state.me?.state.seat){this.api.toast('먼저 일어난 뒤 모닥불로 와주세요.');this.audio.stop();return;}
  if(this.waiting){this.waiting=false;this.audio.stop();this.api.cancelWalk();this.paint(performance.now(),true);return;}
  if(this.api.approachSeat()){this.waiting=true;this.waitSince=performance.now();this.paint(performance.now(),true);}
  else{this.open();this.api.toast('지금은 통나무 자리가 모두 찼어요. 불을 바라보다 빈 자리에서 가지를 보태주세요.');}
 }
 say(text){this.captions.show(text,performance.now(),3600,2);}
 open(){this.captions.open(performance.now());this.waiting=false;this.focused=true;this.startedSeated=this.seated;this.api.stopInputs();this.api.cancelWalk();document.body.classList.add('campfire-focus');$('campfire-view').hidden=false;this.paint(performance.now(),true);$('campfire-open').focus({preventScroll:true});}
 close(){this.warming.stop();this.api.camp()?.setHands(false);this.captions.clear();clearTimeout(this.biteTimer);$('camp-bite').hidden=true;this.awake.setEnabled(false);const active=this.focused||this.waiting;this.focused=false;this.waiting=false;this.pending=0;this.audio.stop();this.api.cancelWalk();document.body.classList.remove('campfire-focus');$('campfire-view').hidden=true;window.dispatchEvent(new Event('resize'));if(active&&!document.hidden)this.paint(performance.now(),true);}
 feed(){
  if(!this.focused||!this.seated||!this.fire||this.pending||Date.now()+this.offset<this.fire.readyAt)return;
  this.pending=performance.now();this.api.send({type:'campfire-branch'});this.paint(performance.now(),true);
 }
 feedLog(){
  if(!this.focused||!this.seated||!this.fire||this.pending)return;
  if(!(this.pack?.wood>0)){this.api.toast('캠핑장 둘레 나무에 가까이 가면 마른 장작을 발견할 수 있어요. 세 개까지 챙겨보세요.');return;}
  if(Date.now()+this.offset<this.fire.fuelReadyAt)return;
  this.pending=performance.now();this.api.send({type:'campfire-log'});this.paint(performance.now(),true);
 }
 touchWood(ray,camera){
  if(!this.focused||document.hidden||!this.api.camp()?.pickWood(ray))return;
  const now=performance.now(),event=this.emberTouch.touch(now,this.fire?heatAt(this.fire,Date.now()+this.offset):FIRE.min);
  if(!event)return;
  const m=camera.matrixWorld.elements,length=Math.hypot(m[0],m[2])||1;
  this.api.camp().stirWood(event,now/1000,{x:m[0]/length,z:m[2]/length});this.audio.stir(event.strength,event.big);
  if(event.pause)this.api.toast('너무 뜨거워서 나중에 해야겠다.');
 }
 receipt(d){this.pending=0;this.snackPending=0;if(d?.action==='camp-snack-fuel'){$('camp-snack-box').open=false;this.api.toast('탄 간식을 불에 보탰어요. 불길이 다시 힘차게 피어올라요.');}if(d?.action==='camp-snack'){$('camp-snack-box').open=false;}if(d?.action==='camp-snack')this.say(d.kind==='marshmallow'?'높이를 바꾸고 돌려가며 구워보세요.':'모닥불 곁에서 천천히 익어요.');if(d?.finished){$('camp-snack-box').open=false;this.showBite(d);}this.paint(performance.now(),true);}
 error(){this.pending=0;this.snackPending=0;this.paint(performance.now(),true);}
 showBite(d){this.captions.show(biteLine(d.kind),performance.now(),3800,3);this.audio.happy();}
 snapshotUpdate(s){
  this.pack=s.myPack;this.shares=s.campShares||[];const {joined,room}=this.api.state();if(!joined||room!=='camp'){if(this.focused||this.waiting||this.audio.enabled)this.close();this.fire=null;return;}
  this.offset=s.at-Date.now();this.fire=s.campfire||null;this.api.camp()?.setWeather(this.fire?.weather);this.api.camp()?.setFireState(this.fire);this.api.camp()?.setSnacks([...(s.campSnacks||[]),...(s.campShares||[]).slice(0,6).map(item=>({...item,id:'share-'+item.id,shared:true,startedAt:item.at-1000,readyAt:item.at}))]);
  if(this.fire?.lastThrow?.sequence>this.sequence){this.sequence=this.fire.lastThrow.sequence;clearTimeout(this.landingTimer);const delay=Math.max(0,this.fire.lastThrow.at+FIRE.flightMs-(Date.now()+this.offset));this.landingTimer=setTimeout(()=>{if(this.api.state().room==='camp'&&!document.hidden)this.audio.crackle(true);if((this.fire?.lastThrow?.branches>=6||this.fire?.heat>3)&&this.api.state().room==='camp'&&!document.hidden)this.api.toast('불이 너무 뜨겁다. 조금 기다리자…');},delay);}
  if(this.waiting&&this.seated)this.open();
  if(this.focused&&this.startedSeated&&!this.seated)this.close();
 }
 cameraPose(position,target){const me=this.api.state().me;const p=me?.state.seat||me?.mesh.position||{x:0,z:3};const angle=Math.atan2(p.x,p.z)+.13;const heat=this.fire?heatAt(this.fire,Date.now()+this.offset):FIRE.min,hot=Math.max(0,heat-1.1),radius=4.6+hot*1.65;position.set(Math.sin(angle)*radius,2.1+hot*.75,Math.cos(angle)*radius);target.set(0,.85+hot*.8,0);}
 frame(now){
  const state=this.api.state();
  if(state.room!=='camp'||!state.joined){if(this.focused||this.waiting||this.audio.enabled)this.close();return;}
  if(this.waiting&&now-this.waitSince>16000){this.waiting=false;this.audio.stop();this.api.cancelWalk();this.api.toast('통나무 가까이에서 멈춘 뒤 불멍하기를 눌러주세요.');}
  if(this.pending&&now-this.pending>15000){this.pending=0;this.api.toast('연결을 확인한 뒤 가지를 다시 보태주세요.');}
  if(this.snackPending&&now-this.snackPending>15000){this.snackPending=0;this.api.toast('연결을 확인한 뒤 간식을 다시 골라주세요.');}if(this.audio.enabled&&this.audio.state!=='running')this.audio.stop();
  const blocked=document.hidden||!$('chat-panel').hidden||!!document.querySelector('dialog[open]');if(blocked)this.warming.stop();const hand=this.warming.tick(now);if(hand?.text)this.captions.show(hand.text,now,3200,3);this.api.camp()?.setHands(this.focused&&this.warming.active,this.warming.started===null?0:now-this.warming.started);
  const weather=this.fire?.weather;if(this.focused&&weather?.eventId!==this.weatherEvent){this.weatherEvent=weather?.eventId;if(weather?.kind==='rain')this.say('비가 온다… 텐트 안에 잠시 피신해야겠다.');else if(weather?.kind==='wind')this.say('바람이 분다. 나뭇잎이 흩날린다…');}
  this.captions.tick(now,{active:this.focused,paused:document.hidden||!$('chat-panel').hidden||!!document.querySelector('dialog[open]'),roasting:!!this.pack?.job});
  this.paint(now);
 }
 paint(now,force=false){
  if(!force&&now-this.lastPaint<250)return;this.lastPaint=now;
  const state=this.api.state(),inCamp=state.joined&&state.room==='camp',aside=$('campfire-invite');const p=state.me?.mesh.position,nearFire=p&&Math.hypot(p.x,p.z)<11;aside.hidden=!inCamp||(!this.focused&&!this.waiting&&!nearFire)||!!document.querySelector('dialog[open]')||!$('chat-panel').hidden||!!($('walk-shortcuts')&&!$('walk-shortcuts').hidden);aside.classList.toggle('is-focused',this.focused);aside.style.setProperty('--fire-dock-height',document.querySelector('.campfire-controls').offsetHeight+'px');aside.querySelector('b').textContent=this.focused?'사뿐히 일어나기':this.waiting?'모닥불로 가는 중 · 취소':'모닥불 가까이, 불멍하기';aside.querySelector('small').hidden=this.focused;document.body.classList.toggle('camp-hide-interact',inCamp&&(!state.near||state.near==='campfire'));$('campfire-hands').textContent=this.warming.active?'손 거두기':'손 쬐기';$('campfire-hands').setAttribute('aria-pressed',String(this.warming.active));
  const items=this.pack?.items||{},job=this.pack?.job,clock=Date.now()+this.offset,total=Object.values(items).reduce((a,b)=>a+b,0),cooking=job?roastState(job,clock):null;
  const marsh=job?.kind==='marshmallow',labels={cooking:'돌려가며 익히는 중',ready:'노릇노릇 잘 익었어요',flaming:'불이 붙었어요 · 높이 들어요',burnt:'타버렸어요'};
  $('camp-roast-tools').hidden=!marsh||!!cooking?.burnt;
  if(marsh&&cooking.roast){const r=cooking.roast;$('camp-roast-level').textContent=MALLOW.levels[r.level];const faceKey=r.faces.map(v=>Math.min(3,Math.floor(v*3))).join()+':'+r.face;if(faceKey!==this.faceKey){this.faceKey=faceKey;$('camp-roast-faces').innerHTML=r.faces.map((v,i)=>'<i class="'+(i===r.face?'is-facing':'')+'" style="--toast:'+Math.min(1,v)+'" title="'+(i+1)+'번째 면"></i>').join('');}for(const b of $('camp-roast-tools').querySelectorAll('button'))b.disabled=!!this.snackPending||!this.seated||b.dataset.roastControl==='closer'&&r.level===0||b.dataset.roastControl==='higher'&&r.level===3;const key=job.id+':'+cooking.stage;if(key!==this.lastRoastStage){this.lastRoastStage=key;if(cooking.stage!=='cooking')this.say(labels[cooking.stage]);}}
  $('camp-pack-title').textContent=job?SNACKS[job.kind].name+' · '+(marsh?({cooking:'굽는 중',ready:'잘 익었어요',flaming:'불이 붙었어요',burnt:'타버렸어요'}[cooking.stage]):cooking.burnt?'너무 탔어요':cooking.scorch>0?'타기 시작해요':cooking.ready?'다 익었어요':'굽는 중 '+Math.max(1,Math.ceil((job.readyAt-clock)/1000))+'초'):'작은 꾸러미 · '+(total?total+'개':this.shares?.some(item=>!item.mine)?'나눔 간식 도착':'간식 찾기');
  if(job&&!marsh){const key=job.id+':'+cooking.stage;if(key!==this.lastRoastStage){this.lastRoastStage=key;if(cooking.ready)this.say(SNACKS[job.kind].done);else if(cooking.burnt)this.say('타버렸어요. 불에 보태볼까요?');}}
  $('camp-snack-box').dataset.stage=cooking?.stage||'';
  $('camp-snack-buttons').hidden=!!job;for(const b of $('camp-snack-buttons').querySelectorAll('[data-roast]')){const kind=b.dataset.roast;b.disabled=!this.seated||!!job||!!this.snackPending||!(items[kind]>0);b.querySelector('small').textContent=(items[kind]||0)+'개';}
  const ready=cooking?.ready&&!cooking.burnt;
  $('camp-snack-status').textContent=marsh?(cooking.burnt?'타버렸어요. 불에 보태고 다시 구워볼까요?':cooking.onFire?'불이 붙었어요! 높이 들어 불 밖으로 빼주세요.':ready?'네 면이 노릇노릇 잘 익었어요. 불 밖으로 빼두면 더 타지 않아요.':'가까이·높이로 거리를 바꾸고, 네 면을 돌려 골고루 구워주세요.'):job?cooking.burnt?'너무 타서 먹기는 어려워요. 장작 대신 불에 보태볼까요?':cooking.scorch>0?SNACKS[job.kind].name+'의 겉이 점점 짙어져요. 더 타기 전에 챙겨주세요.':ready?SNACKS[job.kind].name+'가 알맞게 익었어요. 지금 한입 먹거나, 반쪽을 나눠보세요.':SNACKS[job.kind].name+'가 천천히 익어요. 겉이 노릇해지는 모습을 바라봐요.':total?'구울 간식을 골라주세요. 잔불 곁에서 천천히 익어요.':'정원의 밭에서는 감자·고구마를, 카페에서는 마시멜로를 챙길 수 있어요.';
  $('camp-snack-progress').hidden=!job;if(job){$('camp-snack-progress').value=(cooking.scorch>0?cooking.scorch:cooking.progress)*100;$('camp-snack-progress').setAttribute('aria-label',cooking.scorch>0?'간식이 타는 정도':'간식 익는 정도');}
  $('camp-snack-take').hidden=!ready;$('camp-snack-take').disabled=!this.seated||!!this.snackPending;
  $('camp-snack-share').hidden=!ready;$('camp-snack-share').disabled=!this.seated||!!this.snackPending||(this.shares||[]).some(item=>item.mine);
  $('camp-snack-fuel').hidden=!cooking?.burnt;$('camp-snack-fuel').disabled=!this.seated||!this.fire||!!this.snackPending||clock<(this.fire?.fuelReadyAt||0)||heatAt(this.fire,clock)>3.6;
  $('campfire-log-count').textContent=(this.pack?.wood||0)+'개';
  $('campfire-log').disabled=!this.seated||!this.fire||!!this.pending||clock<(this.fire?.fuelReadyAt||0)||(this.fire?.logs||0)>=FIRE.maxLogs;
  $('campfire-log').title=(this.fire?.logs||0)>=FIRE.maxLogs?'장작 세 개가 타고 있어요. 조금 기다려주세요.':'모은 장작 '+(this.pack?.wood||0)+'개 · 추가 장작 '+(this.fire?.logs||0)+' / 3';
  const shareKey=JSON.stringify([this.shares,!!this.seated,!!this.snackPending]);if(shareKey!==this.shareKey){this.shareKey=shareKey;$('camp-shares').innerHTML=(this.shares||[]).length?'<p class="camp-shares-title">모닥불 나눔 접시</p>'+(this.shares||[]).map(item=>'<div class="camp-share-item"><span>'+esc(item.nickname)+' · '+SNACKS[item.kind].name+' 반쪽</span>'+(item.mine?'<small>함께 드실 분을 기다려요</small>':'<button data-share-take="'+esc(item.id)+'" '+(!this.seated||this.snackPending?'disabled':'')+'>한입 받기</button>')+'</div>').join(''):'';}
  const heat=heatAt(this.fire,Date.now()+this.offset);this.audio.setHeat(heat);
  $('campfire-status').textContent=this.fire?.cooling?moods.hot:this.fire?moods[fireMood(heat)]:'모닥불과 연결하고 있어요…';
  const settling=this.fire&&Date.now()+this.offset<this.fire.readyAt,button=$('campfire-branch');
  button.disabled=!this.fire||!this.seated||!!this.pending||settling;
  $('campfire-branches').textContent='나뭇가지 '+(this.fire?.branches||0)+' / '+FIRE.maxBranches;
  $('campfire-branch-hint').textContent=this.fire?.cooling?'조금 기다리며 불길을 바라봐요':!this.seated?'통나무에 앉으면 가지를 보탤 수 있어요':this.pending?'가지 하나를 조심스레 보태고 있어요':settling?'지금은, 피어오른 불길을 바라봐요':'앉은 자리에서 가볍게 던져요';
  $('campfire-sound').textContent=this.audioBusy?'소리 준비 중…':this.audio.enabled?'불소리 끄기':'불소리 켜기';$('campfire-sound').setAttribute('aria-pressed',String(this.audio.enabled));
 }
 get diagnostics(){return {handsActive:this.warming.active,weather:this.fire?.weather?.kind||'clear',shares:this.shares?.length||0,snack:this.pack?.job||null,awake:!!this.awake.lock,focused:this.focused,waiting:this.waiting,pending:!!this.pending,seated:this.seated,heat:this.fire?heatAt(this.fire,Date.now()+this.offset):null,sequence:this.fire?.sequence||0,readyAt:this.fire?.readyAt||0,branches:this.fire?.branches||0,cooling:!!this.fire?.cooling,audio:this.audio.state,sound:this.audio.enabled,volume:this.audio.volume,melodies:this.audio.melodyCount||0,melodyVoices:this.audio.melodyVoices?.size||0,subtitle:$('campfire-subtitle').hidden?'':$('campfire-subtitle').textContent};}
 dispose(){this.close();clearTimeout(this.biteTimer);this.awake.dispose();clearTimeout(this.landingTimer);document.removeEventListener('keydown',this.onKey);document.removeEventListener('visibilitychange',this.onVisibility);this.audio.dispose();$('campfire-view').remove();$('campfire-invite').remove();document.body.classList.remove('camp-hide-interact');}
}
