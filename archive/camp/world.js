import {createGatheringScreen} from './gathering-screen.js';
import {createCampScenery,campTexture} from './scenery.js';
import {createObservingSky} from './sky-visual.js';
import {createMoon} from './moon.js';
import {createWristwatch} from './wristwatch.js';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {CAMP,CAMP_SEATS,ALL_TENTS,SEA_BENCHES,tentAt,tentTable} from './layout.js';
import {createFireVisual} from './fire-visual.js';
import {createWoodKit} from './wood.js';
import {WOOD_FINDS} from './snack-data.js';
import {createCampLandscape} from './landscape.js';
import {createCampWeather} from './weather-visual.js';
import {createWarmingHands} from './warming-hands.js';
import {createMeteors} from './meteors.js';

// Expanded from the original camp scene in afd9cef. One scene, no extra renderer.
export function createCamp(scene){
 const root=new T.Group(),materials=new Map(),geometries=[],waves=[],cloth=[],canvasTex=campTexture('canvas');
 scene.add(root);
 const mat=(color,glow=false)=>{
  const key=color+glow;
  if(!materials.has(key))materials.set(key,glow?new T.MeshBasicMaterial({color}):new T.MeshLambertMaterial({color}));
  return materials.get(key);
 };
 const box=new T.BoxGeometry(1,1,1),sphere=new T.IcosahedronGeometry(1,1),cylinder=new T.CylinderGeometry(1,1,1,8),cone=new T.ConeGeometry(1,1,7);
 geometries.push(box,sphere,cylinder,cone);
 function add(geo,color,x,y,z,sx=1,sy=sx,sz=sx,glow=false){const mesh=new T.Mesh(geo,mat(color,glow));mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);root.add(mesh);return mesh;}
 function panel(color,x,y,z,w,h,d){return add(box,color,x,y,z,w,h,d);}
 function tube(color,a,b,r=.045){const p=new T.Vector3(...a),q=new T.Vector3(...b),direction=q.clone().sub(p);const o=add(cylinder,color,...p.clone().add(q).multiplyScalar(.5).toArray(),r,direction.length(),r);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());return o;}
 function label(text,x,y,z,w=3.4){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const c=canvas.getContext('2d');c.fillStyle='#f5e6cf';c.font='500 28px Malgun Gothic, sans-serif';c.textAlign='center';c.textBaseline='middle';
  text.split('\n').forEach((s,i,all)=>c.fillText(s,256,64+(i-(all.length-1)/2)*36,490));
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const mesh=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));mesh.position.set(x,y,z);root.add(mesh);return mesh;
 }
 function lantern(x,z,y=0){
  add(cylinder,'#aa8d71',x,y+.53,z,.035,1.06,.035);
  panel('#d7ba84',x,y+1.08,z,.25,.35,.25);
  panel('#fff0bc',x,y+1.08,z+.13,.17,.26,.02);
  add(cone,'#9a8673',x,y+1.34,z,.23,.18,.23);
 }
 // A wider clearing and a long, open coastline; flat colors avoid heavy reflections.
 panel('#426e83',0,-.62,-28,92,.12,30);
 panel('#5d8798',0,-.55,-16.5,44,.025,7);
 panel('#cebfa0',0,-.15,-13.3,31,.22,3.2);
 panel('#e0d0ae',0,-.02,-12.6,29,.035,.7);
 panel('#617e76',0,-.43,0,32,.8,28);
 const groundTex=campTexture('earth');groundTex.repeat.set(14,12);const clearing=panel('#8faaa0',0,-.05,0,30,.1,26);const clearingMat=new T.MeshLambertMaterial({color:'#e3d5bd',map:groundTex});materials.set('clearing-texture',clearingMat);clearing.material=clearingMat;

 for(let i=0;i<8;i++){
  const x=-13+(i%4)*8,z=-15-Math.floor(i/4)*5-(i%2)*.9;
  const line=panel(i%2?'#9cc3c6':'#7da9b7',x,-.48,z,3.2,.012,.06);line.userData.baseX=x;waves.push(line);
 }
 // Pale stepping stones and narrow timber paths join the entrance, fire and tents.
 for(let z=4;z<11.4;z+=.6)panel('#d4c8ac',Math.sin(z)*.12,.04,z,1.55,.045,.37).rotation.y=Math.sin(z)*.07;
 for(const t of ALL_TENTS){
  for(let i=0;i<9;i++)panel('#b9aa8d',t.x,.035,t.z+t.d/2+.5+i*.34,1.7,.035,.24);
  for(let i=0;i<7;i++)panel('#d4c8ac',Math.sign(t.x)*(3.8+i*.58),.035,4,.43,.04,1.25);
 }
 panel('#b7a389',0,.035,-10.8,24,.06,1.5);
 for(let x=-11.8;x<12;x+=.55)panel('#ceb99a',x,.072,-10.8,.022,.008,1.4);
 for(const x of [-12,12])lantern(x,-10.8);
 // Trees sit at the boundary, leaving the front door and all circulation clear.
 for(const side of [-1,1])for(const z of [-9,-4,1,6,10]){
  const x=side*15.1;
  add(cylinder,'#927b69',x,.8,z,.19,1.6,.19);
  for(let j=0;j<3;j++)add(cone,['#6e968c','#7da394','#91b19b'][j],x,1.65+j*.72,z,1.3-j*.27,2-j*.2,1.3-j*.27);
 }
 for(const x of [-11,-6,6,11]){
  add(cylinder,'#927b69',x,.7,12.9,.16,1.4,.16);
  for(let j=0;j<2;j++)add(cone,j?'#91b19b':'#6e968c',x,1.6+j*.75,12.9,1.2-j*.28,1.9,1.2-j*.28);
 }
 for(let i=0;i<24;i++){const side=i%2?1:-1,z=-10.8+Math.floor(i/2)*1.9;add(sphere,i%3?'#aab6a0':'#c3b1ba',side*(13.7+(i%3)*.18),.2,z,.36,.25,.34);}

 // Full-size original canvas cabins. Front wings leave an actual open doorway.
 for(const t of ALL_TENTS){
  const {x,z,w,d,h,door}=t,half=w/2,back=z-d/2,front=z+d/2,eave=1.4;
  panel('#777d7d',x,.025,z,w,.05,d);
  const rug=panel(t.rug,x,.063,z+.35,w-.55,.018,d-1);const rugMat=new T.MeshLambertMaterial({color:t.rug,map:canvasTex});materials.set('rug-'+t.id,rugMat);rug.material=rugMat;
  for(let j=0;j<8;j++)panel('#d9c3ac',x-w/2+.4+j*.74,.075,z+.35,.025,.004,d-1.2);
  const vertices=[],wallVertices=[];
  const tri=(a,b,c)=>vertices.push(...a,...b,...c);
  const quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
  const left=x-half,right=x+half;
  quad([left,0,back],[left,eave,back],[left,eave,front],[left,0,front]);
  quad([right,0,front],[right,eave,front],[right,eave,back],[right,0,back]);
  quad([left,0,back],[right,0,back],[right,eave,back],[left,eave,back]);
  tri([left,eave,back],[right,eave,back],[x,h,back]);
  wallVertices.push(...vertices.splice(0));
  quad([left,eave,back],[x,h,back],[x,h,front],[left,eave,front]);
  quad([x,h,back],[right,eave,back],[right,eave,front],[x,h,front]);
  const openingTop=eave+(h-eave)*(1-door/w);
  quad([left,0,front],[x-door/2,0,front],[x-door/2,openingTop,front],[left,eave,front]);
  quad([x+door/2,0,front],[right,0,front],[right,eave,front],[x+door/2,openingTop,front]);
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(vertices.flatMap((v,i)=>i%3===0?[v*.4+vertices[i+2]*.2,vertices[i+1]*.45+vertices[i+2]*.35]:[]),2));geo.computeVertexNormals();geometries.push(geo);
  const fabric=new T.MeshLambertMaterial({color:t.color,map:canvasTex,side:T.DoubleSide,transparent:true,opacity:1,depthWrite:true});
  const mesh=new T.Mesh(geo,fabric);root.add(mesh);
  const wallGeo=new T.BufferGeometry();wallGeo.setAttribute('position',new T.Float32BufferAttribute(wallVertices,3));wallGeo.setAttribute('uv',new T.Float32BufferAttribute(wallVertices.flatMap((v,i)=>i%3===0?[v*.4+wallVertices[i+2]*.2,wallVertices[i+1]*.45+wallVertices[i+2]*.35]:[]),2));wallGeo.computeVertexNormals();geometries.push(wallGeo);
  const wallMesh=new T.Mesh(wallGeo,fabric.clone());root.add(wallMesh);
  for(const zz of [back,front]){
   tube('#ead8b4',[left,0,zz],[left,eave,zz]);tube('#ead8b4',[left,eave,zz],[x,h,zz]);tube('#ead8b4',[x,h,zz],[right,eave,zz]);tube('#ead8b4',[right,eave,zz],[right,0,zz]);
  }
  tube('#ead8b4',[x,h,back],[x,h,front]);
  for(const side of [-1,1])tube('#ead8b4',[x+side*door/2,0,front],[x+side*door/2,openingTop,front],.065);
  panel('#b8a285',x,.04,front+.5,door+.25,.04,1.1);
  // Rolled doorway, seams, tension ropes and stakes stay clear of the walking entrance.
  const roll=add(cylinder,t.color,x,openingTop+.03,front+.05,.105,door+.14,.105);roll.rotation.z=Math.PI/2;
  for(const side of [-1,1]){
   const xx=x+side*(half-.2),pegX=x+side*(half+.48);
   tube('#a99b83',[xx,eave+.1,back+.45],[pegX,.08,back+.12],.012);
   tube('#5c5850',[pegX,.02,back+.12],[pegX,.19,back+.12],.028);
   for(let j=0;j<12;j++)panel('#b3a28b',x+side*(door/2+.09),.14+j*(openingTop-.25)/12,front+.015,.018,.045,.012);
   panel('#8d8374',x+side*.8,openingTop+.03,front+.16,.04,.15,.025);
  }
  const sign=label(t.name+'\n걸어서 들어오세요',x,3.4,front+.05,3.5);
  cloth.push({tent:t,mesh,wallMesh,sign});
  for(const seat of CAMP_SEATS.filter(s=>s.group==='camp-tent-'+t.id)){
   panel('#e5d7bd',seat.x,.16,seat.z,.92,.25,.86);
   panel(t.color,seat.x,.34,seat.z-.29,.85,.24,.3);
   panel('#f0e4ce',seat.x,.32,seat.z+.05,.7,.07,.54);
  }
  const table=tentTable(t);
  panel('#a98e77',table.x,.5,table.z,table.w,.12,table.d);
  for(const side of [-1,1])panel('#927b69',table.x+side*.58,.25,table.z,.07,.5,.5);
  panel('#e8dcc3',x-.35,.59,table.z,.48,.06,.4);panel(t.rug,x-.35,.625,table.z,.025,.008,.4);
  add(cylinder,'#ead8b4',x+.46,.68,table.z,.08,.25,.08);
  lantern(x+half-.6,back+.7);
 }

 // Moonlit shore benches face the sea; each retains its own whisper group.
 for(const s of SEA_BENCHES){
  for(let j=0;j<4;j++)panel('#c9b89a',s.x,.53,s.z-.23+j*.15,1.8,.095,.13);
  for(const side of [-1,1]){panel('#827666',s.x+side*.67,.25,s.z,.09,.5,.62);panel('#827666',s.x+side*.67,.83,s.z+.35,.07,.75,.08);}
  for(let j=0;j<3;j++)panel('#d2bfa1',s.x,.75+j*.14,s.z+.36,1.8,.105,.075);
 }
 // Existing six fire-circle seats keep their IDs and positions.



 const b=CAMP.board;
 panel('#aa8d71',b.x,1.6,b.z,b.w+.2,1.8,.14);panel('#4e6f6c',b.x,1.6,b.z+.1,b.w,1.6,.06);
 for(const side of [-1,1])add(cylinder,'#aa8d71',b.x+side*1.1,.6,b.z,.06,1.3,.06);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');
 const quoteTex=new T.CanvasTexture(canvas);quoteTex.colorSpace=T.SRGBColorSpace;
 const quoteLabel=new T.Mesh(new T.PlaneGeometry(2.65,1.35),new T.MeshBasicMaterial({map:quoteTex,transparent:true}));quoteLabel.position.set(b.x,1.65,b.z+.14);root.add(quoteLabel);
 for(const [x,z] of [[-3.8,5],[3.8,5],[-8,2.2],[8,2.2],[-2.1,10.3],[2.1,10.3]])lantern(x,z);
 const coords=[];for(let i=0;i<100;i++){const a=i*2.39996,r=75+(i%5)*4;coords.push(Math.sin(a)*r,18+(i%11)*4,Math.cos(a)*r);}
 const starGeo=new T.BufferGeometry();starGeo.setAttribute('position',new T.Float32BufferAttribute(coords,3));const decorativeStars=new T.Points(starGeo,new T.PointsMaterial({color:'#fff1d3',size:.12,sizeAttenuation:true,fog:false}));root.add(decorativeStars);


 // Merge flat-color furniture; only cloth, flame, stars and water stay dynamic.
 root.updateMatrixWorld(true);const buckets=new Map(),originals=[];
 root.traverse(o=>{
  if(!o.isMesh||o.material.map||waves.includes(o)||cloth.some(c=>c.mesh===o||c.wallMesh===o))return;
  const part=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld);part.deleteAttribute('uv');
  const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,{mat:o.material,parts:[]});buckets.get(key).parts.push(part);originals.push(o);
 });
 originals.forEach(o=>o.removeFromParent());
 for(const bucket of buckets.values()){const geo=mergeGeometries(bucket.parts,false);bucket.parts.forEach(g=>g.dispose());if(!geo)throw Error('Camp geometry merge failed');root.add(new T.Mesh(geo,bucket.mat));}
 const gathering=createGatheringScreen(root);
 const scenery=createCampScenery(root),landscape=createCampLandscape(root),weather=createCampWeather(root),hands=createWarmingHands(root),watch=createWristwatch(root);
 const meteors=createMeteors(root),moon=createMoon(root),sky=createObservingSky(root);
 const fire=createFireVisual(root);
 const seatWood=createWoodKit(),woodRoot=new T.Group();woodRoot.name='natural-log-seats';root.add(woodRoot);
 for(const s of CAMP_SEATS.filter(s=>s.group==='campfire-main')){
  const log=seatWood.log(.33,1.3);log.position.set(s.x,.43,s.z);log.rotation.set(0,s.yaw,Math.PI/2);woodRoot.add(log);
  const scar=seatWood.log(.075,.12);scar.position.set(s.x+Math.cos(s.yaw)*.31,.7,s.z-Math.sin(s.yaw)*.31);scar.rotation.set(.2,s.yaw,.4);woodRoot.add(scar);
 }
 const pickupWood=new T.InstancedMesh(seatWood.geometry,seatWood.materials,WOOD_FINDS.length*3),woodPose=new T.Object3D();let woodIndex=0;
 for(const spot of WOOD_FINDS)for(let i=0;i<3;i++){woodPose.position.set(spot.x+(i-1)*.13,.12+i*.035,spot.z);woodPose.rotation.set(.13,i*.4,Math.PI/2);woodPose.scale.set(.07,.54,.07);woodPose.updateMatrix();pickupWood.setMatrixAt(woodIndex++,woodPose.matrix);}woodRoot.add(pickupWood);
 let previous=0;
 return {
  setRanking:value=>gathering.set(value),setCanPack:pack=>scenery.setPack(pack),setSkyMode:mode=>sky.setMode(mode),setSky:active=>{sky.set(active);moon.setSky(active);decorativeStars.visible=!active;},pickMoon:ray=>moon.pick(ray),get skyTarget(){return sky.target;},setFocus:active=>moon.setFocus(active),setWatch:active=>watch.set(active),groundPoint:ray=>landscape.groundPoint(ray),setHands:(...args)=>hands.set(...args),setWeather:value=>weather.setState(value),setFireState:value=>fire.setState(value),setSnacks:value=>fire.setSnacks(value),pickWood:ray=>fire.pickWood(ray),stirWood:(...args)=>fire.stir(...args),
  get fireDiagnostics(){return {...fire.diagnostics,scenery:scenery.diagnostics,sky:sky.diagnostics,moon:moon.diagnostics,meteor:meteors.diagnostics,weather:weather.diagnostics,hands:hands.diagnostics,watch:watch.diagnostics,landscape:landscape.diagnostics};},
  get cutaway(){return cloth.map(c=>({id:c.tent.id,opacity:c.mesh.material.opacity,wallOpacity:c.wallMesh.material.opacity}));},
  setQuote(text){ctx.clearRect(0,0,512,256);ctx.fillStyle='#f8ead1';ctx.textAlign='center';ctx.font='24px sans-serif';ctx.fillText('별빛 캠핑장 방명록',256,60);ctx.font='18px sans-serif';const chars=[...text];ctx.fillText(chars.slice(0,23).join(''),256,115);ctx.fillText(chars.slice(23,46).join('')+(chars.length>46?'…':''),256,148);ctx.font='14px sans-serif';ctx.fillText('가까이에서 흔적 남기기',256,205);quoteTex.needsUpdate=true;},
  update(time,reduced=false,viewer,camera){
   const dt=previous?Math.min(.05,Math.max(0,time-previous)):.05;previous=time;
   sky.update(time,camera);moon.update(camera);weather.update(time,viewer,reduced);hands.update(time,camera,reduced);watch.update(time,camera,reduced);landscape.update(time,viewer,!!viewer&&Math.hypot(viewer.x-(this.lastX??viewer.x),viewer.z-(this.lastZ??viewer.z))>.001,reduced,camera,Date.now());this.lastX=viewer?.x;this.lastZ=viewer?.z;fire.update(time,reduced);meteors.update(time,camera,reduced);
   for(let i=0;i<waves.length;i++)waves[i].position.x=waves[i].userData.baseX+(reduced?0:Math.sin(time*.45+i)*.18);

   const near=viewer?tentAt(viewer.x,viewer.z,1.15):null;
   const inside=viewer?tentAt(viewer.x,viewer.z):null;
   for(const c of cloth){c.baseRotation??=c.mesh.rotation.z;c.mesh.rotation.z=c.baseRotation+(reduced?0:Math.sin(time*2+c.tent.x)*weather.wind*.018);
    for(const [mesh,faded] of [[c.mesh,.1],[c.wallMesh,.72]]){const material=mesh.material,target=near?.id === c.tent.id ? faded : 1;material.opacity=reduced?target:T.MathUtils.damp(material.opacity,target,9,dt);material.depthWrite=material.opacity>.98;}
    c.sign.visible=inside?.id!==c.tent.id;
   }
  },
  dispose(){gathering.dispose();scenery.dispose();canvasTex.dispose();sky.dispose();moon.dispose();landscape.dispose();weather.dispose();hands.dispose();watch.dispose();meteors.dispose();fire.dispose();pickupWood.dispose();woodRoot.removeFromParent();seatWood.dispose();const gs=new Set(geometries),ms=new Set(materials.values());root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>{m.map?.dispose();m.dispose();});scene.remove(root);}
 };
}
