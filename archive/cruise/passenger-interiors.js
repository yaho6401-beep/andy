import * as T from 'three';
import {CABIN_Y,DECK_Y,UPPER_Y} from './ship-layout.js';
import {CABIN_INTERIOR_WALLS,DINING_INTERIOR_WALLS,passengerRegion} from './interior-layout.js';

export function buildPassengerInteriors(parent,{box,mesh,cylinder}){
 const root=new T.Group();root.name='passenger-interiors';parent.add(root);
 const ivory=0xe9e6de,wood=0x977352,walnut=0x6a5142,navy=0x304d59,carpet=0x536f71,brass=0xc4a575;
 const glass=new T.MeshStandardMaterial({color:'#a9c6cb',transparent:true,opacity:.13,roughness:.17,metalness:.05,depthWrite:false,side:T.DoubleSide});glass.forceSinglePass=true;
 const lampMaterial=new T.MeshBasicMaterial({color:'#ffe9c8'}),panelGeo=new T.PlaneGeometry(1,1);let windows=0;
 function wall(w,y,h){
  const alongX=w.w>w.d,length=alongX?w.w:w.d,origin=(alongX?w.x:w.z)-length/2,end=origin+length,thickness=alongX?w.d:w.w;
  function block(a,b,bottom,top){if(b-a<.001||top-bottom<.001)return;const p=box(root,ivory,alongX?(a+b)/2:w.x,y+(bottom+top)/2,alongX?w.z:(a+b)/2,alongX?b-a:thickness,top-bottom,alongX?thickness:b-a);p.userData.bulkhead=w.id;}
  let at=origin;for(const o of w.windows||[]){const a=o.center-o.width/2,b=o.center+o.width/2;block(at,a,0,h);block(a,b,0,o.sill);block(a,b,o.sill+o.height,h);at=b;
   const p=new T.Mesh(panelGeo.clone(),glass);p.name='window-'+w.id+'-'+windows;p.position.set(alongX?o.center:w.x,y+o.sill+o.height/2,alongX?w.z:o.center);p.scale.set(o.width,o.height,1);p.rotation.y=alongX?0:Math.PI/2;p.userData.bakeGlass=true;root.add(p);windows++;
   // Window reveals have depth; opaque walls never continue behind the glazing.
   for(const u of[a,b])box(root,wood,alongX?u:w.x,y+o.sill+o.height/2,alongX?w.z:u,alongX?.07:thickness+.045,o.height+.12,alongX?thickness+.045:.07);
   for(const v of[o.sill,o.sill+o.height])box(root,wood,alongX?o.center:w.x,y+v,alongX?w.z:o.center,alongX?o.width+.08:thickness+.045,.065,alongX?thickness+.045:o.width+.08);
  }block(at,end,0,h);
 }
 function glow(x,y,z,w=1.4,d=.18){const l=box(root,ivory,x,y,z,w,.045,d);l.material=lampMaterial;return l;}
 // Continuous closed hull-side accommodation, including both end bulkheads.
 for(const [x,z,w,d]of [[0,6,25.2,30],[-6.95,-15,11.3,12],[6.95,-15,11.3,12]]){box(root,ivory,x,CABIN_Y-.16,z,w,.32,d);box(root,0xb6a48f,x,CABIN_Y+.008,z,w,.018,d);}
 box(root,ivory,1.2,DECK_Y-.17,0,22.6,.24,42);box(root,ivory,-11.9,DECK_Y-.17,-7.5,3.6,.24,27);box(root,ivory,-11.9,DECK_Y-.17,19.5,3.6,.24,5);
 for(const w of CABIN_INTERIOR_WALLS)wall(w,CABIN_Y,3.05);
 // A broad carpeted passage, connected to an aft stair lobby rather than the sea.
 for(const [x,z,w,d]of [[0,4,5.9,25.5],[-2.15,-14.85,1.6,11.7],[2.15,-14.85,1.6,11.7]])box(root,carpet,x,CABIN_Y+.026,z,w,.028,d);box(root,carpet,-3.7,CABIN_Y+.026,18.55,16.9,.028,3.3);
 for(const x of[-3,3])box(root,brass,x,CABIN_Y+.043,-2,.035,.006,37.5);
 for(const x of[3.65]){box(root,walnut,x,CABIN_Y+.1,-2,.045,.2,37.2);box(root,wood,x,CABIN_Y+1.0,-2,.035,.065,37.2);}
 for(const z of[-18,-10,-2,6,14,19])glow(0,DECK_Y-.33,z,2,.22);
 glow(-8,DECK_Y-.33,18.4,2,.22);glow(8,DECK_Y-.33,6,2.5,.22);
 // Flush doors and numbers are mounted on walls, not floating billboards.
 const signs=[];
 for(const side of[1])for(const[z,n]of[[-16,201],[-7,203],[14,209]]){
  box(root,wood,side*3.665,CABIN_Y+1.17,z,.065,2.34,1.45);box(root,walnut,side*3.62,CABIN_Y+.08,z,.05,.14,1.5);
  box(root,brass,side*3.61,CABIN_Y+1.05,z+.48,.065,.06,.19);box(root,navy,side*3.60,CABIN_Y+1.32,z+.48,.035,.13,.09);
  signs.push({text:String(n+(side>0?1:0)),x:side*3.59,y:CABIN_Y+2.6,z,yaw:side>0?-Math.PI/2:Math.PI/2,w:.58,h:.22});
 }
 // Open private-suite doorway: 2.3m clear passage with a lintel and inward leaf.
 box(root,ivory,3.8,CABIN_Y+2.72,5.85,.22,.64,2.3);
 for(const z of[4.7,7])box(root,walnut,3.8,CABIN_Y+1.2,z,.27,2.4,.07);
 box(root,wood,4.85,CABIN_Y+1.18,4.78,2.1,2.36,.075);box(root,brass,5.68,CABIN_Y+1.1,4.70,.15,.055,.09);
 signs.push({text:'208 · 나의 객실',x:3.59,y:CABIN_Y+2.65,z:5.85,yaw:-Math.PI/2,w:1.5,h:.27});
 signs.push({text:'GUEST DECK · 객실 복도',x:0,y:CABIN_Y+2.1,z:-20.85,yaw:0,w:3.6,h:.52});
 signs.push({text:'계단 · 메인 갑판 →',x:-7.1,y:CABIN_Y+2.3,z:20.84,yaw:Math.PI,w:3.5,h:.45});
 // Properly scaled suite furniture and layered finishes.
 box(root,0x6d8585,8.1,CABIN_Y+.035,6.4,7.8,.035,8.8);
 box(root,wood,9,CABIN_Y+.31,2.7,2.15,.62,2.35);box(root,0xf5eee3,9,CABIN_Y+.72,2.7,2.13,.25,2.3);box(root,walnut,9,CABIN_Y+1.05,1.48,2.5,1.45,.14);
 for(const x of[8.48,9.52])box(root,0xfff7e9,x,CABIN_Y+.93,1.95,.83,.18,.53);box(root,0x759493,9,CABIN_Y+.88,3.35,2.14,.08,.72);
 for(const x of[7.45,10.55]){box(root,wood,x,CABIN_Y+.35,1.9,.5,.7,.58);glow(x,CABIN_Y+1.48,1.74,.25,.16);}
 box(root,wood,5.55,CABIN_Y+1.3,1,2.5,2.6,1.25);for(const x of[5,6.1])box(root,brass,x,CABIN_Y+1.2,1.645,.045,.33,.035);
 box(root,wood,11.85,CABIN_Y+.8,7.1,.8,.1,2.8);for(const z of[5.9,8.3])box(root,walnut,11.85,CABIN_Y+.39,z,.55,.78,.07);
 box(root,navy,12.36,CABIN_Y+1.75,7.1,.04,.9,1.5);box(root,0x88a9ae,12.32,CABIN_Y+1.75,7.1,.025,.73,1.3);
 box(root,wood,9,CABIN_Y+.29,9.6,3.0,.32,.9);box(root,0xe0d5c2,9,CABIN_Y+.56,9.6,2.9,.28,.85);box(root,0xe0d5c2,9,CABIN_Y+1.0,10.0,3.0,.8,.16);
 for(const x of[8,10])box(root,carpet,x,CABIN_Y+.92,9.83,.42,.4,.16);
 box(root,wood,7.65,CABIN_Y+.45,7.65,1.1,.1,.75);for(const x of[7.25,8.05])box(root,walnut,x,CABIN_Y+.2,7.65,.05,.42,.55);
 // Curtain folds stay at the sides of real window openings.
 for(const z of[3,8])for(const side of[-1,1])for(let i=0;i<3;i++)box(root,0xc7bba6,12.30,CABIN_Y+1.95,z+side*(1.28+i*.07),.12,1.65,.06);
 art(8,CABIN_Y+2.0,10.82,2.4,1.1,Math.PI);art(-3.61,CABIN_Y+1.9,3.5,1.8,.9,Math.PI/2);
 // Fully enclosed panoramic restaurant, entered from the existing starboard stair.
 for(const w of DINING_INTERIOR_WALLS)wall(w,UPPER_Y,3.95);
 box(root,ivory,0,UPPER_Y+3.98,34,26,.22,34.4);
 for(const x of[-8,-4,0,4,8]){box(root,0xd4c7b2,x,UPPER_Y+3.82,34,.06,.12,33);}
 for(const z of[21,28,35,42,49]){box(root,0xd4c7b2,0,UPPER_Y+3.78,z,25.4,.12,.06);glow(0,UPPER_Y+3.69,z,8,.13);}
 // Open glass entry: no full wall or invisible collider across the landing.
 box(root,walnut,12.8,UPPER_Y+1.7,20.8,.28,3.4,.1);box(root,walnut,12.8,UPPER_Y+3.48,19,.28,.18,3.6);
 signs.push({text:'OCEAN DINING',x:12.95,y:UPPER_Y+3.05,z:19,yaw:Math.PI/2,w:2.25,h:.32});
 box(root,wood,0,UPPER_Y+.55,48.8,6.2,1.1,1.3);box(root,0xd4c6ad,0,UPPER_Y+1.13,48.8,6.4,.10,1.45);
 for(const x of[-2,-1,0,1,2]){mesh(root,cylinder,0xece4d6,x,UPPER_Y+1.23,48.8,.22,.1,.22);box(root,brass,x,UPPER_Y+1.57,49,.025,.55,.025);}
 art(0,UPPER_Y+2.2,17.15,3.8,1.35,0);
 // One atlas for all small wayfinding plaques; this becomes one static batch.
 let signTexture,signMaterial;
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#354e58';ctx.fillRect(0,0,512,512);
  signs.forEach((s,i)=>{const x=i%2*256,y=Math.floor(i/2)*64;ctx.fillStyle='#e8d5ad';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=(s.text.length>10?'22':'30')+'px system-ui';ctx.fillText(s.text,x+128,y+32,244);});
  signTexture=new T.CanvasTexture(canvas);signTexture.colorSpace=T.SRGBColorSpace;signMaterial=new T.MeshBasicMaterial({map:signTexture});
  signs.forEach((s,i)=>{const g=new T.PlaneGeometry(s.w,s.h),uv=g.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,(i%2+uv.getX(k))/2,1-(Math.floor(i/2)+1-uv.getY(k))/8);const p=new T.Mesh(g,signMaterial);p.position.set(s.x,s.y,s.z);p.rotation.y=s.yaw;root.add(p);});
 }
 const lights=[0,1].map(()=>{const l=new T.PointLight('#ffe4bd',0,13,1);root.add(l);return l;});
 const fixtures={cabin:[[-8,18.5],[0,19],[0,14],[0,6],[0,-2],[0,-10],[0,-18],[8,6]],dining:[[-7,24],[7,24],[-7,34],[7,34],[-7,44],[7,44]],bridge:[[-6,-32],[6,-32],[-6,-43],[6,-43]]};
 return {root,update(time,p){const r=p?passengerRegion(p):null,zone=r==='dining'?'dining':r==='bridge'?'bridge':r?'cabin':null,floor=zone==='cabin'?CABIN_Y:UPPER_Y;if(!zone){lights.forEach(l=>l.intensity=0);return;}const options=fixtures[zone].slice().sort((a,b)=>Math.hypot(a[0]-p.x,a[1]-p.z)-Math.hypot(b[0]-p.x,b[1]-p.z));lights.forEach((l,i)=>{l.position.set(options[i][0],floor+(zone==='cabin'?2.65:3.1),options[i][1]);l.intensity=zone==='dining'?7:6;});},state:{enclosedAccommodation:true,enclosedDining:true,closedEndBulkheads:2,realWindows:windows,guestCorridor:true,privateSuite:true,interiorLights:2},dispose(){panelGeo.dispose();}};
 function art(x,y,z,w,h,yaw){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=yaw;root.add(g);box(g,walnut,0,0,0,w+.12,h+.12,.055);box(g,0xb8cbc5,0,0,.033,w,h,.02);box(g,0x5b7e88,0,-h*.25,.05,w,h*.5,.012);box(g,0xe3cf9e,w*.24,h*.19,.052,h*.16,h*.16,.014);}
}
