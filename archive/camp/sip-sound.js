// One short, quiet procedural sip. No microphone or downloaded recordings.
export class SipSound{
 constructor(){this.voices=new Set();this.count=0;}
 prime(){const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;this.context??=new Audio();this.context.resume().catch(()=>{});}
 play(){const c=this.context;if(!c||c.state!=='running'||this.voices.size>=2)return false;const duration=.8,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const t=i/c.sampleRate;data[i]=(Math.random()*2-1)*(.45+.55*Math.sin(t*43)**2)*Math.sin(Math.PI*t/duration);}const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;filter.type='bandpass';filter.Q.value=3;filter.frequency.setValueAtTime(850,c.currentTime);filter.frequency.exponentialRampToValueAtTime(1600,c.currentTime+.5);filter.frequency.exponentialRampToValueAtTime(650,c.currentTime+duration);gain.gain.value=.12;source.connect(filter);filter.connect(gain);gain.connect(c.destination);const voice={source,filter,gain};this.voices.add(voice);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();this.voices.delete(voice);};source.start();this.count++;return true;}
 stop(){for(const v of this.voices){try{v.source.stop();}catch{}v.source.disconnect();v.filter.disconnect();v.gain.disconnect();}this.voices.clear();}
 dispose(){this.stop();this.context?.close().catch(()=>{});}
}
