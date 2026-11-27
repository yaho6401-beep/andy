import {buildPassengerInteriors} from './passenger-interiors.js';
import * as T from 'three';
import {DECK_Y,UPPER_Y,LOWER_Y,CABIN_Y,ROOF_Y,BRIDGE_WALLS,CABIN_WALLS} from './ship-layout.js';
// Original ship-inspired architecture. Shared primitives are baked by the caller.
export function buildMaritimeInteriors(parent,{box,mesh,cylinder,label}){
 const root=new T.Group();parent.add(root);const white=0xe9e6de,navy=0x213c4a,wood=0x977352,steel=0xa6b5b7;
 const glassMaterial=new T.MeshStandardMaterial({color:'#8bb4c3',roughness:.2,metalness:.1,transparent:true,opacity:.19,depthWrite:false,side:T.DoubleSide});glassMaterial.forceSinglePass=true;
 function pane(x,y,z,w,h,ry=0){const p=new T.Mesh(new T.PlaneGeometry(w,h),glassMaterial);p.position.set(x,y,z);p.rotation.y=ry;p.userData.bakeGlass=true;root.add(p);}
 // A proper enclosed wheelhouse: low window sill, continuous mullions, solid aft bulkhead.
 for(const p of BRIDGE_WALLS){const side=p.w<1,height=side||p.z< -50?1.02:3.95;box(root,white,p.x,UPPER_Y+height/2,p.z,p.w,height,p.d);if(height<2){pane(p.x,UPPER_Y+2.45,p.z,side?p.d:p.w,2.65,side?Math.PI/2:0);}}
 for(let x=-10;x<=10;x+=2.5){box(root,white,x,UPPER_Y+2.5,-50.45,.09,3.8,.16);const wiper=box(root,navy,x,UPPER_Y+1.4,-50.23,.04,1,.035);wiper.rotation.z=-.22;}
 for(const s of [-1,1])for(const z of [-49,-47.2,-39.8,-36,-32,-28])box(root,white,s*10.8,UPPER_Y+2.5,z,.16,3.8,.09);
 for(const s of [-1,1]){box(root,steel,s*1.6,UPPER_Y+2,-28,.11,4,.4);label(root,'WHEELHOUSE',s*5.6,UPPER_Y+2.5,-27.8,2.8);}
 // Walkable roof; the starboard ladder/stair opening is left physically open.
 box(root,white,-.8,ROOF_Y-.15,-36.5,22,.3,26);box(root,white,11.5,ROOF_Y-.15,-41.5,2.6,.3,16);
 for(const x of [-9,9]){const strip=box(root,0xffe3ac,x,UPPER_Y+4.26,-38,.04,.025,18);strip.material.emissive?.setHex(0xe4c394);strip.material.emissiveIntensity=.4;}
 // Visible ceiling panels and overhead instruments keep the interior legible, even at night.
 for(let z=-47;z<=-29;z+=4){box(root,0xb8c3c0,0,ROOF_Y-.35,z,21.3,.12,.12);for(const x of [-6,0,6]){const light=box(root,0xffeac2,x,ROOF_Y-.4,z,1.6,.035,.32);light.material.emissive?.setHex(0xf1d5a3);light.material.emissiveIntensity=.55;}}
 box(root,navy,0,UPPER_Y+3.65,-49.5,9,.6,.5);for(let i=0;i<7;i++){box(root,0x7eac9b,-3.6+i*1.2,UPPER_Y+3.65,-49.22,.8,.25,.03);}
 box(root,navy,-7.8,UPPER_Y+.75,-31.4,3,1.5,1);label(root,'CHARTS · SAFETY',-7.8,UPPER_Y+1.9,-31.3,2.4);
 for(let i=0;i<4;i++)box(root,0x9db5b2,-8.5+i*.48,UPPER_Y+1.56,-31.4,.36,.08,.65);
 // Open bridge wings extend beyond the wheelhouse for a view along the hull.
 for(const s of [-1,1]){box(root,white,s*13.8,UPPER_Y-.17,-42.5,6,.34,7);box(root,0x768e96,s*13.8,UPPER_Y+.012,-42.5,6,.025,7);box(root,navy,s*15.4,UPPER_Y+.63,-44.5,.9,1.26,.65);box(root,0x6c9ca8,s*15.4,UPPER_Y+1.32,-44.5,.74,.12,.48);box(root,s<0?0xc26b5a:0x69a78f,s*16.85,UPPER_Y+.8,-45.4,.12,.18,.22);label(root,s<0?'PORT WING':'STARBOARD WING',s*14.1,UPPER_Y+2.1,-45.9,2.2);}
 const passengers=buildPassengerInteriors(root,{box,mesh,cylinder});
 // Working foredeck: twin windlasses, chain runs, hawses and anchors outside the hull.
 for(const s of [-1,1]){box(root,steel,s*4.5,LOWER_Y+.25,-60,2.5,.5,3);mesh(root,cylinder,navy,s*4.5,LOWER_Y+.9,-60,.65,1.2,.65).rotation.z=Math.PI/2;for(let i=0;i<13;i++){const g=new T.TorusGeometry(.13,.035,5,10),m=mesh(root,g,steel,s*4.5,LOWER_Y+.13,-61-i*.29,1,1,1);m.rotation.set(i%2?0:Math.PI/2,i%2?Math.PI/2:0,0);}box(root,navy,s*5,LOWER_Y+.12,-64,1,.2,1.1);const anchor=new T.Group();anchor.position.set(s*5.8,LOWER_Y-2,-65);anchor.rotation.z=s*.2;root.add(anchor);box(anchor,steel,0,0,0,.16,2.6,.18);box(anchor,steel,0,.8,0,1.3,.12,.15);const bend=mesh(anchor,new T.TorusGeometry(.72,.09,6,20,Math.PI),steel,0,-.8,0,1,1,1);bend.rotation.z=Math.PI;for(const side of [-1,1]){const fluke=mesh(anchor,new T.ConeGeometry(.27,.65,4),steel,side*.68,-.6,0,1,1,1);fluke.rotation.z=-side*.45;}}
 // Stern mooring station on the lower quarterdeck.
 for(const x of [-8,8])for(const z of [59,63]){mesh(root,cylinder,navy,x,LOWER_Y+.55,z,.22,1,.22);box(root,steel,x,LOWER_Y+1.05,z,.8,.12,.5);}box(root,navy,0,LOWER_Y+.65,62,3,1.3,1.8);label(root,'LOWER QUARTERDECK',0,LOWER_Y+2.6,57,3.8);
 // This animated equipment is excluded from the static mesh bake.
 const radar=new T.Group();radar.userData.dynamic=true;radar.position.set(0,ROOF_Y+3.3,-42);parent.add(radar);box(radar,navy,0,0,0,5,.32,.45);box(radar,white,0,.26,0,5.4,.22,.7);
 return {update(time,viewer){radar.rotation.y=time*.55;passengers.update(time,viewer);},state:{...passengers.state,enclosedBridge:true,wingBridges:2,walkableRadarDeck:true,cabin:true,lowerBowAndStern:true,anchors:2},dispose(){passengers.dispose();glassMaterial.dispose();}};
 function guard(x1,z1,x2,z2,y){const length=Math.hypot(x2-x1,z2-z1),a=-Math.atan2(z2-z1,x2-x1);for(const h of [.5,1.05]){const b=box(root,steel,(x1+x2)/2,y+h,(z1+z2)/2,length,.055,.055);b.rotation.y=a;}for(let t=0;t<=1;t+=1/Math.ceil(length/1.4))box(root,white,x1+(x2-x1)*t,y+.52,z1+(z2-z1)*t,.065,1.04,.065);}
}
