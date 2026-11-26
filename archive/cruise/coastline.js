import * as T from 'three';
// Rendered from the actual ArchiveWorld garden and campsite, not a generic town.
// Two small alpha panoramas keep the village's full scene out of this world.
export function createCoastline(parent){
 const root=new T.Group();parent.add(root);const loader=new T.TextureLoader(),planes=[];
 for(const [name,x,z,w,h]of [['camp',-10,-183,108,17],['garden',12,179,89,34]]){
  const map=loader.load(new URL('./scenery/'+name+'.webp',import.meta.url).href);map.colorSpace=T.SRGBColorSpace;map.minFilter=T.LinearFilter;map.generateMipmaps=false;
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,alphaTest:.015,color:'#c9d8df',fog:true}));m.position.set(x,h/2-.7,z);if(name==='garden')m.rotation.y=Math.PI;root.add(m);planes.push({name,mesh:m});
 }
 return {set(room,night){for(const {name,mesh}of planes){mesh.visible=true;mesh.material.color.set(night?'#7291b3':'#e4ded1');}},get state(){return {visible:planes.filter(p=>p.mesh.visible).map(p=>p.name),source:'actual-world-capture',panoramas:2};}};
}
