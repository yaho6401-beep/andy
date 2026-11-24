import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {fireSoundProfile,FireAudio} from '../camp/fire-audio.js';
import {createWaterPour,waterPourPhase} from '../camp/water-pour.js';

test('fire sound stays smoothly bounded through the special fuel maximum',()=>{
 let prev=fireSoundProfile(.16);const cold=prev;
 for(let heat=.17;heat<=4.5;heat+=.01){const p=fireSoundProfile(heat);assert.ok(p.roar>=prev.roar&&p.roar<=.38+1e-9);assert.ok(p.crackle<=.12+1e-9);assert.ok(p.interval>=360-1e-9);assert.ok(p.roar-prev.roar<.005);prev=p;}
 assert.ok(prev.roar<cold.roar*2);assert.ok(prev.interval>cold.interval/2.3);
});
test('water reaches the coals before fire reduction; all buffers remain bounded and disposable',()=>{
 assert.equal(waterPourPhase(500).flow,false);assert.equal(waterPourPhase(700).flow,true);assert.equal(waterPourPhase(700).heatDelay,true);assert.equal(waterPourPhase(850).heatDelay,false);assert.equal(waterPourPhase(850).impact,true);
 const parent=new T.Group(),pour=createWaterPour(parent);pour.setState({pourSequence:1,pourKind:'water',pouredAt:1000,pourFrom:{x:2.2,z:-1.3}});pour.update(1700,.7);assert.equal(pour.diagnostics.flow,true);const counts=[];
 for(let i=0;i<100;i++){pour.setState({pourSequence:i+2,pourKind:'water',pouredAt:1000,pourFrom:{x:0,z:2.55}});pour.update(2000,1);let count=0;parent.traverse(o=>{count+=o.geometry?.attributes.position.count||0;for(const n of o.geometry?.attributes.position.array||[])assert.ok(Number.isFinite(n));});counts.push(count);}
 assert.equal(new Set(counts).size,1);assert.equal(pour.diagnostics.capacity,44);pour.update(4100,3.1);assert.equal(pour.diagnostics.active,false);pour.dispose();assert.equal(parent.children.length,0);
});
test('both noise bed and crackles share the limiter and heat automation uses a gentle envelope',async()=>{
 const old=globalThis.AudioContext;
 const param=()=>({value:0,events:[],cancelScheduledValues(){},setTargetAtTime(...args){this.events.push(args);}});
 const node=()=>({connections:[],connect(n){this.connections.push(n);},disconnect(){},start(){},stop(){},gain:param(),frequency:param(),Q:param(),playbackRate:param()});
 class Context{constructor(){this.currentTime=0;this.sampleRate=8000;this.state='running';this.destination={};}createAnalyser(){return {...node(),fftSize:512,getFloatTimeDomainData(a){a.fill(.001);}};}createGain(){return node();}createBiquadFilter(){return node();}createBuffer(_,len){return {getChannelData:()=>new Float32Array(len)};}createBufferSource(){return node();}createDynamicsCompressor(){const n=node();for(const k of ['threshold','knee','ratio','attack','release'])n[k]=param();return n;}async resume(){}async suspend(){}async close(){}}
 globalThis.AudioContext=Context;const audio=new FireAudio();try{await audio.start();assert.equal(audio.roar.connections[0],audio.compressor);assert.equal(audio.compressor.connections[0],audio.master);assert.equal(audio.rainGain.connections[0],audio.compressor);audio.setRain(1);assert.ok(audio.rainGain.gain.events.at(-1)[0]<=.19);assert.ok(audio.rainGain.gain.events.at(-1)[2]>=1);audio.setHeat(4.45);assert.ok(audio.roar.gain.events.at(-1)[2]>=1);audio.crackle(true,0,999);assert.ok([...audio.voices].every(v=>v.gain.gain.value<=.22));assert.ok(audio.voices.size<=12);}finally{audio.dispose();globalThis.AudioContext=old;}
});
