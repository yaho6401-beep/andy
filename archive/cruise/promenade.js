import * as T from 'three';
import {DECK_LOUNGERS} from './ship-layout.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
// Original, lightweight maritime furniture; shared geometries and materials.
export function cruiseFurnishings(){
 const geo=new RoundedBoxGeometry(1,1,1,1,.045),cylinder=new T.CylinderGeometry(1,1,1,16),sphere=new T.SphereGeometry(1,12,8),mats=new Map();
 const material=(color,metal=0)=>{const k=color+metal;if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color,metalness:metal,roughness:metal?.38:.78}));return mats.get(k);};
 function item(p,g,c,x,y,z,w,h,d,metal=0){const m=new T.Mesh(g,material(c,metal));m.position.set(x,y,z);m.scale.set(w,h,d);p.add(m);return m;}
 const box=(p,c,...v)=>item(p,geo,c,...v),orb=(p,c,...v)=>item(p,sphere,c,...v);
 function planter(p,x,z){box(p,'#ede6d9',x,3.3,z,.68,.6,.68);item(p,cylinder,'#686c49',x,3.61,z,.27,.02,.27);for(let i=0;i<7;i++){const a=i*2.4;const leaf=orb(p,i%2?'#6d8d75':'#87a082',x+Math.sin(a)*.19,3.98+(i%3)*.17,z+Math.cos(a)*.17,.12,.37,.085);leaf.rotation.z=Math.sin(a)*.6;}}
 function lounger(p,x,z){const g=new T.Group();g.position.set(x,0,z);p.add(g);for(const a of [-.42,.42]){box(g,'#b88d64',a,3.34,0,.07,.5,1.7);box(g,'#b88d64',a,3.6,0,.065,.055,1.9);}box(g,'#e6dfce',0,3.56,0,.76,.13,1.68);const back=box(g,'#e6dfce',0,3.82,-.69,.76,.75,.12);back.rotation.x=-.4;box(g,'#a0b6b1',0,3.92,-.7,.65,.27,.13);for(let i=0;i<8;i++)box(g,'#c6b59c',0,3.635,-.43+i*.13,.72,.008,.012);}
 function ring(p,x,z){const g=new T.Group();g.position.set(x,3.78,z);p.add(g);const torus=new T.TorusGeometry(.32,.092,8,28);g.add(new T.Mesh(torus,material('#f4eee0')));for(let i=0;i<4;i++){const a=i*Math.PI/2;const band=box(g,'#b97159',Math.sin(a)*.32,Math.cos(a)*.32,0,.14,.16,.18);band.rotation.z=-a;}}
 function lantern(p,x,z){box(p,'#d6b882',x,3.18,z,.22,.34,.22,.5);const m=material('#ffe8bc');m.emissive.set('#ffd58b');m.emissiveIntensity=.6;const glass=new T.Mesh(sphere,m);glass.position.set(x,3.25,z);glass.scale.set(.075,.14,.075);p.add(glass);}
 function parasol(p,x,z){
  item(p,cylinder,'#d5c1a1',x,4.6,z,.035,3.1,.035,.35);
  const shade=item(p,new T.ConeGeometry(1,.28,24,1,true),'#f1e8d5',x,6.05,z,2.3,1,2.3);shade.material.side=T.DoubleSide;
  for(let i=0;i<8;i++){const a=i*Math.PI/4,arm=box(p,'#d5c1a1',x+Math.cos(a),5.95,z+Math.sin(a),2,.018,.018);arm.rotation.y=-a;arm.rotation.z=.05;}
 }
 function sofa(p,x,z,yaw=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=yaw;p.add(g);box(g,'#56747b',0,3.23,0,2.6,.24,.85);box(g,'#ede4d3',0,3.5,0,2.52,.3,.8);box(g,'#ede4d3',0,3.92,-.38,2.6,.7,.16);for(const side of [-1,1]){box(g,'#b3916a',side*1.29,3.72,0,.09,.6,.9);box(g,'#9bb5ae',side*.75,3.85,-.23,.45,.35,.2);}}
 return {build(p,room){
  for(const o of DECK_LOUNGERS.filter(o=>o.zone===room))lounger(p,o.x,o.z);
  for(const x of [-12,12])for(const z of [-12,12])planter(p,x,z);
  for(const x of [-13.1,13.1]){ring(p,x,-10);lantern(p,x,9);}
  if(room===0){
   for(const z of [-7,0])parasol(p,-7.6,z);
   sofa(p,-8,10);sofa(p,-8,14,Math.PI);box(p,'#c7b08e',-8,3.35,12,2,.18,1);
   for(const z of [6.5,9,11.5]){item(p,cylinder,'#36515d',7.1,3.35,z,.31,.7,.31);item(p,cylinder,'#e1caaa',7.1,3.75,z,.4,.1,.4);}
   box(p,'#f0e6d2',9,6.25,9,7,.08,11);for(const x of [5.8,12.2])for(const z of [4,14])box(p,'#c3aa85',x,4.6,z,.075,3.2,.075,.25);
   for(let z=6;z<=12;z+=1.5){item(p,cylinder,'#e2e9e3',9,4.67,z,.09,.15,.09);box(p,'#dfcfac',9,4.6,z+.2,.32,.018,.22);}
  }
  if(room===1){
   for(const x of [-6,6]){sofa(p,x,10,x<0?Math.PI/2:-Math.PI/2);planter(p,x,14);}
   for(const x of [-4,4]){item(p,cylinder,'#c9b18f',x,3.7,-7,.65,.1,.65);item(p,cylinder,'#657c83',x,3.34,-7,.06,.65,.06,.4);}
   for(const x of [-10,10])lantern(p,x,-6);
  }
  if(room===2){
   for(const x of [-7,7])parasol(p,x,1);
   sofa(p,-5,-11);sofa(p,5,-11);box(p,'#d1b690',0,3.4,-11,2.5,.12,1.2);
   for(const x of [-11,11])planter(p,x,-13);
  }
  if(room===3){
   sofa(p,-8,7);sofa(p,8,7);for(const x of [-8,8]){box(p,'#c9b08b',x,3.4,9.5,2,.14,1);planter(p,x,12);}
   for(const x of [-9.18,-4.59,0,4.59,9.18])for(let i=0;i<4;i++)item(p,cylinder,i%2?'#b9bfaa':'#cfac73',x-.7+i*.22,4.1,-12.76,.035,.035,.035,.4);
  }
  if(room===4){
   for(const x of [-9,0,9])for(const z of [-11,-3,5]){item(p,cylinder,'#f8f0de',x-.36,3.915,z,.22,.012,.22);item(p,cylinder,'#b7cbc1',x+.29,3.96,z+.1,.08,.1,.08);box(p,'#d4b67b',x,3.92,z-.13,.025,.012,.31,.6);}
   sofa(p,-7,13);sofa(p,7,13);for(const x of [-10,10])planter(p,x,15);
   box(p,'#567179',0,3.015,-3,24,.025,23);
  }
 }};
}
