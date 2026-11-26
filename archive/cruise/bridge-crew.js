import * as T from 'three';
import {createAvatar,animateAvatar,disposeAvatar} from '../src/avatar.js';
import {BRIDGE_CREW} from './ship-layout.js';
export function createBridgeCrew(parent){
 const resources=[],own=x=>(resources.push(x),x),white=own(new T.MeshStandardMaterial({color:'#f0ede4',roughness:.8})),navy=own(new T.MeshStandardMaterial({color:'#243d54',roughness:.8})),gold=own(new T.MeshStandardMaterial({color:'#cead69',roughness:.6}));
 const members=BRIDGE_CREW.map((p,i)=>{const avatar=createAvatar({kind:i?0:1,color:'#243d54',hair:i?'#51463b':'#a6a397',hairStyle:0});avatar.position.set(p.x,p.y,p.z);avatar.rotation.y=Math.PI;parent.add(avatar);
  const cap=new T.Group();avatar.userData.hips.add(cap);cap.position.y=1.66;
  const crown=new T.Mesh(own(new T.CylinderGeometry(.38,.39,.16,20)),white);crown.position.y=.02;cap.add(crown);const band=new T.Mesh(own(new T.CylinderGeometry(.385,.385,.075,20)),navy);band.position.y=-.065;cap.add(band);const brim=new T.Mesh(own(new T.SphereGeometry(1,12,6)),navy);brim.position.set(0,-.07,.24);brim.scale.set(.35,.025,.28);cap.add(brim);const badge=new T.Mesh(own(new T.SphereGeometry(1,8,6)),gold);badge.position.set(0,.02,.385);badge.scale.set(.065,.055,.017);cap.add(badge);
  for(const side of [-1,1]){const shoulder=new T.Mesh(own(new T.BoxGeometry(.12,.025,.16)),gold);shoulder.position.set(side*.31,.94,0);avatar.userData.hips.add(shoulder);}
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#193548cc';ctx.roundRect(4,4,248,56,12);ctx.fill();ctx.fillStyle='#eee9d8';ctx.font='500 28px system-ui';ctx.textAlign='center';ctx.fillText(p.name,128,43);const map=own(new T.CanvasTexture(canvas));map.colorSpace=T.SRGBColorSpace;const tag=new T.Sprite(own(new T.SpriteMaterial({map,depthWrite:false})));tag.position.y=2.13;tag.scale.set(1.05,.263,1);avatar.add(tag);
  return {p,avatar};
 });
 // A separate small steering console leaves the original visitor helm usable.
 const wheel=new T.Mesh(own(new T.TorusGeometry(.33,.038,6,20)),gold);wheel.position.set(-4.5,15.63,-46.05);parent.add(wheel);
 return {update(time,viewer,voyage){for(const {p,avatar}of members){avatar.visible=Math.hypot(p.x-viewer.x,p.z-viewer.z)<29&&Math.abs(viewer.y-p.y)<6;if(!avatar.visible)continue;const yaw=p.id==='captain'&&Math.hypot(p.x-viewer.x,p.z-viewer.z)<4.5?Math.atan2(viewer.x-p.x,viewer.z-p.z):Math.PI;avatar.rotation.y+=Math.atan2(Math.sin(yaw-avatar.rotation.y),Math.cos(yaw-avatar.rotation.y))*.06;animateAvatar(avatar,{motion:'idle',emote:p.id==='captain'&&voyage.phase==='outbound'&&voyage.u<.025?'wave':null,emoteAt:time*1000},time);if(p.id==='helmsman'){avatar.userData.arms.forEach((a,i)=>{a.rotation.x=-.85+Math.sin(time*.7+i)*.04;a.rotation.z=i?.25:-.25;});}}wheel.visible=members[1].avatar.visible;wheel.rotation.z=Math.sin(time*.35)*.14;},get state(){return members.map(({p,avatar})=>({id:p.id,name:p.name,visible:avatar.visible,x:p.x,y:p.y,z:p.z}));},dispose(){members.forEach(m=>disposeAvatar(m.avatar));wheel.removeFromParent();resources.forEach(x=>x.dispose());}};
}
