import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {CAMP_SEATS} from './layout.js';
export function createCamp(scene){
 const root=new T.Group(),materials=new Map(),geometries=[],dynamic=[],waveLines=[];scene.add(root);
 const mat=(color,glow=false)=>{const key=color+glow;if(!materials.has(key))materials.set(key,glow?new T.MeshBasicMaterial({color}):new T.MeshLambertMaterial({color}));return materials.get(key);};
 const box=new T.BoxGeometry(1,1,1),sphere=new T.IcosahedronGeometry(1,1),cylinder=new T.CylinderGeometry(1,1,1,8),cone=new T.ConeGeometry(1,1,7);geometries.push(box,sphere,cylinder,cone);
 const add=(geo,color,x,y,z,sx=1,sy=sx,sz=sx,glow=false)=>{const mesh=new T.Mesh(geo,mat(color,glow));mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);root.add(mesh);return mesh;};
 // A quiet sea opens behind the campsite. Flat colors keep reflections inexpensive.
 add(box,'#426e83',0,-.62,-21,46,.12,27);
 add(box,'#5d8798',0,-.55,-11.5,30,.025,6);
 add(box,'#cebfa0',0,0,-7.6,14,.12,2.8);
 add(box,'#e0d0ae',0,.065,-6.7,12,.025,.4);
 for(let i=0;i<6;i++){
  const x=-6+(i%3)*5,z=-9-Math.floor(i/3)*4-(i%2)*.8;
  const line=add(box,i%2?'#9cc3c6':'#7da9b7',x,-.49,z,1.8+(i%3)*.7,.012,.055,true);
  line.userData.seaBaseX=x;waveLines.push(line);
 }
 for(const side of [-1,1])for(let i=0;i<3;i++)add(sphere,'#9aab9f',side*(6.5+i*.4),-.04,-6.9-i*.3,.35,.2,.28);
 add(cylinder,'#617e76',0,-.4,0,10,.8,9);
 add(cylinder,'#8faaa0',0,-.035,0,7.9,.12,7.4);
 add(cylinder,'#b4b19b',0,.035,0,4.1,.06,4.1);
 for(let i=0;i<6;i++)add(box,'#d4c8ac',.1*Math.sin(i),.09,4+i*.4,1.1,.07,.26).rotation.y=i*.17;
 // Low-poly canopy and trunks reuse four geometries, then merge by material.
 for(let i=0;i<18;i++){const a=i*Math.PI*2/18,r=8.0+(i%3)*.22,x=Math.sin(a)*r,z=Math.cos(a)*r*.83;if(z < -3.9)continue;
 add(cylinder,'#927b69',x,.7,z,.16,1.4,.16);
 for(let j=0;j<2;j++)add(cone,['#6e968c','#7da394','#91b19b'][i%3],x,1.5+j*.7,z,1.05-j*.25,1.8-j*.2,1.05-j*.25);
 }
 for(let i=0;i<16;i++){const a=i*2.4;if(Math.cos(a)*6.3 < -5.8)continue;add(sphere,i%2?'#bbc2a5':'#c3b1ba',Math.sin(a)*6.7,.22,Math.cos(a)*6.3,.35,.3,.3);}
 // Two small canvas tents, open fronts facing the clearing.
 for(const [x,z,color]of [[-5,-3.6,'#d8b6a7'],[5,-3.7,'#b6bdcd']]){
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([-1.4,0,-1.2,0,2.1,-1.2,0,2.1,1.2,-1.4,0,-1.2,0,2.1,1.2,-1.4,0,1.2, 0,2.1,-1.2,1.4,0,-1.2,1.4,0,1.2,0,2.1,-1.2,1.4,0,1.2,0,2.1,1.2],3));geo.computeVertexNormals();geometries.push(geo);const tent=add(geo,color,x,.1,z);tent.material.side=T.DoubleSide;
 add(box,'#777d7d',x,.12,z,2.8,.05,2.4);
 const entrance=new T.BufferGeometry();entrance.setAttribute('position',new T.Float32BufferAttribute([-.8,0,0,.8,0,0,0,1.7,0],3));entrance.computeVertexNormals();geometries.push(entrance);add(entrance,'#566971',x,.15,z+1.21).material.side=T.DoubleSide;
 add(cylinder,'#ead8b4',x,2.23,z,.05,.1,1.3).rotation.x=Math.PI/2;
 }
 const stones=12;for(let i=0;i<stones;i++){const a=i*Math.PI*2/stones;add(sphere,'#8a9094',Math.sin(a)*.95,.22,Math.cos(a)*.95,.27,.2,.23);}
 for(let i=0;i<3;i++){const log=add(cylinder,'#8d6c58',0,.22+i*.04,0,.16,1.6,.16);log.rotation.z=Math.PI/2;log.rotation.y=i*Math.PI/3;}
 for(const seat of CAMP_SEATS){const log=add(cylinder,'#a58065',seat.x,.43,seat.z,.33,1.25,.33);log.rotation.z=Math.PI/2;log.rotation.y=seat.yaw;for(const side of [-1,1])add(cylinder,'#d7b796',seat.x+Math.cos(seat.yaw)*side*.63,.43,seat.z-Math.sin(seat.yaw)*side*.63,.28,.03,.28).quaternion.copy(log.quaternion);}
 // Gentle geometric flames, with no shadow maps or post processing.
 for(let i=0;i<3;i++){const flame=add(sphere,['#f9b969','#ffe2a1','#f0a16a'][i],(i-1)*.2,.65,0,.3,.62-i*.1,.3,true);flame.userData.base=flame.scale.y;dynamic.push(flame);}
 add(cylinder,'#d7b789',3.6,1.65,-5.8,1.5,1.8,.09).rotation.z=Math.PI/2;
 add(box,'#4e6f6c',3.6,1.65,-5.69,2.55,1.5,.07);
 for(const x of [2.55,4.65])add(cylinder,'#aa8d71',x,.6,-5.8,.065,1.4,.065);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#f8ead1';ctx.textAlign='center';ctx.font='24px sans-serif';ctx.fillText('오늘의 한 문장',256,75);ctx.font='19px sans-serif';ctx.fillText('잠시 쉬어가도 괜찮아요',256,132);ctx.font='14px sans-serif';ctx.fillText('가까이에서 칠판 살펴보기',256,183);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const labelMat=new T.MeshBasicMaterial({map:texture,transparent:true});const label=new T.Mesh(new T.PlaneGeometry(2.5,1.25),labelMat);label.position.set(3.6,1.7,-5.63);root.add(label);
 // Small shared bookshelf.
 add(box,'#a98e77',-4.8,.75,2.5,1.7,1.5,.5);for(let row=0;row<2;row++){add(box,'#d2b99a',-4.8,.28+row*.65,2.81,1.7,.08,.55);for(let i=0;i<6;i++)add(box,['#e1c3b4','#b5c8bb','#c6bed5'][i%3],-5.45+i*.25,.56+row*.65,2.8,.17,.45,.22);}
 for(const [x,z]of [[-3.5,4],[3.8,3.9],[-5,-1.6],[5,-1.7]]){add(cylinder,'#b19b7b',x,.55,z,.04,1.1,.04);add(box,'#e4cf99',x,1.12,z,.24,.37,.24);add(box,'#fff0bc',x,1.12,z+.13,.17,.26,.02,true);add(cone,'#9a8673',x,1.4,z,.24,.19,.24);}
 // One star draw call; deterministic positions keep builds/screenshots reproducible.
 const coords=[];for(let i=0;i<80;i++){const a=i*2.39996,r=15+(i%5)*.8;coords.push(Math.sin(a)*r,9+(i%11)*.8,Math.cos(a)*r);}
 const starGeo=new T.BufferGeometry();starGeo.setAttribute('position',new T.Float32BufferAttribute(coords,3));const starMat=new T.PointsMaterial({color:'#fff1d3',size:.07,sizeAttenuation:true});const stars=new T.Points(starGeo,starMat);root.add(stars);
 const moon=add(sphere,'#f8e7b9',-7,10,-12,.65,.65,.3,true);
 // Bake only static, untextured meshes. Flames and stars stay independently animated.
 root.updateMatrixWorld(true);const buckets=new Map(),originals=[];root.traverse(o=>{if(!o.isMesh||o.material.map||dynamic.includes(o)||waveLines.includes(o))return;const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,{mat:o.material,parts:[]});buckets.get(key).parts.push(o.geometry.clone().applyMatrix4(o.matrixWorld));originals.push(o);});
 originals.forEach(o=>o.removeFromParent());for(const b of buckets.values()){const geometry=mergeGeometries(b.parts,false);b.parts.forEach(g=>g.dispose());const mesh=new T.Mesh(geometry,b.mat);root.add(mesh);}
 const glow=new T.PointLight('#ffb66d',5,6,2);glow.position.set(0,1.1,0);root.add(glow);
 return {update(time,reduced=false){for(let i=0;i<dynamic.length;i++){dynamic[i].scale.y=dynamic[i].userData.base*(reduced?1:1+Math.sin(time*3.5+i*2)*.1);}for(let i=0;i<waveLines.length;i++)waveLines[i].position.x=waveLines[i].userData.seaBaseX+(reduced?0:Math.sin(time*.45+i)*.18);glow.intensity=reduced?5:5+Math.sin(time*4)*.3;},dispose(){const gs=new Set(geometries),ms=new Set(materials.values());root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>{m.map?.dispose();m.dispose();});scene.remove(root);}};
}
