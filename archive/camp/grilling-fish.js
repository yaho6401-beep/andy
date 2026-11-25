import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// A tapered whole fish with a forked tail, gills, eyes and fine scales. One
// reusable skin texture per roast visual; no remote image requests or models.
export function createFishSkin(){const w=128,h=64,data=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const back=.6+.4*Math.sin(y/h*Math.PI),scale=Math.sin(x*.9+Math.floor(y/5)%2*1.8)*Math.sin(y*.65)>.6?.95:1,i=(y*w+x)*4;data[i]=Math.round(235*back*scale);data[i+1]=Math.round(240*back*scale);data[i+2]=Math.round(234*back*scale);data[i+3]=255;}const texture=new T.DataTexture(data,w,h,T.RGBAFormat);texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;return texture;}
export function createGrillingFish(texture){const root=new T.Group(),owned=[],own=o=>(owned.push(o),o),skin=own(new T.MeshStandardMaterial({color:'#c6d0c7',map:texture,roughness:.42,metalness:.18})),fin=own(new T.MeshStandardMaterial({color:'#777f72',roughness:.8,side:T.DoubleSide})),eye=own(new T.MeshStandardMaterial({color:'#111c1c',roughness:.2})),silver=own(new T.MeshStandardMaterial({color:'#d6c9a1',roughness:.45})),buckets=new Map();
 const add=(geo,mat,x=0,y=0,z=0,sx=1,sy=sx,sz=sx,rx=0,ry=0,rz=0)=>{const o=new T.Object3D();o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,ry,rz);o.updateMatrix();const g=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(o.matrix);geo.dispose();if(!buckets.has(mat))buckets.set(mat,[]);buckets.get(mat).push(g);};
 const profile=[[0,-.72],[.045,-.68],[.1,-.56],[.2,-.3],[.25,-.05],[.22,.22],[.16,.43],[.07,.61],[0,.67]].map(p=>new T.Vector2(...p));add(new T.LatheGeometry(profile,24),skin,0,0,0,.52,1,1,Math.PI/2);
 function membrane(vertices){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.BufferAttribute(new Float32Array(vertices.length/3*2),2));g.computeVertexNormals();add(g,fin);}
 membrane([0,0,-.63,0,.23,-.98,0,.1,-.86,0,0,-.63,0,.1,-.86,0,0,-.79,0,0,-.63,0,0,-.79,0,-.1,-.86,0,0,-.63,0,-.1,-.86,0,-.23,-.98]);
 membrane([0,.18,-.36,0,.4,-.26,0,.22,.22,0,-.16,-.37,0,-.32,-.29,0,-.18,-.02]);
 for(const side of [-1,1]){add(new T.SphereGeometry(.027,10,8),eye,side*.073,.055,.48);add(new T.TorusGeometry(.035,.007,5,16),silver,side*.078,.055,.48,1,1,1,0,Math.PI/2);add(new T.TorusGeometry(.13,.009,5,18,Math.PI*.8),fin,side*.092,-.01,.29,1,.85,.5,0,Math.PI/2,.25);membrane([side*.1,0,.13,side*.27,-.13,-.13,side*.07,-.11,-.17]);}
 for(let i=0;i<4;i++)add(new T.CylinderGeometry(.009,.009,.29,5),fin,0,.19,-.35+i*.17,1,1,1,.45,0,Math.PI/2);
 for(const [mat,parts]of buckets){const g=own(mergeGeometries(parts,false));parts.forEach(p=>p.dispose());root.add(new T.Mesh(g,mat));}root.userData.skin=skin;root.userData.dispose=()=>{root.removeFromParent();owned.forEach(o=>o.dispose());};root.name='whole-fish-on-a-skewer';return root;
}
