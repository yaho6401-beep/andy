import {FireAudio} from './fire-audio.js';
import {heatAt,fireMood,FIRE} from './fire-state.js';
import {SNACKS} from './snack-data.js';
import {ScreenAwake} from '../src/screen-awake.js';

const $=id=>document.getElementById(id);
const moods={hot:'불이 너무 뜨겁다. 조금 기다리자…',embers:'불씨가 조용히 숨 쉬고 있어요. 가지 하나를 보태볼까요?',gentle:'가만히 타오르는 불과, 잠시 쉬어가는 시간.',bright:'따뜻한 불길이 피어올라요. 천천히 바라보세요.'};

// One renderer, one shared fire, and sound that starts only after a tap.
export class CampfireSession{
 constructor(api){
  this.api=api;this.audio=new FireAudio();this.focused=false;this.waiting=false;this.pending=0;this.offset=0;this.fire=null;this.sequence=0;this.lastPaint=0;this.audioBusy=false;
  document.body.insertAdjacentHTML('beforeend',`<aside id="campfire-invite" class="campfire-invite" hidden><button id="campfire-open"><span class="fire-mark" aria-hidden="true">♨</span><span><b>모닥불 가까이, 불멍하기</b><small>편히 앉아 가지 하나 · 누르면 불소리가 켜져요</small></span><span aria-hidden="true">↗</span></button><p id="campfire-walk" role="status" hidden>빈 통나무 자리로 천천히 걸어가요…</p></aside><section id="campfire-view" class="campfire-view" aria-label="별빛 캠핑장 불멍" hidden><header><span>STARLIGHT · A LITTLE PAUSE</span><button id="campfire-awake" aria-pressed="false">화면 켜두기</button><button id="campfire-back" aria-label="불멍 화면 닫고 캠핑장 보기">캠핑장 보기 ↗</button></header><div class="campfire-caption"><h2>오늘은, 불만 바라봐도 좋아요.</h2><p id="campfire-status" role="status"></p></div><div class="campfire-controls"><button id="campfire-branch" class="campfire-branch"><span aria-hidden="true">↝</span><span><b>나뭇가지 하나 보태기</b><small id="campfire-branch-hint">앉은 자리에서 가볍게 던져요</small><em id="campfire-branches" class="campfire-branches">나뭇가지 0 / 5</em></span></button><details id="camp-snack-box" class="camp-snack-box"><summary id="camp-pack-title">작은 꾸러미 · 간식 없음</summary><div id="camp-snack-buttons"><button data-roast="potato"><span>🥔</span><b>감자</b><small data-snack-count="potato">0개</small></button><button data-roast="sweetpotato"><span>🍠</span><b>고구마</b><small data-snack-count="sweetpotato">0개</small></button><button data-roast="marshmallow"><span>☁</span><b>마시멜로</b><small data-snack-count="marshmallow">0개</small></button></div><p id="camp-snack-status" role="status">정원의 작은 밭에서 감자·고구마를, 카페 서비스 메뉴에서 마시멜로를 챙겨보세요.</p><progress id="camp-snack-progress" max="100" value="0" aria-label="간식 익는 정도" hidden></progress><button id="camp-snack-take" hidden>따뜻한 간식 먹기</button></details><div class="campfire-sound"><button id="campfire-sound" aria-pressed="false">불소리 켜기</button><label for="campfire-volume">소리 크기</label><input id="campfire-volume" type="range" min="0" max="0.7" step="0.01" value="0.32"></div><nav aria-label="불멍 중 활동"><button id="campfire-chat">함께 이야기</button><span aria-hidden="true">·</span><button id="campfire-stand">사뿐히 일어나기</button></nav></div></section>`);
  this.awake=new ScreenAwake($('campfire-awake'),{notify:api.toast});
  this.onSnack=e=>{const b=e.target.closest('[data-roast]');if(b&&!b.disabled&&!this.snackPending){this.snackPending=performance.now();api.send({type:'camp-snack',kind:b.dataset.roast});this.paint(performance.now(),true);}};$('camp-snack-buttons').addEventListener('click',this.onSnack);$('camp-snack-take').onclick=()=>{if(this.snackPending)return;this.snackPending=performance.now();api.send({type:'camp-snack-take'});this.paint(performance.now(),true);};
  this.onOpen=()=>this.begin();this.onBack=()=>this.close();this.onBranch=()=>this.feed();this.onSound=()=>this.toggleSound();this.onVolume=e=>this.audio.setVolume(e.target.value);this.onStand=()=>{this.close();api.stand();};this.onChat=()=>$('chat-open').click();
  for(const [id,event,fn]of [['campfire-open','click',this.onOpen],['campfire-back','click',this.onBack],['campfire-branch','click',this.onBranch],['campfire-sound','click',this.onSound],['campfire-volume','input',this.onVolume],['campfire-stand','click',this.onStand],['campfire-chat','click',this.onChat]])$(id).addEventListener(event,fn);
  this.onKey=e=>{if(e.key==='Escape'&&this.focused&&!document.querySelector('dialog[open]')&&$('chat-panel').hidden){e.preventDefault();this.close();}};
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
 open(){this.waiting=false;this.focused=true;this.startedSeated=this.seated;this.api.stopInputs();this.api.cancelWalk();document.body.classList.add('campfire-focus');$('campfire-view').hidden=false;this.paint(performance.now(),true);$('campfire-back').focus({preventScroll:true});}
 close(){this.awake.setEnabled(false);const active=this.focused||this.waiting;this.focused=false;this.waiting=false;this.pending=0;this.audio.stop();this.api.cancelWalk();document.body.classList.remove('campfire-focus');$('campfire-view').hidden=true;if(active&&!document.hidden)this.paint(performance.now(),true);}
 feed(){
  if(!this.focused||!this.seated||!this.fire||this.pending||Date.now()+this.offset<this.fire.readyAt)return;
  this.pending=performance.now();this.api.send({type:'campfire-branch'});this.paint(performance.now(),true);
 }
 receipt(d){this.pending=0;this.snackPending=0;if(d?.action==='camp-snack'){$('camp-snack-box').open=false;}if(d?.action==='camp-snack')this.api.toast('모닥불 곁에 올렸어요. 천천히 익는 동안 불을 바라봐요.');if(d?.finished)this.api.toast(SNACKS[d.kind]?.done);this.paint(performance.now(),true);}
 error(){this.pending=0;this.snackPending=0;this.paint(performance.now(),true);}
 snapshotUpdate(s){
  this.pack=s.myPack;const {joined,room}=this.api.state();if(!joined||room!=='camp'){if(this.focused||this.waiting||this.audio.enabled)this.close();this.fire=null;return;}
  this.offset=s.at-Date.now();this.fire=s.campfire||null;this.api.camp()?.setFireState(this.fire);this.api.camp()?.setSnacks(s.campSnacks||[]);
  if(this.fire?.lastThrow?.sequence>this.sequence){this.sequence=this.fire.lastThrow.sequence;clearTimeout(this.landingTimer);const delay=Math.max(0,this.fire.lastThrow.at+FIRE.flightMs-(Date.now()+this.offset));this.landingTimer=setTimeout(()=>{if(this.api.state().room==='camp'&&!document.hidden)this.audio.crackle(true);if(this.fire?.lastThrow?.branches>=4&&this.api.state().room==='camp'&&!document.hidden)this.api.toast('불이 너무 뜨겁다. 조금 기다리자…');},delay);}
  if(this.waiting&&this.seated)this.open();
  if(this.focused&&this.startedSeated&&!this.seated)this.close();
 }
 cameraPose(position,target){const me=this.api.state().me;const p=me?.state.seat||me?.mesh.position||{x:0,z:3};const angle=Math.atan2(p.x,p.z)+.13;const hot=Math.max(0,(this.fire?.heat||0)-1.1),radius=4.6+hot*.85;position.set(Math.sin(angle)*radius,2.1+hot*.3,Math.cos(angle)*radius);target.set(0,.9+hot*.2,0);}
 frame(now){
  const state=this.api.state();
  if(state.room!=='camp'||!state.joined){if(this.focused||this.waiting||this.audio.enabled)this.close();$('campfire-invite').hidden=true;return;}
  if(this.waiting&&now-this.waitSince>16000){this.waiting=false;this.audio.stop();this.api.cancelWalk();this.api.toast('통나무 가까이에서 멈춘 뒤 불멍하기를 눌러주세요.');}
  if(this.pending&&now-this.pending>15000){this.pending=0;this.api.toast('연결을 확인한 뒤 가지를 다시 보태주세요.');}
  if(this.snackPending&&now-this.snackPending>15000){this.snackPending=0;this.api.toast('연결을 확인한 뒤 간식을 다시 골라주세요.');}if(this.audio.enabled&&this.audio.state!=='running')this.audio.stop();
  this.paint(now);
 }
 paint(now,force=false){
  if(!force&&now-this.lastPaint<250)return;this.lastPaint=now;
  const {room,joined,me}=this.api.state(),inCamp=room==='camp'&&joined,visible=inCamp&&!this.focused&&!document.querySelector('dialog[open]')&&$('chat-panel').hidden;
  $('campfire-invite').hidden=!visible||!!(me?.state.seat&& !this.seated);$('campfire-walk').hidden=!this.waiting;
  $('campfire-open').querySelector('b').textContent=this.waiting?'자리로 가는 중 · 취소하기':'모닥불 가까이, 불멍하기';
  const items=this.pack?.items||{},job=this.pack?.job,clock=Date.now()+this.offset,total=Object.values(items).reduce((a,b)=>a+b,0);$('camp-pack-title').textContent=job?'작은 꾸러미 · '+SNACKS[job.kind].name+(clock>=job.readyAt?' 다 익었어요 · 열어보기':' 굽는 중 · '+Math.max(1,Math.ceil((job.readyAt-clock)/1000))+'초'):'작은 꾸러미 · '+(total?total+'개':'간식 찾으러 가볼까요?');
  $('camp-snack-buttons').hidden=!!job;for(const b of $('camp-snack-buttons').querySelectorAll('[data-roast]')){const kind=b.dataset.roast;b.disabled=!this.seated||!!job||!!this.snackPending||!(items[kind]>0);b.querySelector('small').textContent=(items[kind]||0)+'개';}
  const ready=job&&clock>=job.readyAt;$('camp-snack-status').textContent=job?ready?SNACKS[job.kind].name+'가 알맞게 익었어요. 서두르지 않아도 타지 않아요.':SNACKS[job.kind].name+'가 천천히 익어요 · 약 '+Math.max(1,Math.ceil((job.readyAt-clock)/1000))+'초':total?'구울 간식을 골라주세요. 잔불 곁에서 천천히 익혀드려요.':'정원의 작은 밭에서 감자·고구마를, 카페 서비스 메뉴에서 마시멜로를 챙겨보세요.';
  $('camp-snack-progress').hidden=!job;if(job)$('camp-snack-progress').value=Math.min(100,Math.max(0,(clock-job.startedAt)/(job.readyAt-job.startedAt)*100));$('camp-snack-take').hidden=!ready;$('camp-snack-take').disabled=!this.seated||!!this.snackPending;
  const heat=heatAt(this.fire,Date.now()+this.offset);this.audio.setHeat(heat);
  $('campfire-status').textContent=this.fire?.cooling?moods.hot:this.fire?moods[fireMood(heat)]:'모닥불과 연결하고 있어요…';
  const settling=this.fire&&Date.now()+this.offset<this.fire.readyAt,button=$('campfire-branch');
  button.disabled=!this.fire||!this.seated||!!this.pending||settling;
  $('campfire-branches').textContent='나뭇가지 '+(this.fire?.branches||0)+' / '+FIRE.maxBranches;
  $('campfire-branch-hint').textContent=this.fire?.cooling?'조금 기다리며 불길을 바라봐요':!this.seated?'통나무에 앉으면 가지를 보탤 수 있어요':this.pending?'가지 하나를 조심스레 보태고 있어요':settling?'지금은, 피어오른 불길을 바라봐요':'앉은 자리에서 가볍게 던져요';
  $('campfire-sound').textContent=this.audioBusy?'소리 준비 중…':this.audio.enabled?'불소리 끄기':'불소리 켜기';$('campfire-sound').setAttribute('aria-pressed',String(this.audio.enabled));$('campfire-stand').hidden=!this.seated;
 }
 get diagnostics(){return {snack:this.pack?.job||null,awake:!!this.awake.lock,focused:this.focused,waiting:this.waiting,pending:!!this.pending,seated:this.seated,heat:this.fire?heatAt(this.fire,Date.now()+this.offset):null,sequence:this.fire?.sequence||0,readyAt:this.fire?.readyAt||0,branches:this.fire?.branches||0,cooling:!!this.fire?.cooling,audio:this.audio.state,sound:this.audio.enabled,volume:this.audio.volume};}
 dispose(){this.close();this.awake.dispose();clearTimeout(this.landingTimer);document.removeEventListener('keydown',this.onKey);document.removeEventListener('visibilitychange',this.onVisibility);this.audio.dispose();$('campfire-invite').remove();$('campfire-view').remove();}
}
