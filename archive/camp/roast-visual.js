import * as T from 'three';
import {CAMP_SEATS} from './layout.js';
import {roastState} from './snack-data.js';
import {billboardVertex,flameFragment} from './fire-shaders.js';

export function createRoastingVisual(parent){
 const root=new T.Group();root.name='slow-roasting-snacks';parent.add(root);
 const geo=new T.SphereGeometry(1,14,9),mallow=new T.CylinderGeometry(.16,.16,.25,16),rod=new T.CylinderGeometry(.013,.018,1.1,6),half=new T.SphereGeometry(1,12,8,0,Math.PI),cut=new T.CircleGeometry(1,16),plate=new T.CylinderGeometry(.34,.3,.04,16),flameGeo=new T.PlaneGeometry(1,1);
 const p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=1+.026*Math.sin(x*18+y*9)*Math.sin(z*17-y*7);p.setXYZ(i,x*d,y*d,z*d);}
 geo.computeVertexNormals();
 const rodMat=new T.MeshLambertMaterial({color:'#a37a4b'}),foilMat=new T.MeshStandardMaterial({color:'#c8bda9',metalness:.65,roughness:.43}),cutMat=new T.MeshLambertMaterial({color:'#f4cf80',side:T.DoubleSide}),dark=new T.Color('#242019'),models=new Map();
 function remove(model){model.root.removeFromParent();model.material.dispose();model.fleshMaterial?.dispose();model.personalGeometry?.dispose();model.flame?.material.dispose();}
 function setJobs(jobs){
  const ids=new Set(jobs.map(j=>j.id));for(const [id,m]of models)if(!ids.has(id)){remove(m);models.delete(id);}
  for(const job of jobs){
   if(models.has(job.id)){models.get(job.id).job=job;continue;}
   const seat=CAMP_SEATS.find(s=>s.id===job.seat&&s.group==='campfire-main');if(!seat)continue;
   const g=new T.Group();g.rotation.y=Math.atan2(seat.x,seat.z);root.add(g);
   const marsh=job.kind==='marshmallow',sweet=job.kind==='sweetpotato',start=new T.Color(marsh?'#fff4e3':sweet?'#99535f':'#bda078'),end=new T.Color(marsh?'#bd7e38':sweet?'#b86e40':'#e0ab5d'),mat=new T.MeshStandardMaterial({color:start,roughness:.85});
   const food=new T.Mesh(marsh?mallow:job.shared?half:geo,mat);food.position.set(0,marsh?.72:.55,marsh?.9:1.1);
   let flesh,fleshMaterial,stick,personalGeometry,flame;
   if(job.shared){
    food.position.set(0,.3,1.24);food.scale.set(marsh?1:.22,marsh?.5:.13,marsh?1:sweet?.34:.24);food.rotation.y=Math.PI;
    const dish=new T.Mesh(plate,rodMat);dish.position.set(0,.18,1.24);g.add(dish);
    if(!marsh){const face=new T.Mesh(cut,cutMat);face.scale.set(.22,.13,1);face.position.set(0,.3,1.242);g.add(face);}
   }else if(marsh){
    food.rotation.x=Math.PI/2;stick=new T.Mesh(rod,rodMat);stick.rotation.x=Math.PI/2;stick.position.set(0,.72,1.45);g.add(stick);
    personalGeometry=mallow.clone();personalGeometry.setAttribute('color',new T.BufferAttribute(new Float32Array(personalGeometry.attributes.position.count*3).fill(1),3));food.geometry=personalGeometry;mat.vertexColors=true;
    flame=new T.Mesh(flameGeo,new T.ShaderMaterial({uniforms:{uTime:{value:0},uPhase:{value:9.3},uHeat:{value:.65},uBurst:{value:0},uWidth:{value:.4},uHeight:{value:.65}},vertexShader:billboardVertex,fragmentShader:flameFragment,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false}));flame.name='marshmallow-small-flame';flame.visible=false;flame.renderOrder=12;g.add(flame);
   }else{
    food.scale.set(.28,.18,sweet?.4:.3);food.rotation.y=.25;
    const foil=new T.Mesh(geo,foilMat);foil.scale.set(.33,.055,sweet?.44:.35);foil.position.set(0,.315,1.1);g.add(foil);
    fleshMaterial=new T.MeshLambertMaterial({color:sweet?'#efb653':'#f0d698'});flesh=new T.Mesh(geo,fleshMaterial);flesh.position.set(0,.722,1.1);flesh.scale.set(.01,.015,sweet?.24:.18);g.add(flesh);
   }
   g.add(food);models.set(job.id,{root:g,food,material:mat,job,start,end,flesh,fleshMaterial,stick,personalGeometry,flame,scorch:0,turnAngle:0,color:new T.Color()});
  }
 }
 return {
  setJobs,
  update(now,time,reduced=false){for(const m of models.values()){
   const state=roastState(m.job,now);m.scorch=state.scorch;m.material.color.lerpColors(m.start,m.end,state.progress).lerp(dark,state.scorch*.96);m.material.roughness=.85+state.scorch*.15;
   if(m.flesh){m.flesh.scale.x=.008+state.progress*.066;m.fleshMaterial.color.set(m.job.kind==='sweetpotato'?'#efb653':'#f0d698').lerp(dark,state.scorch);}
   if(m.job.kind==='marshmallow'&&!m.job.shared){
    const r=state.roast,level=r?.level??1,height=[.76,1.12,1.62,1.8][level],radius=[.72,.95,1.18,1.85][level];
    m.food.position.y+=(height-m.food.position.y)*(reduced?1:.18);m.food.position.z+=(radius-m.food.position.z)*(reduced?1:.18);m.stick.position.set(0,m.food.position.y,m.food.position.z+.55);
    m.turnAngle+=((r?.turns||0)*Math.PI/2-m.turnAngle)*(reduced?1:.2);m.food.rotation.set(Math.PI/2,m.turnAngle,0);
    if(r){m.material.color.set('#ffffff');const pos=m.personalGeometry.attributes.position,colors=m.personalGeometry.attributes.color,key=r.faces.map(v=>Math.floor(v*50)).join()+':'+Math.floor(r.char*50);if(m.colorKey!==key){m.colorKey=key;for(let i=0;i<pos.count;i++){const face=Math.floor(((Math.atan2(pos.getZ(i),pos.getX(i))+Math.PI*2)%(Math.PI*2))/(Math.PI/2));m.color.lerpColors(m.start,m.end,Math.min(1,r.faces[face])).lerp(dark,Math.min(1,r.char*.85+Math.max(0,r.faces[face]-1.25)*.6));colors.setXYZ(i,m.color.r,m.color.g,m.color.b);}colors.needsUpdate=true;}}
    m.flame.visible=!!state.onFire&&!state.burnt;m.flame.position.copy(m.food.position);m.flame.material.uniforms.uTime.value=reduced?1:time;m.flame.material.uniforms.uHeight.value=.3+(r?.flame||0)*.5;
   }
  }},
  get diagnostics(){return {roasting:[...models.values()].filter(m=>!m.job.shared).length,sharedPortions:[...models.values()].filter(m=>m.job.shared).length,food:[...models.values()].map(m=>({kind:m.job.kind,color:m.material.color.getHexString(),scorch:m.scorch,shared:!!m.job.shared,height:m.food.position.y,turn:m.turnAngle,flaming:!!m.flame?.visible}))};},
  dispose(){for(const m of models.values())remove(m);models.clear();root.removeFromParent();[geo,mallow,rod,half,cut,plate,flameGeo].forEach(g=>g.dispose());[rodMat,foilMat,cutMat].forEach(m=>m.dispose());}
 };
}
