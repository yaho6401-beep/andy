import * as T from 'three';
import {createFire,heatAt,FIRE} from './fire-state.js';

function flameGeometry(core=false){
 const rings=12,sides=10,positions=[],colors=[],indices=[],bottom=new T.Color(core?'#ffbb43':'#f14d14'),tip=new T.Color(core?'#fff4bf':'#ffca58');
 for(let row=0;row<=rings;row++){
  const t=row/rings,r=Math.max(.003,Math.pow(1-t,.8)*.32*(t<.09?.7+t*3.3:1));
  for(let side=0;side<=sides;side++){const a=side/sides*Math.PI*2,c=bottom.clone().lerp(tip,t);positions.push(Math.cos(a)*r+.15*t*t,t,Math.sin(a)*r);colors.push(c.r,c.g,c.b);if(row<rings&&side<sides){const i=row*(sides+1)+side;indices.push(i,i+sides+1,i+1,i+1,i+sides+1,i+sides+2);}}
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
export function createFireVisual(parent){
 const root=new T.Group();root.name='shared-cozy-campfire';parent.add(root);
 const materials=[],geometries=[],flames=[],own=g=>(geometries.push(g),g),material=m=>(materials.push(m),m);
 const outer=own(flameGeometry()),inner=own(flameGeometry(true)),outerMat=material(new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,toneMapped:false,transparent:true,opacity:.87,depthWrite:false})),innerMat=material(new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,toneMapped:false,transparent:true,opacity:.95,depthWrite:false}));
 for(let i=0;i<7;i++){const core=i>3,a=i*2.39996,m=new T.Mesh(core?inner:outer,core?innerMat:outerMat);m.position.set(Math.sin(a)*(core?.12:.29),.24,Math.cos(a)*(core?.12:.29));m.rotation.y=a;m.userData.core=core;root.add(m);flames.push(m);}
 const coalMat=material(new T.MeshBasicMaterial({color:'#ee6828'})),coals=new T.InstancedMesh(own(new T.IcosahedronGeometry(.16,1)),coalMat,9),matrix=new T.Matrix4();
 for(let i=0;i<9;i++){const a=i*2.4;matrix.makeScale(1,.48,1);matrix.setPosition(Math.sin(a)*(.2+i*.04),.18,Math.cos(a)*(.2+i*.04));coals.setMatrixAt(i,matrix);}root.add(coals);
 const light=new T.PointLight('#ffb56a',5,8,2);light.position.set(0,1.05,0);root.add(light);
 const sparkPositions=new Float32Array(48*3),sparkGeo=own(new T.BufferGeometry());sparkGeo.setAttribute('position',new T.BufferAttribute(sparkPositions,3));const sparks=new T.Points(sparkGeo,material(new T.PointsMaterial({color:'#ffdb8a',size:.035,transparent:true,opacity:.6,depthWrite:false})));sparks.frustumCulled=false;root.add(sparks);
 const branch=new T.Group(),wood=material(new T.MeshLambertMaterial({color:'#986a43'})),cut=material(new T.MeshLambertMaterial({color:'#d4b17f'})),stickGeo=own(new T.CylinderGeometry(.035,.05,.75,7));
 const stem=new T.Mesh(stickGeo,wood);stem.rotation.z=Math.PI/2;branch.add(stem);const fork=new T.Mesh(stickGeo,wood);fork.scale.set(.65,.5,.65);fork.rotation.z=.5;fork.position.set(.06,.12,0);branch.add(fork);const end=new T.Mesh(own(new T.CylinderGeometry(.049,.049,.012,7)),cut);end.rotation.z=Math.PI/2;end.position.x=.38;branch.add(end);branch.visible=false;root.add(branch);
 let fire=createFire(Date.now()),offset=0,sequence=0,throwEvent=null,energy=1,disposed=false;
 return {
  setState(value){if(!value)return;fire=value;offset=value.at-Date.now();if(value.lastThrow?.sequence>sequence){sequence=value.lastThrow.sequence;throwEvent=value.lastThrow;}},
  get diagnostics(){return {heat:heatAt(fire,Date.now()+offset),sequence,branchVisible:branch.visible,energy,sparks:sparks.visible};},
  update(time,reduced=false){if(disposed)return;const now=Date.now()+offset,heat=heatAt(fire,now),age=throwEvent?(now-throwEvent.at)/1000:99,burst=age<1.1?0:Math.max(0,1-(age-1.1)/4.6);energy=.45+heat*1.25+burst*.8;
   flames.forEach((m,i)=>{const sway=reduced?0:Math.sin(time*(2.2+i*.12)+i*2);m.scale.setScalar(m.userData.core?.75:1);m.scale.y=energy*.76*(m.userData.core?.68:1)*(1+sway*.12)*(1+(i%3)*.08);m.rotation.z=sway*.065;m.position.y=.22+(m.userData.core?.015:0);});
   light.intensity=2.8+heat*3+burst*2+(reduced?0:Math.sin(time*4.3)*.15);coalMat.color.setRGB(.48+heat*.4,.09+heat*.14,.018);
   branch.visible=age>=0&&age<FIRE.flightMs/1000;
   if(branch.visible){const t=Math.max(0,age/(FIRE.flightMs/1000)),ease=t;branch.position.set(throwEvent.x*(1-ease),.95*(1-t)+.25*t+Math.sin(Math.PI*t)*1.25,throwEvent.z*(1-ease));branch.rotation.set(t*3.5,age*2,.3+t*2);}
   sparks.visible=!reduced;for(let i=0;i<48;i++){const life=(time*(.24+(i%5)*.025)+i*.618)%1,a=i*2.39996+Math.sin(time+i)*.2,r=(.12+life*.4)*(burst?.9:1);sparkPositions[i*3]=Math.sin(a)*r;sparkPositions[i*3+1]=.4+life*(1.05+heat+burst*.8);sparkPositions[i*3+2]=Math.cos(a)*r;if(i>12+Math.floor(heat*16+burst*18))sparkPositions[i*3+1]=-10;}sparkGeo.attributes.position.needsUpdate=true;sparks.material.opacity=.25+heat*.25+burst*.2;
  },
  dispose(){disposed=true;root.removeFromParent();coals.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 };
}
