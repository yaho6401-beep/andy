import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// A small, original camping prop. Every instance owns its disposable resources.
export function createCanisterModel(kind){
 const root=new T.Group(),geometries=[],materials=[];
 const mat=(color)=>{const m=new T.MeshStandardMaterial({color,roughness:.76,metalness:.12});m.userData.avatarOwned=true;materials.push(m);return m;};
 const body=mat(kind==='water'?'#819fad':'#a69a68'),edge=mat('#4d5653'),label=mat('#e8dcc0');
 const add=(g,m,x,y,z)=>{geometries.push(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);root.add(o);return o;};
 const shape=new T.Shape();shape.moveTo(-.16,0);shape.lineTo(.16,0);shape.lineTo(.16,.33);shape.lineTo(.1,.4);shape.lineTo(-.12,.4);shape.lineTo(-.16,.34);shape.closePath();
 const g=new T.ExtrudeGeometry(shape,{depth:.19,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:2});g.translate(0,0,-.095);add(g,body,0,.035,0);
 // Open handle, sealed cap and recessed reinforcing ribs, rather than a plain box.
 for(const x of [-.095,.055])add(new T.CylinderGeometry(.014,.014,.1,6),edge,x,.48,0);
 const handle=add(new T.CylinderGeometry(.017,.017,.15,6),edge,-.02,.53,0);handle.rotation.z=Math.PI/2;
 add(new T.CylinderGeometry(.041,.043,.035,10),edge,.105,.447,.015);
 add(new T.BoxGeometry(.13,.11,.008),label,0,.24,.126);
 const symbol=add(kind==='water'?new T.CircleGeometry(.031,14):new T.RingGeometry(.02,.03,10),body,0,.24,.132);
 symbol.rotation.z=Math.PI/4;
 for(const sign of [-1,1]){const rib=add(new T.BoxGeometry(.022,.19,.012),edge,sign*.07,.18,-.126);rib.rotation.z=sign*.48;}
 // Three draw calls per prop, including the handle and ribs, even with many visitors.
 root.updateMatrixWorld(true);const buckets=new Map();
 for(const child of root.children){const part=(child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone()).applyMatrix4(child.matrixWorld);if(!buckets.has(child.material))buckets.set(child.material,[]);buckets.get(child.material).push(part);}
 geometries.forEach(g=>g.dispose());geometries.length=0;root.clear();
 for(const [material,parts] of buckets){const merged=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());geometries.push(merged);root.add(new T.Mesh(merged,material));}
 root.name='camp-held-'+kind;
 root.userData.dispose=()=>{geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());root.removeFromParent();};
 return root;
}
