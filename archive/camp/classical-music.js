// J. S. Bach, Prelude in C major BWV 846 (1722), short quiet arrangement.
// Public-domain composition; these piano-like voices are synthesized, no recording is used.
export const CLASSICAL_CREDIT='바흐 · 프렐류드 C장조 BWV 846 · 짧은 편곡';
export const PRELUDE_BARS=[[48,52,55,60,64],[48,50,57,62,65],[47,50,55,62,65],[48,52,55,60,64],[48,52,57,64,69],[48,50,54,57,62],[47,50,55,62,67],[47,48,52,55,60]];
export class CampMusic{
 constructor(){this.voices=new Set();this.generation=0;this.active=false;this.bar=0;}
 async start(){if(this.active)return true;const generation=++this.generation,Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return false;this.context??=new Context();const c=this.context;if(!this.master){this.master=c.createGain();this.master.gain.value=.18;this.master.connect(c.destination);}await c.resume();if(generation!==this.generation||c.state!=='running')return false;this.active=true;this.bar=0;this.next=c.currentTime+.06;this.schedule();return true;}
 schedule(){clearTimeout(this.timer);if(!this.active||this.context?.state!=='running')return;const c=this.context;while(this.next<c.currentTime+.7){const notes=PRELUDE_BARS[this.bar++%PRELUDE_BARS.length],pattern=[0,1,2,3,4,2,3,4,0,1,2,3,4,2,3,4];for(let i=0;i<pattern.length;i++){const t=this.next+i*.23;this.note(notes[pattern[i]],t);}this.next+=pattern.length*.23;}this.timer=setTimeout(()=>this.schedule(),200);}
 note(midi,t){if(this.voices.size>=96)return;const c=this.context,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=440*2**((midi-69)/12);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.095,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+2.3);o.connect(g);g.connect(this.master);const v={o,g};this.voices.add(v);o.onended=()=>{o.disconnect();g.disconnect();this.voices.delete(v);};o.start(t);o.stop(t+2.35);}
 stop(){++this.generation;this.active=false;clearTimeout(this.timer);for(const v of this.voices){try{v.o.stop();}catch{}v.o.disconnect();v.g.disconnect();}this.voices.clear();this.context?.suspend().catch(()=>{});}
 dispose(){this.stop();this.context?.close().catch(()=>{});this.context=null;this.master=null;}
}
