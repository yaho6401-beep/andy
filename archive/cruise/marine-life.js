import * as T from 'three';
import {createDolphin} from '../camp/dolphin-model.js';

export class MarineSchedule{
 constructor(random=Math.random,now=Date.now()){this.random=random;this.nextAt=now+30000+random()*35000;this.event=null;this.encounters=0;}
 update(now,enabled=true){if(this.event&&now-this.event.at>this.event.duration){this.event=null;this.nextAt=now+75000+this.random()*105000;}if(!this.event&&enabled&&now>=this.nextAt){const whale=this.random()<.25;this.event={kind:whale?'whale':'dolphins',at:now,duration:whale?26000:20000,side:this.random()<.5?-1:1,distance:whale?90+this.random()*35:32+this.random()*14};this.encounters++;}return this.event;}
}
// Original streamlined large-whale mesh: broad head, long pectorals, tapered tail,
// horizontal flukes and a small aft dorsal fin. No downloaded animal assets.
export function createWhale(){
 const root=new T.Group(),owned=[],skin=new T.MeshStandardMaterial({color:'#53616b',roughness:.52,vertexColors:true});root.name='cruise-large-whale';
 const profile=[[-6,.05,.05],[-4.8,.22,.22],[-3.4,.58,.5],[-1.8,1.08,.91],[0,1.4,1.1],[1.8,1.42,1.08],[3.1,1.1,.88],[4.2,.76,.6],[4.8,.25,.3]],pos=[],col=[],ix=[],rings=24;
 for(const[z,x,y]of profile)for(let i=0;i<=rings;i++){const a=i/rings*Math.PI*2;pos.push(Math.cos(a)*x,Math.sin(a)*y,z);const c=.64+Math.max(0,-Math.sin(a))*.27;col.push(c,c+.02,c+.035);}for(let j=0;j<profile.length-1;j++)for(let i=0;i<rings;i++){const a=j*(rings+1)+i,b=a+rings+1;ix.push(a,a+1,b,b,a+1,b+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(ix);g.computeVertexNormals();owned.push(g);root.add(new T.Mesh(g,skin));
 function fin(points){const p=[],ids=[];for(const s of[-1,1])for(const[x,y,z]of points)p.push(x,y+s*.045,z);const n=points.length;for(let i=1;i<n-1;i++)ids.push(0,i,i+1,n,n+i+1,n+i);for(let i=0;i<n;i++){const k=(i+1)%n;ids.push(i,k,n+i,k,n+k,n+i);}const f=new T.BufferGeometry();f.setAttribute('position',new T.Float32BufferAttribute(p,3));f.setAttribute('color',new T.Float32BufferAttribute(p.map(()=>.73),3));f.setIndex(ids);f.computeVertexNormals();owned.push(f);return new T.Mesh(f,skin);}
 for(const s of[-1,1])root.add(fin([[s*.85,-.3,1.6],[s*1.8,-.8,.6],[s*3.2,-1.1,-1.8],[s*2.5,-.9,-1.5],[s*1.1,-.55,-.1]]));
 const tail=new T.Group();tail.position.z=-5.1;root.add(tail);for(const s of[-1,1])tail.add(fin([[0,0,-.1],[s*1.1,.08,.35],[s*2.3,.14,-.55],[s*1.1,.03,-1.05],[0,0,-.7]]));
 root.add(fin([[0,.55,-2.5],[0,1.25,-3.1],[.08,.62,-3.5],[.06,.5,-3.3]]));root.userData.tail=tail;root.userData.dispose=()=>{root.removeFromParent();owned.forEach(g=>g.dispose());skin.dispose();};return root;
}
export function createMarineLife(scene,{random=Math.random,clock=Date.now}={}){
 const schedule=new MarineSchedule(random,clock()),root=new T.Group(),dolphins=[createDolphin(),createDolphin()],whale=createWhale();root.name='occasional-marine-life';scene.add(root);root.add(...dolphins,whale);root.visible=false;
 const mistGeo=new T.BufferGeometry(),mistPos=new Float32Array(18*3);mistGeo.setAttribute('position',new T.BufferAttribute(mistPos,3));const mistMat=new T.PointsMaterial({color:'#cad8de',transparent:true,opacity:0,size:.65,depthWrite:false}),mist=new T.Points(mistGeo,mistMat);root.add(mist);mist.frustumCulled=false;
 const ringGeo=new T.RingGeometry(.86,1,48),ringMat=new T.MeshBasicMaterial({color:'#b4cbd0',transparent:true,opacity:.15,side:T.DoubleSide,depthWrite:false}),rings=[0,1].map(()=>{const m=new T.Mesh(ringGeo,ringMat);m.rotation.x=-Math.PI/2;root.add(m);return m;});
 const note=typeof document==='undefined'?null:Object.assign(document.createElement('p'),{id:'marine-glimpse'});if(note)document.body.append(note);
 let state=null;
 return{update(time,{enabled=true}={}){const event=schedule.update(clock(),enabled);root.visible=!!event;dolphins.forEach(d=>d.visible=false);whale.visible=false;mist.visible=false;rings.forEach(r=>r.visible=false);if(!event){state=null;note?.classList.remove('visible');return;}const t=(clock()-event.at)/1000,u=t/(event.duration/1000),envelope=Math.sin(Math.PI*u),side=event.side;state={...event,progress:u};if(note){note.textContent=(side<0?'왼쪽':'오른쪽')+' 먼 바다에 '+(event.kind==='whale'?'고래의 숨결이 보인다…':'돌고래가 잠시 수면 위로 올라온다…');note.classList.toggle('visible',enabled&&t>1&&t<6);}
  if(event.kind==='dolphins'){dolphins.forEach((d,i)=>{d.visible=true;const phase=t*.8-i*.7,breath=Math.max(0,Math.sin(phase));d.position.set(side*(event.distance+i*3),-1.15+breath*1.12*envelope,-92+u*88-i*5);d.rotation.set(Math.cos(phase)*.10,0,side*.04);d.userData.tail.rotation.x=Math.sin(t*3.1+i)*.19;});}
  else{whale.visible=true;whale.position.set(side*event.distance,-1.65+envelope*1.3,-155+u*65);whale.rotation.x=Math.sin(t*.2)*.035;whale.rotation.y=.10*side;whale.userData.tail.rotation.x=Math.sin(t*1.2)*.12;const breath=t-8;mist.visible=breath>0&&breath<3.3;if(mist.visible){for(let i=0;i<18;i++){const age=breath+i*.015;mistPos.set([whale.position.x+Math.sin(i*2.4)*age*.38,Math.max(0,whale.position.y+1.2)+age*1.9,whale.position.z+2.5+Math.cos(i*3.1)*age*.3],i*3);}mistGeo.attributes.position.needsUpdate=true;mistMat.opacity=Math.sin(breath/3.3*Math.PI)*.36;}}
  const animal=event.kind==='whale'?whale:dolphins[0];rings.forEach((r,i)=>{const p=(t*.15+i*.5)%1;r.visible=animal.position.y>-.8;r.position.set(animal.position.x,.045,animal.position.z);r.scale.setScalar((event.kind==='whale'?3:1)*(1+p*1.8));});
 },get state(){return{event:state,nextAt:schedule.nextAt,encounters:schedule.encounters,models:3};},dispose(){note?.remove();root.removeFromParent();dolphins.forEach(d=>d.userData.dispose());whale.userData.dispose();mistGeo.dispose();mistMat.dispose();ringGeo.dispose();ringMat.dispose();}};
}
