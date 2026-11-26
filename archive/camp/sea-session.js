import {campLightAt,DARK_COAST_LINES} from './camp-lighting.js';
import {depthAt} from './sea-adventure-state.js';
import {SEA,waterDepth,rescuePose} from './shore-state.js';
import {createSeaVisual} from './sea-visual.js';
import {FireCaptions} from './fire-captions.js';
const $=id=>document.getElementById(id);
export class SeaSession{
 constructor(api){this.api=api;this.visual=createSeaVisual(api.scene);document.body.insertAdjacentHTML('beforeend','<p id="sea-caption" class="sea-caption" role="status" aria-live="polite" hidden></p>');this.captions=new FireCaptions($('sea-caption'));this.unlock=()=>{if(!this.api.state().joined||this.api.state().room!=='camp')return;try{if(!this.sound){const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;const context=new Context(),gain=context.createGain(),osc=context.createOscillator();gain.gain.value=0;osc.type='sine';osc.frequency.value=620;osc.connect(gain).connect(context.destination);osc.start();this.sound={context,gain,osc};}this.sound.context.resume().catch(()=>{});}catch{}};window.addEventListener('pointerdown',this.unlock,{passive:true});window.addEventListener('keydown',this.unlock);this.hidden=()=>{if(document.hidden)this.setSiren(false);};document.addEventListener('visibilitychange',this.hidden);}
 get locked(){return !!this.api.state().me?.state.seaRescue;}
 snapshot(s){this.snapshotValue=s;this.received=Date.now();}
 wall(){return (this.snapshotValue?.at||Date.now())+Date.now()-(this.received||Date.now());}
 say(text,now){this.captions.show(text,now,3800,2);}
 frame(now,time){const s=this.api.state(),p=s.me?.state,position=s.me?.mesh.position,active=s.joined&&s.room==='camp',rescue=active&&p?.seaRescue;
  document.body.classList.toggle('sea-rescue-active',!!rescue);document.body.classList.toggle('sea-near-water',!!active&&!!position&&position.z< -15&&!p?.seat);if(!active){this.captions.clear();this.warned=false;this.setSiren(false);this.visual.update([],0,time,false);return;}
  const wall=this.wall();this.visual.update((this.snapshotValue?.players||[]).map(q=>q.id===p?.id&&!q.seaRescue&&position?{...q,x:position.x,z:position.z}:q),wall,time,true,matchMedia('(prefers-reduced-motion: reduce)').matches,position?{id:p?.id,x:position.x,z:position.z}:null);
  if(rescue){if(this.event!==rescue.at){this.event=rescue.at;this.api.stop();this.say(rescue.reason==='wave'?'파도에 휩쓸렸다… 구명보트가 다가온다!':'물이 목까지 찼다… 구명보트가 오고 있어!',now);}const pose=rescuePose(rescue,wall);if(this.stage!==pose.stage){this.stage=pose.stage;if(pose.stage==='boarding')this.say('구명보트가 도착했다… 손을 잡고 올라가자.',now);if(pose.stage==='aboard')this.say('구명보트에 올라탔다… 이제 해변으로 돌아가자.',now);}this.setSiren(pose.age<4200,time);}
  else{this.setSiren(false);this.stage=null;if(p?.seaNotice&&wall-p.seaNotice.at<20000&&this.notice!==p.seaNotice.at){this.notice=p.seaNotice.at;this.say(p.seaNotice.text,now);}const weather=this.snapshotValue?.campfire?.weather,light=campLightAt(wall,weather),depth=position?depthAt(position.x,position.z):0;if(position?.z< -14.8&&!p?.voyage&&light.dark&&now-(this.darkWarningAt||-Infinity)>24000){this.darkWarningAt=now;this.say(DARK_COAST_LINES[Math.floor(Math.random()*DARK_COAST_LINES.length)],now);}if(!p?.swimming&&depth>=SEA.warnDepth&&!this.warned){this.warned=true;this.say('더 이상 들어가면 위험할 것 같아… 얕은 곳으로 돌아가자.',now);}if(depth<.3)this.warned=false;}
  if(now>=this.captions.until)$('sea-caption').hidden=true;if(s.modal)$('sea-caption').hidden=true;
 }
 setSiren(active,time=0){if(!this.sound)return;const {context,gain,osc}=this.sound;gain.gain.setTargetAtTime(active&&!document.hidden ? .035 : 0,context.currentTime,.18);if(active)osc.frequency.setTargetAtTime(Math.sin(time*6)>0?780:560,context.currentTime,.09);}
 get diagnostics(){return {locked:this.locked,stage:this.stage||null,...this.visual.diagnostics,caption:$('sea-caption').hidden?'':$('sea-caption').textContent};}
 dispose(){this.setSiren(false);this.sound?.context.close().catch(()=>{});window.removeEventListener('pointerdown',this.unlock);window.removeEventListener('keydown',this.unlock);document.removeEventListener('visibilitychange',this.hidden);document.body.classList.remove('sea-near-water','sea-rescue-active');this.visual.dispose();$('sea-caption').remove();}
}
