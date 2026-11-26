import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
// Original, lightweight maritime furniture; shared geometries and materials.
export function cruiseFurnishings(){
 const geo=new RoundedBoxGeometry(1,1,1,2,.055),cylinder=new T.CylinderGeometry(1,1,1,16),sphere=new T.SphereGeometry(1,12,8),mats=new Map();
 const material=(color,metal=0)=>{const k=color+metal;if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color,metalness:metal,roughness:metal?.38:.78}));return mats.get(k);};
 function item(p,g,c,x,y,z,w,h,d,metal=0){const m=new T.Mesh(g,material(c,metal));m.position.set(x,y,z);m.scale.set(w,h,d);p.add(m);return m;}
 const box=(p,c,...v)=>item(p,geo,c,...v),orb=(p,c,...v)=>item(p,sphere,c,...v);
 function planter(p,x,z){box(p,'#ede6d9',x,3.3,z,.68,.6,.68);item(p,cylinder,'#686c49',x,3.61,z,.27,.02,.27);for(let i=0;i<7;i++){const a=i*2.4;const leaf=orb(p,i%2?'#6d8d75':'#87a082',x+Math.sin(a)*.19,3.98+(i%3)*.17,z+Math.cos(a)*.17,.12,.37,.085);leaf.rotation.z=Math.sin(a)*.6;}}
 function lounger(p,x,z){const g=new T.Group();g.position.set(x,0,z);p.add(g);for(const a of [-.42,.42]){box(g,'#b88d64',a,3.34,0,.07,.5,1.7);box(g,'#b88d64',a,3.6,0,.065,.055,1.9);}box(g,'#e6dfce',0,3.56,0,.76,.13,1.68);const back=box(g,'#e6dfce',0,3.82,-.69,.76,.75,.12);back.rotation.x=-.4;box(g,'#a0b6b1',0,3.92,-.7,.65,.27,.13);for(let i=0;i<8;i++)box(g,'#c6b59c',0,3.635,-.43+i*.13,.72,.008,.012);}
 function ring(p,x,z){const g=new T.Group();g.position.set(x,3.78,z);p.add(g);const torus=new T.TorusGeometry(.32,.092,8,28);g.add(new T.Mesh(torus,material('#f4eee0')));for(let i=0;i<4;i++){const a=i*Math.PI/2;const band=box(g,'#b97159',Math.sin(a)*.32,Math.cos(a)*.32,0,.14,.16,.18);band.rotation.z=-a;}}
 function lantern(p,x,z){box(p,'#d6b882',x,3.18,z,.22,.34,.22,.5);const m=material('#ffe8bc');m.emissive.set('#ffd58b');m.emissiveIntensity=.6;const glass=new T.Mesh(sphere,m);glass.position.set(x,3.25,z);glass.scale.set(.075,.14,.075);p.add(glass);}
 return {build(p,room){
  // Cap rail, brass inlay, scuppers and subtle deck seams.
  for(const x of [-8.3,8.3]){box(p,'#d5b78b',x,3.13,0,.09,.045,16.4,.45);for(let z=-7;z<=7;z+=2)box(p,'#354f5b',x,2.73,z,.05,.08,.28);}
  if(room===0){for(const x of [-6,-3])lounger(p,x,-1.2);planter(p,-7,5.9);planter(p,2.6,-1.2);ring(p,-8.3,-1);lantern(p,-1.5,3.1);box(p,'#f2e9d8',-4.5,5.8,2.9,6,.075,3.6);for(const x of [-7.3,-1.7])box(p,'#d5bf9f',x,4.45,4.4,.07,2.8,.07,.4);for(let i=0;i<5;i++)box(p,'#345564',3.96,4.85,4.45+i*.74,.035,1.03,.56);box(p,'#d9c9ac',6,6.16,6,4.2,.14,5.2);}
  if(room===1){for(const x of [-7,7]){planter(p,x,4);ring(p,x,-3.8);}for(const x of [-4.2,4.2])lounger(p,x,-2.6);box(p,'#e0cba7',0,3.62,-4.9,1.8,.1,.8);item(p,cylinder,'#293f4b',0,3.3,-4.9,.07,.6,.07,.5);lantern(p,0,-4.9);}
  if(room===2){for(const x of [-6,-2.6,2.6,6])lounger(p,x,-1.4);planter(p,-7.4,-2);planter(p,7.4,-2);ring(p,-8.2,4);lantern(p,0,-5.5);}
  if(room===3){for(const x of [-6.8,6.8])planter(p,x,0);for(const x of [-5.1,-2.55,0,2.55,5.1]){for(let i=0;i<4;i++)item(p,cylinder,i%2?'#b9bfaa':'#cfac73',x-.7+i*.22,4.1,-5.96,.035,.035,.035,.4);box(p,'#c0a171',x,4.06,-5.79,1.7,.025,.02,.5);}}
  if(room===4){for(const x of [-5,0,5]){item(p,cylinder,'#f8f0de',x-.36,3.915,-5.8,.22,.012,.22);item(p,cylinder,'#b7cbc1',x+.29,3.96,-5.7,.08,.1,.08);box(p,'#d4b67b',x,3.92,-5.93,.025,.012,.31,.6);for(let i=0;i<3;i++)box(p,'#e6dcc6',x-.35,3.93,-5.85+i*.08,.22,.009,.008);}planter(p,-7.5,-2.7);planter(p,7.5,-2.7);box(p,'#ab8e6b',0,3.12,-4.25,16,.04,.08);}
 }};
}
