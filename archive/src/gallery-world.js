import * as T from 'three';
import {GALLERY} from './gallery-layout.js';
import {SEATS,CAFE_TABLES} from './seats.js';
import {INGREDIENTS} from './scent-exhibits.js';
import {createIngredientObject} from './ingredient-objects.js';
import {publicBoardSurface} from './board-art.js';
const cache = new Map();
const cube = new T.BoxGeometry(1,1,1);
const cylinder = new T.CylinderGeometry(1,1,1,16);
const leaf = new T.SphereGeometry(1,8,6);
const palette = {ivory:'#ede8df',stone:'#d9d3c9',oak:'#997a59',dark:'#453d34',brass:'#aa8b58',paper:'#f7f2e9',green:'#6e806f'};

function texture(kind) {
  if(cache.has(kind)) return cache.get(kind);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const c=canvas.getContext('2d');
  if(kind==='contact') {
    const falloff=c.createRadialGradient(128,128,12,128,128,124);falloff.addColorStop(0,'rgba(52,45,34,.55)');falloff.addColorStop(.5,'rgba(52,45,34,.24)');falloff.addColorStop(1,'rgba(52,45,34,0)');c.fillStyle=falloff;c.fillRect(0,0,256,256);
  } else if(kind==='landscape') {
    const sky=c.createLinearGradient(0,0,0,256);sky.addColorStop(0,'#b5cbd2');sky.addColorStop(.65,'#e3e6d6');sky.addColorStop(1,'#c0c6ab');c.fillStyle=sky;c.fillRect(0,0,256,256);
    for(let j=0;j<3;j++){c.fillStyle=['#aabda9','#8da58b','#6d8b78'][j];c.beginPath();c.moveTo(0,256);for(let x=0;x<=260;x+=8)c.lineTo(x,150+j*25+Math.sin(x*.027+j)*19+Math.sin(x*.08)*5);c.lineTo(256,256);c.fill();}
    for(let j=0;j<12;j++){const x=(j*53)%256;c.fillStyle=j%2?'#718772':'#849580';c.fillRect(x,160,2,96);c.beginPath();c.moveTo(x-14,224);c.lineTo(x+1,126+(j%3)*13);c.lineTo(x+17,224);c.fill();}
  } else if(kind==='stone') {
    c.fillStyle='#dedbd3';c.fillRect(0,0,256,256);
    for(let i=0;i<1400;i++){const x=(i*73)%256,y=(i*151+Math.floor(i/256)*11)%256;c.fillStyle=i%3?'#d5d1c8':'#e8e5dd';c.fillRect(x,y,1,1);}
    c.fillStyle='#cbc5ba';c.fillRect(0,0,256,1);c.fillRect(0,0,1,256);
  } else {
    c.fillStyle='#b79d7a';c.fillRect(0,0,256,256);
    for(let i=0;i<120;i++){c.strokeStyle=i%3?'#ad9271':'#c3ab89';c.lineWidth=.5;c.beginPath();c.moveTo((i*47)%256,0);c.bezierCurveTo((i*47)%256+6,70,(i*47)%256-6,190,(i*47)%256,256);c.stroke();}
    c.fillStyle='#8d765d';for(let x=0;x<256;x+=64)c.fillRect(x,0,1,256);
  }
  const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;
  if(!['landscape','contact'].includes(kind)){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(kind==='stone'?8:5,kind==='stone'?7:6);}
  cache.set(kind,t);return t;
}
function mat(color,kind,metalness=0) {
  const key=[color,kind,metalness].join('|');
  if(!cache.has(key)) { const m=new T.MeshStandardMaterial({color,map:kind?texture(kind):null,roughness:metalness?.45:.83,metalness});m.userData.galleryShared=true;cache.set(key,m); }
  return cache.get(key);
}
function solid(g,color,x,y,z,w,h,d,geo=cube,kind=null,metal=0) {
  const o=new T.Mesh(geo,mat(color,kind,metal));o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=o.receiveShadow=true;g.add(o);return o;
}
function panel(g,color,x,y,z,w,h,d=.06) {return solid(g,color,x,y,z,w,h,d);}
function text(g,line,x,y,z,w=3,color=palette.dark) {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');
  c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font='500 29px Georgia, Malgun Gothic, sans-serif';
  line.split('\n').forEach((part,i,all)=>c.fillText(part,256,64+(i-(all.length-1)/2)*38,490));
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
  const o=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));o.position.set(x,y,z);g.add(o);return o;
}
function windowPanel(g,x,z,w=4,h=3.7,y=3.2) {
  panel(g,palette.oak,x,y,z,w+.18,h+.18,.14);
  const pane=new T.Mesh(new T.PlaneGeometry(w,h),mat('#ffffff','landscape'));pane.position.set(x,y,z+.09);g.add(pane);
  panel(g,palette.ivory,x,y,z+.13,.055,h,.05);panel(g,palette.ivory,x,y-h*.15,z+.13,w,.055,.05);
  panel(g,palette.stone,x,y-h/2-.1,z+.2,w+.4,.14,.55);
}
const contactPlane=new T.PlaneGeometry(1,1);
function shadow(g,x,z,w,d) {
  if(!cache.has('shadowMaterial')){const m=new T.MeshBasicMaterial({map:texture('contact'),transparent:true,depthWrite:false,opacity:.6});m.userData.galleryShared=true;cache.set('shadowMaterial',m);}
  const plane=new T.Mesh(contactPlane,cache.get('shadowMaterial'));plane.rotation.x=-Math.PI/2;plane.position.set(x,.052,z);plane.scale.set(w,d,1);g.add(plane);
}
function foliage(g,x,z) {
  solid(g,palette.stone,x,.36,z,.36,.72,.36,cylinder);
  for(let i=0;i<7;i++){const a=i*2.4;const o=solid(g,i%2?'#819478':'#a1ad8c',x+Math.sin(a)*.2,.9+i*.12,z+Math.cos(a)*.18,.12,.4,.2,leaf);o.rotation.z=Math.sin(a)*.6;}
}
function bottle(g,x,y,z,color,index=0,scale=1) {
  const body=index%3===0?cylinder:cube;
  solid(g,color,x,y+.32*scale,z,(body===cube?.38:.23)*scale,.58*scale,(body===cube?.25:.23)*scale,body);
  panel(g,palette.paper,x,y+.32*scale,z+.145*scale,.24*scale,.21*scale,.012);
  solid(g,palette.brass,x,y+.65*scale,z,.1*scale,.12*scale,.1*scale,cylinder,null,.45);
  solid(g,palette.dark,x,y+.77*scale,z,.24*scale,.14*scale,.21*scale);
}
function artwork(g,x,z,color,w=2.4,h=2.6) {
  panel(g,palette.brass,x,2.9,z,w+.12,h+.12,.09);
  panel(g,palette.paper,x,2.9,z+.06,w,h,.035);
  solid(g,color,x-.17,3.04,z+.095,w*.28,h*.27,.018,leaf);
  panel(g,palette.green,x+.27,2.48,z+.12,w*.23,.035,.015);
  for(let i=0;i<3;i++)panel(g,palette.stone,x,2.13-i*.08,z+.12,w*.56,.012,.01);
}
function architecture(g,room) {
  const {width:w,depth:d,height:h}=GALLERY[room],wood=room==='books'||room==='salon';
  solid(g,palette.stone,0,-.22,0,w+.8,.42,d+.8);
  solid(g,'#ffffff',0,.005,0,w,.04,d,cube,wood?'wood':'stone');
  // The front wall and roof are cut away; full-height back walls establish scale.
  panel(g,palette.ivory,0,h/2,-d/2,w,h,.3);
  panel(g,palette.ivory,-w/2,h/2,-d/4,.3,h,d/2);
  panel(g,palette.ivory,-w/2,.6,d/4,.3,1.2,d/2);
  panel(g,palette.stone,0,.14,-d/2+.18,w,.26,.1);
  panel(g,palette.brass,0,h-.2,-d/2+.18,w,.035,.04);
  for(const x of [-w/2+.6,w/2-.6]) {
    panel(g,palette.ivory,x,h/2,-d/2+.4,.4,h,.4);
    panel(g,palette.brass,x,h-.6,-d/4,.045,.045,d/2);
  }
  // Thin beams and emissive strips suggest skylights without extra shadow lights.
  for(const x of [-w*.32,0,w*.32]) {
    panel(g,palette.stone,x,h-.12,-d*.27,.14,.16,d*.43);
    panel(g,'#f7edcf',x,h-.23,-d*.27,.08,.03,d*.38);
  }
  for(const x of [-w*.32,w*.32])windowPanel(g,x,-d/2+.23,wood?4.5:3.8,wood?1.9:3.5,wood?5.5:3.2);
  if(wood){const sideView=new T.Group();sideView.position.set(-w/2+.08,0,5.5);sideView.rotation.y=Math.PI/2;g.add(sideView);windowPanel(sideView,0,0,7,4.1,3.55);}
  for(const x of [-w/2+.8,w/2-.8])foliage(g,x,-d/2+1);
  if(room==='lobby'||room==='salon'){
    for(const door of GALLERY[room].doors)gateway(g,door.x,door.z,door.label,door.yaw);
    return;
  }
  const thresholdX=room==='scents'?w/2-.8:-w/2+.8;
  // Both portals keep the lobby's left/right wing relationship.
  const door=new T.Group();door.position.set(thresholdX,0,0);door.rotation.y=room==='scents'?-Math.PI/2:Math.PI/2;g.add(door);
  for(const x of [-1.55,1.55])panel(door,palette.oak,x,1.7,0,.16,3.4,.22);
  panel(door,palette.oak,0,3.43,0,3.3,.16,.22);text(door,'LOBBY · 로비로',0,3.85,.02,3);
  panel(door,palette.brass,0,.05,.1,3.05,.03,.75);
}
function gateway(g,x,z,title,yaw=0,camp=false) {
  const door=new T.Group();door.position.set(x,0,z);door.rotation.y=yaw;g.add(door);
  for(const side of [-1,1]){
    panel(door,camp?'#728b7c':palette.oak,side*1.75,2,0,.16,4,.25);
    panel(door,palette.brass,side*1.64,2,.08,.025,3.85,.04);
  }
  panel(door,camp?'#728b7c':palette.oak,0,4.05,0,3.65,.16,.25);
  text(door,title,0,4.55,.1,4,camp?'#5d7669':palette.dark);
  panel(door,camp?'#b8c9ba':'#c6baa4',0,.05,0,3.3,.035,2.5);
  // The threshold remains open. No invisible collider or click is needed.
  for(const side of [-1,1])panel(door,palette.brass,side*1.6,.072,0,.035,.015,2.3);
}
function noteBoard(g,p,title,side=false,live=false) {
  const board=new T.Group();board.position.set(p.x,0,p.z);if(side)board.rotation.y=Math.PI/2;g.add(board);
  panel(board,palette.oak,0,1.9,0,3.2,2.4,.15);panel(board,'#a8b29a',0,1.9,.09,3,2.2,.03);
  if(live)publicBoardSurface(board,0,1.9,.13,3,2.2);
  else for(let i=0;i<9;i++){const note=panel(board,['#ece0b8','#dcc8ce','#d7dfc7'][i%3],-.94+(i%3)*.93,2.55-Math.floor(i/3)*.63,.13,.65,.47,.02);note.rotation.z=i%2?.07:-.04;}
  text(board,title,0,3.55,.1,3.7);
}
function lobby(g,content,hotspots) {
  const r=GALLERY.lobby;
  // A generous central atrium: low furniture keeps sightlines open to four wings.
  text(g,'BOOKS & SCENTS ARCHIVE\n향과 문장 사이, 당신의 이야기',0,5.8,-13.77,9.5);
  panel(g,'#d3c5ac',0,.033,1,7.5,.012,22);
  for(const x of [-3.7,3.7])panel(g,palette.brass,x,.043,1,.035,.006,21.5);
  for(const z of [-4.7,7])panel(g,palette.brass,0,.044,z,7.5,.006,.03);
  const f=r.fountain;
  shadow(g,f.x,f.z,6.8,6.8);
  solid(g,palette.stone,f.x,.18,f.z,2.4,.36,2.4,cylinder);
  solid(g,'#aebfb3',f.x,.37,f.z,2.16,.06,2.16,cylinder);
  solid(g,palette.ivory,f.x,.68,f.z,.65,1.05,.65,cylinder);
  solid(g,palette.brass,f.x,1.24,f.z,.74,.08,.74,cylinder,null,.55);
  bottle(g,f.x,1.31,f.z,'#a5b49b',0,2.25);
  text(g,'당신의 이야기에 향을 입히세요.',0,.7,1.52,4.8);
  hotspots.push({x:0,z:2,id:'lobby-today',title:'오늘의 향과 문장',type:'today'});
  for(const b of r.benches){couch(g,b.x,b.z,b.x<0?'#b0b9a4':'#c5b5bc');shadow(g,b.x,b.z,4.4,2.8);foliage(g,b.x+(b.x<0?-2:2),b.z);}
  const desk=r.reception;
  panel(g,palette.oak,desk.x,.65,desk.z,desk.w,1.3,desk.d);
  panel(g,palette.paper,desk.x,1.34,desk.z,desk.w+.12,.1,desk.d+.1);
  for(let i=0;i<16;i++)panel(g,'#b89f7e',desk.x-desk.w/2+.2+i*.3,.68,desk.z+.72,.045,1.15,.035);
  panel(g,palette.dark,desk.x-.7,1.65,desk.z,.65,.45,.04);
  bottle(g,desk.x+1.3,1.42,desk.z,'#c4b18c',1,.6);
  text(g,'WELCOME · 천천히 둘러보세요',desk.x,.7,desk.z+.76,4.3);
  noteBoard(g,r.board,'솔로만 프로젝트 · 참가 안내');
  hotspots.push({x:r.board.x,z:r.board.z+.8,id:'solo-board',title:'솔로만 프로젝트 참가신청',type:'solo'});
  panel(g,palette.paper,r.exhibit.x,.6,r.exhibit.z,r.exhibit.w,1.2,r.exhibit.d);
  for(let i=0;i<5;i++){bottle(g,r.exhibit.x-1.4+i*.7,1.24,r.exhibit.z,['#aab6a3','#c8b28e','#baa9be'][i%3],i,.75);}
  text(g,'작은 향기 전시 · 오늘의 컬렉션',r.exhibit.x,.64,r.exhibit.z+.73,4);
  hotspots.push({x:r.exhibit.x,z:r.exhibit.z+1.4,id:'lobby-collection',title:'작은 컬렉션 · 향 조합하기',type:'compose'});
  for(const x of [-11.8,11.8]){
    artwork(g,x,-13.76,x<0?'#b6a0ae':'#98ad9d',2.4,2.7);
    solid(g,palette.stone,x,3.35,-4.5,.24,6.7,.24,cylinder);
    solid(g,palette.brass,x,.1,-4.5,.34,.2,.34,cylinder,null,.3);
  }
  gateway(g,r.campGate.x,r.campGate.z,'별빛 캠핑장 · CAMPFIRE',-.3,true);
  // A small planted frame suggests the forest awaiting beyond the camp entrance.
  for(const x of [r.campGate.x-2.1,r.campGate.x+2.1])foliage(g,x,r.campGate.z);
}
function cafeChair(g,seat) {
  const chair=new T.Group();chair.position.set(seat.x,0,seat.z);chair.rotation.y=seat.yaw;g.add(chair);
  const bar=seat.table===5,y=bar?1:.48;
  solid(chair,bar?'#b3a08a':'#a1ae99',0,y,0,.31,.13,.31,cylinder);
  panel(chair,palette.oak,0,y+.27,-.25,.56,.44,.075);
  for(const x of [-.23,.23])for(const z of [-.23,.23])panel(chair,palette.dark,x,y/2,z,.045,y,.045);
  if(bar){panel(chair,palette.brass,0,.36,.2,.5,.04,.04);}
}
function cafe(g,content,hotspots) {
  const r=GALLERY.salon,c=r.counter;
  text(g,'SCENT CAFÉ\n향을 닮은 대화, 잠시의 쉼',0,4.9,-13.77,8);
  panel(g,'#e4daca',0,2.05,-13.7,11,2.8,.16);
  for(const x of [-3.8,0,3.8]){
    panel(g,palette.oak,x,2,-13.5,3.3,.08,.6);
    for(let i=0;i<5;i++)solid(g,['#c4b89e','#abb69d','#c1a8ae'][i%3],x-1.1+i*.55,2.28,-13.45,.17,.5,.17,cylinder);
  }
  text(g,'COFFEE  /  TEA  /  ADE  /  DESSERT',0,3.55,-13.49,7.3);
  panel(g,palette.oak,c.x,.72,c.z,c.w,1.44,c.d);
  panel(g,palette.paper,c.x,1.48,c.z,c.w+.16,.14,c.d+.15);
  for(let i=0;i<31;i++)panel(g,'#b89e7d',c.x-c.w/2+.2+i*.34,.73,c.z+c.d/2+.035,.045,1.3,.045);
  panel(g,palette.dark,-3,1.83,c.z,1.5,.6,.65);panel(g,palette.brass,-3,1.83,c.z+.34,1.2,.4,.03);
  for(let i=0;i<3;i++)solid(g,palette.paper,-3.4+i*.4,1.61,c.z+.55,.11,.15,.11,cylinder);
  panel(g,palette.dark,3.7,1.76,c.z,.6,.4,.06);
  for(const [i,p] of r.cases.entries()){
    panel(g,palette.oak,p.x,.55,p.z,p.w,1.1,p.d);
    panel(g,'#d8dfd1',p.x,1.4,p.z,p.w,.65,p.d);
    for(let j=0;j<4;j++)panel(g,i?'#a8b799':'#dfc3a0',p.x-.7+j*.45,1.78,p.z,.29,.12,.4);
    text(g,i?'TEA LIBRARY':'FRESH BAKERY',p.x,.65,p.z+.68,2.2);
    foliage(g,p.x+(p.x<0?-1.8:1.8),p.z);
  }
  for(const t of CAFE_TABLES){
    if(t.shape!=='bar'){
      solid(g,t.id%2?'#cfc6b4':'#c9cbbb',t.x,.035,t.z,t.w/2+1.6,.012,t.d/2+1.6,cylinder);
      shadow(g,t.x,t.z,t.w+3,t.d+3);
    }
    const round=t.shape==='round';
    if(round){solid(g,palette.oak,t.x,t.top-.06,t.z,t.w/2,.12,t.d/2,cylinder);solid(g,palette.dark,t.x,(t.top-.12)/2,t.z,.08,t.top-.12,.08,cylinder);solid(g,palette.dark,t.x,.06,t.z,.38,.08,.38,cylinder);}
    else{
      panel(g,palette.oak,t.x,t.top-.06,t.z,t.w,.12,t.d);
      for(const dx of [-t.w/2+.2,t.w/2-.2])for(const dz of [-t.d/2+.15,t.d/2-.15])panel(g,palette.dark,t.x+dx,(t.top-.12)/2,t.z+dz,.08,t.top-.12,.08);
    }
    if(t.id!==5){solid(g,palette.paper,t.x,t.top+.14,t.z,.09,.26,.09,cylinder);solid(g,'#b9a6b1',t.x,t.top+.36,t.z,.18,.14,.18,leaf);}
    hotspots.push({x:t.x,z:t.z,id:'cafe-table-'+t.id,title:t.label,type:'table'});
  }
  for(const seat of SEATS.filter(s=>s.room==='salon'))cafeChair(g,seat);
  // Pendant shades are geometry only: no additional point lights or shadow maps.
  for(const x of [-7.5,0,6.5]){
    panel(g,palette.brass,x,4.8,-1.8,.025,2,.025);
    solid(g,'#d6c49e',x,3.75,-1.8,.65,.32,.65,new T.ConeGeometry(1,1,12));
    solid(g,'#f0dfb5',x,3.59,-1.8,.45,.025,.45,cylinder);
  }
  const view=new T.Group();view.position.set(-14.8,0,7);view.rotation.y=Math.PI/2;g.add(view);windowPanel(view,0,0,7,3.7,3.1);
  noteBoard(g,r.board,'향기카페 · 실제로 남긴 이야기',true,true);
  hotspots.push({x:r.board.x+1,z:r.board.z,id:'cafe-note-wall',title:'카페 포스트잇 · 이야기 남기기',type:'board'});
  for(const x of [-12,12])foliage(g,x,10.7);
  artwork(g,12.6,-13.76,'#9cad98',2.1,2.4);
}
function organ(g,x,z,w,rows,cols,colors) {
  panel(g,palette.oak,x,1.65,z,w,3.3,.56);
  panel(g,'#d5c7af',x,1.65,z+.3,w-.24,3.05,.05);
  for(let row=0;row<rows;row++){
    const yy=.28+row*(2.8/rows);panel(g,palette.oak,x,yy,z+.5,w-.12,.075,.75);
    for(let j=0;j<cols;j++)bottle(g,x-w*.43+j*w*.86/(cols-1),yy+.05,z+.61,colors[j%colors.length],row*cols+j,.43);
  }
}
function scents(g,content,hotspots) {
  const r=GALLERY.scents;
  shadow(g,0,-10.2,10,2.6);shadow(g,r.desk.x,r.desk.z,6.3,3.1);shadow(g,r.notes.x,r.notes.z,4.4,2.7);
  text(g,'BOOKS & SCENTS\nTHE SCENT MUSEUM',0,5.05,-11.78,7.6);
  organ(g,r.organ.x,r.organ.z,r.organ.w,6,12,['#b2bba4','#cbb18a','#b7a5bc','#a2b8bf']);
  text(g,'72 MAIN SCENTS',0,3.75,-9.6,4.3);
  hotspots.push({x:0,z:-9.3,id:'main-organ',title:'메인향 72개 · 나만의 향 조합하기',type:'compose'});
  content.scents.slice(0,5).forEach((s,i)=>{
    const p=r.plinths[i],height=1.05+(i%2)*.22;
    shadow(g,p.x,p.z,2.6,2.6);
    solid(g,palette.stone,p.x,.08,p.z,.85,.16,.85,cylinder);
    solid(g,palette.ivory,p.x,height/2+.12,p.z,.67,height,.67,cylinder);
    solid(g,palette.brass,p.x,height+.15,p.z,.72,.045,.72,cylinder,null,.55);
    bottle(g,p.x,height+.18,p.z,s.color,i,1.1);
    text(g,String(i+1).padStart(2,'0')+'  /  '+s.family,p.x,.73,p.z+.76,1.8);
    hotspots.push({x:p.x,z:p.z,id:s.id,title:s.name,type:'scent'});
  });
  for(const [i,c] of r.cabinets.entries()){organ(g,c.x,c.z,c.w,3,3,['#b8a5bc','#c7af88','#a2b9ac']);artwork(g,c.x,-11.78,i?'#a2b9ac':'#b8a5bc',2.4,2.5);}
  const {desk,notes}=r;
  for(const x of [-desk.w/2+.25,desk.w/2-.25])panel(g,palette.dark,x,.56,desk.z,.15,1.12,desk.d-.1);
  panel(g,palette.oak,desk.x,1.17,desk.z,desk.w,.18,desk.d);
  for(let i=0;i<4;i++){const strip=panel(g,palette.paper,-.65+i*.21,1.27,desk.z+.2,.1,.014,.55);strip.rotation.y=(i-2)*.11;}
  panel(g,'#9c8296',1.1,1.29,desk.z,.62,.08,.7);
  bottle(g,-1.6,1.28,desk.z,'#b2bba4',1,.65);
  text(g,'당신의 이야기에 향을 입히세요.',0,.68,desk.z+.94,4.2);
  hotspots.push({x:desk.x,z:desk.z,id:'balance',title:'72가지 메인향 · 나만의 향 조합하기',type:'compose'});
  panel(g,palette.oak,notes.x,.63,notes.z,notes.w,1.25,notes.d);
  for(let row=0;row<3;row++){panel(g,palette.stone,notes.x,1.3+row*.23,notes.z-.38+row*.21,notes.w-.2,.08,.31);for(let j=0;j<10;j++)bottle(g,notes.x-1.3+j*.29,1.35+row*.23,notes.z-.38+row*.21,['#c2b8a2','#b4bda9','#c6b0c4'][row],j,.26);}
  text(g,'T1–10  /  M1–10  /  L1–10',notes.x,.64,notes.z+.78,3.2);
  hotspots.push({x:notes.x,z:notes.z,id:'blend-organ',title:'블라인드 단일향 30개 · 조합하기',type:'compose'});
  text(g,'SCENT AS MEMORY',-6.4,5.25,-11.78,3.4);text(g,'A PERSONAL ARCHIVE',6.4,5.25,-11.78,3.7);
  ingredientGallery(g,r.exhibits,hotspots);
  noteBoard(g,r.board,'책과향기 · 함께 남긴 이야기',false,true);
  hotspots.push({x:r.board.x,z:r.board.z+.75,id:'museum-public-board',title:'실제 게시글 · 공방 방명록',type:'board'});
}
function exhibitAtlas(){
  if(cache.has('ingredientAtlas'))return cache.get('ingredientAtlas');
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d');
  INGREDIENTS.forEach((s,i)=>{const x=(i%4)*256,y=Math.floor(i/4)*128;c.fillStyle='#f0eadf';c.fillRect(x,y,256,128);c.fillStyle='#a58a5e';c.fillRect(x+108,y+22,40,2);c.textAlign='center';c.fillStyle='#4d5446';c.font='500 44px Georgia,sans-serif';c.fillText(s.code,x+128,y+85);});
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const material=new T.MeshBasicMaterial({map:texture});material.userData.galleryShared=true;cache.set('ingredientAtlas',material);return material;
}
function ingredientGallery(g,exhibits,hotspots){
  const labels=exhibitAtlas();
  for(const [i,s] of exhibits.entries()){
    const height=1.05+(i%3)*.07;
    panel(g,palette.stone,s.x,.1,s.z,s.w,.2,s.d);
    panel(g,palette.ivory,s.x,height/2+.15,s.z,s.w-.12,height,s.d-.12);
    panel(g,s.color,s.x,height+.18,s.z,s.w+.03,.045,s.d+.03);
    const study=createIngredientObject(s.code);study.position.set(s.x,height+.21,s.z);study.rotation.y=(i%3-1)*.18;g.add(study);
    const plaque=new T.PlaneGeometry(1.45,.725),uv=plaque.getAttribute('uv'),col=i%4,row=Math.floor(i/4);
    for(let j=0;j<uv.count;j++)uv.setXY(j,(col+uv.getX(j))/4,1-(row+1-uv.getY(j))/8);
    const card=new T.Mesh(plaque,labels);card.position.set(s.x,.72,s.z+s.d/2+.04);g.add(card);
    hotspots.push({x:s.x,z:s.z,id:s.id,title:s.code+' · 어떤 향일까요?',type:'ingredient',reach:2.15});
  }
  text(g,'TOP · T1–T10\n첫인상이 피어나는 곳',-10,3.7,-10.7,3.7);
  text(g,'MIDDLE · M1–M10\n이야기의 중심이 되는 향',10,3.7,-10.7,3.7);
  text(g,'LAST · L1–L10 · 오래 남는 여운',0,3.3,11.2,8);
}
function shelf(g,x,z,w,rows=5) {
  const height=rows*.76+.4;
  panel(g,palette.oak,x,height/2,z,w,height,.65);
  panel(g,'#c8b799',x,height/2+.02,z+.34,w-.22,height-.25,.04);
  const colors=['#8b9985','#b9a58c','#9d899a','#7f979b','#bba675','#ded3c2'];
  for(let row=0;row<rows;row++){
    const yy=.25+row*.76;panel(g,palette.oak,x,yy,z+.48,w-.1,.075,.8);
    for(let j=0;j<15;j++){
      const xx=x-w*.44+j*w*.88/14,h=.38+(j%4)*.055;
      panel(g,colors[(j+row*2)%colors.length],xx,yy+.06+h/2,z+.48,.17,h,.31);
      panel(g,palette.paper,xx,yy+.18,z+.645,.1,.014,.012);
    }
  }
}
function couch(g,x,z,color) {
  panel(g,palette.oak,x,.2,z,2.7,.22,1.1);panel(g,color,x,.5,z,2.8,.5,1.2);
  panel(g,color,x,.99,z-.48,2.8,.65,.22);
  for(const side of [-1,1]){panel(g,color,x+side*1.25,.82,z,.25,.5,1.2);panel(g,'#e2d6c4',x+side*.58,.8,z,1.05,.16,.88);}
}
function books(g,content,hotspots) {
  const r=GALLERY.books;
  panel(g,'#d7cfbc',0,.032,.3,13,.014,5.5);
  for(const x of [-6.3,6.3])panel(g,palette.brass,x,.044,.3,.025,.005,5.1);
  for(const s of r.shelves)shadow(g,s.x,s.z,5.4,2);
  for(const x of [-4,4,-10,10])shadow(g,x,Math.abs(x)===10?6:0,4.2,2.7);
  text(g,'THE READING GARDEN\n책의 숲, 머무는 문장',0,5.45,-12.78,8);
  r.shelves.forEach((s,i)=>{shelf(g,s.x,s.z,s.w);text(g,['감각과 기억','상상과 성장','사람과 관계','여행과 발견'][i],s.x,4.7,s.z+.45,3.9);hotspots.push({x:s.x,z:s.z,id:'shelf-'+i,title:'책장 살펴보기 · 도서와 추천',type:'book'});});
  const side=new T.Group();side.position.set(r.side.x,0,r.side.z);side.rotation.y=Math.PI/2;g.add(side);shelf(side,0,0,4.3);
  hotspots.push({x:r.side.x,z:r.side.z,id:'side-shelf',title:'옆 서가 · 책과 이야기',type:'book'});
  for(const [i,stand] of r.islands.entries()){
    const island=new T.Group();island.position.set(stand.x,0,stand.z);island.rotation.y=Math.PI/2;g.add(island);shelf(island,0,0,4.1,3);
    hotspots.push({x:stand.x,z:stand.z,id:'island-'+i,title:'독립 서가 · 취향을 나누는 책',type:'book'});shadow(g,stand.x,stand.z,2.5,5.2);
  }
  for(const column of r.columns){solid(g,palette.ivory,column.x,3.15,column.z,.25,6.3,.25,cylinder);solid(g,palette.stone,column.x,.15,column.z,.34,.3,.34,cylinder);}
  couch(g,-4,0,'#9eaa96');couch(g,4,0,'#b3a2ae');
  for(const x of [-3.9,3.9]){
    panel(g,palette.oak,x,.4,2.1,1.4,.12,.9);
    for(let i=0;i<3;i++)panel(g,['#98a98e','#b3a2ae','#bdab85'][i],x+.25,.52+i*.09,2.05,.58,.09,.4);
    solid(g,palette.paper,x-.35,.57,2.2,.1,.23,.1,cylinder);
    solid(g,palette.brass,x+(x<0?-1.4:1.4),1.2,-.5,.025,2.4,.025,cylinder,null,.4);
    solid(g,'#e9dfc6',x+(x<0?-1.4:1.4),2.35,-.5,.35,.22,.35,leaf);
  }
  solid(g,palette.oak,0,.65,3,1,.13,1,cylinder);solid(g,palette.dark,0,.3,3,.09,.6,.09,cylinder);
  content.books.forEach((b,i)=>panel(g,b.color,-.55+i*.36,.77,3,.27,.09,.4));
  hotspots.push({x:0,z:3,id:'books',title:'오늘의 문장과 책 이야기',type:'book'});
  for(const b of r.benches){couch(g,b.x,b.z,'#a4ad9d');foliage(g,b.x+(b.x<0?-1.9:1.9),b.z);}
  const reading=r.readingTable;
  panel(g,palette.oak,reading.x,.84,reading.z,reading.w,.14,reading.d);
  for(const dx of [-2.2,2.2])for(const dz of [-.5,.5])panel(g,palette.dark,dx,.4,reading.z+dz,.08,.8,.08);
  for(const seat of SEATS.filter(s=>s.group==='books-reading-table')){
    const chair=new T.Group();chair.position.set(seat.x,0,seat.z);chair.rotation.y=seat.yaw;g.add(chair);
    panel(chair,'#9baa92',0,.44,0,.58,.12,.58);panel(chair,palette.oak,0,.78,-.27,.58,.56,.08);
    for(const dx of [-.23,.23])for(const dz of [-.23,.23])panel(chair,palette.oak,dx,.2,dz,.045,.4,.045);
  }
  for(let i=0;i<3;i++){
    panel(g,palette.paper,-1.6+i*1.6,.94,reading.z,.55,.06,.65);
    panel(g,'#b1a18a',-1.6+i*1.6,.98,reading.z,.025,.006,.65);
  }
  hotspots.push({x:reading.x,z:reading.z,id:'reading-table',title:'긴 독서 테이블 · 책과 문장 추천',type:'book'});shadow(g,0,reading.z,6.8,3.2);
  // An open exhibition island: original illustrations rather than copied book covers.
  panel(g,palette.paper,0,.47,-5,5,.9,1.2);
  for(let i=0;i<5;i++){panel(g,['#879d8c','#b4a189','#9b889f'][i%3],-1.6+i*.8,.98,-5,.55,.08,.75);}
  // This island is collision geometry, not a decorative object that can be walked through.
  text(g,'TODAY’S READING · 오늘의 책',0,.53,-4.36,4.5);
  hotspots.push({x:0,z:-5,id:'reading-island',title:'오늘의 추천 도서 · 책 이야기',type:'book'});
  const wall=new T.Group();wall.position.set(r.board.x,0,r.board.z);wall.rotation.y=Math.PI/2;g.add(wall);
  panel(wall,palette.oak,0,1.85,0,3,2.3,.12);panel(wall,'#c7bca4',0,1.85,.08,2.8,2.1,.04);
  publicBoardSurface(wall,0,1.85,.13,2.8,2.1);
  text(wall,'책갈피 벽 · 한 줄의 마음',0,3.5,.1,3.5);
  hotspots.push({x:r.board.x,z:r.board.z,id:'note-wall',title:'책갈피 벽 · 추천과 한줄 메모',type:'board'});
  const gate=new T.Mesh(new T.TorusGeometry(.85,.06,6,32),mat('#90ab9c',null,.4));gate.position.set(r.portal.x,1.7,r.portal.z);g.add(gate);
  panel(g,palette.stone,r.portal.x,.2,r.portal.z,1.6,.4,.5);
  text(g,'문장 너머 · 혼자 읽는 세계',r.portal.x,3.15,r.portal.z,3.4);
  hotspots.push({x:r.portal.x,z:r.portal.z,id:'beyond-portal',title:'문장 너머로 · 혼자 읽는 세계',type:'beyond'});
}
export function buildGallery(g,room,content,hotspots) {
  architecture(g,room);
  ({scents,books,lobby,salon:cafe})[room](g,content,hotspots);
}
