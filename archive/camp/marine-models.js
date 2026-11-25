import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// Original, reusable low-poly silhouettes; no external models or per-frame meshes.
export function marineModel(kind='fish',color='#8cabaf'){
 const root=new T.Group(),buckets=new Map(),owned=[];const add=(geo,c,x,y,z,sx=1,sy=sx,sz=sx,rx=0,ry=0,rz=0)=>{const m=new T.Mesh(geo);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);m.updateMatrix();const part=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(m.matrix);geo.dispose();if(!buckets.has(c))buckets.set(c,[]);buckets.get(c).push(part);};
 const dolphin=kind==='dolphin';add(new T.SphereGeometry(1,18,12),color,0,0,0,.28,.37,dolphin?.98:.67);
 add(new T.SphereGeometry(1,14,9),dolphin?'#d3ddce':'#d4d5b9',0,-.16,.08,.21,.23,dolphin?.78:.55);
 const fin=(x,y,z,sx,sy,sz,rz=0)=>add(new T.ConeGeometry(1,1,3),color,x,y,z,sx,sy,sz,0,0,rz);
 fin(0,.35,-.12,.12,dolphin?.43:.28,.27,-.15);for(const side of [-1,1]){fin(side*.32,-.13,.1,.18,.43,.09,side*1.12);add(new T.SphereGeometry(.035,10,8),'#182c33',side*.234,.08,.42);add(new T.SphereGeometry(.012,8,6),'#f5f2de',side*.252,.09,.439);}
 if(dolphin){add(new T.SphereGeometry(1,12,8),color,0,-.035,.99,.13,.12,.37);for(const side of [-1,1])add(new T.SphereGeometry(1,12,7),color,side*.28,0,-.98,.4,.07,.2,0,side*.3,0);}
 else{fin(-.12,0,-.78,.17,.42,.12,-Math.PI/2);fin(.12,0,-.78,.17,.42,.12,Math.PI/2);add(new T.TorusGeometry(.07,.012,5,12),color,0,-.01,.665);}
 for(const[c,parts]of buckets){const g=mergeGeometries(parts,false),m=new T.MeshStandardMaterial({color:c,roughness:.66,metalness:dolphin?.08:.2});parts.forEach(p=>p.dispose());root.add(new T.Mesh(g,m));owned.push(g,m);}
 root.name='original-'+kind;root.userData.dispose=()=>{root.removeFromParent();owned.forEach(x=>x.dispose());};return root;
}
