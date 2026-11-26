import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export const VESSEL_SPECS={yacht:{length:22,beam:5.4,deck:1.8,draft:1.35},fishing:{length:25,beam:7,deck:2.1,draft:1.9},tug:{length:23,beam:8.2,deck:2.7,draft:2.7},cargo:{length:76,beam:13,deck:4.3,draft:4.4},ferry:{length:49,beam:10,deck:2.9,draft:2.5},sail:{length:19,beam:4.8,deck:1.6,draft:1.8}};
const clamp=x=>Math.max(0,Math.min(1,x));
export function vesselHalfBeam(t,beam){return beam*.5*(t<.26?Math.sin(t/.26*Math.PI/2)**.85:t>.8?1-.32*((t-.8)/.2)**2:1);}

// Closed, indexed, smoothly shaded sections: sheer, flared topsides, waterline, chine and keel.
// Bow points toward -Z; the lower forefoot is raked aft, rather than ending as a flat box.
export function vesselHullGeometry({length,beam,deck,draft},stations=48){
 const pos=[],col=[],indices=[],body=new T.Color('#d9dfdd'),boot=new T.Color('#283d48'),under=new T.Color('#75534f');
 const cross=[[1,1],[.998,.72],[.975,.38],[.94,.12],[.925,.035],[.90,-.1],[.72,-.7],[.28,-1],[0,-1.04],[-.28,-1],[-.72,-.7],[-.90,-.1],[-.925,.035],[-.94,.12],[-.975,.38],[-.998,.72],[-1,1]];
 const n=cross.length;
 for(let i=0;i<=stations;i++){const t=i/stations,w=Math.max(.018,vesselHalfBeam(t,beam)),sheer=deck+length*.018*(1-t)**5+length*.002*t**8;
  for(const [xx,yy]of cross){const y=yy>=0?yy*sheer:yy*draft,z=(t-.5)*length+length*.055*(1-t)**9*Math.max(0,-yy);pos.push(xx*w,y,z);const c=(yy<0?under:yy<.15?boot:body).clone().multiplyScalar(.97+.03*Math.sin(t*51+yy*2));col.push(c.r,c.g,c.b);}
 }
 for(let i=0;i<stations;i++)for(let j=0;j<n;j++){const a=i*n+j,b=(i+1)*n+j,c=(i+1)*n+(j+1)%n,d=i*n+(j+1)%n;indices.push(a,b,c,a,c,d);}
 for(const end of[0,stations]){const start=end*n,center=pos.length/3;pos.push(0,deck*.3,(end/stations-.5)*length);col.push(body.r,body.g,body.b);for(let j=0;j<n;j++){const a=start+j,b=start+(j+1)%n;indices.push(center,...(end?[b,a]:[a,b]));}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();return g;
}

// Original interpretations of working-vessel construction, not copies of a manufacturer's model.
// Static fittings merge by finish; a port caches each type and shares it between instances.
export function buildVesselModel(kind){
 const s=VESSEL_SPECS[kind];if(!s)throw Error('Unknown vessel');
 const bins=new Map(),resources=[],parts=[],boxGeo=new T.BoxGeometry(),roundGeo=new RoundedBoxGeometry(1,1,1,2,.075),cyl=new T.CylinderGeometry(1,1,1,8),sphere=new T.SphereGeometry(1,12,8),matrix=new T.Matrix4(),q=new T.Quaternion();
 const finishes={paint:['#e0e5e2',.2,.43],dark:['#293e49',.35,.43],glass:['#294b5b',.6,.12],steel:['#a9b8ba',.72,.28],teak:['#998471',.02,.82],rubber:['#263134',.03,.91],orange:['#b6754e',.04,.69],red:['#97534e',.08,.7],green:['#547a70',.08,.69],nav:['#699787',.15,.38]};
 function push(g,key,m){const copy=(g.index?g.toNonIndexed():g.clone()).applyMatrix4(m);copy.deleteAttribute('uv');if(!bins.has(key))bins.set(key,[]);bins.get(key).push(copy);}
 function put(g,key,x,y,z,w=1,h=1,d=1,rx=0,ry=0,rz=0){q.setFromEuler(new T.Euler(rx,ry,rz));matrix.compose(new T.Vector3(x,y,z),q,new T.Vector3(w,h,d));push(g,key,matrix);}
 const box=(key,x,y,z,w,h,d)=>put(boxGeo,key,x,y,z,w,h,d),rounded=(key,x,y,z,w,h,d)=>put(roundGeo,key,x,y,z,w,h,d),pole=(key,x,y,z,r,h)=>put(cyl,key,x,y,z,r,h,r);
 function tube(key,a,b,r=.035){const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);q.setFromUnitVectors(new T.Vector3(0,1,0),delta.clone().normalize());matrix.compose(av.add(bv).multiplyScalar(.5),q,new T.Vector3(r,delta.length(),r));push(cyl,key,matrix);}
 function pane(points){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();put(g,'glass',0,0,0);g.dispose();}
 function house(x,y,z,w,h,l,windows=5){
  const g=roundGeo.clone(),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)-Math.max(0,p.getY(i))*.28);g.computeVertexNormals();put(g,'paint',x,y+h/2,z,w,h,l);g.dispose();
  const low=y+h*.54,high=y+h*.86,shiftLow=-l*.012,shiftHigh=-l*.101;
  for(const side of[-1,1])for(let i=0;i<windows;i++){const a=z-l*.37+i*l*.71/windows,b=a+l*.57/windows,xx=x+side*(w*.5+.016);const ps=[[xx,low,a+shiftLow],[xx,low,b+shiftLow],[xx,high,b+shiftHigh],[xx,high,a+shiftHigh]];pane(side>0?ps:ps.reverse());}
  for(let i=0;i<3;i++){const a=x-w*.39+i*w*.78/3,b=a+w*.215;pane([[a,low,z-l*.5+shiftLow-.02],[a,high,z-l*.5+shiftHigh-.02],[b,high,z-l*.5+shiftHigh-.02],[b,low,z-l*.5+shiftLow-.02]]);}
  rounded('paint',x,y+h+.07,z-l*.05,w*1.05,.15,l*1.04);
 }
 function rails(from=-.36,to=.43,height=.8){for(const side of[-1,1]){let prev;for(let z=from*s.length;z<=to*s.length+.01;z+=s.length/20){const t=z/s.length+.5,x=side*vesselHalfBeam(t,s.beam)*.94,y=s.deck+s.length*.018*(1-t)**5;const p=[x,y+height,z];tube('steel',[x,y,z],p,.026);if(prev)tube('steel',prev,p,.029);prev=p;}}}
 function mast(x,y,z,h){pole('steel',x,y+h/2,z,.045,h);tube('steel',[x-1,y+h*.67,z],[x+1,y+h*.67,z],.028);pole('dark',x,y+h+.22,z,.022,.5);put(sphere,'nav',x,y+h*.68,z,.09,.09,.09);}
 const hull=vesselHullGeometry(s);parts.push({geometry:hull,material:new T.MeshStandardMaterial({color:kind==='fishing'?'#9eb7bd':kind==='cargo'?'#7c9099':'#ffffff',vertexColors:true,metalness:.27,roughness:.43})});resources.push(hull,parts[0].material);
 // A recessed deck, a thin cap rail, fairleads and open mooring gear.
 rounded('teak',0,s.deck+.02,s.length*.1,s.beam*.76,.11,s.length*.56);
 for(const side of[-1,1])for(const z of[-.31,.36]){pole('steel',side*s.beam*.32,s.deck+.22,z*s.length,.09,.4);box('steel',side*s.beam*.32,s.deck+.43,z*s.length,.48,.08,.18);}
 if(kind==='yacht'){
  house(0,s.deck+.06,0,s.beam*.74,2.25,9,5);house(0,s.deck+2.45,1.0,s.beam*.54,1.25,5,3);
  rounded('paint',0,s.deck+3.9,1.3,4.1,.13,6.3);for(const side of[-1,1])tube('steel',[side*1.6,s.deck+2.3,3],[side*1.6,s.deck+3.85,3.7],.055);
  rounded('paint',0,s.deck+.3,-6.5,3.1,.3,3.2);for(const side of[-1,1])rounded('teak',side*.75,s.deck+.52,-6.5,1.35,.12,2.7);
  rounded('paint',0,.3,s.length*.51,3.8,.18,1.3);mast(0,s.deck+4,1.8,2.5);rails();
 }else if(kind==='ferry'){
  house(0,s.deck+.1,1,s.beam*.79,2.4,s.length*.68,14);house(0,s.deck+2.62,-3.1,s.beam*.69,2.15,s.length*.43,9);
  house(0,s.deck+4.9,-s.length*.24,s.beam*.65,1.7,5.5,3);mast(0,s.deck+6.8,-s.length*.24,4);
  for(const side of[-1,1]){rounded('orange',side*s.beam*.42,s.deck+3.4,6,.65,.65,3.5);pole('dark',side*2,s.deck+6.2,9,.48,2.8);}
  rails(-.42,.43,.9);
 }else if(kind==='cargo'){
  for(let row=0;row<6;row++)for(let col=0;col<3;col++)for(let tier=0;tier<2;tier++){const x=(col-1)*2.55,z=-s.length*.29+row*6.4,key=['red','green','teak','paint'][(row+col+tier)%4];box(key,x,s.deck+1.35+tier*2.7,z,2.44,2.59,6.05);for(let j=0;j<6;j++)for(const side of[-1,1])box('steel',x+side*1.225,s.deck+1.35+tier*2.7,z-2.6+j*1.04,.022,2.37,.055);}
  house(0,s.deck+.1,s.length*.34,s.beam*.69,5.6,11,5);house(0,s.deck+5.85,s.length*.32,s.beam*.77,1.9,8,4);
  for(const side of[-1,1]){box('paint',side*s.beam*.42,s.deck+5.95,s.length*.29,2.5,.35,6);tube('steel',[side*5.5,s.deck+6.1,s.length*.29-3],[side*5.5,s.deck+7,s.length*.29-3]);}
  rounded('dark',0,s.deck+9.2,s.length*.4,3.3,4.3,3.7);for(const side of[-1,1])pole('rubber',side*.75,s.deck+11.6,s.length*.4,.42,1.1);
  mast(0,s.deck+.1,-s.length*.4,6);mast(0,s.deck+7.8,s.length*.29,6);rails(-.4,.43,.95);
 }else if(kind==='tug'){
  house(0,s.deck+.12,-1,s.beam*.62,2.5,7.3,4);house(0,s.deck+2.8,-1.65,s.beam*.7,1.8,5.2,4);mast(0,s.deck+4.7,-1.2,4.4);
  for(const side of[-1,1]){rounded('dark',side*2,s.deck+3,2.7,1,4.3,1.3);pole('rubber',side*2,s.deck+5.3,2.7,.42,.5);}
  for(let z=-7;z<=8;z+=2.5)for(const side of[-1,1]){const ring=new T.TorusGeometry(.52,.16,7,14);put(ring,'rubber',side*vesselHalfBeam(z/s.length+.5,s.beam),s.deck*.43,z,1,1,1,0,Math.PI/2);ring.dispose();}
  const fender=new T.CatmullRomCurve3(Array.from({length:23},(_,i)=>{const u=(i-11)/11,t=.012+.32*Math.abs(u);return new T.Vector3(vesselHalfBeam(t,s.beam)*Math.sign(u),s.deck*.58,(t-.5)*s.length);}));const fg=new T.TubeGeometry(fender,32,.22,6,false);put(fg,'rubber',0,0,0);fg.dispose();
  pole('steel',0,s.deck+.7,6,.7,1.3);put(cyl,'dark',0,s.deck+1.1,6,1.2,1.5,1.2,Math.PI/2);rails(-.27,.43,.8);
 }else if(kind==='fishing'){
  house(0,s.deck+.1,-3,s.beam*.61,2.6,6.8,4);mast(0,s.deck+2.9,-3,7);
  for(const side of[-1,1]){tube('steel',[side*2.4,s.deck,4],[side*2.4,s.deck+6.9,5],.09);tube('steel',[side*2.4,s.deck+6.9,5],[side*2.4,s.deck+5.8,9],.06);tube('steel',[side*2.4,s.deck+6.6,5],[side*2.4,s.deck+.4,10],.018);}
  tube('steel',[-2.4,s.deck+6.9,5],[2.4,s.deck+6.9,5],.09);put(cyl,'steel',0,s.deck+1.0,4.5,.85,3,.85,0,0,Math.PI/2);
  for(let i=0;i<10;i++)put(cyl,'rubber',-1.2+i*.26,s.deck+1,4.5,.88,.055,.88,0,0,Math.PI/2);
  for(const side of[-1,1]){rounded('green',side*1.9,s.deck+.55,8,1.2,1.05,3);for(let z=6.8;z<9.5;z+=.35)tube('steel',[side*1.9-.6,s.deck+1.09,z],[side*1.9+.6,s.deck+1.09,z],.018);}
  rails(-.38,.44,.85);
 }else{
  house(0,s.deck+.02,0,s.beam*.52,1.02,6.5,4);mast(0,s.deck+.1,-1.2,19);tube('steel',[0,s.deck+2.2,-1.2],[0,s.deck+2.2,6.1],.055);
  for(const point of[[-2,s.deck,1.4],[2,s.deck,1.4],[0,s.deck,-8],[0,s.deck,8]])tube('steel',[0,s.deck+18.7,-1.2],point,.014);
  const g=new T.BufferGeometry(),v=[],ix=[];for(let row=0;row<=12;row++){const f=row/12,height=s.deck+2.3+f*16.3,span=7.3*(1-f);for(let col=0;col<=4;col++){const u=col/4;v.push(Math.sin(u*Math.PI)*Math.sin(f*Math.PI)*.65,height,-1.2+span*u);}}for(let r=0;r<12;r++)for(let c=0;c<4;c++){const a=r*5+c,b=a+5;ix.push(a,b,b+1,a,b+1,a+1,b+1,b,a,a+1,b+1,a);}g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();put(g,'paint',0,0,0);g.dispose();rails(-.39,.45,.65);
 }
 for(const[key,geos]of bins){const g=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());const[color,metalness,roughness]=finishes[key],m=new T.MeshStandardMaterial({color,metalness,roughness,side:key==='glass'?T.DoubleSide:T.FrontSide});if(key==='nav'){m.emissive.set('#5b7b68');m.emissiveIntensity=.2;}parts.push({geometry:g,material:m});resources.push(g,m);}
 for(const g of[boxGeo,roundGeo,cyl,sphere])g.dispose();
 return {parts,spec:s,triangles:parts.reduce((n,p)=>n+(p.geometry.index?.count||p.geometry.attributes.position.count)/3,0),dispose(){resources.forEach(r=>r.dispose());}};
}
