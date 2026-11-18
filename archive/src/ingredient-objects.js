import * as T from 'three';

// Original small botanical studies. Vertex colour lets all thirty still-life
// sculptures bake into one draw call, without image downloads or glass layers.
const geometryCache=new Map();
const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.63});
material.userData.galleryShared=true;
const C={leaf:'#567b43',light:'#82994b',stem:'#71533c',cream:'#f5e6c5',pink:'#db7188',purple:'#9c7aac',white:'#f5f1df',yellow:'#e9bd48'};
function geometry(key,color,make){
 const id=key+color;if(geometryCache.has(id))return geometryCache.get(id);
 const g=make(),p=g.getAttribute('position'),colors=[],base=new T.Color(color);
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),v=.93+.065*Math.sin(x*17+z*11)*Math.cos(y*23)+.035*y;
  const c=base.clone().multiplyScalar(v);colors.push(c.r,c.g,c.b);
 }
 g.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometryCache.set(id,g);return g;
}
function add(p,g,x,y,z,sx=1,sy=sx,sz=sx){const o=new T.Mesh(g,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
function sphere(p,color,x,y,z,rx,ry=rx,rz=rx,shape='round'){
 const segments=shape==='leaf'?10:Math.max(rx,ry,rz)>.24?20:Math.max(rx,ry,rz)>.12?12:8;
 const geo=geometry('sphere-'+shape+'-'+segments,color,()=>{
  const g=new T.SphereGeometry(1,segments,segments>12?12:6),v=g.getAttribute('position');
  for(let i=0;i<v.count;i++){
   let a=v.getX(i),b=v.getY(i),c=v.getZ(i);const angle=Math.atan2(c,a);
   if(shape==='apple'){const r=1+.12*b+.035*Math.cos(5*angle)*(1-b*b);a*=r;c*=r;b*=1-.22*Math.pow(Math.abs(b),8);}
   if(shape==='lemon'){const r=.84+.16*Math.abs(b);a*=r;c*=r;b*=1+.2*Math.pow(Math.abs(b),6);}
   if(shape==='quince'){const r=.88-.22*b+.04*Math.cos(5*angle);a*=r;c*=r;b*=.93;}
   if(shape==='berry'){a*=.7+.3*b;c*=.7+.3*b;}
   if(shape==='leaf'){a*=Math.sqrt(Math.max(0,1-b*b))+.08;c*=.16;}
   v.setXYZ(i,a,b,c);
  }
  g.computeVertexNormals();return g;
 });return add(p,geo,x,y,z,rx,ry,rz);
}
function cylinder(p,color,x,y,z,r,h,top=r){return add(p,geometry('cylinder-'+top/r,color,()=>new T.CylinderGeometry(top/r,1,1,16)),x,y,z,r,h,r);}
function twig(p,points,r=.017,color=C.stem){const key='twig-'+JSON.stringify(points)+'-'+r;return add(p,geometry(key,color,()=>new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),10,r,5,false)),0,0,0);}
function leaf(p,x,y,z,size=.18,angle=0,color=C.leaf){const o=sphere(p,color,x,y,z,size*.42,size,size,'leaf');o.rotation.set(.35,angle,.6);return o;}
function stemLeaf(p,top=.64){twig(p,[[0,.02,0],[.02,top*.6,0],[0,top,0]]);leaf(p,.12,top*.5,0,.18,-.3);}
function fruitLeaf(p,y=.7){twig(p,[[0,y-.08,0],[.02,y+.08,0],[.07,y+.12,0]],.025);leaf(p,.15,y+.07,0,.2,-.5);}
function citrusSlice(p,color,x,z,r=.31){
 cylinder(p,C.cream,x,.055,z,r,.075);cylinder(p,C.cream,x,.097,z,r*.91,.014);
 for(let i=0;i<9;i++){
  const a=i*Math.PI*2/9;
  const g=geometry('segment-'+i,color,()=>new T.CircleGeometry(1,4,a+.035,Math.PI*2/9-.07));
  const m=add(p,g,x,.11,z,r*.83,r*.83,r*.83);m.rotation.x=-Math.PI/2;
 }
 sphere(p,C.cream,x,.12,z,.035,.012,.035);
}
function flower(p,x,y,z,color,petals=5,size=.25){
 for(let i=0;i<petals;i++){const a=i*Math.PI*2/petals,o=sphere(p,color,x+Math.cos(a)*size*.54,y,z+Math.sin(a)*size*.54,size*.65,.06,size*.34);o.rotation.y=-a;}
 sphere(p,C.yellow,x,y+.035,z,.07,.045,.07);
}
function sprig(p,color=C.leaf,round=false){
 twig(p,[[-.1,.02,.06],[0,.4,0],[.08,.9,-.04]]);
 for(let i=0;i<6;i++){const side=i%2?1:-1,y=.2+i*.11,x=(y-.4)*.2+side*.12;
  twig(p,[[x-side*.12,y-.07,0],[x,y,0]],.008);
  if(round){const l=sphere(p,color,x,y,.015,.105,.1,.03);l.rotation.z=side*.4;}
  else leaf(p,x,y,0,.16,side*.65,color);
 }
}
const MODELS={
 T1(p){sphere(p,'#96ab43',0,.34,0,.33,.32,.32,'apple');fruitLeaf(p,.61);},
 T2(p){sphere(p,'#e6ba62',-.12,.34,-.12,.33,.31,.33);fruitLeaf(p,.61);citrusSlice(p,'#e78b85',.16,.23,.29);},
 T3(p){sprig(p);leaf(p,-.18,.08,.19,.23,.7);leaf(p,.12,.06,.22,.19,-.7);},
 T4(p){sphere(p,'#be4146',0,.34,0,.36,.38,.34,'apple');fruitLeaf(p,.65);},
 T5(p){const o=sphere(p,'#efce4b',0,.28,0,.29,.39,.28,'lemon');o.rotation.z=-1.05;leaf(p,-.18,.49,-.06,.18,.5);},
 T6(p){sphere(p,'#e99b38',-.08,.28,-.07,.34,.26,.33,'apple');fruitLeaf(p,.48);citrusSlice(p,'#ecac43',.2,.22,.23);},
 T7(p){for(let row=0;row<4;row++)for(let i=0;i<4-row;i++){const a=i*2.4+row*.5,r=.17-row*.035;sphere(p,'#a6bd55',Math.sin(a)*r,.64-row*.15,Math.cos(a)*r,.125);}
  twig(p,[[0,.65,0],[.03,.83,0],[.18,.88,0]],.023);leaf(p,.18,.77,0,.19,.6);},
 T8(p){sphere(p,'#c9444c',0,.31,0,.34,.35,.3,'berry');
  for(let row=0;row<4;row++)for(let i=0;i<8;i++){const a=i*Math.PI/4+row*.3,b=-.65+row*.4,r=Math.sqrt(1-b*b)*(.7+.3*b);sphere(p,'#e9c475',Math.sin(a)*.342*r,.31+b*.35,Math.cos(a)*.305*r,.012,.019,.009);}
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5,l=leaf(p,Math.sin(a)*.09,.63,Math.cos(a)*.09,.16,a);l.rotation.z=1.2;}},
 T9(p){sphere(p,'#d3bc52',0,.34,0,.35,.38,.31,'quince');fruitLeaf(p,.68);},
 T10(p){sphere(p,'#71323e',-.17,.18,.06,.19,.18,.19,'apple');sphere(p,'#71323e',.19,.19,.02,.2,.19,.2,'apple');
  twig(p,[[-.17,.33,.06],[-.08,.6,.04],[.06,.78,0]],.016);twig(p,[[.19,.35,.02],[.17,.59,0],[.06,.78,0]],.016);leaf(p,.18,.75,0,.19,-.5);},
 M1(p){stemLeaf(p,.6);for(let ring=0;ring<3;ring++)for(let i=0;i<7-ring;i++){const a=i*Math.PI*2/(7-ring)+ring*.4,r=.18-ring*.055,o=sphere(p,ring===2?'#b94c64':C.pink,Math.cos(a)*r,.65+ring*.05,Math.sin(a)*r,.13,.1,.07);o.rotation.set(-.3,a,.2);} },
 M2(p){stemLeaf(p,.4);for(let row=0;row<4;row++)for(let i=0;i<5;i++){const a=i*1.26+row*.5,r=.16-row*.035;flower(p,Math.cos(a)*r,.42+row*.12,Math.sin(a)*r,C.purple,4,.09);}},
 M3(p){stemLeaf(p,.55);flower(p,0,.64,0,C.white,7,.3);flower(p,.25,.4,.06,C.white,6,.16);},
 M4(p){stemLeaf(p,.56);for(let i=0;i<6;i++){const a=i*Math.PI/3,o=sphere(p,C.yellow,Math.sin(a)*.17,.61,Math.cos(a)*.17,.07,.045,.28);o.rotation.set(.3,a,0);}sphere(p,C.light,0,.66,0,.065);},
 M5(p){for(let i=0;i<3;i++){const g=geometry('wave-'+i,['#6babad','#91c4c4','#c1dcce'][i],()=>new T.TorusGeometry(.24+i*.015,.07,7,22,Math.PI*1.43));const o=add(p,g,(i-1)*.18,.25+i*.09,(i-1)*.16);o.rotation.set(-.2,0,.3);}
  sphere(p,C.cream,.23,.07,.23,.16,.055,.12);},
 M6(p){twig(p,[[0,.05,0],[.04,.48,0],[-.14,.82,0]]);for(let i=0;i<8;i++){const a=i*2.4;sphere(p,C.white,Math.sin(a)*.12,.3+i*.065,Math.cos(a)*.1,.09,.065,.065);}leaf(p,.19,.56,0,.19,-.7);},
 M7(p){for(let j=0;j<3;j++){const x=(j-1)*.16;twig(p,[[x*.3,.02,0],[x,.5,0],[x,.88-j*.07,0]],.012,C.leaf);for(let i=0;i<5;i++)for(let k=0;k<3;k++){const a=k*2.1;sphere(p,C.purple,x+Math.cos(a)*.045,.49+i*.075-j*.06,Math.sin(a)*.045,.047,.057,.04);}leaf(p,x+.08,.3,0,.15,.5);}},
 M8(p){sprig(p,'#80a79a',true);},
 M9(p){stemLeaf(p,.53);for(let ring=0;ring<2;ring++)for(let i=0;i<11;i++){const a=i*Math.PI*2/11+ring*.2,r=.18-ring*.08,o=sphere(p,ring?C.pink:'#e0a1b0',Math.cos(a)*r,.62+ring*.08,Math.sin(a)*r,.11,.045,.1);o.rotation.y=a;}},
 M10(p){for(let i=0;i<5;i++){const a=i*1.26;twig(p,[[0,.02,0],[Math.sin(a)*.12,.22,Math.cos(a)*.12]],.012,C.leaf);const o=sphere(p,C.leaf,Math.sin(a)*.2,.3,Math.cos(a)*.2,.16,.025,.2,'apple');o.rotation.set(-.35,a,.2);}},
 L1(p){sphere(p,'#8c9383',0,.13,0,.37,.15,.29);for(let i=0;i<17;i++){const a=i*2.4,r=.26*Math.sqrt(i/17);sphere(p,i%2?C.leaf:C.light,Math.sin(a)*r,.22+(1-r)*.03,Math.cos(a)*r,.09,.045,.08);}},
 L2(p){sprig(p,C.leaf);leaf(p,.18,.09,.18,.24,-.5,'#8c7656');},
 L3(p){for(let i=0;i<3;i++){const o=cylinder(p,'#b29165',(i-1)*.18,.12+i*.08,0,.09,.65);o.rotation.set(Math.PI/2,0,(i-1)*.12);const end=cylinder(p,'#d0b38a',(i-1)*.18,.12+i*.08,.328,.075,.012);end.rotation.x=Math.PI/2;}
  for(let i=0;i<5;i++){const o=sphere(p,'#d0b38a',.19-i*.07,.07,.2,.07,.02,.12);o.rotation.y=i;}},
 L4(p){for(let i=0;i<3;i++){const o=cylinder(p,'#936347',(i-1)*.19,.14+i*.05,-.02,.1,.73);o.rotation.x=Math.PI/2;const end=cylinder(p,'#c4a173',(i-1)*.19,.14+i*.05,.35,.085,.012);end.rotation.x=Math.PI/2;
  const ring=add(p,geometry('wood-ring','#936347',()=>new T.TorusGeometry(.044,.006,4,16)),(i-1)*.19,.14+i*.05,.359);ring.rotation.z=i;}
 },
 L5(p){const cloth=geometry('cloth',C.white,()=>{const g=new T.PlaneGeometry(1,1,12,12),v=g.attributes.position;for(let i=0;i<v.count;i++)v.setZ(i,.06*Math.cos(v.getX(i)*17)+.035*Math.sin(v.getY(i)*21));g.rotateX(-Math.PI/2);g.computeVertexNormals();return g;});for(let i=0;i<3;i++){const o=add(p,cloth,0,.06+i*.07,0,.67,1,.56);o.rotation.y=i*.22;}},
 L6(p){for(let i=0;i<4;i++){const o=add(p,geometry('resin','#b97736',()=>new T.IcosahedronGeometry(1,0)),(i%2-.5)*.31,.12+Math.floor(i/2)*.17,(i%2)*.08,.2,.16,.16);o.rotation.set(i,.3*i,.2);}},
 L7(p){for(let i=0;i<3;i++)twig(p,[[-.3,.07+i*.035,-.2+i*.14],[0,.11+i*.025,.02+i*.1],[.27,.08+i*.03,.25]],.026,'#584333');flower(p,.22,.21,-.15,C.cream,5,.19);},
 L8(p){twig(p,[[0,.03,0],[0,.6,0],[.09,.82,0]],.018);for(const [x,y,z]of [[0,.39,0],[.09,.66,0]]){for(let i=0;i<5;i++){const a=i*1.26;sphere(p,C.white,x+Math.sin(a)*.1,y,Math.cos(a)*.1,.12,.12,.12);}sphere(p,C.stem,x,y-.11,z,.09,.035,.09);}},
 L9(p){cylinder(p,'#d3b7b1',0,.1,0,.32,.18);cylinder(p,C.cream,0,.195,0,.29,.02);const puff=sphere(p,C.white,0,.28,0,.27,.1,.27);puff.rotation.z=.12;const ribbon=add(p,geometry('puff-ribbon',C.pink,()=>new T.BoxGeometry(1,1,1)),0,.375,0,.37,.025,.07);ribbon.rotation.z=.12;},
 L10(p){for(let j=0;j<3;j++){const x=(j-1)*.17,h=.58+j*.12;cylinder(p,C.leaf,x,h/2,0,.063,h);for(let i=0;i<3;i++)cylinder(p,C.light,x,.12+i*.21,0,.07,.025);}leaf(p,.23,.67,.02,.22,-.6);leaf(p,-.24,.47,.01,.18,.6);}
};
export const INGREDIENT_OBJECT_CODES=Object.freeze(Object.keys(MODELS));
export function createIngredientObject(code){
 const build=MODELS[code];if(!build)throw Error('Unknown exhibit code');
 const group=new T.Group(),study=new T.Group();group.userData.exhibitCode=code;build(study);
 const bounds=new T.Box3().setFromObject(study),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 const scale=Math.min(1,.9/size.x,.78/size.z,.96/size.y);
 study.scale.setScalar(scale);study.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);group.add(study);return group;
}
