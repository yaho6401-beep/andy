import * as T from 'three';

// A fixed pool of actual world-space streaks. They approach the lens, then fade
// before the near plane; no screen flash, camera shake or per-touch GPU objects.
export function createViewerEmbers(parent,random=Math.random){
 const capacity=48,geometry=new T.PlaneGeometry(1,1),fades=new Float32Array(capacity);
 geometry.setAttribute('emberFade',new T.InstancedBufferAttribute(fades,1));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,toneMapped:false,blending:T.AdditiveBlending,
  vertexShader:'attribute float emberFade;varying float fade;varying vec2 uv0;void main(){fade=emberFade;uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
  fragmentShader:'varying float fade;varying vec2 uv0;void main(){vec2 p=uv0*2.-1.;float a=exp(-p.x*p.x*8.)*(1.-smoothstep(.1,1.,abs(p.y)))*fade;if(a<.004)discard;vec3 c=mix(vec3(1.,.12,.008),vec3(1.,.76,.29),exp(-dot(p,p)*6.));gl_FragColor=vec4(c,a*.82);\n#include <colorspace_fragment>\n}'});
 const mesh=new T.InstancedMesh(geometry,material,capacity);mesh.name='embers-toward-viewer';mesh.frustumCulled=false;mesh.renderOrder=13;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);parent.add(mesh);
 const particles=Array.from({length:capacity},()=>({born:-100,life:1,start:new T.Vector3(),end:new T.Vector3(),bend:new T.Vector3(),width:0}));
 const pose=new T.Object3D(),point=new T.Vector3(),next=new T.Vector3(),direction=new T.Vector3(),right=new T.Vector3(),up=new T.Vector3(),forward=new T.Vector3(),end=new T.Vector3();let cursor=0,active=0,bursts=0;
 function sample(p,t,out){out.lerpVectors(p.start,p.end,t);return out.addScaledVector(p.bend,Math.sin(Math.PI*t));}
 return {
  emit(event,time,camera){if(!event.towardViewer||!camera)return;bursts++;camera.updateMatrixWorld();right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);camera.getWorldDirection(forward);end.copy(camera.position).addScaledVector(forward,1.2);parent.worldToLocal(end);const n=12+Math.floor(random()*7);
   for(let j=0;j<n;j++){const p=particles[cursor++%capacity];p.born=time+j*.009;p.life=.7+random()*.42;p.width=.012+random()*.019;p.start.set((random()-.5)*.6,.4+random()*.25,(random()-.5)*.6);p.end.copy(end).addScaledVector(right,(random()-.5)*1.5).addScaledVector(up,(random()-.5)*.9);p.bend.copy(up).multiplyScalar(.22+random()*.46).addScaledVector(right,(random()-.5)*.32);}
  },
  update(time,camera,reduced=false){active=0;for(let i=0;i<capacity;i++){const p=particles[i],t=(time-p.born)/p.life;fades[i]=0;pose.scale.setScalar(0);if(!reduced&&camera&&t>=0&&t<1){active++;sample(p,t,point);sample(p,Math.min(1,t+.035),next);direction.copy(next).sub(point);right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);pose.position.copy(point);pose.quaternion.copy(camera.quaternion);pose.rotateZ(-Math.atan2(direction.dot(right),direction.dot(up)));pose.scale.set(p.width,.045+direction.length()*.9,1);fades[i]=Math.min(1,t/.1)*Math.min(1,(1-t)/.25)*(.75-t*.2);}pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);}mesh.visible=active>0;mesh.instanceMatrix.needsUpdate=true;geometry.attributes.emberFade.needsUpdate=true;},
  get diagnostics(){return {active,bursts,capacity};},
  dispose(){mesh.removeFromParent();mesh.dispose();geometry.dispose();material.dispose();}
 };
}
