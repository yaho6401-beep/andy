import * as T from 'three';
import {SHIP_EQUIPMENT,SHIP_BENCHES,ROOF_Y,LOWER_Y} from './ship-layout.js';
// Original, static ship fittings merge into the existing material batches.
export function buildDeckEquipment(ship,{box,mesh,cylinder,label}){
 const steel=0xa6b5b7,navy=0x213c4a,white=0xe9e6de,wood=0x977352,yellow=0xc4a575,rope=0x998f79,radars=[];
 const pole=(p,c,x,y,z,r,h)=>mesh(p,cylinder,c,x,y,z,r,h,r);
 const tube=(p,c,a,b,r=.025)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),m=mesh(p,cylinder,c,...av.clone().add(bv).multiplyScalar(.5).toArray(),r,av.distanceTo(bv),r);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return m;};
 const ring=(p,c,x,y,z,r,thick=.025)=>mesh(p,new T.TorusGeometry(r,thick,6,24),c,x,y,z,1,1,1);
 for(const f of SHIP_EQUIPMENT){const g=new T.Group();g.position.set(f.x,f.y,f.z);ship.add(g);
  if(f.kind==='mooring-winch'){
   box(g,steel,0,.12,0,2.4,.24,2.6);for(const x of[-.94,.94]){box(g,navy,x,.65,0,.16,1.12,1.55);pole(g,steel,x,.77,0,.62,.13).rotation.z=Math.PI/2;}
   pole(g,navy,0,.77,0,.48,1.85).rotation.z=Math.PI/2;
   for(let x=-.77;x<=.78;x+=.105)ring(g,rope,x,.77,0,.49,.052).rotation.y=Math.PI/2;
   box(g,navy,0,.37,.99,1.4,.5,.45);pole(g,steel,1,.68,.78,.11,.75);ring(g,yellow,1,1.05,.78,.2).rotation.x=Math.PI/2;
  }else if(f.kind==='bitts'){
   box(g,steel,0,.07,0,1.7,.14,.96);for(const x of[-.49,.49]){pole(g,navy,x,.48,0,.19,.84);box(g,steel,x,.9,0,.72,.1,.35);}
  }else if(f.kind==='fairlead'){
   box(g,steel,0,.1,0,.65,.2,2);for(const z of[-.67,.67]){pole(g,navy,0,.5,z,.23,.8);pole(g,steel,0,.9,z,.28,.09);}tube(g,steel,[-.2,.85,-.67],[-.2,.85,.67],.075);
  }else if(f.kind==='rope'){
   for(let i=0;i<7;i++){const r=ring(g,rope,0,.08+i*.045,0,.6-i*.02,.035);r.rotation.x=Math.PI/2;}const line=new T.CatmullRomCurve3([new T.Vector3(.6,.05,0),new T.Vector3(.67,.05,.35),new T.Vector3(.4,.05,.65),new T.Vector3(.02,.05,.62)]);mesh(g,new T.TubeGeometry(line,12,.035,5,false),rope,0,0,0,1,1,1);
  }else if(f.kind==='chain-stopper'){
   box(g,steel,0,.1,0,1.15,.2,2.9);for(const x of[-.36,.36])box(g,navy,x,.32,.25,.12,.48,.85);box(g,yellow,0,.49,.08,.83,.12,.19);box(g,navy,0,.06,-1.06,.72,.14,.65);
   for(const side of[-1,1])for(let z=-1.4;z<1.4;z+=.38){const b=box(g,yellow,side*.56,.22,z,.035,.02,.19);b.rotation.y=.4;}
  }else if(f.kind==='radar-base'){
   box(g,white,0,.58,0,1.3,1.16,1.3);pole(g,steel,0,1.82,0,.2,1.9);for(const x of[-1.4,1.4])for(let z=-1.4;z<1.5;z+=.48){const b=box(g,yellow,x,.022,z,.08,.035,.29);b.rotation.y=.5;}
  }else if(f.kind==='x-radar'){
   pole(g,steel,0,1.5,0,.14,3);box(g,white,0,2.75,0,.75,.4,.68);const a=new T.Group();a.position.y=3.15;a.userData.dynamic=true;g.add(a);box(a,white,0,0,0,2.7,.22,.42);box(a,navy,0,-.1,0,2.5,.08,.3);radars.push(a);
  }else if(f.kind==='hatch'){
   box(g,navy,0,.09,0,2.1,.18,2.7);box(g,white,0,.25,0,1.94,.25,2.53);for(const x of[-.68,.68])for(const z of[-.8,.8]){box(g,steel,x,.41,z,.27,.07,.13);pole(g,navy,x,.45,z,.055,.07);}tube(g,steel,[-.3,.4,0],[-.3,.58,0]);tube(g,steel,[-.3,.58,0],[.3,.58,0]);tube(g,steel,[.3,.58,0],[.3,.4,0]);
  }else if(f.kind==='vent'){
   box(g,white,0,.55,0,1.85,1.1,1.85);box(g,steel,0,1.13,0,2.04,.15,2.04);for(const s of[-1,1])for(let y=.24;y<1;y+=.15){box(g,navy,s*.935,y,0,.035,.062,1.47);box(g,navy,0,y,s*.935,1.47,.062,.035);}
  }else if(f.kind==='antenna'){
   pole(g,white,0,.7,0,.1,1.4);pole(g,steel,0,2.8,0,.022,4.2);for(const s of[-1,1])tube(g,steel,[0,2.4,0],[s*.26,2.18,0],.014);pole(g,navy,0,1.54,0,.13,.2);pole(g,white,.23,1.87,.06,.07,.2);
  }else if(f.kind==='signal-mast'){
   pole(g,white,0,2.4,0,.09,4.8);for(const y of[2.7,3.6,4.5]){tube(g,steel,[-.32,y,0],[.32,y,0],.025);pole(g,navy,0,y,0,.14,.22);pole(g,white,0,y+.16,0,.12,.12);}tube(g,steel,[0,.15,0],[.35,3.2,.35],.019);
  }else if(f.kind==='compass'){
   pole(g,white,0,.63,0,.22,1.26);pole(g,steel,0,1.25,0,.42,.16);mesh(g,new T.SphereGeometry(1,12,8),yellow,0,1.43,0,.41,.27,.41);for(const s of[-1,1]){tube(g,steel,[0,1.22,0],[s*.48,1.22,0],.03);mesh(g,new T.SphereGeometry(1,10,7),s<0?0xa65d55:0x5e8575,s*.48,1.22,0,.11,.11,.11);}
  }
 }
 for(const s of SHIP_BENCHES.filter(s=>!s.existing&&!s.venue)){const g=new T.Group();g.position.set(s.x,s.y,s.z);g.rotation.y=s.yaw;ship.add(g);for(const x of[-s.w*.36,s.w*.36]){box(g,navy,x,.24,0,.085,.48,.62);tube(g,steel,[x,.38,-.3],[x,.93,-.3],.035);tube(g,steel,[x,.65,-.24],[x,.65,.27],.035);}for(let z=-.25;z<.31;z+=.13)box(g,wood,0,.46,z,s.w,.08,.11);for(let y=.66;y<.95;y+=.14)box(g,wood,0,y,-.3,s.w,.1,.065);}
 // Narrow cable trays and working-area markings keep visitor aisles free.
 for(const side of[-1,1]){for(let z=-45;z<-38;z+=.34)box(ship,steel,side*9.4,ROOF_Y+.04,z,.3,.045,.045);for(let z=-61.5;z<-54;z+=.65){const m=box(ship,yellow,side*6.1,LOWER_Y+.025,z,.07,.018,.34);m.rotation.y=.5;}}
 label(ship,'ANCHOR · MOORING',0,9.65,-58.1,3.2);label(ship,'EQUIPMENT · KEEP CLEAR',0,20.05,-42,3.1);
 return{update(time){radars.forEach(r=>r.rotation.y=-time*.8);},state:{bowFittings:10,upperFittings:9,visitorBenches:SHIP_BENCHES.length,types:[...new Set(SHIP_EQUIPMENT.map(f=>f.kind))]}};
}
