import * as T from 'three';import {DECK_Y,UPPER_Y,SHIP_STAIRS,SHIP_COLUMNS,SHIP_ZONES,stairLanding} from './ship-layout.js';
export function buildShipConnections(parent,{box,mesh,cylinder,rail,label}){
 const ivory=0xe7dfcd,teak=0xb77e56,navy=0x162d40,brass=0xe4ba70;
 for(const p of SHIP_COLUMNS){box(parent,ivory,p.x,(DECK_Y+UPPER_Y)/2,p.z,.32,UPPER_Y-DECK_Y,.32);box(parent,brass,p.x,DECK_Y+.12,p.z,.38,.24,.38);}
 for(const zone of SHIP_ZONES.slice(3))for(const x of [-7.8,7.8])box(parent,ivory,x,UPPER_Y-.24,zone.z,.22,.25,16.5);
 // Broad covered promenades connect all three main-deck spaces.
 for(const z of [-14,14]){box(parent,navy,0,1.4,z,17,2.8,11.2);box(parent,ivory,0,2.73,z,17.15,.25,11.2);box(parent,teak,0,2.91,z,17,.18,11.2);for(const x of [-8.48,8.48])rail(parent,x,z-5.6,x,z+5.6);for(let i=-16;i<=16;i++)box(parent,0x81573e,i*.5,3.004,z,.012,.006,11.15);}
 for(const stair of SHIP_STAIRS){const side=stair.x<0?-1:1,run=Math.abs(stair.toZ-stair.fromZ),rise=UPPER_Y-DECK_Y,direction=Math.sign(stair.toZ-stair.fromZ),count=24;
  for(let i=0;i<count;i++){const y=DECK_Y+rise*(i+1)/count,z=stair.fromZ+direction*run*(i+.5)/count;box(parent,ivory,stair.x,y-.13,z,stair.w,.26,run/count+.02);box(parent,teak,stair.x,y+.012,z,stair.w,.026,run/count-.025);}
  for(const upper of [false,true]){const p=stairLanding(stair,upper);box(parent,ivory,p.x,p.y-.13,p.z,p.w,.26,p.d);box(parent,teak,p.x,p.y+.012,p.z,p.w-.05,.025,p.d-.025);}
  for(const x of [stair.x-stair.w/2,stair.x+stair.w/2]){for(let i=0;i<=6;i++){const t=i/6,y=DECK_Y+rise*t,z=stair.fromZ+direction*run*t;box(parent,ivory,x,y+.48,z,.065,.96,.065);}for(const h of [.42,.96]){const a=new T.Vector3(x,DECK_Y+h,stair.fromZ),b=new T.Vector3(x,UPPER_Y+h,stair.toZ),g=mesh(parent,cylinder,h>.9?brass:ivory,...a.clone().add(b).multiplyScalar(.5).toArray(),.035,a.distanceTo(b),.035);g.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());}}
  for(const x of [stair.x-.87,stair.x+.87]){const a=new T.Vector3(x,DECK_Y-.18,stair.fromZ),b=new T.Vector3(x,UPPER_Y-.18,stair.toZ),beam=mesh(parent,cylinder,ivory,...a.clone().add(b).multiplyScalar(.5).toArray(),.09,a.distanceTo(b),.09);beam.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());}
  label(parent,stair.label+' ↑ 계단',side*7.6,4.2,stair.fromZ+.2,1.45);
 }
 label(parent,'선수 산책로',0,4.1,-10);label(parent,'선미 산책로',0,4.1,10);
 // Repeated windows and hull rub rails tie separate rooms into a single vessel.
 for(const side of [-1,1]){box(parent,ivory,side*8.63,2.35,0,.18,.5,71);box(parent,navy,side*8.74,1.85,0,.12,.14,71);for(let z=-32;z<=32;z+=3.6)mesh(parent,cylinder,brass,side*8.75,1.45,z,.16,.07,.16).rotation.z=Math.PI/2;}
 const marker=new T.Group();parent.add(marker);const ring=new T.Mesh(new T.TorusGeometry(.4,.025,6,32),new T.MeshBasicMaterial({color:'#e8d7a8',transparent:true,opacity:.7,depthWrite:false}));ring.rotation.x=-Math.PI/2;marker.add(ring);marker.visible=false;return {guide(point,time){marker.visible=!!point;if(point){marker.position.set(point.x,point.y+.06,point.z);marker.scale.setScalar(1+Math.sin(time*3)*.1);}}};
}
