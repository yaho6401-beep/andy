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
 for(const z of [-49.6,-23.4])guard(-11.8,z,11.8,z,ROOF_Y);guard(-11.8,-49.6,-11.8,-23.4,ROOF_Y);guard(13,-49.6,13,-34,ROOF_Y);
 for(const x of [-9,9]){const strip=box(root,0xffe3ac,x,UPPER_Y+4.26,-38,.04,.025,18);strip.material.emissive?.setHex(0xe4c394);strip.material.emissiveIntensity=.4;}
 // Visible ceiling panels and overhead instruments keep the interior legible, even at night.
 for(let z=-47;z<=-29;z+=4){box(root,0xb8c3c0,0,ROOF_Y-.35,z,21.3,.12,.12);for(const x of [-6,0,6]){const light=box(root,0xffeac2,x,ROOF_Y-.4,z,1.6,.035,.32);light.material.emissive?.setHex(0xf1d5a3);light.material.emissiveIntensity=.55;}}
 box(root,navy,0,UPPER_Y+3.65,-49.5,9,.6,.5);for(let i=0;i<7;i++){box(root,0x7eac9b,-3.6+i*1.2,UPPER_Y+3.65,-49.22,.8,.25,.03);}
 box(root,navy,-7.8,UPPER_Y+.75,-31.4,3,1.5,1);label(root,'CHARTS · SAFETY',-7.8,UPPER_Y+1.9,-31.3,2.4);
 for(let i=0;i<4;i++)box(root,0x9db5b2,-8.5+i*.48,UPPER_Y+1.56,-31.4,.36,.08,.65);
 // Open bridge wings extend beyond the wheelhouse for a view along the hull.
 for(const s of [-1,1]){box(root,white,s*13.8,UPPER_Y-.17,-42.5,6,.34,7);box(root,0x768e96,s*13.8,UPPER_Y+.012,-42.5,6,.025,7);guard(s*16.8,-46,s*16.8,-39,UPPER_Y);guard(s*10.8,-46,s*16.8,-46,UPPER_Y);guard(s*10.8,-39,s*16.8,-39,UPPER_Y);box(root,navy,s*15.4,UPPER_Y+.63,-44.5,.9,1.26,.65);box(root,0x6c9ca8,s*15.4,UPPER_Y+1.32,-44.5,.74,.12,.48);box(root,s<0?0xc26b5a:0x69a78f,s*16.85,UPPER_Y+.8,-45.4,.12,.18,.22);label(root,s<0?'PORT WING':'STARBOARD WING',s*14.1,UPPER_Y+2.1,-45.9,2.2);}
 // Passenger accommodation below the promenade, reached by the port-side staircase.
 box(root,white,0,CABIN_Y-.16,0,25.2,.32,42);box(root,0xa18767,0,CABIN_Y+.008,0,25,.018,41.8);
 // Solid ceiling under the open promenade; camera remains beneath it when inside.
 box(root,white,1.2,DECK_Y-.17,0,22.6,.24,42);box(root,white,-11.9,DECK_Y-.17,-7.5,3.6,.24,27);box(root,white,-11.9,DECK_Y-.17,19.5,3.6,.24,5);
 for(const z of [-14,-6,2,10,18]){const light=box(root,0xffe6b8,0,DECK_Y-.31,z,2,.03,.22);light.material.emissive?.setHex(0xffddb0);light.material.emissiveIntensity=.5;}
 box(root,0xffe4b0,8,DECK_Y-.31,6,3,.035,.32);
 for(const x of [-12.55,12.55])box(root,white,x,CABIN_Y+1.5,0,.16,3,42);
 for(const p of CABIN_WALLS)box(root,white,p.x,CABIN_Y+1.5,p.z,p.w,3,p.d);
 box(root,0x597c81,8,CABIN_Y+.028,6.8,7.6,.025,7.4);
 box(root,wood,9,CABIN_Y+.35,3,3.9,.7,3.6);box(root,0xf0ece4,9,CABIN_Y+.79,3,3.9,.3,3.6);box(root,wood,9,CABIN_Y+1.07,1.16,4.1,1.4,.16);
 for(const x of [8,10])box(root,0xfff7e4,x,CABIN_Y+1.02,1.85,1.5,.2,.7);box(root,0x6c9493,9,CABIN_Y+.98,4.2,3.9,.12,1.1);
 box(root,wood,11.4,CABIN_Y+.72,8,1,1.44,3.2);box(root,0x253b47,11.39,CABIN_Y+1.7,8,.05,.85,1.3);box(root,0x9bc0bf,11.34,CABIN_Y+1.7,8,.02,.68,1.1);
 box(root,wood,5.5,CABIN_Y+1.3,.8,2.3,2.6,1);for(const x of [5.1,5.9])box(root,steel,x,CABIN_Y+1.2,1.32,.04,.3,.035);
 const cabinLight=new T.PointLight('#ffe2b4',0,17,1);cabinLight.position.set(8,CABIN_Y+2.65,6);root.add(cabinLight);
 box(root,wood,6.65,CABIN_Y+.4,1.8,.55,.8,.7);mesh(root,cylinder,steel,6.65,CABIN_Y+1.05,1.8,.035,.5,.035);mesh(root,new T.ConeGeometry(.27,.35,12,1,true),0xe5cfab,6.65,CABIN_Y+1.42,1.8,1,1,1);
 box(root,wood,8,CABIN_Y+2.05,10.83,2.5,1.15,.08);box(root,0xb9d0c6,8,CABIN_Y+2.05,10.77,2.3,.96,.03);box(root,0x466b7a,8,CABIN_Y+1.87,10.745,2.3,.23,.015);box(root,0xf1ddac,8.55,CABIN_Y+2.22,10.72,.3,.3,.015);
 for(const z of [3,8]){pane(12.28,CABIN_Y+1.8,z,3.1,1.55,Math.PI/2);for(const zz of [z-1.6,z+1.6])box(root,0xb7aa8e,12.2,CABIN_Y+1.8,zz,.3,1.9,.3);}
 box(root,0xf6e7bd,8,CABIN_Y+2.92,6,5,.035,.07);label(root,'S-208 · YOUR CABIN',3.62,CABIN_Y+2.3,6,2.1);label(root,'ACCOMMODATION · DECK 2',-3,CABIN_Y+2.3,18,4);
 for(let z=-16;z<17;z+=7){box(root,wood,-5,CABIN_Y+1.2,z,2,2.4,.1);label(root,'S-'+(212+z+16),-5,CABIN_Y+2.6,z,1.1);} // closed neighboring cabin doors
 // Working foredeck: twin windlasses, chain runs, hawses and anchors outside the hull.
 for(const s of [-1,1]){box(root,steel,s*4.5,LOWER_Y+.25,-60,2.5,.5,3);mesh(root,cylinder,navy,s*4.5,LOWER_Y+.9,-60,.65,1.2,.65).rotation.z=Math.PI/2;for(let i=0;i<13;i++){const g=new T.TorusGeometry(.13,.035,5,10),m=mesh(root,g,steel,s*4.5,LOWER_Y+.13,-61-i*.29,1,1,1);m.rotation.set(i%2?0:Math.PI/2,i%2?Math.PI/2:0,0);}box(root,navy,s*5,LOWER_Y+.12,-64,1,.2,1.1);const anchor=new T.Group();anchor.position.set(s*5.8,LOWER_Y-2,-65);anchor.rotation.z=s*.2;root.add(anchor);box(anchor,steel,0,0,0,.16,2.6,.18);box(anchor,steel,0,.8,0,1.3,.12,.15);const bend=mesh(anchor,new T.TorusGeometry(.72,.09,6,20,Math.PI),steel,0,-.8,0,1,1,1);bend.rotation.z=Math.PI;for(const side of [-1,1]){const fluke=mesh(anchor,new T.ConeGeometry(.27,.65,4),steel,side*.68,-.6,0,1,1,1);fluke.rotation.z=-side*.45;}}
 // Stern mooring station on the lower quarterdeck.
 for(const x of [-8,8])for(const z of [59,63]){mesh(root,cylinder,navy,x,LOWER_Y+.55,z,.22,1,.22);box(root,steel,x,LOWER_Y+1.05,z,.8,.12,.5);}box(root,navy,0,LOWER_Y+.65,62,3,1.3,1.8);label(root,'LOWER QUARTERDECK',0,LOWER_Y+2.6,57,3.8);
 // This animated equipment is excluded from the static mesh bake.
 const radar=new T.Group();radar.userData.dynamic=true;radar.position.set(0,ROOF_Y+3.3,-42);parent.add(radar);box(radar,navy,0,0,0,5,.32,.45);box(radar,white,0,.26,0,5.4,.22,.7);
 return {update(time,viewer){radar.rotation.y=time*.55;cabinLight.intensity=viewer&&viewer.y<CABIN_Y+.6?5:0;},state:{enclosedBridge:true,wingBridges:2,walkableRadarDeck:true,cabin:true,lowerBowAndStern:true,anchors:2},dispose(){glassMaterial.dispose();}};
 function guard(x1,z1,x2,z2,y){const length=Math.hypot(x2-x1,z2-z1),a=-Math.atan2(z2-z1,x2-x1);for(const h of [.5,1.05]){const b=box(root,steel,(x1+x2)/2,y+h,(z1+z2)/2,length,.055,.055);b.rotation.y=a;}for(let t=0;t<=1;t+=1/Math.ceil(length/1.4))box(root,white,x1+(x2-x1)*t,y+.52,z1+(z2-z1)*t,.065,1.04,.065);}
}
