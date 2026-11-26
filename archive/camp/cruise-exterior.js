import * as T from 'three';
import {SHIP_LENGTH,SHIP_BEAM} from './cruise-dimensions.js';
// Batched exterior LOD of the same cruise. The full interior stays deferred.
export function buildCruiseExterior({put,box}){
 const l=SHIP_LENGTH,w=SHIP_BEAM,hull=new T.Shape();hull.moveTo(-l/2,-w*.4);hull.quadraticCurveTo(-l*.54,0,-l/2,w*.4);hull.lineTo(l*.31,w/2);hull.quadraticCurveTo(l*.51,w*.43,l/2,0);hull.quadraticCurveTo(l*.51,-w*.43,l*.31,-w/2);hull.closePath();
 put(new T.ExtrudeGeometry(hull,{depth:8.9,bevelEnabled:true,bevelSegments:1,bevelSize:.2,bevelThickness:.2,steps:1}),'white',0,9.7,0,Math.PI/2);
 box('hull',0,1.1,0,l*.85,.65,w+.1);box('wood',0,10.1,0,l*.84,.18,w-.2);
 for(const side of [-1,1]){
  for(const y of [2.8,5.3,7.8]){box('hull',0,y,side*(w/2+.21),101,1.45,.08);box('white',0,y-.85,side*(w/2+.25),102,.16,.45);for(let x=-48;x<=48;x+=3.4){box('white',x,y,side*(w/2+.39),.13,1.6,.16);box('window',x+1.1,y-.23,side*(w/2+.27),.6,.45,.04);}}
  for(const x of [-38,-26,26,38]){box('red',x,8.2,side*14.8,7.5,.8,1.7);box('white',x,8.8,side*14.8,6.7,.8,1.5);for(const dx of [-2.5,2.5])box('white',x+dx,9.9,side*14.5,.12,2.2,1.9);}
  box('white',0,11.1,side*13.8,108,.08,.08);for(let x=-52;x<=52;x+=3.5)box('white',x,10.6,side*13.8,.07,1,.07);
 }
 for(const x of [-34,34]){
  box('white',x,14.2,0,34,.32,27);box('blue',x,16.3,0,32,3.8,25.4);box('white',x,18.8,0,34,.22,26.8);
  for(const side of [-1,1])for(let dx=-15;dx<=15;dx+=3.5){box('white',x+dx,16.35,side*12.8,.1,4.1,.13);box('window',x+dx+1.1,16.2,side*12.82,1.15,1.6,.04);}
 }
 box('wood',-6,10.3,3,12.4,.12,6.4);box('blue',-6,10.4,3,12,.05,6);
 put(new T.CylinderGeometry(2.1,2.4,5.3,16),'hull',12.5,19,-7,0,-.13);box('white',12.5,15.5,-7,5.4,2.6,5);
 for(const z of [-8,8])put(new T.SphereGeometry(1.35,12,8),'white',-29,20.5,z);
 box('white',-42,21.4,0,.15,5,.15);box('white',-42,22.7,0,.15,.15,8);
 // Stair flights read at a distance, without loading the pedestrian graph.
 for(const side of [-1,1])for(let i=0;i<14;i++)box('white',side*i*17/14,10.2+4.2*(i+1)/14,side*15.3,17/14,.12,2.6);
}
