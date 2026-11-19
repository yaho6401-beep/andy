import * as T from 'three';
export function clockAngles(date=new Date()){
 const seconds=date.getSeconds()+date.getMilliseconds()/1000,minutes=date.getMinutes()+seconds/60;
 return {hour:-(date.getHours()%12+minutes/60)*Math.PI/6,minute:-minutes*Math.PI/30,second:-seconds*Math.PI/30};
}
export const WATCH_HAND_ASSET='/assets/camp/wrist-left-relaxed-world-v2.png';
// The arm points right; the independently mounted dial keeps twelve at the top.
export function watchPose(camera,{width=390,height=844}={}){
 const landscape=width>height*1.4,short=!landscape&&height<650,depth=1.8;
 const half=Math.tan(T.MathUtils.degToRad(camera.fov||58)/2)*depth/(camera.zoom||1),diameter=landscape?86:short?76:90;
 const x=width*(landscape?.28:.39),y=height*(landscape?.72:short?.63:.72);
 return {x:(x/width*2-1)*half*(width/height),y:(1-y/height*2)*half,z:-depth,scale:diameter/height*half*2/.23,diameter};
}
export function createWristwatch(parent){
 const root=new T.Group(),arm=new T.Group();root.name='my-analogue-wristwatch';root.visible=false;root.add(arm);parent.add(root);
 const geometries=[],materials=[],textures=[],own=g=>(geometries.push(g),g),mat=o=>{const m=new T.MeshStandardMaterial(o);materials.push(m);return m;};
 const steel=mat({color:'#a4aca4',metalness:.3,roughness:.58}),rim=mat({color:'#c5c7b9',metalness:.25,roughness:.6}),strap=mat({color:'#556252',roughness:1}),box=own(new T.BoxGeometry(1,1,1));
 function piece(geo,material,x,y,z,sx=1,sy=sx,sz=sx){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);arm.add(m);return m;}
 const photoMat=new T.MeshBasicMaterial({transparent:true,alphaTest:.72,depthWrite:false,toneMapped:false,color:'#eadccf'});materials.push(photoMat);
 const photo=piece(own(new T.PlaneGeometry(1,1)),photoMat,-.042,.028,0,1.2,.8,1);photo.visible=false;
 let disposed=false,loading=false,loaded=false,failed=false,handTexture;
 function loadHand(){if(loading||loaded||failed||disposed)return;loading=true;handTexture=new T.TextureLoader().load(WATCH_HAND_ASSET,t=>{if(disposed){t.dispose();return;}t.colorSpace=T.SRGBColorSpace;photo.scale.y=1.2/(t.image.width/t.image.height);photoMat.map=t;photoMat.needsUpdate=true;photo.visible=true;loaded=true;},undefined,()=>{loading=false;failed=true;});textures.push(handTexture);}
 // A simple, original round steel analogue case, without a copied brand mark.
 piece(box,strap,0,0,.012,.132,.285,.022);
 for(const side of [-1,1]){piece(box,steel,side*.072,.105,.025,.021,.065,.028);piece(box,steel,side*.072,-.105,.025,.021,.065,.028);}
 const body=piece(own(new T.CylinderGeometry(.113,.113,.031,64)),steel,0,0,.032);body.rotation.x=Math.PI/2;
 piece(own(new T.TorusGeometry(.103,.008,8,64)),rim,0,0,.052);piece(box,steel,.124,0,.034,.019,.028,.026);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#f8f5e8';ctx.fillRect(0,0,512,512);ctx.translate(256,256);
 for(let i=0;i<60;i++){ctx.save();ctx.rotate(i*Math.PI/30);ctx.strokeStyle=i%5?'#8d958f':'#263a35';ctx.lineWidth=i%5?2:5;ctx.beginPath();ctx.moveTo(0,-(i%5?226:215));ctx.lineTo(0,-239);ctx.stroke();ctx.restore();}
 ctx.fillStyle='#172c25';ctx.textAlign='center';ctx.textBaseline='middle';for(let n=1;n<=12;n++){const angle=n*Math.PI/6;ctx.font=(n%3?'600 43px':'700 46px')+' Arial,sans-serif';ctx.fillText(String(n),Math.sin(angle)*178,-Math.cos(angle)*178);}
 ctx.font='14px Arial,sans-serif';ctx.fillStyle='#607067';ctx.fillText('BOOKS & SCENTS',0,-86);ctx.font='12px Arial,sans-serif';ctx.fillText('A LITTLE PAUSE',0,101);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);const faceMat=new T.MeshBasicMaterial({map:texture,toneMapped:false});materials.push(faceMat);piece(own(new T.CircleGeometry(.097,64)),faceMat,0,0,.055);
 const dark=new T.MeshBasicMaterial({color:'#233b34',toneMapped:false}),red=new T.MeshBasicMaterial({color:'#a54f40',toneMapped:false});materials.push(dark,red);const hands=[];
 for(const [length,width,z,material]of [[.052,.008,.060,dark],[.075,.005,.064,dark],[.086,.002,.068,red]]){const pivot=new T.Group(),needle=new T.Mesh(box,material);needle.position.y=length/2-.011;needle.scale.set(width,length,.002);pivot.position.z=z;pivot.add(needle);arm.add(pivot);hands.push(pivot);}
 piece(own(new T.SphereGeometry(1,10,6)),steel,0,0,.073,.009,.009,.004);
 // Composite the first-person wrist after world particles, preserving layer order.
 for(const m of materials){m.transparent=true;m.depthTest=false;m.depthWrite=false;}let layer=900;arm.traverse(o=>{if(o.isMesh)o.renderOrder=layer++;});
 let target=0,amount=0,previousTime=null,angles={hour:0,minute:0,second:0},pose=null;
 return {set(active){if(active&&!target&&failed)failed=false;target=active?1:0;if(active)loadHand();},update(time,camera,reduced=false,date=new Date()){
  const dt=previousTime===null?0:Math.min(.05,Math.max(0,time-previousTime));previousTime=time;const ready=loaded?target:0;amount=reduced?ready:T.MathUtils.damp(amount,ready,9,dt);root.visible=loaded&&amount>.015;if(!root.visible)return;
  root.position.copy(camera.position);root.quaternion.copy(camera.quaternion);pose=watchPose(camera,{width:globalThis.innerWidth||390,height:globalThis.innerHeight||844});arm.position.set(pose.x-(1-amount)*.32,pose.y-(1-amount)*.5,pose.z);arm.scale.setScalar(pose.scale);arm.rotation.z=reduced?0:Math.sin(time*.8)*.006;
  angles=clockAngles(date);hands[0].rotation.z=angles.hour;hands[1].rotation.z=angles.minute;hands[2].rotation.z=angles.second;
 },get diagnostics(){return {visible:root.visible,active:!!target,angles,amount,handDirection:'right',handStyle:'soft-3d',handAsset:WATCH_HAND_ASSET,dial:'round',numerals:12,handLoaded:loaded,handFailed:failed,diameter:pose?.diameter||0};},dispose(){disposed=true;root.removeFromParent();textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
