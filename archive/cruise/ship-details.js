import {vesselHullGeometry} from './vessel-models.js';
import * as T from 'three';
import {DECK_Y,UPPER_Y,POOL,SHIP_ZONES} from './ship-layout.js';
// No downloaded models, real-time reflections, shadow maps or extra render passes.
// Opaque fittings are merged by the caller; pool water is one small animated surface.
export function buildCruiseDetails(ship,{box,mesh,cylinder,label}){
 const white=0xeee9df,navy=0x162d40,brass=0xc4a575,chrome=0xb5c3c6;
 const glass=new T.MeshPhysicalMaterial({color:'#7fabb9',roughness:.18,metalness:.12,transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide});
 glass.forceSinglePass=true;
 const paneGeo=new T.PlaneGeometry(1,1);
 function pane(x,y,z,w,h,yaw=0){const p=new T.Mesh(paneGeo,glass);p.position.set(x,y,z);p.scale.set(w,h,1);p.rotation.y=yaw;p.userData.bakeGlass=true;ship.add(p);return p;}
 for(const zone of SHIP_ZONES.slice(4,5)){
  // Tall panoramic glazing, fine mullions and a softly lit, coffered ceiling.
  for(const side of [-1,1])for(let z=-14;z<=14;z+=4){pane(side*12.85,UPPER_Y+2.1,zone.z+z,3.85,3.4,Math.PI/2);box(ship,white,side*12.85,UPPER_Y+2.1,zone.z+z+2,.075,4.2,.075);}
  for(let x=-10.5;x<=10.5;x+=3.5){pane(x,UPPER_Y+2.2,zone.z+(zone.z<0?-16.45:16.45),3.35,3.5);box(ship,white,x+1.75,UPPER_Y+2.2,zone.z+(zone.z<0?-16.45:16.45),.075,4.4,.12);}
  const roof=pane(0,UPPER_Y+4.5,zone.z,25.8,32);roof.rotation.x=-Math.PI/2;
  for(const x of [-12.9,12.9])box(ship,white,x,UPPER_Y+4.45,zone.z,.2,.25,34);
  for(const z of [-16.8,16.8])box(ship,white,0,UPPER_Y+4.45,zone.z+z,26,.25,.18);
  for(const x of [-10,10]){const light=box(ship,0xf4dfb6,x,UPPER_Y+4.32,zone.z,.045,.025,30);light.material.emissive?.setHex(0xc29b62);light.material.emissiveIntensity=.23;}
 }
 // Sculpted funnel, ventilation louvres, communications domes and navigation mast.
 box(ship,white,-7,UPPER_Y+1.3,12.5,5.4,2.6,5);
 const funnel=mesh(ship,new T.CylinderGeometry(1,1,1,24),navy,-7,UPPER_Y+4.9,12.5,2.45,5.3,1.8);funnel.rotation.z=-.13;
 mesh(ship,cylinder,0x44525a,-7.35,UPPER_Y+7.5,12.5,2.4,.16,1.8);
 for(const x of[-7.95,-6.65]){mesh(ship,cylinder,0x243239,x,UPPER_Y+7.9,12.5,.48,.9,.48);mesh(ship,cylinder,0x5b6970,x,UPPER_Y+8.35,12.5,.52,.08,.52);}
 for(let z=10.9;z<14.2;z+=.35)box(ship,0x596b74,-4.58,UPPER_Y+5,z,.035,2.5,.085);
 for(let y=UPPER_Y+.4;y<UPPER_Y+2.4;y+=.35)box(ship,0x667e88,-4.28,y,12.5,.04,.12,3.8);
 for(const x of [-8,8]){mesh(ship,cylinder,white,x,UPPER_Y+5.25,-29,.5,1.25,.5);mesh(ship,new T.SphereGeometry(1,16,10),white,x,UPPER_Y+6.1,-29,1.35,1.35,1.35);}
 mesh(ship,cylinder,white,0,UPPER_Y+7,-42,.14,5,.14);box(ship,white,0,UPPER_Y+8.3,-42,8,.15,.16);box(ship,navy,0,UPPER_Y+9.5,-42,4,.12,.14);
 for(const x of [-4,4])mesh(ship,new T.SphereGeometry(1,8,6),x<0?0xcf7560:0x77aa91,x,UPPER_Y+8.4,-42,.14,.14,.14);
 // Enclosed rescue boats under their davits, clear of the pedestrian stair flights.
 const rescueGeo=vesselHullGeometry({length:8.2,beam:2.3,deck:.56,draft:.57},24);rescueGeo.deleteAttribute('color');
 const canopy=new T.CapsuleGeometry(.72,4.6,5,12);canopy.rotateX(Math.PI/2);canopy.scale(1,.84,1);
 const hatch=new T.TorusGeometry(.23,.035,6,14);
 for(const side of [-1,1])for(const z of [-38,-26,26,38]){
  mesh(ship,rescueGeo,0xca8147,side*14.9,DECK_Y-1.85,z,1,1,1);
  mesh(ship,canopy,0xd9d8c9,side*14.9,DECK_Y-1.08,z,1,1,1);
  mesh(ship,hatch,chrome,side*14.9,DECK_Y-.43,z,1,1,1).rotation.x=-Math.PI/2;
  for(const sign of[-1,1]){for(let dz=-2.1;dz<=2.2;dz+=1.05)box(ship,navy,side*14.9+sign*.727,DECK_Y-1.02,z+dz,.026,.32,.56);box(ship,chrome,side*14.9+sign*.96,DECK_Y-1.24,z,.045,.055,6.4);}
  for(const dz of [-2.5,2.5]){box(ship,white,side*14.1,DECK_Y-.25,z+dz,.12,2.4,.13);box(ship,white,side*14.9,DECK_Y+.85,z+dz,1.8,.12,.13);mesh(ship,cylinder,chrome,side*15.25,DECK_Y-.2,z+dz,.024,2,.024);}
  
 }
 const {x,z,w,d}=POOL;
 box(ship,0xd4dedb,x,DECK_Y+.08,z,w+.65,.16,d+.65);
 box(ship,0x6cbdc4,x,DECK_Y+.17,z,w,.08,d);
 const water=new T.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 v;uniform float time;void main(){float a=sin(v.x*42.+sin(v.y*21.+time*.5)*2.+time*.6);float b=sin(v.y*61.-time*.8+sin(v.x*16.)*2.);float c=pow(.5+.5*a*b,8.);vec3 water=mix(vec3(.13,.48,.56),vec3(.34,.72,.72),v.y*.35+.4);water+=vec3(.23,.28,.23)*c*.65;float edge=smoothstep(0.,.045,min(min(v.x,1.-v.x),min(v.y,1.-v.y)));gl_FragColor=vec4(mix(vec3(.7,.84,.8),water,edge),1.);
 #include <colorspace_fragment>
 }`});
 const surface=new T.Mesh(new T.PlaneGeometry(w-.08,d-.08),water);surface.rotation.x=-Math.PI/2;surface.position.set(x,DECK_Y+.222,z);ship.add(surface);
 for(const side of [-1,1])box(ship,white,x+side*(w/2+.12),DECK_Y+.3,z,.24,.2,d+.5);
 for(const side of [-1,1])box(ship,white,x,DECK_Y+.3,z+side*(d/2+.12),w+.5,.2,.24);
 for(const xx of [x-.42,x+.42]){const curve=new T.CatmullRomCurve3([new T.Vector3(xx,DECK_Y+.25,z+d/2+.6),new T.Vector3(xx,DECK_Y+1.1,z+d/2+.5),new T.Vector3(xx,DECK_Y+1.1,z+d/2-.15),new T.Vector3(xx,DECK_Y+.35,z+d/2-.3)]);mesh(ship,new T.TubeGeometry(curve,16,.035,6,false),chrome,0,0,0,1,1,1);}
 label(ship,'LIDO POOL · OCEAN CLUB',3,DECK_Y+1.45,-13.3,3.6);
 // Navigation signs and deck numbering use restrained maritime typography.
 label(ship,'BLUE HORIZON',0,DECK_Y+2.4,62,7);
 return {update(time){water.uniforms.time.value=time;},get state(){return {panoramicLounges:2,rescueBoats:8,pool:true,balconyRows:3};}};
}
