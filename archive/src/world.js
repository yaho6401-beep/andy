import {CAFE_TABLES,SEATS} from './seats.js';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {LAYOUT,PORTALS} from './protocol.js';
import {SCENTS,BOOKS} from './content.js';
const materials=new Map(),geometries=new Map();
const material=(color,metal=0)=>{const k=color+metal;if(!materials.has(k))materials.set(k,new T.MeshStandardMaterial({color,roughness:metal?.38:.86,metalness:metal}));return materials.get(k);};
function mesh(parent,geo,color,x,y,z,sx=1,sy=sx,sz=sx,metal=0){const m=new T.Mesh(geo,material(color,metal));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const sphere=new T.SphereGeometry(1,16,12),box=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,24);
function roundedGeo(w,h,d,r=.1){const key=[w,h,d,r].join();if(geometries.has(key))return geometries.get(key);const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new T.ExtrudeGeometry(s,{depth:Math.max(.01,d-2*r),bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:r*.5,bevelThickness:r,curveSegments:4});g.center();geometries.set(key,g);return g;}
function round(p,c,x,y,z,w,h,d,r=.1){return mesh(p,roundedGeo(w,h,d,r),c,x,y,z);}
function label(p,text,x,y,z,width=3,color='#4d5844',font=36){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,256);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`500 ${font}px Georgia, 'Malgun Gothic', sans-serif`;text.split('\n').forEach((s,i,a)=>ctx.fillText(s,512,128+(i-(a.length-1)/2)*55,960));const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));m.position.set(x,y,z);p.add(m);return m;}
function plant(p,x,z,size=1){mesh(p,cylinder,'#d0b398',x,.3*size,z,.28*size,.6*size,.28*size);for(let i=0;i<6;i++){const a=i*2.4;const leaf=mesh(p,sphere,i%2?'#94ac83':'#afbf99',x+Math.sin(a)*.24*size,(.7+i*.13)*size,z+Math.cos(a)*.2*size,.13*size,.4*size,.18*size);leaf.rotation.z=Math.sin(a)*.7;}}
function lamp(p,x,z){mesh(p,cylinder,'#ba9d6c',x,1.1,z,.035,2.2,.035, .45);mesh(p,cylinder,'#baa176',x,.06,z,.3,.1,.3);const shade=new T.Mesh(new T.ConeGeometry(.43,.5,24,1,true),material('#f5dfb6'));shade.position.set(x,2.1,z);p.add(shade);mesh(p,sphere,'#fff0c8',x,1.95,z,.12);}
function rug(p,x,z,w,d,color){const r=mesh(p,roundedGeo(w,d,.035,.15),color,x,.03,z);r.rotation.x=-Math.PI/2;return r;}
function bench(p,x,z,color='#b49a7c',rotate=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotate;p.add(g);round(g,color,0,.5,0,2.2,.18,.8);round(g,color,0,.95,-.35,2.2,.65,.16);for(const a of [-.8,.8]){mesh(g,box,'#92785c',a,.25,0,.12,.5,.6);round(g,'#e5d8bc',a,.65,0,.16,.14,.85);}}
function sofa(p,x,z,color){round(p,color,x,.4,z,2.8,.6,1.2,.2);round(p,color,x,.9,z-.48,2.8,.7,.26,.15);for(const a of [-1.25,1.25])round(p,color,x+a,.75,z,.25,.6,1.2,.12);for(const a of [-.6,.6])round(p,'#eee3cf',x+a,.73,z,1.05,.16,.86,.09);}
function bookcase(p,x,z){round(p,'#a08060',x,1.25,z,3.6,2.5,.6,.06);round(p,'#dfc7a3',x,1.3,z+.3,3.3,2.2,.05,.03);for(let row=0;row<3;row++){const yy=.4+row*.72;mesh(p,box,'#9b7956',x,yy,z+.25,3.4,.09,.6);for(let j=0;j<11;j++){const color=['#bbad8d','#b7bfa5','#d4b5b5','#b0bac7','#ad97b5'][j%5];const h=.36+(j%3)*.09;const b=round(p,color,x-1.45+j*.27,yy+h/2+.06,z+.33,.19,h,.28,.02);b.rotation.z=j%5===0?.12:0;}}}
function bottle(p,x,y,z,color,scale=1,index=0){const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);p.add(g);if(index%2){mesh(g,cylinder,color,0,.47,0,.32,.78,.32);}else round(g,color,0,.47,0,.65,.8,.38,.12);round(g,'#fff0d1',0,.48,.22,.35,.3,.02,.02);mesh(g,cylinder,'#c3a363',0,.92,0,.15,.16,.15,.5);round(g,index%2?'#8c7763':'#8a987d',0,1.1,0,.36,.24,.3,.04);return g;}
function archWindow(p,x,z,color){round(p,'#e6d9c3',x,2.15,z,2.1,3.1,.2,.35);round(p,color,x,2.2,z+.13,1.8,2.75,.05,.33);mesh(p,box,'#f4ead5',x,2.1,z+.17,.07,2.7,.06);mesh(p,box,'#f4ead5',x,2.1,z+.17,1.8,.06,.06);}

