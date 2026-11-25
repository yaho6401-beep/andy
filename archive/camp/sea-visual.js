import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {depthAt} from './sea-adventure-state.js';
import {SEA,waterDepth,rescuePose} from './shore-state.js';

function rescueBoat(){
 const root=new T.Group(),groups=new Map(),owned=[];
 const add=(geo,color,x,y,z,sx=1,sy=sx,sz=sx,rotation=null)=>{const m=new T.Mesh(geo);m.position.set(x,y,z);m.scale.set(sx,sy,sz);if(rotation)m.rotation.set(...rotation);m.updateMatrix();const part=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(m.matrix);geo.dispose();if(!groups.has(color))groups.set(color,[]);groups.get(color).push(part);};
 for(const side of [-1,1]){add(new T.CapsuleGeometry(.23,1.65,4,10),'#dc7841',side*.63,.19,0,1,1,1,[Math.PI/2,0,0]);add(new T.BoxGeometry(.12,.09,1.9),'#373f42',side*.65,.3,0);}
 add(new T.BoxGeometry(1.1,.16,1.65),'#e5dec8',0,.18,0);add(new T.BoxGeometry(.75,.26,.48),'#364b59',0,.36,-.55);add(new T.BoxGeometry(.6,.34,.05),'#9db7bb',0,.62,-.55,1,1,1,[-.16,0,0]);
 add(new T.BoxGeometry(.55,.07,.47),'#eee5cc',0,.8,-.56);add(new T.CylinderGeometry(.065,.065,.17,8),'#df655a',-.15,.91,-.56);add(new T.CylinderGeometry(.065,.065,.17,8),'#75a8c8',.15,.91,-.56);
 add(new T.TorusGeometry(.23,.06,6,18),'#e6a25e',.62,.4,.38,1,1,1,[Math.PI/2,0,.3]);add(new T.BoxGeometry(.18,.44,.2),'#43505a',0,.08,-1.15);
 add(new T.SphereGeometry(.14,10,8),'#dfbca0',0,.66,-.05);add(new T.SphereGeometry(.15,10,6),'#ebe2cb',0,.77,-.07,1,.5,1);add(new T.CylinderGeometry(.16,.21,.36,8),'#bc6847',0,.4,-.06);
 for(const [color,parts]of groups){const geo=mergeGeometries(parts,false),mat=new T.MeshLambertMaterial({color,transparent:true});parts.forEach(g=>g.dispose());const mesh=new T.Mesh(geo,mat);root.add(mesh);owned.push(geo,mat);}
 const light=new T.Mesh(new T.SphereGeometry(.065,8,6),new T.MeshBasicMaterial({color:'#bce6ff',transparent:true}));light.position.set(.15,.99,-.56);root.add(light);owned.push(light.geometry,light.material);
 root.name='coast-rescue-boat';root.scale.setScalar(1.2);return {root,light,dispose(){root.removeFromParent();owned.forEach(r=>r.dispose());}};
}
export function createSeaVisual(scene){
 const root=new T.Group();root.name='shore-rescue-and-waterlines';scene.add(root);const boats=Array.from({length:3},()=>{const b=rescueBoat();root.add(b.root);return b;});
 const geometry=new T.PlaneGeometry(1,1);geometry.rotateX(-Math.PI/2);const alpha=new T.InstancedBufferAttribute(new Float32Array(30),1);geometry.setAttribute('waterAlpha',alpha);
 const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false,uniforms:{uTime:{value:0}},vertexShader:'attribute float waterAlpha;varying float a;varying vec2 uv0;void main(){a=waterAlpha;uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',fragmentShader:'uniform float uTime;varying float a;varying vec2 uv0;void main(){float r=length(uv0-.5)*2.;float ring=pow(max(0.,sin(r*28.-uTime*4.)),10.)*(1.-smoothstep(.25,1.,r));float opacity=ring*a;if(opacity<.005)discard;gl_FragColor=vec4(.55,.73,.73,opacity);\n#include <colorspace_fragment>\n}'}),rings=new T.InstancedMesh(geometry,mat,30);rings.frustumCulled=false;rings.renderOrder=5;root.add(rings);const pose=new T.Object3D();let active=0,boatIds=[];
 return {update(players,now,time,enabled=true,reduced=false,viewer=null){root.visible=enabled;active=0;if(!enabled)return;mat.uniforms.uTime.value=reduced?0:time;let ring=0;for(const p of players.filter(p=>p.room==='camp').slice(0,30)){const depth=depthAt(p.x,p.z),rescue=p.seaRescue,position=rescue?rescuePose(rescue,now).player:p;pose.position.set(position.x,SEA.surface+.028,position.z);pose.rotation.set(0,0,0);pose.scale.setScalar(depth>.08?1.1+(rescue?.at ? .3 : 0):0);pose.updateMatrix();rings.setMatrixAt(ring,pose.matrix);alpha.setX(ring++,depth>.08?(rescue?.at ? .4 : .25):0);}
   rings.count=ring;rings.instanceMatrix.needsUpdate=true;alpha.needsUpdate=true;
   const rescues=players.filter(p=>p.room==='camp'&&p.seaRescue).sort((a,b)=>(a.id===viewer?.id?-1:b.id===viewer?.id?1:viewer?Math.hypot(a.x-viewer.x,a.z-viewer.z)-Math.hypot(b.x-viewer.x,b.z-viewer.z):0)).slice(0,3);boatIds=rescues.map(p=>p.id);for(let i=0;i<boats.length;i++){const b=boats[i],p=rescues[i];b.root.visible=!!p;if(!p)continue;active++;const pose=rescuePose(p.seaRescue,now);b.root.position.set(pose.boat.x,pose.boat.y+(reduced?0:Math.sin(time*2)*.025),pose.boat.z);b.root.rotation.y=pose.stage==='struggle'?Math.atan2(p.seaRescue.from.x-pose.boat.x,p.seaRescue.from.z-pose.boat.z):0;b.root.children.forEach(m=>m.material.opacity=pose.boatOpacity);b.light.material.opacity=pose.boatOpacity*(.45+.55*Math.sin(time*7)**2);}
  },get diagnostics(){return {boats:active,boatIds:[...boatIds],boatCapacity:3,waterlineCapacity:30};},dispose(){boats.forEach(b=>b.dispose());rings.dispose();geometry.dispose();mat.dispose();root.removeFromParent();}};
}
