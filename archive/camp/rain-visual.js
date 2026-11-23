import * as T from 'three';
import {campHeight} from './layout.js';

const random=(i,s=0)=>{const n=Math.sin(i*127.1+s*311.7)*43758.5453;return n-Math.floor(n);};
// Fixed pools: rain advances by elapsed frame time, never time * changing intensity.
export function createSoftRain(parent){
 const count=240,rippleCount=16,positions=new Float32Array(count*3),variations=new Float32Array(count),cycles=new Uint32Array(count),hits=Array.from({length:rippleCount},()=>({age:1,x:0,z:0}));
 const quad=new T.PlaneGeometry(1,1),geo=new T.InstancedBufferGeometry().copy(quad);quad.dispose();geo.instanceCount=count;geo.setAttribute('aDrop',new T.InstancedBufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));for(let i=0;i<count;i++)variations[i]=random(i,4);geo.setAttribute('aVariation',new T.InstancedBufferAttribute(variations,1));
 const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uOpacity:{value:.2},uPixels:{value:844}},vertexShader:/* glsl */`
 attribute vec3 aDrop;attribute float aVariation;uniform float uPixels;varying vec2 vUv;varying float vDistance;
 void main(){vUv=uv;vec4 head=modelViewMatrix*vec4(aDrop,1.0);float length=mix(.22,.43,aVariation);vec4 tail=modelViewMatrix*vec4(aDrop+vec3(.025,length,-.008),1.0);vec2 direction=normalize(tail.xy-head.xy+vec2(.00001));vec2 across=vec2(direction.y,-direction.x);vec4 mv=mix(head,tail,uv.y);float pixel=2.0*max(.1,-mv.z)/(max(1.0,uPixels)*projectionMatrix[1][1]);mv.xy+=across*position.x*max(.0025,pixel*2.2);vDistance=-mv.z;gl_Position=projectionMatrix*mv;}
 `,fragmentShader:/* glsl */`
 uniform float uOpacity;varying vec2 vUv;varying float vDistance;
 void main(){float across=exp(-pow((vUv.x-.5)*3.7,2.0));float ends=smoothstep(0.0,.18,vUv.y)*(1.0-smoothstep(.45,1.0,vUv.y));float depth=smoothstep(.4,1.3,vDistance)*(1.0-smoothstep(14.0,25.0,vDistance));float alpha=across*ends*depth*uOpacity;gl_FragColor=vec4(vec3(.61,.71,.78),alpha);
 #include <colorspace_fragment>
 }
 `});
 const rain=new T.Mesh(geo,mat);rain.name='soft-tapered-rain';rain.frustumCulled=false;rain.visible=false;rain.renderOrder=7;parent.add(rain);
 const rippleGeo=new T.RingGeometry(.76,1,18);rippleGeo.rotateX(-Math.PI/2);const life=new T.InstancedBufferAttribute(new Float32Array(rippleCount).fill(1),1).setUsage(T.DynamicDrawUsage);rippleGeo.setAttribute('aLife',life);
 const rippleMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,toneMapped:false,vertexShader:/* glsl */`
 attribute float aLife;varying float vFade;void main(){vFade=pow(max(0.0,1.0-aLife),2.0);gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}
 `,fragmentShader:/* glsl */`
 varying float vFade;void main(){gl_FragColor=vec4(vec3(.37,.46,.48),vFade*.32);
 #include <colorspace_fragment>
 }
 `}),ripples=new T.InstancedMesh(rippleGeo,rippleMat,rippleCount),matrix=new T.Matrix4();ripples.name='quiet-rain-landing-rings';ripples.frustumCulled=false;ripples.visible=false;parent.add(ripples);
 let previous=null,active=false,intensity=.5,hitIndex=0,disposed=false;
 function spawn(i,viewer,first=false){const seed=i+cycles[i]++*count,x=(viewer?.x||0)+(random(seed,1)-.5)*14,z=(viewer?.z||0)+(random(seed,2)-.5)*14;positions.set([x,campHeight(x,z)+1+(first?random(seed,3)*7:7),z],i*3);}
 return {
  update(time,viewer,on,strength=.5,still=false){if(disposed)return;const dt=still||previous===null?0:Math.min(.06,Math.max(0,time-previous));previous=time;rain.visible=ripples.visible=!!on;if(!on){active=false;for(const h of hits)h.age=1;return;}if(!active){for(let i=0;i<count;i++)spawn(i,viewer,true);active=true;intensity=T.MathUtils.clamp(strength,0,1);}intensity=T.MathUtils.damp(intensity,T.MathUtils.clamp(strength,0,1),3,dt);geo.instanceCount=Math.floor((still?70:118)+(still?38:122)*intensity);mat.uniforms.uOpacity.value=.40+intensity*.20;mat.uniforms.uPixels.value=globalThis.innerHeight||844;
   for(let i=0;i<count;i++){const k=i*3;positions[k]-=dt*(.18+intensity*.12);positions[k+1]-=dt*(6+intensity*2+variations[i]*1.6);const x=positions[k],z=positions[k+2];if(positions[k+1]<campHeight(x,z)+.03){if(i<geo.instanceCount&&Math.hypot(x-(viewer?.x||0),z-(viewer?.z||0))<7){const h=hits[hitIndex++%rippleCount];h.x=x;h.z=z;h.age=0;}spawn(i,viewer);}else if(Math.hypot(x-(viewer?.x||0),z-(viewer?.z||0))>16)spawn(i,viewer);}
   geo.attributes.aDrop.needsUpdate=true;
   for(let i=0;i<rippleCount;i++){const h=hits[i];h.age=Math.min(1,h.age+dt/.72);const r=h.age<1?.035+h.age*.16:0;matrix.makeScale(r,1,r);matrix.setPosition(h.x,campHeight(h.x,h.z)+.025,h.z);ripples.setMatrixAt(i,matrix);life.setX(i,h.age);}ripples.instanceMatrix.needsUpdate=true;life.needsUpdate=true;
  },
  get diagnostics(){return {rain:rain.visible,capacity:count,ripples:hits.filter(h=>h.age<1).length,rippleCapacity:rippleCount,style:'soft-tapered-drops',opacity:mat.uniforms.uOpacity.value,streakWidth:2.2,intensity,activeDrops:geo.instanceCount};},
  dispose(){if(disposed)return;disposed=true;rain.removeFromParent();ripples.removeFromParent();geo.dispose();mat.dispose();rippleGeo.dispose();rippleMat.dispose();ripples.dispose();}
 };
}
