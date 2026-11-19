import * as T from 'three';
import {CANISTERS} from './canisters.js';
import {createCanisterModel} from './canister-model.js';

// Small deterministic, locally generated textures: no network assets or postprocessing.
export function campTexture(kind){
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
 let seed=kind==='canvas'?17:91;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 ctx.fillStyle=kind==='canvas'?'#d6ccb9':'#8e8170';ctx.fillRect(0,0,128,128);
 for(let i=0;i<1600;i++){const v=Math.floor(70+rand()*100);ctx.fillStyle=`rgba(${v},${v-7},${v-14},${kind==='canvas'?.09:.2})`;ctx.fillRect(rand()*128,rand()*128,1+rand()*3,1+rand()*2);}
 if(kind==='canvas')for(let n=0;n<128;n+=3){ctx.fillStyle='rgba(255,248,224,.1)';ctx.fillRect(n,0,1,128);ctx.fillStyle='rgba(62,53,42,.06)';ctx.fillRect(0,n,128,1);}
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=2;return tex;
}

export function createCampScenery(parent){
 const root=new T.Group();root.name='textured-camp-clearing';parent.add(root);
 const textures=[campTexture('earth')],materials=[],geometries=[],own=g=>(geometries.push(g),g),mat=o=>{const m=new T.MeshStandardMaterial(o);materials.push(m);return m;};
 const earth=mat({map:textures[0],color:'#b4a58e',roughness:1});textures[0].repeat.set(5,5);
 const floor=new T.Mesh(own(new T.CylinderGeometry(4.35,4.35,.028,64)),earth);floor.position.y=.048;root.add(floor);
 // Smoothly weathered, asymmetric river stones with restrained mineral variation.
 const geo=own(new T.IcosahedronGeometry(1,2)),p=geo.attributes.position,colors=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.055*Math.sin(x*11+z*7)*Math.cos(y*9-z*4);p.setXYZ(i,x*n,y*n,z*n);const shade=.65+.06*Math.sin(x*19+y*13+z*17);colors.push(shade,shade*.97,shade*.9);}geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 const rock=mat({color:'#c2bdb1',vertexColors:true,roughness:.96}),stones=new T.InstancedMesh(geo,rock,76),dummy=new T.Object3D();
 for(let i=0;i<76;i++){const a=i*2.399963,r=i<14?1.02:1.55+(i%17)*.16;dummy.position.set(Math.sin(a)*r,i<14?.16:.076,Math.cos(a)*r);dummy.rotation.set(i*.27,i*.63,i*.17);dummy.scale.set(i<14?.25+(i%3)*.018:.024+(i%5)*.012,i<14?.17+(i%4)*.014:.022,i<14?.23:.035);dummy.updateMatrix();stones.setMatrixAt(i,dummy.matrix);stones.setColorAt(i,new T.Color().setHSL(.1,.06,.66+(i%4)*.045));}root.add(stones);
 const cans=CANISTERS.map(spot=>{const mesh=createCanisterModel(spot.kind);mesh.scale.setScalar(1.65);mesh.position.set(spot.x,.09,spot.z);mesh.rotation.y=spot.kind==='water'?-.25:.22;root.add(mesh);return {spot,mesh};});
 return {setPack(pack){for(const c of cans)c.mesh.visible=!pack?.canClaims?.[c.spot.id];},get diagnostics(){return {style:'weathered-stone-canvas',stoneCount:76,textureSize:128,visibleCans:cans.filter(c=>c.mesh.visible).map(c=>c.spot.id)};},dispose(){for(const c of cans)c.mesh.userData.dispose();stones.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());root.removeFromParent();}};
}