function flowers(p,x,z,color='#dc99ae',n=7){for(let i=0;i<n;i++){const a=i*2.4,xx=x+Math.sin(a)*.36,zz=z+Math.cos(a)*.3;mesh(p,cylinder,'#829e70',xx,.28,zz,.018,.5,.018);for(let j=0;j<5;j++){const q=j*Math.PI/2.5;mesh(p,sphere,color,xx+Math.sin(q)*.07,.57,zz+Math.cos(q)*.07,.065,.035,.065);}mesh(p,sphere,'#e4bf70',xx,.59,zz,.035);}}
function tree(p,x,z){mesh(p,cylinder,'#b79469',x,1.1,z,.15,2.2,.15);for(const [dx,dy,dz,r]of [[0,2.7,0,1.1],[-.6,2.3,.15,.75],[.6,2.4,-.1,.8]])mesh(p,sphere,'#a8c589',x+dx,dy,z+dz,r,r*.9,r);mesh(p,cylinder,'#c2b495',x,.15,z,1.15,.25,1.15);}
function portalFrame(p,gate,outdoor=false){const g=new T.Group();g.position.set(gate.x,0,gate.z);if(gate.x)g.rotation.y=gate.x>0?-Math.PI/2:Math.PI/2;else if(gate.z>0)g.rotation.y=Math.PI;p.add(g);const c=outdoor?'#d2b284':'#c7b493';for(const side of [-1,1])round(g,c,side*1.23,1.4,0,.23,2.8,.35,.05);round(g,c,0,2.86,0,2.65,.23,.35,.08);round(g,'#faf2df',0,3.18,0,3.2,.5,.18,.08);label(g,gate.label,0,3.2,.12,3,'#6b6e56',48);rug(g,0,-.3,2.05,1.9,outdoor?'#d8c49a':'#c2c7af');for(const side of [-1,1]){const pane=round(g,outdoor?'#dce6dc':'#d9cbb5',side*1.45,1.32,.18,.42,2.4,.14,.05);pane.rotation.y=side*.5;mesh(g,sphere,'#b99859',side*1.3,1.2,.33,.045);}label(g,'歩いて入る'.replace('歩いて入る','걸어서 들어가기'),0,.17,1.1,2.3,'#8b9578',44).rotation.x=-Math.PI/2;}

