import * as T from 'three';
import {createCanisterModel} from './canister-model.js';

export function waterPourPhase(age){
 return {active:age>=0&&age<3000,flow:age>=550&&age<1950,impact:age>=780&&age<2450,steam:age>=780&&age<3000,heatDelay:age>=0&&age<780};
}
const particleVertex=`attribute float aFade;varying float vFade;uniform float uSize;void main(){vFade=aFade;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(uSize/max(1.,-p.z),1.,55.);gl_Position=projectionMatrix*p;}`;
const particleFragment=`varying float vFade;uniform vec3 uColor;void main(){float r=length(gl_PointCoord-.5)*2.;float a=(1.-smoothstep(.25,1.,r))*vFade;gl_FragColor=vec4(uColor,a);#include <colorspace_fragment>}`.replace('#include','\n#include');

// Fixed small buffers, visible for three seconds only; no textures or physics engine.
export function createWaterPour(parent){
 const root=new T.Group();root.name='camp-water-pouring';root.visible=false;parent.add(root);
 const waterCan=createCanisterModel('water'),fuelCan=createCanisterModel('fuel');root.add(fuelCan);let can=waterCan;for(const model of [waterCan,fuelCan])model.traverse(o=>{if(o.isMesh){o.renderOrder=14;o.material.transparent=true;}});root.add(can);
 const cylinder=new T.CylinderGeometry(1,1,1,7),streamMaterial=new T.MeshBasicMaterial({color:'#bcd7d8',transparent:true,opacity:.54,depthWrite:false}),stream=new T.InstancedMesh(cylinder,streamMaterial,12);stream.frustumCulled=false;stream.renderOrder=15;root.add(stream);
 const pointMaterials=[],pointGeometries=[];
 function particles(count,color,size){const geo=new T.BufferGeometry(),positions=new Float32Array(count*3),fades=new Float32Array(count);geo.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('aFade',new T.BufferAttribute(fades,1).setUsage(T.DynamicDrawUsage));const mat=new T.ShaderMaterial({uniforms:{uSize:{value:size},uColor:{value:new T.Color(color)}},vertexShader:particleVertex,fragmentShader:particleFragment,transparent:true,depthWrite:false,toneMapped:false});const mesh=new T.Points(geo,mat);mesh.frustumCulled=false;mesh.renderOrder=16;root.add(mesh);pointMaterials.push(mat);pointGeometries.push(geo);return {mesh,positions,fades,geo,count};}
 const drops=particles(36,'#c2e1e4',8),steam=particles(8,'#d5d5ce',160),dummy=new T.Object3D(),start=new T.Vector3(),end=new T.Vector3(),direction=new T.Vector3(),up=new T.Vector3(0,1,0),cap=new T.Vector3(.105,.47,.015),points=Array.from({length:13},()=>new T.Vector3());
 let event=null,seen=0,age=Infinity,phase=waterPourPhase(age),disposed=false;
 function point(t,out,time){return out.set(start.x*(1-t),start.y+(.29-start.y)*t*t,start.z*(1-t)).addScaledVector(direction,Math.sin(t*15+time*17)*.006);}
 return {
  setState(fire){if(!fire?.pourSequence||fire.pourSequence===seen)return;seen=fire.pourSequence;event=['water','fuel'].includes(fire.pourKind)?{kind:fire.pourKind,at:fire.pouredAt,from:fire.pourFrom||{x:0,z:2.55}}:null;waterCan.visible=fuelCan.visible=false;can=event?.kind==='fuel'?fuelCan:waterCan;streamMaterial.color.set(event?.kind==='fuel'?'#cba05e':'#bcd7d8');drops.mesh.material.uniforms.uColor.value.set(event?.kind==='fuel'?'#c49b61':'#c2e1e4');},
  update(now,time,reduced=false){
   if(disposed)return;age=event?now-event.at:Infinity;phase=waterPourPhase(age);root.visible=phase.active;if(!root.visible)return;
   const a=age/1000,angle=Math.atan2(event.from.x,event.from.z),ease=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t);},lift=ease(a/.45),lower=ease((a-2.25)/.65),tilt=ease((a-.3)/.45)*(1-ease((a-1.95)/.4));
   can.position.set(Math.cos(angle)*.95+Math.sin(angle)*.55,.35+lift*.75-lower*.75,-Math.sin(angle)*.95+Math.cos(angle)*.55);can.rotation.set(0,angle,tilt*1.15);can.scale.setScalar(1.25);can.visible=a<2.85;can.updateMatrixWorld(true);start.copy(cap).applyMatrix4(can.matrixWorld);direction.set(Math.cos(angle),0,-Math.sin(angle));
   stream.visible=phase.flow;
   if(phase.flow){for(let i=0;i<13;i++)point(i/12,points[i],reduced?0:time);for(let i=0;i<12;i++){start.copy(points[i]);end.copy(points[i+1]);dummy.position.copy(start).add(end).multiplyScalar(.5);direction.copy(end).sub(start);const len=direction.length();dummy.quaternion.setFromUnitVectors(up,direction.normalize());const width=(.014+i*.0008)*(reduced?1:1+Math.sin(time*23+i)*.12);dummy.scale.set(width,len,width);dummy.updateMatrix();stream.setMatrixAt(i,dummy.matrix);}stream.instanceMatrix.needsUpdate=true;}
   drops.mesh.visible=phase.impact&&!reduced;steam.mesh.visible=event.kind==='water'&&phase.steam&&!reduced;
   for(const group of [drops,steam]){for(let i=0;i<group.count;i++){const isSteam=group===steam,life=((a-.78)*(isSteam?.65:2.4)+i*.618)%1,active=a>=.78&&life>=0&&(phase.impact||isSteam);const r=isSteam?.12+life*.45:.04+life*.44,theta=i*2.39996;group.positions[i*3]=Math.sin(theta)*r;group.positions[i*3+1]=isSteam?.35+life*.95:.31+Math.sin(Math.PI*life)*.28;group.positions[i*3+2]=Math.cos(theta)*r;group.fades[i]=active?Math.sin(life*Math.PI)*(isSteam?.14:.48)*Math.min(1,(3-a)*2):0;}group.geo.attributes.position.needsUpdate=true;group.geo.attributes.aFade.needsUpdate=true;}
  },
  get diagnostics(){return {kind:event?.kind||null,active:root.visible,age,flow:stream.visible&&root.visible,impact:phase.impact,capacity:44};},
  dispose(){if(disposed)return;disposed=true;waterCan.userData.dispose();fuelCan.userData.dispose();stream.dispose();cylinder.dispose();streamMaterial.dispose();pointMaterials.forEach(m=>m.dispose());pointGeometries.forEach(g=>g.dispose());root.removeFromParent();}
 };
}
