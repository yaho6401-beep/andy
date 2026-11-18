import * as T from 'three';
import {createFire,heatAt,FIRE} from './fire-state.js';
import {billboardVertex,flameFragment,smokeFragment,haloFragment,sparkVertex,sparkFragment,coalVertex,coalFragment} from './fire-shaders.js';

export function createFireVisual(parent){
 const root=new T.Group();root.name='shared-cozy-campfire';parent.add(root);
 const materials=[],geometries=[],own=g=>(geometries.push(g),g),material=m=>(materials.push(m),m);
 const timeUniform={value:0},heatUniform={value:.72},burstUniform={value:0};
 const quad=own(new T.PlaneGeometry(1,1));
 function veil(name,fragment,width,height,y,order,additive=false){
  const uniforms={uTime:timeUniform,uHeat:heatUniform,uBurst:burstUniform,uWidth:{value:width},uHeight:{value:height}};
  const mat=material(new T.ShaderMaterial({uniforms,vertexShader:billboardVertex,fragmentShader:fragment,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false,blending:additive?T.AdditiveBlending:T.NormalBlending}));
  const mesh=new T.Mesh(quad,mat);mesh.name=name;mesh.position.y=y;mesh.renderOrder=order;mesh.frustumCulled=false;root.add(mesh);return mesh;
 }
 const smoke=veil('campfire-soft-smoke',smokeFragment,2.5,2.5,.72,8);
 const halo=veil('campfire-warm-air',haloFragment,2.65,2.3,.1,9,true);
 const flame=veil('campfire-flowing-flame',flameFragment,1.95,1.6,.18,10);
 const coalMat=material(new T.ShaderMaterial({uniforms:{uTime:timeUniform,uHeat:heatUniform},vertexShader:coalVertex,fragmentShader:coalFragment,toneMapped:false}));
 const coals=new T.InstancedMesh(own(new T.IcosahedronGeometry(.19,1)),coalMat,13),matrix=new T.Matrix4();
 for(let i=0;i<13;i++){const a=i*2.4,r=.17+i*.034;matrix.makeScale(1,.44+(i%3)*.06,.75);matrix.setPosition(Math.sin(a)*r,.19+(i%2)*.025,Math.cos(a)*r);coals.setMatrixAt(i,matrix);}root.add(coals);
 const light=new T.PointLight('#ffad55',5,8,2);light.position.set(0,.75,0);root.add(light);
 const sparkCount=40,sparkPositions=new Float32Array(sparkCount*3),sparkFades=new Float32Array(sparkCount),sparkSizes=new Float32Array(sparkCount),sparkGeo=own(new T.BufferGeometry());
 for(let i=0;i<sparkCount;i++)sparkSizes[i]=.035+(i%4)*.009;
 sparkGeo.setAttribute('position',new T.BufferAttribute(sparkPositions,3));sparkGeo.setAttribute('aFade',new T.BufferAttribute(sparkFades,1));sparkGeo.setAttribute('aSize',new T.BufferAttribute(sparkSizes,1));
 const sparks=new T.Points(sparkGeo,material(new T.ShaderMaterial({vertexShader:sparkVertex,fragmentShader:sparkFragment,transparent:true,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending})));sparks.name='campfire-rising-embers';sparks.frustumCulled=false;sparks.renderOrder=11;root.add(sparks);
 const branch=new T.Group(),wood=material(new T.MeshLambertMaterial({color:'#986a43'})),cut=material(new T.MeshLambertMaterial({color:'#d4b17f'})),stickGeo=own(new T.CylinderGeometry(.035,.05,.75,7));
 const stem=new T.Mesh(stickGeo,wood);stem.rotation.z=Math.PI/2;branch.add(stem);const fork=new T.Mesh(stickGeo,wood);fork.scale.set(.65,.5,.65);fork.rotation.z=.5;fork.position.set(.06,.12,0);branch.add(fork);const end=new T.Mesh(own(new T.CylinderGeometry(.049,.049,.012,7)),cut);end.rotation.z=Math.PI/2;end.position.x=.38;branch.add(end);branch.visible=false;root.add(branch);
 let fire=createFire(Date.now()),offset=0,sequence=0,throwEvent=null,energy=1,disposed=false;
 return {
  setState(value){if(!value)return;fire=value;offset=value.at-Date.now();if(value.lastThrow?.sequence>sequence){sequence=value.lastThrow.sequence;throwEvent=value.lastThrow;}},
  get diagnostics(){return {style:'flowing-fire',heat:heatAt(fire,Date.now()+offset),sequence,branchVisible:branch.visible,energy,sparks:sparks.visible,smoke:smoke.visible};},
  update(time,reduced=false){
   if(disposed)return;
   const now=Date.now()+offset,heat=heatAt(fire,now),age=throwEvent?(now-throwEvent.at)/1000:99,burst=age<1.1?0:Math.max(0,1-(age-1.1)/4.6);energy=.45+heat*1.25+burst*.8;
   timeUniform.value=reduced?3.7:time;heatUniform.value=heat;burstUniform.value=burst;
   flame.material.uniforms.uHeight.value=Math.min(2.7,energy)*.92;flame.material.uniforms.uWidth.value=1.65+heat*.35+burst*.12;
   smoke.material.uniforms.uHeight.value=2+heat*.55+burst*.3;smoke.visible=!reduced;
   halo.material.uniforms.uHeight.value=1.7+heat*.6+burst*.25;
   const flicker=reduced?0:Math.sin(time*7.3)*.1+Math.sin(time*11.7+1)*.07+Math.sin(time*2.4)*.12;
   light.intensity=Math.min(9.2,2.6+heat*3.3+burst*2+flicker);light.position.x=reduced?0:Math.sin(time*2.7)*.07;light.position.z=reduced?0:Math.cos(time*3.2)*.05;
   branch.visible=age>=0&&age<FIRE.flightMs/1000;
   if(branch.visible){const t=Math.max(0,age/(FIRE.flightMs/1000));branch.position.set(throwEvent.x*(1-t),1.25*(1-t)+.25*t+Math.sin(Math.PI*t)*1.1,throwEvent.z*(1-t));branch.rotation.set(t*3.5,age*2,.3+t*2);}
   sparks.visible=!reduced;
   for(let i=0;i<sparkCount;i++){
    const life=(time*(.18+(i%7)*.019)+i*.618)%1,a=i*2.39996,r=.1+life*.42;
    sparkPositions[i*3]=Math.sin(a)*r+Math.sin(time*1.3+i)*life*.1;sparkPositions[i*3+1]=.3+life*(1.15+heat*.65+burst*.7);sparkPositions[i*3+2]=Math.cos(a)*r;
    sparkFades[i]=i<6+Math.floor(heat*10+burst*18)?Math.sin(life*Math.PI)*(.4+heat*.4+burst*.2):0;
   }
   sparkGeo.attributes.position.needsUpdate=true;sparkGeo.attributes.aFade.needsUpdate=true;
  },
  dispose(){if(disposed)return;disposed=true;root.removeFromParent();coals.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 };
}
