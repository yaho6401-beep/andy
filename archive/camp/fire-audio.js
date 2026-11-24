import {FIRE,clampHeat} from './fire-state.js';
export const HAPPY_MELODY=[{at:0,note:523.25,length:.55},{at:.38,note:659.25,length:.6},{at:.78,note:783.99,length:.62},{at:1.2,note:880,length:.6},{at:1.62,note:783.99,length:.65},{at:2.1,note:1046.5,length:.9}];
export function fireSoundProfile(heat){const h=Math.min(1,Math.log1p((clampHeat(heat)-FIRE.min)/(FIRE.max-FIRE.min))/Math.log1p((4.5-FIRE.min)/(FIRE.max-FIRE.min)));return {roar:.2+h*.18,filter:900+h*900,crackle:.055+h*.065,interval:800-h*440};}
export function rainSoundProfile(value){const intensity=Math.max(0,Math.min(1,Number(value)||0));return {gain:intensity? .035+.15*intensity**1.15:0,filter:1600+intensity*2000};}
// Original procedural fire sound. No downloaded audio, microphone or autoplay.
export class FireAudio{
 constructor(){this.context=null;this.enabled=false;this.volume=.20;this.mix=1;this.heat=.7;this.rain=0;this.generation=0;this.voices=new Set;this.melodyVoices=new Set;this.melodyCount=0;this.lastMelodyAt=-10;}
 async start(){
  const generation=++this.generation,AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!AudioContext)throw Error('이 브라우저에서는 소리를 켤 수 없어요. 화면으로 편히 쉬어가세요.');
  if(!this.context){
   const c=this.context=new AudioContext(),master=this.master=c.createGain(),filter=this.filter=c.createBiquadFilter(),high=c.createBiquadFilter(),roar=this.roar=c.createGain();master.gain.value=0;master.connect(c.destination);this.analyser=c.createAnalyser();this.analyser.fftSize=512;this.samples=new Float32Array(512);master.connect(this.analyser);const compressor=this.compressor=c.createDynamicsCompressor();compressor.threshold.value=-22;compressor.knee.value=18;compressor.ratio.value=8;compressor.attack.value=.012;compressor.release.value=.35;compressor.connect(master);filter.type='lowpass';filter.frequency.value=1800;high.type='highpass';high.frequency.value=80;
   const buffer=c.createBuffer(1,c.sampleRate*4,c.sampleRate),data=buffer.getChannelData(0);let last=0;
   for(let i=0;i<data.length;i++){last=(last+Math.random()*.08-.04)/1.025;data[i]=last*4;}
   const source=this.bed=c.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(high);high.connect(filter);filter.connect(roar);roar.connect(compressor);source.start();
   const rainBuffer=c.createBuffer(1,c.sampleRate*4,c.sampleRate),rainData=rainBuffer.getChannelData(0);let soft=0;
   for(let i=0;i<rainData.length;i++){const white=Math.random()*2-1;soft=soft*.72+white*.28;rainData[i]=white*.22+soft*.3;}
   const rain=this.rainBed=c.createBufferSource(),rainFilter=this.rainFilter=c.createBiquadFilter(),rainGain=this.rainGain=c.createGain();rain.buffer=rainBuffer;rain.loop=true;rainFilter.type='lowpass';rainFilter.frequency.value=2800;rainGain.gain.value=0;rain.connect(rainFilter);rainFilter.connect(rainGain);rainGain.connect(compressor);rain.start();const sea=this.seaBed=c.createBufferSource(),seaFilter=c.createBiquadFilter(),seaGain=this.seaGain=c.createGain();sea.buffer=buffer;sea.loop=true;seaFilter.type='lowpass';seaFilter.frequency.value=550;seaGain.gain.value=.035;const seaHigh=c.createBiquadFilter();seaHigh.type='highpass';seaHigh.frequency.value=45;sea.connect(seaHigh);seaHigh.connect(seaFilter);seaFilter.connect(seaGain);seaGain.connect(compressor);sea.start();
   const crackle=this.crackleBuffer=c.createBuffer(1,Math.floor(c.sampleRate*.13),c.sampleRate),crackleData=crackle.getChannelData(0);for(let i=0;i<crackleData.length;i++)crackleData[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.023));
  }
  await this.context.resume();if(generation!==this.generation){if(!this.enabled)await this.context.suspend();return false;}
  if(this.context.state!=='running')throw Error('불소리 버튼을 한 번 더 눌러주세요.');
  this.enabled=true;this.setVolume(this.volume);this.setHeat(this.heat);this.setRain(this.rain);this.schedule();return true;
 }
 setVolume(value){this.volume=Math.max(0,Math.min(.7,Number(value)||0));if(this.context&&this.master){const t=this.context.currentTime;this.master.gain.cancelScheduledValues(t);this.master.gain.setTargetAtTime(this.enabled?this.volume*this.mix:0,t,this.mix<1?1.2:.25);}}
 setMusicMix(active,musicLevel){const unducked=this.level/Math.max(.05,this.mix),target=active?(Number.isFinite(musicLevel)&&musicLevel>0&&unducked>.0001?Math.max(.02,Math.min(.55,musicLevel*.55/unducked)):.45):1;if(target!==this.mix){this.mix=target;this.setVolume(this.volume);}if(this.seaGain){const t=this.context.currentTime;this.seaGain.gain.setTargetAtTime(.028+.014*(.5+.5*Math.sin(t*.23)),t,1.5);}}
 setHeat(heat){this.heat=clampHeat(heat);if(this.context&&this.roar){const p=fireSoundProfile(this.heat),t=this.context.currentTime;this.roar.gain.cancelScheduledValues(t);this.filter.frequency.cancelScheduledValues(t);this.roar.gain.setTargetAtTime(p.roar,t,1.25);this.filter.frequency.setTargetAtTime(p.filter,t,1.4);}}
 setRain(value){this.rain=Math.max(0,Math.min(1,Number(value)||0));if(this.context&&this.rainGain){const p=rainSoundProfile(this.rain),t=this.context.currentTime;this.rainGain.gain.cancelScheduledValues(t);this.rainFilter.frequency.cancelScheduledValues(t);this.rainGain.gain.setTargetAtTime(p.gain,t,1.5);this.rainFilter.frequency.setTargetAtTime(p.filter,t,1.8);}}
 crackle(boost=false,delay=0,strength=1){if(!this.enabled||this.context?.state!=='running'||this.voices.size>=12)return;const c=this.context,source=c.createBufferSource(),gain=c.createGain(),filter=c.createBiquadFilter(),profile=fireSoundProfile(this.heat);source.buffer=this.crackleBuffer;source.playbackRate.value=boost?.6+Math.random()*.3:.7+Math.random()*.9;filter.type='bandpass';filter.frequency.value=boost?420+Math.random()*350:700+Math.random()*1800;filter.Q.value=.7;gain.gain.value=Math.min(.22,(boost?.06+profile.crackle:profile.crackle*(.55+Math.random()*.65))*Math.max(0,Math.min(1.8,strength)));source.connect(filter);filter.connect(gain);gain.connect(this.compressor);const voice={source,gain,filter};this.voices.add(voice);source.onended=()=>{source.disconnect();gain.disconnect();filter.disconnect();this.voices.delete(voice);};source.start(c.currentTime+delay);}
 stir(strength,big=false){const boost=big?1.3:1;this.crackle(true,0,(.3+strength*.65)*boost);this.crackle(false,.055+Math.random()*.07,(.4+strength*.5)*boost);if(big){this.crackle(false,.13,.55+strength*.6);this.crackle(false,.22,.4+strength*.45);}}
 happy(){
  if(!this.enabled||!this.volume||this.context?.state!=='running'||this.context.currentTime-this.lastMelodyAt<3)return false;
  const c=this.context,now=c.currentTime;this.lastMelodyAt=now;this.melodyCount++;
  for(const n of HAPPY_MELODY){const source=c.createOscillator(),gain=c.createGain(),t=now+n.at;source.type='sine';source.frequency.value=n.note;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.075,t+.018);gain.gain.exponentialRampToValueAtTime(.0001,t+n.length);source.connect(gain);gain.connect(this.master);const voice={source,gain};this.melodyVoices.add(voice);source.onended=()=>{source.disconnect();gain.disconnect();this.melodyVoices.delete(voice);};source.start(t);source.stop(t+n.length);}
  return true;
 }
 schedule(){clearTimeout(this.timer);if(!this.enabled)return;this.crackle();this.timer=setTimeout(()=>this.schedule(),fireSoundProfile(this.heat).interval*(.65+Math.random()*.7));}
 stop(){++this.generation;this.enabled=false;clearTimeout(this.timer);for(const v of this.melodyVoices){try{v.source.stop();}catch{}v.source.disconnect();v.gain.disconnect();}this.melodyVoices.clear();if(this.context){this.setVolume(this.volume);const generation=this.generation;clearTimeout(this.suspendTimer);this.suspendTimer=setTimeout(()=>{if(generation===this.generation&&!this.enabled)this.context?.suspend().catch(()=>{});},350);}}
 get level(){if(!this.enabled||this.context?.state!=='running')return 0;this.analyser.getFloatTimeDomainData(this.samples);return Math.sqrt(this.samples.reduce((s,v)=>s+v*v,0)/this.samples.length);}
 get state(){return this.context?.state||'not-started';}
 dispose(){this.stop();clearTimeout(this.suspendTimer);for(const voice of this.voices){try{voice.source.stop();}catch{}}this.voices.clear();try{this.seaBed?.stop();this.rainBed?.stop();this.bed?.stop();}catch{}this.context?.close().catch(()=>{});this.context=null;}
}
