import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// Original port-inspired scenery, made of actual 3D coastlines and architecture.
// Only the selected port is allocated. Static geometry is batched by material.
export function createPortWorld(parent,id){
 const root=new T.Group();root.name='voyage-port-'+id;parent.add(root);const batches=new Map(),owned=[],cube=new T.BoxGeometry(),sphere=new T.SphereGeometry(1,12,8),cylinder=new T.CylinderGeometry(1,1,1,9),matrix=new T.Matrix4(),q=new T.Quaternion();let count=0;
 const put=(geo,color,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{q.setFromEuler(new T.Euler(rx,ry,rz));matrix.compose(new T.Vector3(x,y,z),q,new T.Vector3(sx,sy,sz));const g=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(matrix);g.deleteAttribute('uv');if(!g.attributes.color)g.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(1),3));if(!batches.has(color))batches.set(color,[]);batches.get(color).push(g);count++;};
 const box=(c,x,y,z,w,h,d,ry=0)=>put(cube,c,x,y,z,w,h,d,0,ry),orb=(c,x,y,z,w,h,d)=>put(sphere,c,x,y,z,w,h,d),pole=(c,x,y,z,r,h)=>put(cylinder,c,x,y,z,r,h,r);
 const seaWall='#8c9691',white='#e8e5d7',glass='#668e9d',wood='#8f7964',leaves='#5e8766';
 function ground(w=610,d=150,color='#8d9c7e'){box(color,0,.2,-35,w,2,d);box(seaWall,0,.1,42,w,3,7);box('#c4bda7',0,1.4,31,w,1.1,15);for(let x=-w/2+8;x<w/2;x+=14){pole('#4e6067',x,5.8,34,.12,8.8);orb('#f5d59f',x,10.2,34,.35,.4,.35);}}
 function roof(x,y,z,w,d,color='#755c53'){const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,w*.44);shape.lineTo(w/2,0);shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,steps:1});put(g,color,x,y,z-d/2);g.dispose();}
 function house(x,z,w,h,d,color,style=0){box(color,x,h/2+2,z,w,h,d);roof(x,h+2,z,w+1,d+1,style?'#66827c':'#715d56');for(const side of [-1,1])box(white,x+side*(w/2-.3),h/2+2,z+d/2+.1,.4,h,.2);for(let y=5;y<h;y+=4.5)for(let xx=-w/2+2;xx<w/2-1;xx+=3.7){box(white,x+xx,y,z+d/2+.14,1.9,2.5,.12);box(glass,x+xx,y,z+d/2+.24,1.35,1.95,.12);}box(wood,x,3.7,z+d/2+.25,1.8,3.4,.2);}
 function hill(x,z,w,h,d,color='#648575',seed=0){const g=new T.SphereGeometry(1,24,16),p=g.attributes.position,colors=[];for(let i=0;i<p.count;i++){const a=p.getX(i),b=p.getY(i),c=p.getZ(i),noise=Math.sin(a*12+seed)*Math.sin(c*8+seed),f=1+.035*noise,shade=.89+.09*noise+.025*Math.sin(a*37+c*29);p.setXYZ(i,a*f,b*f,c*f);colors.push(shade*1.015,shade,shade*.97);}g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();put(g,color,x,-h*.18,z,w,h,d);g.dispose();}
 function conifer(x,z,h=13){pole('#76684f',x,h*.38,z,.32,h*.75);const g=new T.ConeGeometry(1,1,9);for(let i=0;i<3;i++)put(g,i%2?'#385f52':'#456e59',x,h*(.42+i*.2),z,h*(.24-i*.045),h*.6,h*(.24-i*.045));g.dispose();}
 function palm(x,z,h=15){pole('#9b8765',x,h*.48,z,.35,h);const g=new T.BufferGeometry(),v=[],ix=[];for(let j=0;j<7;j++){const a=j/7*Math.PI*2;const base=v.length/3;v.push(0,0,0,Math.cos(a-.18)*3,-.2,Math.sin(a-.18)*3,Math.cos(a)*6.5,-2,Math.sin(a)*6.5,Math.cos(a+.18)*3,-.2,Math.sin(a+.18)*3);ix.push(base,base+1,base+2,base,base+2,base+3,base+2,base+1,base,base+3,base+2,base);}g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();put(g,leaves,x,h,z);g.dispose();}
 function sailboat(x,z,size=1){orb('#ece6d6',x,.7,z,2.2*size,.85*size,6*size);pole(wood,x,7*size,z,.08*size,13*size);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,0,11*size,0,4.2*size,0,0],3));g.setIndex([0,1,2,2,1,0]);g.computeVertexNormals();put(g,'#e5dfcb',x,2,z);g.dispose();}
 function crane(x,z,h=32){for(const side of [-1,1])box('#b6b7a1',x+side*5,h/2,z,1.2,h,1.2);box('#bdc8c4',x,h,z,30,1.3,1.4);box('#778a8c',x+10,h*.65,z,.1,h*.55,.1);box('#bf8c60',x-8,h+1,z,4,2,3);}
 if(id==='bergen'){
  ground();for(const [x,z,w,h,d,c]of [[-270,-145,220,150,130,'#536e66'],[250,-175,220,185,120,'#5a756d'],[-40,-215,230,125,110,'#718b7c']])hill(x,z,w,h,d,c,x);
  const colors=['#a95042','#ca9d5b','#d9c6a0','#ab6546','#b74737','#dfd1b1'];for(let i=0;i<23;i++)house(-238+i*21,10,18,17+i%4*2,21,colors[i%colors.length]);
  for(let i=0;i<26;i++)conifer(-270+i*22,-50-(i%4)*16,11+(i%4)*3);for(const x of [-200,190]){box(wood,x,1.2,67,8,1.2,48);sailboat(x+13,65,1.2);}for(let i=0;i<5;i++)orb('#a2ab9d',-260+i*120,6,-12,15,6,12);
 }else if(id==='copenhagen'){
  ground(620,140,'#a4a58b');const colors=['#c99069','#e4c078','#9c605d','#b4c3bd','#91a7ae','#d5af98'];for(let i=0;i<29;i++)house(-255+i*18,3,15.5,18+i%4*2.1,18,colors[i%colors.length],i%3===0);
  for(const x of [-140,65,210]){box('#d0b999',x,25,-72,19,46,22);const g=new T.ConeGeometry(9,34,7);put(g,'#668d81',x,62,-72);g.dispose();pole('#b6a574',x,83,-72,.18,10);}
  for(const x of [-220,-150,110,175,240])sailboat(x,67,1.3);box('#e5e5d8',-210,9,-70,80,16,35);box('#687f83',-210,19,-70,98,2.5,43);
 }else if(id==='madeira'){
  ground(650,180,'#8a9c6d');for(let i=0;i<6;i++)hill(-290+i*110,-130-(i%2)*45,130,95+(i%3)*32,130,i%2?'#719564':'#5d835e',i);
  for(let row=0;row<4;row++)for(let i=0;i<11;i++){const x=-240+i*44,z=-5-row*36;let y=1;for(let j=0;j<6;j++){const h=95+(j%3)*32,dx=(x-(-290+j*110))/130,dz=(z-(-130-(j%2)*45))/130;if(dx*dx+dz*dz<1)y=Math.max(y,h*Math.sqrt(1-dx*dx-dz*dz)-h*.18+3);}box('#e3dfcc',x,y+8,z,25,14,21);roof(x,y+15,z,27,23,'#b57856');for(const dx of [-7,0,7])box('#6b8d91',x+dx,y+9,z+10.6,2.1,3,.15);}
  box('#778f7b',0,2,15,600,2,8);for(let x=-280;x<=280;x+=28)palm(x,26,12);for(const x of [-240,220])crane(x,17,27);for(let i=0;i<5;i++)sailboat(150+i*16,71,1);
 }else if(id==='seychelles'){
  // Curved pale beach and shallow turquoise shoals in front of granite islands.
  for(const [x,z,w,h,d,c]of [[0,-88,210,100,140,'#6d936e'],[-210,-105,140,80,100,'#5d886c'],[235,-110,150,105,120,'#70956f']])hill(x,z,w,h,d,c,x);
  orb('#e7d7ad',0,-1,-8,300,5,78);for(let i=0;i<18;i++){const x=-270+i*32,z=3+(i%4)*9;orb(i%2?'#b6b2a3':'#d1c9b8',x,3.2,z,8+i%4*2,5+i%3*3,6+i%4);}
  for(let i=0;i<31;i++)palm(-270+i*18,-12-(i%4)*12,13+i%3*2);for(const x of [-155,-95,100,160]){house(x,-7,21,8,22,'#ede2c3',1);}
  box('#a79775',0,1,73,8,1,100);box('#a79775',0,1,120,58,1,7);for(const x of [-25,25])sailboat(x,128,1.5);
  const shallow=new T.Mesh(new T.CircleGeometry(350,48),new T.MeshBasicMaterial({color:'#7bd4c6',transparent:true,opacity:.22,depthWrite:false}));shallow.rotation.x=-Math.PI/2;shallow.scale.y=.36;shallow.position.set(0,.025,16);root.add(shallow);owned.push(shallow.geometry,shallow.material);
 }else if(id==='singapore'){
  ground(700,190,'#7d997b');for(let i=0;i<29;i++){const x=-285+i*21,z=-60-(i%4)*24,h=25+(i*37%68),w=14+(i%3)*4;box(i%2?'#88a2aa':'#627e8e',x,h/2+2,z,w,h,17);box('#c4d0cc',x,h+2,z,w+1,1,18);for(let y=7;y<h;y+=6)box('#bacbc8',x,y,z+8.6,w-.5,.35,.1);for(const dx of [-w*.3,w*.3])box('#4f707c',x+dx,h/2+2,z+8.7,.35,h,.1);}
  // Three slender towers and a broad sky garden evoke the Marina waterfront.
  for(const x of [90,122,154]){box('#a6b9ba',x,39,-15,19,74,22);for(let y=8;y<75;y+=5)box('#708d97',x,y,-3.8,17,.6,.15);}box('#d5ddcf',122,78,-15,104,4,27);orb('#6b966d',122,81,-15,48,2,10);
  for(const x of [-100,-60,-20]){pole('#967964',x,11,4,.8,20);const g=new T.ConeGeometry(8,7,12,1,true);put(g,'#749774',x,23,4);g.dispose();}
  for(const x of [-290,260,310])crane(x,24,40);for(let i=0;i<16;i++)box(i%3?'#af775c':'#5c8793',-300+(i%4)*13,4+Math.floor(i/4)*3.2,-2,12,3,6);for(let x=-250;x<250;x+=30)palm(x,24,12);
 }
 for(const [color,parts]of batches){const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());const material=new T.MeshStandardMaterial({color,vertexColors:true,roughness:.88,metalness:color===glass?.12:0});if(color===glass){material.emissive.set('#879f9d');material.emissiveIntensity=.08;}if(color==='#f5d59f'){material.emissive.set(color);material.emissiveIntensity=.45;}root.add(new T.Mesh(geometry,material));owned.push(geometry,material);}cube.dispose();sphere.dispose();cylinder.dispose();
 return {root,state:{id,batchedMaterials:batches.size,objects:count,triangles:[...root.children].reduce((n,m)=>n+(m.geometry?(m.geometry.index?.count||m.geometry.attributes.position.count)/3:0),0)},dispose(){root.removeFromParent();owned.forEach(x=>x.dispose());}};
}
