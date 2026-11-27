import * as T from 'three';
import {GUEST_ROOMS,ENTERTAINMENT_Y as Y,ENTERTAINMENT_WALLS,VENUE_SEATS,CINEMA,THEATER} from './leisure-layout.js';

export function buildLeisureArt(parent,{box,mesh,cylinder,label}){
 const root=new T.Group();root.name='cruise-leisure-deck';parent.add(root);const ivory=0xe6dfd1,wood=0x7e5d47,brass=0xc5a575,navy=0x2d4655,velvet=0x775666;
 for(const r of GUEST_ROOMS){const z=(r.minZ+r.maxZ)/2;
  box(root,r.color,-8.1,7.025,z,8.3,.04,r.maxZ-r.minZ-.3);
  box(root,wood,-9.7,7.33,r.minZ+1.65,2.1,.66,2.5);box(root,0xf1e9dc,-9.7,7.77,r.minZ+1.65,2.03,.22,2.4);box(root,r.color,-9.7,7.9,r.minZ+2.35,2.04,.08,.8);
  box(root,ivory,-9.7,7.99,r.minZ+.85,1.7,.14,.5);box(root,wood,-11.8,7.77,r.maxZ-1.3,.75,.12,2.0);box(root,navy,-11.8,8.45,r.maxZ-1.4,.16,.9,1.4);
  box(root,wood,-5.1,8.2,r.minZ+.8,1.5,2.4,1.2);box(root,0xd6c6ad,-6,7.55,r.maxZ-1.1,1.6,.14,1.2);
  mesh(root,cylinder,ivory,-6,7.73,r.maxZ-1.1,.32,.08,.32);for(const dx of[-.23,.23])mesh(root,cylinder,brass,-6+dx,7.86,r.maxZ-1.1,.08,.18,.08);
  if(r.open){box(root,ivory,-3.8,9.74,r.doorZ,.22,.62,2.2);for(const z of[r.doorZ-1.1,r.doorZ+1.1])box(root,wood,-3.8,8.2,z,.28,2.4,.08);box(root,wood,-4.85,8.18,r.doorZ-1.02,2.1,2.36,.075);box(root,brass,-5.65,8.1,r.doorZ-.97,.14,.06,.1);}
  else box(root,wood,-3.66,8.18,r.doorZ,.07,2.36,1.55);
  label(root,r.id+(r.open?' · OPEN':' · PRIVATE'),-3.59,9.63,r.doorZ,.95);
  box(root,wood,-8.2,8.9,r.maxZ-.16,2.2,1.15,.06);box(root,0xa2b8b7,-8.2,8.9,r.maxZ-.12,2.05,1.0,.04);box(root,r.color,-8.2,8.65,r.maxZ-.09,2.05,.5,.02);
 }
 box(root,ivory,0,Y-.16,0,25.2,.32,48);box(root,0x565866,0,Y+.018,0,25,.035,47.9);
 for(const w of ENTERTAINMENT_WALLS)box(root,w.x===0?wood:navy,w.x,Y+1.52,w.z,w.w,3.04,w.d);
 // Guest-deck floor is the continuous ceiling above the halls.
 box(root,ivory,-7.2,6.8,0,10.7,.18,48);box(root,ivory,7.2,6.8,0,10.7,.18,48);box(root,ivory,0,6.8,7.5,3.5,.18,33);
 box(root,0x8b7566,0,Y+.04,6,3.4,.04,35);for(const x of[-1.4,1.4])box(root,brass,x,Y+.07,6,.035,.01,35);
 for(const side of[-1,1]){for(const z of[15.6,20])box(root,brass,side*1.8,Y+1.3,z,.25,2.6,.08);box(root,ivory,side*1.8,Y+2.82,17.8,.24,.4,4.4);}
 for(const s of VENUE_SEATS){const g=new T.Group();g.position.set(s.x,Y,s.z);root.add(g);box(g,wood,0,.2,0,.7,.4,.65);box(g,s.venue==='cinema'?0x566976:velvet,0,.5,0,1.05,.18,.9);box(g,s.venue==='cinema'?0x566976:velvet,0,.93,.36,1.05,.82,.17);for(const x of[-.52,.52])box(g,brass,x,.71,.08,.08,.09,.83);}
 box(root,wood,7.2,Y+.34,-20.5,10,.68,4.8);box(root,0x342e39,7.2,Y+.72,-20.5,9.9,.08,4.7);
 for(const x of[2.2,12.2]){box(root,velvet,x,Y+1.6,-22,.4,3.1,1.5);for(let i=0;i<5;i++)mesh(root,cylinder,velvet,x+(i-2)*.09,Y+1.6,-21.2,.09,3.1,.09);}
 for(const x of[4,10]){box(root,navy,x,Y+.6,-18.7,.65,1.2,.65);mesh(root,cylinder,0x121d28,x,Y+.65,-18.34,.2,.08,.2).rotation.x=Math.PI/2;}
 box(root,wood,CINEMA.screen.x,CINEMA.screen.y,CINEMA.screen.z,7,3.1,.15);
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=432;const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const screen=new T.Mesh(new T.PlaneGeometry(6.7,2.85),new T.MeshBasicMaterial({map:texture,toneMapped:false}));screen.userData.dynamic=true;screen.position.set(CINEMA.screen.x,CINEMA.screen.y,CINEMA.screen.z+.1);root.add(screen);
 const projector=new T.Group();projector.position.set(-7.1,Y+2.5,18);root.add(projector);box(projector,0x303a42,0,0,0,.75,.3,.8);mesh(projector,cylinder,0xcfe5e3,0,0,-.43,.13,.12,.13).rotation.x=Math.PI/2;
 const beam=new T.Mesh(new T.ConeGeometry(1.2,8,12,1,true),new T.MeshBasicMaterial({color:'#c1dad5',transparent:true,opacity:.025,depthWrite:false,side:T.DoubleSide}));beam.userData.dynamic=true;beam.rotation.x=-Math.PI/2;beam.position.set(-7.1,Y+1.8,13.6);root.add(beam);
 for(const x of[-11.9,11.9])for(const z of[-16,-5,6,17]){box(root,brass,x,Y+1.7,z,.08,.5,.4);box(root,0xffdab1,x*.99,Y+1.7,z,.045,.35,.28,true);}
 label(root,'CINEMA · 파도를 건너온 편지',-7,Y+2.6,21.5,3.6);label(root,'STARLIGHT STAGE',7,Y+2.6,21.5,3.6);label(root,'↑ 객실층 · 계단',0,Y+2.2,-23.8,2.8);
 // Empty seats remain usable; a few quiet audience silhouettes give scale.
 for(const s of VENUE_SEATS.filter((s,i)=>i%7===0)){mesh(root,new T.SphereGeometry(.25,10,7),0xbc9f83,s.x,Y+1.15,s.z,.9,1,.9);box(root,s.venue==='cinema'?0x86949a:0x9a8493,s.x,Y+.74,s.z,.48,.55,.34);}
 let last=-1,draws=0;const ctx=canvas.getContext('2d');
 function film(time){const phase=Math.floor(time/24)%5,t=time%24,sky=ctx.createLinearGradient(0,0,0,432);sky.addColorStop(0,['#273d60','#d8b49e','#8aacc0','#283c54','#627f82'][phase]);sky.addColorStop(1,'#c1ceca');ctx.fillStyle=sky;ctx.fillRect(0,0,768,432);ctx.fillStyle='#f4e6bd';ctx.beginPath();ctx.arc(580-phase*32,100,25,0,Math.PI*2);ctx.fill();for(let j=0;j<7;j++){ctx.fillStyle=`rgba(27,76,95,${.35+j*.07})`;ctx.beginPath();ctx.moveTo(0,250+j*24);for(let x=0;x<=768;x+=8)ctx.lineTo(x,250+j*24+Math.sin(x*.012+time*.7+j)*8);ctx.lineTo(768,432);ctx.lineTo(0,432);ctx.fill();}const x=90+(time%120)/120*530;ctx.save();ctx.translate(x,285+Math.sin(time)*4);ctx.rotate(Math.sin(time*.8)*.04);ctx.fillStyle='#a98159';ctx.beginPath();ctx.moveTo(-36,0);ctx.lineTo(38,0);ctx.lineTo(22,19);ctx.lineTo(-21,19);ctx.closePath();ctx.fill();ctx.fillStyle='#f3e8cf';ctx.fillRect(-10,-27,26,21);ctx.strokeStyle='#b5996e';ctx.strokeRect(-10,-27,26,21);ctx.restore();ctx.fillStyle='#102532b8';ctx.fillRect(0,357,768,75);ctx.fillStyle='#fff6e5';ctx.font='24px system-ui';ctx.textAlign='center';ctx.fillText(['바다 건너 누군가에게, 편지를 띄웠습니다.','급히 가야 할 곳은 없었습니다.','작은 파도 하나가 이야기를 이어 주었습니다.','이 밤에도, 누군가는 우리를 기다리고 있을까요.','오늘의 마음이 다정한 해안에 닿기를.'][phase],384,400);texture.needsUpdate=true;draws++;}
 film(0);
 return{root,update(time,{filmTime=0,playing=false,visible=false}={}){const frame=Math.floor((filmTime)*12);if(visible&&frame!==last){film(filmTime);last=frame;}beam.visible=visible&&playing;},state:{cinemaSeats:VENUE_SEATS.filter(s=>s.venue==='cinema').length,theaterSeats:VENUE_SEATS.filter(s=>s.venue==='theater').length,originalFilm:true,get frames(){return draws;}},dispose(){texture.dispose();screen.material.dispose();beam.geometry.dispose();beam.material.dispose();}};
}
