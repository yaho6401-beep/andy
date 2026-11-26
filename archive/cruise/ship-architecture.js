import * as T from 'three';
import {DECK_Y,UPPER_Y,SHIP_STAIRS,SHIP_COLUMNS,SHIP_ZONES,stairLanding,hullHalfBeam,SHIP_LENGTH} from './ship-layout.js';
// One shaped hull and promenade; the exact same stairs feed pedestrian routing.
export function buildShipConnections(parent,{box,mesh,cylinder,rail,label}){
 const ivory=0xeee9df,teak=0xb77e56,navy=0x162d40,brass=0xc4a575;
 const outline=new T.Shape();outline.moveTo(0,-70);
 for(let z=-69;z<=69;z++)outline.lineTo(hullHalfBeam(z),z);
 outline.lineTo(0,70);for(let z=69;z>=-69;z--)outline.lineTo(-hullHalfBeam(z),z);outline.closePath();
 // Shape XY rotates into world XZ; the fore/aft asymmetry is preserved.
 const hullGeo=new T.ExtrudeGeometry(outline,{depth:DECK_Y-1.1,bevelEnabled:true,bevelSize:.22,bevelThickness:.4,bevelSegments:2,steps:1});hullGeo.rotateX(Math.PI/2);hullGeo.translate(0,DECK_Y-.55,0);mesh(parent,hullGeo,ivory,0,0,0,1,1,1);
 const deckGeo=new T.ShapeGeometry(outline,24);deckGeo.rotateX(Math.PI/2);for(let i=0;i<deckGeo.index.count;i+=3){const a=deckGeo.index.getX(i+1);deckGeo.index.setX(i+1,deckGeo.index.getX(i+2));deckGeo.index.setX(i+2,a);}deckGeo.computeVertexNormals();deckGeo.translate(0,DECK_Y,0);mesh(parent,deckGeo,teak,0,0,0,1,1,1);
 for(const side of [-1,1])for(let z=-66;z<66;z+=3){if(z>=-51&&z<51)continue;rail(parent,side*(hullHalfBeam(z)-.1),z,side*(hullHalfBeam(z+3)-.1),z+3);}
 rail(parent,-6.5,-66.5,6.5,-66.5);rail(parent,-8.8,66.7,8.8,66.7);
 for(const side of [-1,1])for(const [a,b]of [[-51,-18.8],[-16.9,-1],[1,16.9],[18.8,51]])rail(parent,side*13.9,a,side*13.9,b);
 // Recessed passenger cabin bands with repeated balcony partitions.
 for(const side of [-1,1]){
  box(parent,navy,side*14.08,1.12,0,.1,.55,108);
  for(const y of [2.8,5.3,7.8]){
   box(parent,navy,side*14.35,y,0,.08,1.5,100);box(parent,ivory,side*14.48,y-.88,0,.45,.16,102);
   for(let z=-48;z<=48;z+=3.4){box(parent,ivory,side*14.5,y,z,.12,1.64,.13);box(parent,0xc4d1d1,side*14.54,y-.2,z,.05,.045,3.1);box(parent,0xe4d1a6,side*14.4,y-.27,z+1.1,.045,.45,.55);}
  }
  for(let z=-46;z<=46;z+=4)mesh(parent,cylinder,brass,side*14.23,1.65,z,.16,.06,.16).rotation.z=Math.PI/2;
 }
 for(const p of SHIP_COLUMNS){box(parent,ivory,p.x,(DECK_Y+UPPER_Y)/2,p.z,p.w,UPPER_Y-DECK_Y,p.d);box(parent,brass,p.x,DECK_Y+.12,p.z,.4,.24,.4);}
 for(const zone of SHIP_ZONES.slice(3)){
  box(parent,ivory,0,UPPER_Y-.19,zone.z,27.2,.38,34.3);box(parent,teak,0,UPPER_Y+.005,zone.z,27,.025,34.1);
  for(const x of [-13.55,13.55]){const r=new T.Group();r.position.y=UPPER_Y-DECK_Y;parent.add(r);rail(r,x,zone.z-17,x,zone.z+17);box(parent,ivory,x,UPPER_Y-.3,zone.z,.18,.32,34.3);}
 }
 for(const stair of SHIP_STAIRS){const run=Math.abs(stair.toZ-stair.fromZ),rise=UPPER_Y-DECK_Y,direction=Math.sign(stair.toZ-stair.fromZ),count=28;
  for(let i=0;i<count;i++){const y=DECK_Y+rise*(i+1)/count,z=stair.fromZ+direction*run*(i+.5)/count;box(parent,ivory,stair.x,y-.13,z,stair.w,.26,run/count+.02);box(parent,teak,stair.x,y+.012,z,stair.w,.026,run/count-.025);}
  for(const upper of [false,true]){const p=stairLanding(stair,upper);box(parent,ivory,p.x,p.y-.13,p.z,p.w,.26,p.d);box(parent,teak,p.x,p.y+.012,p.z,p.w-.05,.025,p.d-.025);}
  for(const x of [stair.x-stair.w/2,stair.x+stair.w/2]){for(let i=0;i<=10;i++){const t=i/10,y=DECK_Y+rise*t,z=stair.fromZ+direction*run*t;box(parent,ivory,x,y+.5,z,.06,1,.06);}for(const h of [.46,1.02]){const a=new T.Vector3(x,DECK_Y+h,stair.fromZ),b=new T.Vector3(x,UPPER_Y+h,stair.toZ),g=mesh(parent,cylinder,h>.9?brass:ivory,...a.clone().add(b).multiplyScalar(.5).toArray(),.035,a.distanceTo(b),.035);g.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());}}
  label(parent,stair.label,Math.sign(stair.x)*11.7,DECK_Y+2.25,stair.fromZ+.6,2.9);
 }
 label(parent,'FORWARD · OBSERVATION',0,DECK_Y+1.7,-27,3.4);label(parent,'AFT · OCEAN TERRACE',0,DECK_Y+1.7,27,3.4);
 const marker=new T.Group();parent.add(marker);const ring=new T.Mesh(new T.TorusGeometry(.4,.025,6,32),new T.MeshBasicMaterial({color:'#e8d7a8',transparent:true,opacity:.7,depthWrite:false}));ring.rotation.x=-Math.PI/2;marker.add(ring);marker.visible=false;
 return {length:SHIP_LENGTH,guide(point,time){marker.visible=!!point;if(point){marker.position.set(point.x,point.y+.06,point.z);marker.scale.setScalar(1+Math.sin(time*3)*.1);}}};
}
