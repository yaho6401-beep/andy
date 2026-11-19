import {BACKGROUND_STARS} from './sky-background.js';
import * as T from 'three';
import {STARS,SKY_TARGETS} from './sky-catalog.js';
import {julian,precess,horizontal,planetSky,moonSky,observingDate,wrap} from './sky-coordinates.js';

export function createObservingSky(parent){
 const root=new T.Group();root.name='daejeon-observing-sky';root.visible=false;parent.add(root);
 const catalog=[...STARS,...BACKGROUND_STARS.map((s,i)=>['bg-'+i,...s])],positions=new Float32Array((catalog.length+1)*3),sizes=new Float32Array(catalog.length+1),glows=new Float32Array(catalog.length+1),geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('starSize',new T.BufferAttribute(sizes,1));geometry.setAttribute('glow',new T.BufferAttribute(glows,1));
 const mat=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{night:{value:1}},vertexShader:'attribute float starSize; attribute float glow; varying float g; void main(){g=glow;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=starSize*(1.+g*.4);if(starSize<.1)gl_Position=vec4(2.,2.,2.,1.);}',fragmentShader:'uniform float night;varying float g;void main(){float r=length(gl_PointCoord-.5)*2.;float a=exp(-r*r*5.)*(1.-smoothstep(.45,1.,r));gl_FragColor=vec4(mix(vec3(.79,.86,1.),vec3(1.,.92,.73),g),a*night*(.7+g*.3));}'});
 const points=new T.Points(geometry,mat);points.frustumCulled=false;points.renderOrder=1002;root.add(points);
 const domeGeo=new T.SphereGeometry(85,32,20),domeMat=new T.ShaderMaterial({side:T.BackSide,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{day:{value:0}},vertexShader:'varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;uniform float day;void main(){float h=max(0.,v.y);vec3 night=mix(vec3(.085,.125,.17),vec3(.012,.025,.065),sqrt(h));vec3 light=mix(vec3(.52,.66,.75),vec3(.2,.42,.66),sqrt(h));gl_FragColor=vec4(mix(night,light,day),smoothstep(-.025,.025,v.y));}'}),dome=new T.Mesh(domeGeo,domeMat);dome.renderOrder=1000;root.add(dome);
 const lines=SKY_TARGETS.filter(t=>t.edges.length).map(t=>{const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(t.edges.length*6),3));const m=new T.LineBasicMaterial({color:'#abbdd0',transparent:true,opacity:0,depthTest:false,depthWrite:false,fog:false,toneMapped:false}),mesh=new T.LineSegments(geo,m);mesh.frustumCulled=false;mesh.renderOrder=1003;root.add(mesh);return {target:t,mesh};});
 const moonGeo=new T.SphereGeometry(.62,24,16),moonMat=new T.MeshBasicMaterial({color:'#e0d9c7',depthTest:false,depthWrite:false,fog:false,toneMapped:false}),moon=new T.Mesh(moonGeo,moonMat);moon.renderOrder=1004;moon.visible=false;root.add(moon);let texture,loaded=false,disposed=false;
 const forward=new T.Vector3(),vectors=new Map();let active=false,mode='auto',lastCalc=0,date=new Date(),sunAltitude=0,venusVisible=false,visibleCount=0,aim=null;
 function calculate(now=Date.now()){date=observingDate(mode,new Date(now));lastCalc=now;const jd=julian(date),planets=planetSky(date);sunAltitude=planets.sun.altitude;venusVisible=planets.venus.visible;mat.uniforms.night.value=T.MathUtils.smoothstep(-sunAltitude,2,12);domeMat.uniforms.day.value=T.MathUtils.smoothstep(sunAltitude,-12,0);visibleCount=0;
  for(let i=0;i<=catalog.length;i++){const star=catalog[i],q=star?precess(star[1],star[2],jd):null,h=star?horizontal(q.ra,q.dec,date):planets.venus,id=star?star[0]:'venus';vectors.set(id,{...h,vector:new T.Vector3(h.x,h.y,h.z),visible:h.altitude>0&&(star?sunAltitude< -4:venusVisible)});positions.set([h.x*75,h.y*75,h.z*75],i*3);sizes[i]=h.altitude>0&&(star||venusVisible)?(star?Math.max(1.6,6.2-star[3]*.7):6.7):0;if(h.altitude>0)visibleCount++;}
  geometry.attributes.position.needsUpdate=true;geometry.attributes.starSize.needsUpdate=true;
  for(const {target,mesh}of lines){const array=mesh.geometry.attributes.position.array;target.edges.forEach(([a,b],i)=>{const p=vectors.get(target.ids[a]),q=vectors.get(target.ids[b]);const hide=p.altitude<=0||q.altitude<=0;array.set(hide?[0,-80,0,0,-80,0]:[p.x*74,p.y*74,p.z*74,q.x*74,q.y*74,q.z*74],i*6);});mesh.geometry.attributes.position.needsUpdate=true;}
  const m=moonSky(date);moon.visible=m.visible;moon.position.set(m.x*74,m.y*74,m.z*74);
 }
 return {
  set(value){active=!!value;root.visible=active;if(active){calculate();if(!loaded){loaded=true;texture=new T.TextureLoader().load('/assets/camp/nasa-lro-moon-1k.jpg',t=>{if(disposed){t.dispose();return;}t.colorSpace=T.SRGBColorSpace;moonMat.map=t;moonMat.needsUpdate=true;});}}else aim=null;},
  setMode(value){if(!['auto','now','tonight','dawn'].includes(value))return;mode=value;calculate();},
  get target(){return aim;},
  update(time,camera){if(!active)return;if(Date.now()-lastCalc>15000)calculate();root.position.copy(camera.position);camera.getWorldDirection(forward);let best=.982;aim=null;for(const target of SKY_TARGETS){for(const id of target.ids){const p=vectors.get(id);if(!p?.visible)continue;const score=p.vector.dot(forward);if(score>best){best=score;aim=target;}}}
   for(let i=0;i<=catalog.length;i++)glows[i]=aim?.ids.includes(catalog[i]?.[0]||'venus')?1:0;geometry.attributes.glow.needsUpdate=true;for(const {target,mesh}of lines)mesh.material.opacity=T.MathUtils.lerp(mesh.material.opacity,aim?.id===target.id ? .35 : 0,.1);
  },
  get diagnostics(){return {active,mode,date:date.toISOString(),location:'대전',latitude:36.35,longitude:127.38,catalogStars:catalog.length,targets:SKY_TARGETS.length,visibleCount,sunAltitude,venusVisible,target:aim?.id||null,positions:Object.fromEntries([...vectors].filter(([id])=>['polaris','venus','sirius'].includes(id)).map(([id,p])=>[id,{azimuth:p.azimuth,altitude:p.altitude,visible:p.visible}]))};},
  dispose(){disposed=true;root.removeFromParent();geometry.dispose();mat.dispose();domeGeo.dispose();domeMat.dispose();moonGeo.dispose();moonMat.dispose();texture?.dispose();for(const {mesh}of lines){mesh.geometry.dispose();mesh.material.dispose();}}
 };
}
