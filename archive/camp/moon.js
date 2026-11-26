import * as T from 'three';
// One world bearing shared with the clouds; it never follows the screen or
// appears through the ground and tents. NASA / LRO public-domain surface map.
export const CAMP_MOON_DIRECTION=new T.Vector3(.28,.53,-.8).normalize();
export function createMoon(parent){
 const root=new T.Group();root.name='lro-moon';parent.add(root);
 const texture=new T.TextureLoader().load('/assets/camp/nasa-lro-moon-1k.jpg');texture.colorSpace=T.SRGBColorSpace;
 const geo=new T.SphereGeometry(1,32,20),mat=new T.MeshBasicMaterial({map:texture,color:'#e4dfd3',toneMapped:false,fog:false,transparent:true,depthTest:true,depthWrite:false}),moon=new T.Mesh(geo,mat);
 moon.renderOrder=-1096;moon.rotation.y=Math.PI/2;root.add(moon);
 let focused=false,screen=null;const projected=new T.Vector3(),direction=CAMP_MOON_DIRECTION.clone(),forward=new T.Vector3();
 return {
  pick(ray){root.updateWorldMatrix(true,true);return mat.opacity>.08&&root.visible&&!!screen?.visible&&ray.intersectObject(moon).length>0;},
  setSky(v){root.visible=!v;},setFocus(v){focused=v;},get direction(){return direction;},
  update(camera,glow=0,transmission=1){if(!camera)return;mat.opacity=transmission;mat.color.setRGB(.89+glow*.1,.87+glow*.1,.83+glow*.11);root.position.copy(camera.position).addScaledVector(direction,68);moon.scale.setScalar(1.55);root.updateWorldMatrix(true,true);moon.getWorldPosition(projected).project(camera);camera.getWorldDirection(forward);screen={x:(projected.x+1)/2,y:(1-projected.y)/2,diameter:(globalThis.innerHeight||844)*1.55/(68*Math.tan(T.MathUtils.degToRad((camera.fov||58)/2))),visible:forward.dot(direction)>0&&Math.abs(projected.x)<1.05&&Math.abs(projected.y)<1.05};},
  get diagnostics(){return {source:'NASA-LRO',focused,transmission:mat.opacity,screen,direction:direction.toArray()};},
  dispose(){root.removeFromParent();texture.dispose();geo.dispose();mat.dispose();}
 };
}
