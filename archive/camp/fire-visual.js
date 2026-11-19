import * as T from 'three';
import {createFire,heatAt,FIRE} from './fire-state.js';
import {createRoastingVisual} from './roast-visual.js';
import {EmberPool} from './ember-touch.js';
import {createWoodKit} from './wood.js';
import {billboardVertex,flameFragment,smokeFragment,haloFragment,sparkVertex,sparkFragment,coalVertex,coalFragment} from './fire-shaders.js';

export function createFireVisual(parent){
 const root=new T.Group();root.name='shared-cozy-campfire';parent.add(root);
 const materials=[],geometries=[],own=g=>(geometries.push(g),g),material=m=>(materials.push(m),m);
 const timeUniform={value:0},heatUniform={value:.72},burstUniform={value:0};
 const quad=own(new T.PlaneGeometry(1,1));
 function veil(name,fragment,width,height,y,order,additive=false){
  const uniforms={uTime:timeUniform,uPhase:{value:0},uHeat:heatUniform,uBurst:burstUniform,uWidth:{value:width},uHeight:{value:height}};
  const mat=material(new T.ShaderMaterial({uniforms,vertexShader:billboardVertex,fragmentShader:fragment,transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,toneMapped:false,blending:additive?T.AdditiveBlending:T.NormalBlending}));
  const mesh=new T.Mesh(quad,mat);mesh.name=name;mesh.position.y=y;mesh.renderOrder=order;mesh.frustumCulled=false;root.add(mesh);return mesh;
 }
 const smoke=veil('campfire-soft-smoke',smokeFragment,2.5,2.5,.72,8);
 const halo=veil('campfire-warm-air',haloFragment,2.65,2.3,.1,9,true);
 const innerFlame=veil('campfire-low-flame-folds',flameFragment,1.5,.8,.23,9.5);innerFlame.material.uniforms.uPhase.value=7.13;
 const flame=veil('campfire-flowing-flame',flameFragment,1.95,1.6,.29,10);
 const coalMat=material(new T.ShaderMaterial({uniforms:{uTime:timeUniform,uHeat:heatUniform},vertexShader:coalVertex,fragmentShader:coalFragment,toneMapped:false}));
 const coals=new T.InstancedMesh(own(new T.IcosahedronGeometry(.19,1)),coalMat,37),matrix=new T.Matrix4();
 for(let i=0;i<37;i++){const a=i*2.4,r=Math.sqrt(i/37)*.69;matrix.makeScale(.7+(i%3)*.15,.32+(i%3)*.06,.7);matrix.setPosition(Math.sin(a)*r,.17+(i%2)*.025,Math.cos(a)*r);coals.setMatrixAt(i,matrix);}root.add(coals);
 const fireWood=createWoodKit(true),logs=[];
 for(let i=0;i<6;i++){const log=fireWood.log(.115+(i%2)*.02,1.2+(i%3)*.13);log.rotation.set(.1,i*1.047+.35,Math.PI/2+(i>2?.48:0));log.position.set(Math.sin(i*2.4)*.13,.3+(i>2?.2:0)+(i%3)*.035,Math.cos(i*2.4)*.13);root.add(log);logs.push({mesh:log,y:log.position.y,z:log.rotation.z,yaw:log.rotation.y});}
 const hit=new T.Mesh(own(new T.BoxGeometry(1.5,.8,1.5)),material(new T.MeshBasicMaterial({visible:false})));hit.position.y=.47;hit.name='touchable-firewood';root.add(hit);
 const roasting=createRoastingVisual(root);
 const light=new T.PointLight('#ffad55',5,8,2);light.position.set(0,.75,0);root.add(light);
 const sparkCount=40,sparkPositions=new Float32Array(sparkCount*3),sparkFades=new Float32Array(sparkCount),sparkSizes=new Float32Array(sparkCount),sparkGeo=own(new T.BufferGeometry());
 for(let i=0;i<sparkCount;i++)sparkSizes[i]=.035+(i%4)*.009;
 sparkGeo.setAttribute('position',new T.BufferAttribute(sparkPositions,3));sparkGeo.setAttribute('aFade',new T.BufferAttribute(sparkFades,1));sparkGeo.setAttribute('aSize',new T.BufferAttribute(sparkSizes,1));
 const sparks=new T.Points(sparkGeo,material(new T.ShaderMaterial({vertexShader:sparkVertex,fragmentShader:sparkFragment,transparent:true,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending})));sparks.name='campfire-rising-embers';sparks.frustumCulled=false;sparks.renderOrder=11;root.add(sparks);
 const emberPool=new EmberPool(),touchGeo=own(new T.BufferGeometry());touchGeo.setAttribute('position',new T.BufferAttribute(emberPool.positions,3).setUsage(T.DynamicDrawUsage));touchGeo.setAttribute('aFade',new T.BufferAttribute(emberPool.fades,1).setUsage(T.DynamicDrawUsage));touchGeo.setAttribute('aSize',new T.BufferAttribute(emberPool.sizes,1).setUsage(T.DynamicDrawUsage));
 const touchEmbers=new T.Points(touchGeo,sparks.material);touchEmbers.name='touched-wood-embers';touchEmbers.frustumCulled=false;touchEmbers.renderOrder=12;root.add(touchEmbers);
 const branch=new T.Group(),wood=material(new T.MeshLambertMaterial({color:'#986a43'})),cut=material(new T.MeshLambertMaterial({color:'#d4b17f'})),stickGeo=own(new T.CylinderGeometry(.035,.05,.75,7));
 const stem=new T.Mesh(stickGeo,wood);stem.rotation.z=Math.PI/2;branch.add(stem);const fork=new T.Mesh(stickGeo,wood);fork.scale.set(.65,.5,.65);fork.rotation.z=.5;fork.position.set(.06,.12,0);branch.add(fork);const end=new T.Mesh(own(new T.CylinderGeometry(.049,.049,.012,7)),cut);end.rotation.z=Math.PI/2;end.position.x=.38;branch.add(end);branch.visible=false;root.add(branch);
 const thrownLog=fireWood.log(.13,.9);thrownLog.visible=false;root.add(thrownLog);
 const burntThrow=new T.Mesh(own(new T.SphereGeometry(.2,10,7)),material(new T.MeshLambertMaterial({color:'#29231d'})));burntThrow.visible=false;root.add(burntThrow);
 let fire=createFire(Date.now()),offset=0,sequence=0,throwEvent=null,energy=1,disposed=false,stirTime=-100,stirStrength=0,stirMotion=1,bigStirs=0,stirSerial=0,displayHeat=FIRE.initial,previousTime=null,flip=null,flipStarted=-100,flips=0;
 return {
  pickWood(ray){root.updateMatrixWorld(true);return ray.intersectObject(hit,false).length>0;},
  stir(event,time,right){if(disposed)return;stirTime=time;stirStrength=event.strength;stirMotion=event.motion||1;if(event.big)bigStirs++;stirSerial++;if(event.flip){flipStarted=time;flip={at:time,index:event.flipIndex%logs.length,from:logs[event.flipIndex%logs.length].z};flips++;}emberPool.emit(event,time,right);},
  setSnacks:jobs=>roasting.setJobs(jobs),
  setState(value){if(!value)return;fire=value;offset=value.at-Date.now();if(value.lastThrow?.sequence>sequence){sequence=value.lastThrow.sequence;throwEvent=value.lastThrow;}},
  get diagnostics(){return {style:'layered-wood-fire',...roasting.diagnostics,heat:heatAt(fire,Date.now()+offset),sequence,branchVisible:branch.visible||thrownLog.visible||burntThrow.visible,energy,displayHeat,targetHeat:heatAt(fire,Date.now()+offset),sparks:sparks.visible,smoke:smoke.visible,stirs:stirSerial,bigStirs,flips,stirMotion,touchParticles:emberPool.active,particleCapacity:emberPool.capacity,flameHeight:flame.material.uniforms.uHeight.value};},
  update(time,reduced=false){
   if(disposed)return;
   const now=Date.now()+offset,targetHeat=throwEvent&&now-throwEvent.at<FIRE.flightMs?displayHeat:heatAt(fire,now),dt=previousTime===null?0:Math.min(.05,Math.max(0,time-previousTime));previousTime=time;displayHeat=T.MathUtils.damp(displayHeat,targetHeat,1.35,dt);const heat=displayHeat,age=throwEvent?(now-throwEvent.at)/1000:99,burst=(age<1.1?0:Math.max(0,1-(age-1.1)/2.8))*(throwEvent?.kind==='burnt'?.28:1),stirAge=time-stirTime,stir=reduced?0:Math.max(0,1-stirAge/.65)*stirStrength,flipAge=time-flipStarted,flipPulse=reduced?0:Math.sin(Math.PI*Math.max(0,Math.min(1,flipAge/.95)))**2*stirStrength;energy=.45+heat*1.25+burst*.8;
   timeUniform.value=reduced?3.7:time;heatUniform.value=Math.max(.46,heat);burstUniform.value=burst+stir*.14+flipPulse*.28;
   for(let i=0;i<logs.length;i++){const log=logs[i],wiggle=(reduced?0:stirMotion)*Math.sin(stirAge*21+i*1.7)*Math.exp(-Math.max(0,stirAge)*7)*(stirAge>=0&&stirAge<1?1:0);log.mesh.rotation.z=log.z+wiggle*.04025;log.mesh.rotation.y=log.yaw+wiggle*.0299;log.mesh.position.y=log.y+Math.abs(wiggle)*.0138;if(flip?.index===i){const p=Math.max(0,Math.min(1,flipAge/.78)),ease=p*p*(3-2*p);log.mesh.rotation.z=flip.from+Math.PI*ease+wiggle*.025;log.mesh.position.y+=reduced?0:Math.sin(p*Math.PI)*.33;if(p>=1){log.z=flip.from+Math.PI;flip=null;}}}
   roasting.update(now,time,reduced);
   flame.material.uniforms.uHeight.value=Math.max(.95,.22+Math.pow(Math.max(.18,heat-FIRE.min),.92)*1.82)+burst*.22+stir*.0575+flipPulse*.46;flame.material.uniforms.uWidth.value=1.12+heat*.72+burst*.12;
   innerFlame.material.uniforms.uHeight.value=flame.material.uniforms.uHeight.value*.62;innerFlame.material.uniforms.uWidth.value=flame.material.uniforms.uWidth.value*.88;
   fireWood.materials[0].emissiveIntensity=.45+heat*.3+stir*.15;
   smoke.material.uniforms.uHeight.value=1.6+heat*1.05+burst*.3;smoke.material.uniforms.uWidth.value=1.5+heat*.5;smoke.visible=!reduced;
   halo.material.uniforms.uHeight.value=.6+heat*.95+burst*.25;
   const flicker=reduced?0:Math.sin(time*7.3)*.1+Math.sin(time*11.7+1)*.07+Math.sin(time*2.4)*.12;
   light.intensity=Math.min(12,.8+heat*4+burst+flicker*heat);light.position.x=reduced?0:Math.sin(time*2.7)*.07;light.position.z=reduced?0:Math.cos(time*3.2)*.05;
   const flying=age>=0&&age<FIRE.flightMs/1000;
   const prop=throwEvent?.kind==='wood'?thrownLog:throwEvent?.kind==='burnt'?burntThrow:branch;
   branch.visible=flying&&prop===branch;thrownLog.visible=flying&&prop===thrownLog;burntThrow.visible=flying&&prop===burntThrow;
   if(flying){const t=Math.max(0,age/(FIRE.flightMs/1000));prop.position.set(throwEvent.x*(1-t),1.25*(1-t)+.25*t+Math.sin(Math.PI*t)*1.1,throwEvent.z*(1-t));prop.rotation.set(t*3.5,age*2,.3+t*2);}
   sparks.visible=!reduced;
   for(let i=0;i<sparkCount;i++){
    const life=(time*(.18+(i%7)*.019)+i*.618)%1,a=i*2.39996,r=.1+life*.42;
    sparkPositions[i*3]=Math.sin(a)*r+Math.sin(time*1.3+i)*life*.1;sparkPositions[i*3+1]=.3+life*(1.15+heat*.65+burst*.7);sparkPositions[i*3+2]=Math.cos(a)*r;
    sparkFades[i]=i<6+Math.floor(heat*10+burst*18)?Math.sin(life*Math.PI)*(.4+heat*.4+burst*.2):0;
   }
   sparkGeo.attributes.position.needsUpdate=true;sparkGeo.attributes.aFade.needsUpdate=true;
   emberPool.update(time,reduced);touchEmbers.visible=!reduced&&emberPool.active>0;for(const attribute of Object.values(touchGeo.attributes))attribute.needsUpdate=true;
  },
  dispose(){if(disposed)return;disposed=true;roasting.dispose();root.removeFromParent();fireWood.dispose();coals.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 };
}