export class ArchiveWorld {
 constructor(scene){this.scene=scene;this.group=new T.Group();scene.add(this.group);this.hotspots=[];this.room=null;this.water=null;}
 build(room,content={scents:SCENTS,books:BOOKS}){for(const obj of [...this.group.children]){obj.traverse(o=>{if(o.material?.map){o.material.map.dispose();o.material.dispose();o.geometry?.dispose();}else if(o.userData.archiveMerged)o.geometry.dispose();});this.group.remove(obj);}this.hotspots=[];this.water=null;this.room=room;const g=this.group;

 const outdoor=room==='garden';
 round(g,outdoor?'#b9cc93':'#c5ad8d',0,-.22,0,17,.4,17,.15);mesh(g,box,outdoor?'#d0ddac':room==='books'?'#c8a47d':room==='scents'?'#eee4f1':room==='salon'?'#e6cbd0':'#eee2cb',0,-.005,0,16,.05,16);
 if(outdoor){
  rug(g,0,0,2.8,15.6,'#e5d4ae');for(let z=-6;z<=6;z+=1)mesh(g,box,'#f5e9cb',0,.065,z,2.4,.06,.8);
  for(const x of [-4.8,4.8]){tree(g,x,-3);bench(g,x,3,'#d7b68e');for(const z of [-5.2,.3,5.7]){round(g,'#eee3c6',x,.16,z,2.6,.3,1.1,.12);flowers(g,x-.6,z,'#d99db2');flowers(g,x+.5,z,'#b5a1d4');}}
  for(const x of [-7.7,7.7]){round(g,'#a7bf85',x,.4,0,.42,.8,15.8,.15);for(let z=-7;z<8;z+=2)round(g,'#f0e6c9',x,.65,z,.22,1.3,.22,.04);}
  for(const x of [-2.85,2.85])round(g,'#f1e5cf',x,1.7,-8,3.1,3.4,.4,.12);for(const x of [-2.8,2.8])archWindow(g,x,-7.73,'#c6dcd6');label(g,'BOOKS & SCENTS ARCHIVE',0,3.85,-7.4,8,'#697b58',44);round(g,'#bcaa83',0,3.6,-7.5,9.3,.25,1.2,.08);
  for(const x of [-1.8,1.8]){plant(g,x,-6.8,.8);flowers(g,x,-6.8,'#d5a0bc',5);}this.hotspots.push({x:4.8,z:3,id:'garden',title:'정원의 오늘 한 문장',type:'today'});
 }else{
  // Wall sections leave physical door openings at the lobby's three wings.
  const gates=PORTALS[room];
  if(gates.some(p=>p.z<0)){for(const x of [-4.8,4.8])round(g,'#eee1cd',x,1.9,-8,6.7,3.8,.25,.12);}else round(g,room==='salon'?'#dfc5ce':room==='scents'?'#d9cce5':'#e9dac1',0,1.9,-8,16.3,3.8,.25,.12);
  if(gates.some(p=>p.x<0)){for(const z of [-4.8,4.8])round(g,'#e9dcc5',-8,1.9,z,.25,3.8,6.7,.12);}else round(g,'#eadbc4',-8,1.9,0,.25,3.8,16.3,.12);
  for(let i=-7;i<=7;i++){if(room==='books')mesh(g,box,'#b28e66',i,.026,0,.023,.005,16);else if(room!=='salon'){mesh(g,box,'#dacebe',i,.026,0,.018,.005,16);mesh(g,box,'#dacebe',0,.026,i,16,.005,.018);}}
  for(const x of [-5,5])archWindow(g,x,-7.8,room==='salon'?'#dec3d5':'#d6e2d7');for(const x of [-7,7]){plant(g,x,-6.5,1.25);lamp(g,x,3.5);}rug(g,0,0,12,10,room==='books'?'#cbb18d':room==='salon'?'#d6aab9':room==='scents'?'#e4d9eb':'#eee5d3');
  const names={lobby:'BOOKS & SCENTS',scents:'SCENT ARCHIVE\n香りの美術館'.replace('香りの美術館','향을 수집하는 박물관'),books:'THE READING GARDEN\n문장과 이야기가 자라는 곳',salon:'SCENT & STORY CAFÉ\n향과 이야기를 마시는 시간'};if(room!=='lobby')label(g,names[room],0,3.15,-7.6,6,'#665c50',40);
 }
 for(const gate of PORTALS[room])portalFrame(g,gate,outdoor);
 if(room==='lobby'){mesh(g,cylinder,'#c3b397',0,.25,0,1.7,.45,1.7);mesh(g,cylinder,'#e8ddc7',0,.5,0,1.55,.18,1.55);this.water=mesh(g,cylinder,'#a9c6bb',0,.605,0,1.35,.035,1.35);mesh(g,cylinder,'#ddc9a2',0,.9,0,.7,.65,.7);bottle(g,0,1.25,0,'#c3b1cf',1.35);for(let i=0;i<10;i++){const a=i*Math.PI/5;mesh(g,sphere,'#c9dfd1',Math.sin(a)*.86,1.1+Math.sin(i)*.15,Math.cos(a)*.86,.045);}
 bench(g,-5,2);bench(g,5,2);round(g,'#b29275',4.7,.98,4.4,2.4,1.9,.3,.1);round(g,'#f4e7cf',4.7,1.08,4.6,2.12,1.5,.06,.04);label(g,'SOLO ONLY PROJECT\n솔로만 참가신청',4.7,1.15,4.65,2,'#735d6b',48);for(let i=0;i<3;i++){round(g,['#e7c6ce','#d8ddb7','#d5c7e7'][i],4.05+i*.62,.8,4.68,.44,.35,.025,.03);}this.hotspots.push({x:4.7,z:4.4,id:'solo-application',title:'솔로만 프로젝트 참가신청서 작성',type:'solo'});round(g,'#c4a981',3.2,1,-6,3,1.9,.4,.08);label(g,'당신의 이야기에\n향을 입히세요.',3.2,1.15,-5.76,2.8,'#fff7e8',48);this.hotspots.push({x:0,z:0,id:'today',title:'오늘의 향과 문장',type:'today'});
 }else if(room==='scents'){content.scents.slice(0,5).forEach((s,i)=>{const x=-5+i*2.5;mesh(g,cylinder,'#efe5d3',x,.58,-3,.65,1.15,.65);mesh(g,cylinder,'#c5a976',x,1.18,-3,.7,.06,.7,.35);bottle(g,x,1.23,-3,s.color,.85,i);label(g,s.family,x,.9,-2.32,1.25,'#6f6656',52);this.hotspots.push({x,z:-3,id:s.id,title:s.name,type:'scent'});});round(g,'#d9c7e1',0,.6,2,3,1.1,1.8,.18);bottle(g,0,1.2,2,'#d9b5be',.6);label(g,'향은 감각의 상상입니다.',0,1.25,2.94,2.7,'#665771',45);this.hotspots.push({x:0,z:2,id:'balance',title:'72가지 메인향 · 나만의 향 조합하기',type:'compose'});
 }else if(room==='books'){for(const [i,x]of [-5,0,5].entries()){bookcase(g,x,-6.5);this.hotspots.push({x,z:-6.5,id:'shelf-'+i,title:'책장 살펴보기 · 도서와 추천',type:'book'});label(g,['감각과 기억','상상과 성장','사람과 관계'][i],x,2.8,-6.12,3,'#6f775e',39);}sofa(g,-4,0,'#a7b798');sofa(g,4,0,'#c3afc9');mesh(g,cylinder,'#bc9d74',0,.65,3,1,.15,1);mesh(g,cylinder,'#a38665',0,.3,3,.09,.6,.09);content.books.forEach((b,i)=>{const x=-.55+i*.36;const obj=round(g,b.color,x,.77,3,.27,.09,.4,.02);obj.rotation.y=.12*i;});this.hotspots.push({x:0,z:3,id:'books',title:'오늘의 문장과 책 이야기',type:'book'});this.hotspots.push({x:-7.3,z:-3.2,id:'side-shelf',title:'옆 서가 · 책과 이야기',type:'book'});
 }else if(room==='salon'){
 for(const t of CAFE_TABLES){
  if(t.shape==='round')mesh(g,cylinder,'#d2b491',t.x,t.top-.06,t.z,t.w/2,.12,t.d/2);
  else round(g,t.shape==='bar'?'#dbc4a0':'#bd9672',t.x,t.top-.06,t.z,t.w,.12,t.d,.13);
  if(t.shape==='rectangle')for(const dx of [-t.w/2+.3,t.w/2-.3])for(const dz of [-.48,.48])mesh(g,cylinder,'#8b745f',t.x+dx,t.top/2,t.z+dz,.065,t.top,.065);
  else for(const dx of t.shape==='bar'?[-2.3,2.3]:[0])mesh(g,cylinder,'#9b8066',t.x+dx,t.top/2,t.z,.09,t.top,.09);
  if(t.shape!=='bar'){flowers(g,t.x,t.z,'#dfaebb',3);label(g,t.capacity+'인 · '+(t.shape==='round'?'ROUND':'TOGETHER'),t.x,1.45,t.z,t.w+1,'#866b77',46);}
  for(const s of SEATS.filter(s=>s.table===t.id)){mesh(g,cylinder,t.id===5?'#8eaa94':t.id===1?'#c8a3b3':'#e0c7c0',s.x,s.height-.1,s.z,.32,.18,.32);for(const dx of [-.19,.19])for(const dz of [-.19,.19])mesh(g,cylinder,'#a98b6e',s.x+dx,(s.height-.2)/2,s.z+dz,.026,s.height-.2,.026);if(t.shape!=='bar'){const chair=new T.Group();chair.position.set(s.x,0,s.z);chair.rotation.y=s.yaw;g.add(chair);round(chair,'#d7bcb2',0,.82,-.27,.6,.5,.1,.1);}}
  this.hotspots.push({x:t.x,z:t.z,id:String(t.id),title:t.label+' · 가까운 빈 의자에 앉기',type:'table'});
 }
 round(g,'#b59ab7',0,.7,-6.5,3,1.3,.7,.12);label(g,'향기카페 · 오늘의 한 잔',0,1.4,-6.05,3,'#fff7ed',44);
 }

 if(room==='lobby'){rug(g,0,4.5,2.6,3.2,'#c4cead');for(const x of [-3.6,3.6]){mesh(g,cylinder,'#c5ab74',x,.65,-2,.48,1.3,.48);bottle(g,x,1.33,-2,x<0?'#d5b7c8':'#b8c9ab',.55);}round(g,'#a08a6c',-4,1,-5.8,3.1,1.5,1.2,.1);label(g,'WELCOME · 안내 데스크',-4,1.4,-5.12,3,'#fdf2d9',40);for(let i=0;i<3;i++)round(g,['#c5b3c8','#b4c3a4','#cfb686'][i],-4.8+i*.7,1.82,-5.8,.5,.1,.65,.03);}
 if(room==='scents'){
 round(g,'#aa91b3',0,1.65,-6.8,6.8,3.2,.45,.09);
 for(let row=0;row<6;row++){round(g,'#e8d7b8',0,.36+row*.48,-6.48,6.7,.07,.65,.02);for(let j=0;j<12;j++)bottle(g,-3.05+j*.55,.42+row*.48,-6.35,['#cfb3d2','#e0c08d','#b7cbb8'][j%3],.32,row*12+j);}
 label(g,'72 MAIN SCENTS · 책과향기',0,3.9,-6.35,5,'#75607e',42);
 this.hotspots.push({x:0,z:-6,id:'main-organ',title:'메인향 72개 · 나만의 향 조합하기',type:'compose'});
  for(const x of [-6,6]){round(g,'#b19bba',x,1.45,-6.5,1.35,2.9,.7,.1);for(let row=0;row<3;row++){round(g,'#dfcfae',x,.55+row*.8,-6.08,1.3,.08,.7,.03);for(let j=0;j<3;j++)bottle(g,x+(j-1)*.35,.6+row*.8,-6.0,['#c6b2d7','#d6b68e','#b1c6b7'][j],.27,j);}}
  for(let i=0;i<5;i++){const x=-5+i*2.5;const s=content.scents[i];if(!s)continue;round(g,s.color,x,2.45,-4.1,1.65,1.9,.08,.22);label(g,s.family,x,2.52,-4.02,1.5,'#fff7eb',49);}
  round(g,'#ac94ba',-4, .68,2.7,2.5,1.25,1.4,.12);for(let row=0;row<3;row++)for(let j=0;j<10;j++)bottle(g,-5+j*.22,1.35+row*.28,2.45,'#e3c58e',.18,j);label(g,'30 NOTES · 나만의 향 조합',-4,1,3.43,2.5,'#fff4e5',40);this.hotspots.push({x:-4,z:2.7,id:'blend-organ',title:'단일향 30개 · 조합하기',type:'compose'});
 }
 if(room==='books'){
  const sidecase=new T.Group();sidecase.position.set(-7.3,0,-3.2);sidecase.rotation.y=Math.PI/2;g.add(sidecase);bookcase(sidecase,0,0);
  for(const x of [-3.9,3.9]){round(g,'#b79a78',x,.4,2.1,1.4,.12,.9,.08);for(let i=0;i<3;i++){const b=round(g,['#b5bda0','#c5adc0','#d1b97f'][i],x+.2,.52+i*.09,2.05,.6,.09,.4,.02);b.rotation.y=i*.1;}mesh(g,cylinder,'#f2e6c9',x-.3,.55,2.2,.11,.2,.11);}
  round(g,'#baa384',5.6,.8,4.7,1.5,1.6,.65,.1);flowers(g,5.6,4.7,'#d6b1ba',5);label(g,'오늘의 한 문장',-4,2.95,-7.5,3,'#6f775e',44);
 }
 if(room==='salon'){
  round(g,'#a48464',0,.8,-5.8,6.8,1.6,1.6,.12);round(g,'#eee0c4',0,1.66,-5.8,7,.15,1.8,.06);round(g,'#6b7c67',-1.5,2.1,-5.8,1.2,.85,.65,.06);for(const x of [-1.8,-1.2]){mesh(g,cylinder,'#b9a374',x,1.9,-5.35,.08,.2,.08);mesh(g,cylinder,'#fff1db',x,1.8,-5.3,.12,.14,.12);}for(let i=0;i<4;i++){mesh(g,cylinder,'#fff0d9',.3+i*.48,1.85,-5.5,.12,.23,.12);mesh(g,cylinder,'#855b3f',.3+i*.48,1.977,-5.5,.1,.015,.1);}round(g,'#dccbaf',2.1,2,-5.9,1.3,.6,.8,.06);for(let j=0;j<3;j++)mesh(g,sphere,['#d4b272','#d4a6ad','#b99978'][j],1.75+j*.34,2.25,-5.5,.14,.07,.12);label(g,'SCENT CAFÉ · COFFEE & TEA',0,2.85,-5.4,5,'#79745b',42);
  for(const x of [-5,-2.5,0,2.5,5]){mesh(g,cylinder,'#b6955f',x,3.65,0,.015,.8,.015);mesh(g,sphere,'#f4ddb0',x,3.15,0,.18,.2,.18);}
  round(g,'#ac8b9a',6.8,.75,-5.5,.8,1.4,1.8,.1);for(let i=0;i<4;i++){mesh(g,cylinder,'#f3e2cb',6.8,1.52,-6.1+i*.4,.12,.24,.12);}label(g,'TEA & TALK',6.8,2.2,-5.5,2.3,'#856d7c',45);
 }


 if(room==='books'||room==='salon'){
 const bg=new T.Group();bg.position.set(-7.1,0,3.8);bg.rotation.y=Math.PI/2;g.add(bg);round(bg,'#ae8b62',0,1.65,0,2.5,1.9,.18,.1);round(bg,'#c9b38a',0,1.65,.11,2.25,1.65,.04,.04);for(let j=0;j<6;j++){const paper=round(bg,['#f1dfaa','#e7c5d4','#c9dbb5'][j%3],-.72+(j%3)*.7,1.95-Math.floor(j/3)*.65,.16,.53,.48,.025,.025);paper.rotation.z=(j%2?.09:-.08);mesh(bg,sphere,'#b39970',-.72+(j%3)*.7,2.12-Math.floor(j/3)*.65,.2,.027);}label(bg,room==='books'?'책갈피 포스트잇':'향기카페 메모',0,2.9,.15,3,'#7d805f',42);this.hotspots.push({x:-7.1,z:3.8,id:'note-wall',title:room==='books'?'책갈피 벽 · 추천과 한줄 메모':'향기카페 · 포스트잇 붙이기',type:'board'});
 }

 // Bake static furnishings into one mesh per material for mobile rendering.
 g.updateMatrixWorld(true);const buckets=new Map(),originals=[];
 g.traverse(o=>{if(!o.isMesh||o.material.map||o===this.water)return;const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,{material:o.material,geometries:[]});buckets.get(key).geometries.push(o.geometry.clone().applyMatrix4(o.matrixWorld));originals.push(o);});
 for(const o of originals)o.removeFromParent();
 for(const b of buckets.values()){const geometry=mergeGeometries(b.geometries,false);for(const part of b.geometries)part.dispose();if(!geometry)continue;const combined=new T.Mesh(geometry,b.material);combined.castShadow=true;combined.receiveShadow=true;combined.userData.archiveMerged=true;g.add(combined);}
 this.colliders=LAYOUT[room];return this.hotspots;
 }
 nearest(x,z){return this.hotspots.map(h=>({...h,distance:Math.hypot(x-h.x,z-h.z)})).filter(h=>h.distance<2.9).sort((a,b)=>a.distance-b.distance)[0];}
 update(t){if(this.water&&this.room==='lobby')this.water.material.color.setHSL(.42,.16,.73+Math.sin(t)*.015);}
}
