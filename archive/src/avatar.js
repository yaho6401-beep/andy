import * as T from 'three';
const materials=new Map();const mat=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.88}));return materials.get(color);};
function ball(parent,color,x,y,z,sx,sy= sx,sz=sx){const m=new T.Mesh(new T.SphereGeometry(1,14,10),mat(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m;}
export function createAvatar(look={}){
 const root=new T.Group(),body=new T.Group();root.add(body);const female=(look.kind||0)>=4,variant=(look.kind||0)%4;const skin=['#edc5aa','#bf8b6d','#e5bfa7','#d3a58a'][variant],hair=look.hair||'#554239',shirt=look.color||'#b7c6a1';
 const hips=new T.Group();body.add(hips);ball(hips,shirt,0,.72,0,.32,.38,.25);ball(hips,skin,0,1.27,0,.43,.43,.36);
 ball(hips,hair,0,1.43,-.04,.445,.32,.36);ball(hips,hair,-.26,1.42,.21,.2,.15,.12);ball(hips,hair,-.03,1.5,.25,.18,.16,.12);
 if(look.hairStyle===1){ball(hips,hair,-.35,1.13,-.12,.15,.27,.17);ball(hips,hair,.35,1.13,-.12,.15,.27,.17);}if(look.hairStyle===2){ball(hips,hair,0,1.08,-.24,.4,.43,.2);ball(hips,hair,.36,1.2,-.12,.12,.35,.15);}
 for(const x of [-.135,.135]){ball(hips,'#352d31',x,1.28,.323,.035,.051,.025);ball(hips,'#fff8ee',x-.009,1.297,.343,.009);ball(hips,'#d89f9b',x*1.6,1.16,.31,.064,.028,.013);}
 const smile=new T.Mesh(new T.TorusGeometry(.047,.009,5,12,Math.PI),mat('#956e65'));smile.rotation.z=Math.PI;smile.position.set(0,1.17,.351);hips.add(smile);
 ball(hips,skin,-.42,1.27,0,.075,.11,.08);ball(hips,skin,.42,1.27,0,.075,.11,.08);
 const arms=[],legs=[];for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.31,.88,0);ball(arm,shirt,side*.05,-.13,0,.12,.22,.13);ball(arm,skin,side*.065,-.34,.015,.1,.105,.1);hips.add(arm);arms.push(arm);const leg=new T.Group();leg.position.set(side*.14,.43,0);ball(leg,'#767a75',0,-.13,0,.12,.23,.13);ball(leg,'#f7eedb',0,-.32,.035,.14,.09,.18);body.add(leg);legs.push(leg);}
 if(female){
 const skirt=new T.Mesh(new T.CylinderGeometry(.25,.42,.43,20),mat(shirt));skirt.position.set(0,.49,0);hips.add(skirt);
 const collar=new T.Mesh(new T.TorusGeometry(.16,.025,6,20,Math.PI),mat('#f5e6cd'));collar.position.set(0,.96,.19);collar.rotation.x=.2;hips.add(collar);
 for(const x of [-.135,.135]){const lash=new T.Mesh(new T.BoxGeometry(.055,.012,.012),mat('#352d31'));lash.position.set(x*1.2,1.32,.336);lash.rotation.z=x<0?.35:-.35;hips.add(lash);}
 if(variant===0){ball(hips,hair,-.35,1.16,-.07,.15,.27,.19);ball(hips,hair,.35,1.16,-.07,.15,.27,.19);}
 if(variant===1){ball(hips,hair,0,1.1,-.27,.41,.47,.18);for(const side of [-1,1])ball(hips,hair,side*.34,.98,-.08,.15,.3,.16);}
 if(variant===2){ball(hips,hair,.08,1.78,-.14,.2,.18,.18);ball(hips,'#d5b77e',.21,1.73,0,.05,.04,.04);}
 if(variant===3){for(const side of [-1,1])ball(hips,hair,side*.37,1.05,-.08,.12,.25,.16);ball(hips,'#f0d4a5',-.32,1.49,.19,.05);}
 }
 // Original accessories distinguish the eight silhouettes.
 if(variant===1){for(const x of [-.14,.14]){const rim=new T.Mesh(new T.TorusGeometry(.096,.014,6,20),mat('#987d5f'));rim.position.set(x,1.28,.35);hips.add(rim);}const bridge=new T.Mesh(new T.BoxGeometry(.08,.015,.015),mat('#987d5f'));bridge.position.set(0,1.28,.35);hips.add(bridge);}
 if(variant===2){ball(hips,'#e1c48c',.3,1.54,.17,.055,.025,.055);}if(variant===3){const bag=ball(hips,'#aa8568',-.3,.56,.2,.12,.16,.05);bag.rotation.z=-.15;}
 const shadow=new T.Mesh(new T.CircleGeometry(.4,24),new T.MeshBasicMaterial({color:'#705e50',transparent:true,opacity:.15,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;root.add(shadow);
 root.userData={body,hips,arms,legs};root.scale.setScalar(1.08);return root;
}
export function animateAvatar(root,state,time){const {body,hips,arms,legs}=root.userData,moving=state.motion==='walk',sit=state.motion==='sit',active=time-(state.emoteAt||0)/1000<3.5;body.position.y=sit?-.25:moving?Math.sin(time*12)*.035:Math.sin(time*2)*.015;hips.rotation.x=sit?-.05:0;for(let i=0;i<2;i++){legs[i].rotation.x=sit?-1.2:moving?Math.sin(time*10+i*Math.PI)*.45:0;arms[i].rotation.x=moving?Math.sin(time*10+(i+1)*Math.PI)*.3:0;arms[i].rotation.z=(i===0?1:-1)*.06;}if(active&&state.emote==='wave'){arms[1].rotation.z=2.3+Math.sin(time*13)*.28;}if(active&&state.emote==='clap'){arms[0].rotation.z=-.55;arms[1].rotation.z=.55;arms[0].rotation.x=arms[1].rotation.x=-.9+Math.sin(time*12)*.12;}if(active&&state.emote==='heart'){arms[0].rotation.z=-1;arms[1].rotation.z=1;arms[0].rotation.x=arms[1].rotation.x=-.45;}}
