// Original procedural fire sound. No downloaded audio, microphone or autoplay.
export class FireAudio{
 constructor(){this.context=null;this.enabled=false;this.volume=.32;this.heat=.7;this.generation=0;this.voices=new Set;}
 async start(){
  const generation=++this.generation,AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!AudioContext)throw Error('이 브라우저에서는 소리를 켤 수 없어요. 화면으로 편히 쉬어가세요.');
  if(!this.context){
   const c=this.context=new AudioContext(),master=this.master=c.createGain(),filter=c.createBiquadFilter(),high=c.createBiquadFilter();master.gain.value=0;master.connect(c.destination);filter.type='lowpass';filter.frequency.value=1800;high.type='highpass';high.frequency.value=80;
   const buffer=c.createBuffer(1,c.sampleRate*4,c.sampleRate),data=buffer.getChannelData(0);let last=0;
   for(let i=0;i<data.length;i++){last=(last+Math.random()*.08-.04)/1.025;data[i]=last*4;}
   const source=this.bed=c.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(high);high.connect(filter);filter.connect(master);source.start();
   const crackle=this.crackleBuffer=c.createBuffer(1,Math.floor(c.sampleRate*.13),c.sampleRate),crackleData=crackle.getChannelData(0);for(let i=0;i<crackleData.length;i++)crackleData[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.023));
   const compressor=this.compressor=c.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=5;compressor.connect(master);
  }
  await this.context.resume();if(generation!==this.generation){if(!this.enabled)await this.context.suspend();return false;}
  if(this.context.state!=='running')throw Error('불소리 버튼을 한 번 더 눌러주세요.');
  this.enabled=true;this.setVolume(this.volume);this.schedule();return true;
 }
 setVolume(value){this.volume=Math.max(0,Math.min(.7,Number(value)||0));if(this.context&&this.master){const t=this.context.currentTime;this.master.gain.cancelScheduledValues(t);this.master.gain.setTargetAtTime(this.enabled?this.volume:0,t,.14);}}
 setHeat(heat){this.heat=Math.max(.24,Math.min(.98,heat||.5));}
 crackle(boost=false){if(!this.enabled||this.context?.state!=='running')return;const c=this.context,source=c.createBufferSource(),gain=c.createGain(),filter=c.createBiquadFilter();source.buffer=this.crackleBuffer;source.playbackRate.value=boost?.6:.7+Math.random()*.9;filter.type='bandpass';filter.frequency.value=boost?420:700+Math.random()*1800;filter.Q.value=.7;gain.gain.value=boost?.55:.08+Math.random()*.22;source.connect(filter);filter.connect(gain);gain.connect(this.compressor);const voice={source,gain,filter};this.voices.add(voice);source.onended=()=>{source.disconnect();gain.disconnect();filter.disconnect();this.voices.delete(voice);};source.start();}
 schedule(){clearTimeout(this.timer);if(!this.enabled)return;this.crackle();this.timer=setTimeout(()=>this.schedule(),100+Math.random()*330/(.5+this.heat));}
 stop(){++this.generation;this.enabled=false;clearTimeout(this.timer);if(this.context){this.setVolume(this.volume);const generation=this.generation;clearTimeout(this.suspendTimer);this.suspendTimer=setTimeout(()=>{if(generation===this.generation&&!this.enabled)this.context?.suspend().catch(()=>{});},350);}}
 get state(){return this.context?.state||'not-started';}
 dispose(){this.stop();clearTimeout(this.suspendTimer);for(const voice of this.voices){try{voice.source.stop();}catch{}}this.voices.clear();try{this.bed?.stop();}catch{}this.context?.close().catch(()=>{});this.context=null;}
}
