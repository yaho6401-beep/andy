import * as T from 'three';
export function clockAngles(date=new Date()){
 const seconds=date.getSeconds()+date.getMilliseconds()/1000,minutes=date.getMinutes()+seconds/60;
 return {hour:-(date.getHours()%12+minutes/60)*Math.PI/6,minute:-minutes*Math.PI/30,second:-seconds*Math.PI/30};
}
// Original quiet analogue watch, with a small retro steel case and a fabric strap.
export function createWristwatch(parent){
 const root=new T.Group(),arm=new T.Group();root.name='my-analogue-wristwatch';root.visible=false;root.add(arm);parent.add(root);
 const geometries=[],materials=[],own=g=>(geometries.push(g),g),mat=o=>{const m=new T.MeshStandardMaterial(o);materials.push(m);return m;};
 const skin=mat({color:'#e2b48e',roughness:.82}),sleeve=mat({color:'#8fa7b2',roughness:1}),steel=mat({color:'#b7b9b5',metalness:.65,roughness:.3}),strap=mat({color:'#434c48',roughness:.95});
 const ball=own(new T.SphereGeometry(1,14,9)),box=own(new T.BoxGeometry(1,1,1));
 function piece(geo,material,x,y,z,sx,sy,sz){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);arm.add(m);return m;}
 piece(ball,sleeve,.065,-.29,-.025,.105,.24,.085);piece(ball,skin,.018,-.11,0,.089,.17,.067);piece(ball,skin,-.018,.105,.005,.106,.13,.05);
 for(let i=0;i<4;i++)piece(ball,skin,-.084+i*.049,.224-(i===0||i===3?.015:0),.006,.025,.085,.032);
 const thumb=piece(ball,skin,.11,.065,.005,.035,.085,.04);thumb.rotation.z=-.45;
 piece(box,strap,0,-.035,.064,.145,.37,.027);for(let i=0;i<5;i++)piece(box,steel,0,-.23-i*.018,.066,.14,.009,.024);
 const shape=new T.Shape(),w=.112,h=.127,r=.025;shape.moveTo(-w+r,-h);shape.lineTo(w-r,-h);shape.quadraticCurveTo(w,-h,w,-h+r);shape.lineTo(w,h-r);shape.quadraticCurveTo(w,h,w-r,h);shape.lineTo(-w+r,h);shape.quadraticCurveTo(-w,h,-w,h-r);shape.lineTo(-w,-h+r);shape.quadraticCurveTo(-w,-h,-w+r,-h);
 const caseGeo=own(new T.ExtrudeGeometry(shape,{depth:.028,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.009,bevelThickness:.008}));piece(caseGeo,steel,0,0,.086,1,1,1);piece(box,steel,.124,0,.10,.02,.036,.028);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#f3efdf';ctx.fillRect(0,0,256,256);ctx.translate(128,128);
 for(let i=0;i<60;i++){const a=i*Math.PI/30;ctx.save();ctx.rotate(a);ctx.strokeStyle=i%5?'#9b9b92':'#35423f';ctx.lineWidth=i%5?1.4:4;ctx.beginPath();ctx.moveTo(0,-(i%5?109:102));ctx.lineTo(0,-116);ctx.stroke();ctx.restore();}
 ctx.fillStyle='#42504d';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='20px sans-serif';for(const [n,x,y]of [['12',0,-78],['3',81,0],['6',0,79],['9',-81,0]])ctx.fillText(n,x,y);ctx.font='9px sans-serif';ctx.fillText('BOOKS & SCENTS',0,-42);ctx.font='8px sans-serif';ctx.fillText('A LITTLE PAUSE',0,44);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const faceMat=new T.MeshBasicMaterial({map:texture});materials.push(faceMat);piece(own(new T.PlaneGeometry(.20,.225)),faceMat,0,0,.124,1,1,1);
 const dark=mat({color:'#334440',roughness:.5}),red=mat({color:'#aa645b',roughness:.7}),hands=[];
 for(const [length,width,z,material]of [[.055,.009,.132,dark],[.082,.006,.137,dark],[.091,.002,.142,red]]){const pivot=new T.Group(),needle=new T.Mesh(box,material);needle.position.y=length/2-.012;needle.scale.set(width,length,.003);pivot.position.z=z;pivot.add(needle);arm.add(pivot);hands.push(pivot);}piece(ball,steel,0,0,.147,.012,.012,.005);
 let target=0,amount=0,angles={hour:0,minute:0,second:0};const offset=new T.Vector3();
 return {set(active){target=active?1:0;},update(time,camera,reduced=false,date=new Date()){amount=reduced?target:T.MathUtils.lerp(amount,target,.14);root.visible=amount>.015;if(!root.visible)return;root.position.copy(camera.position);root.quaternion.copy(camera.quaternion);const landscape=camera.aspect>1.4,short=!landscape&&(globalThis.innerHeight||844)<650;offset.set(landscape?-.66:short?-.30:-.28,(short?-.12:-.36)-(1-amount)*.7,-1.8);arm.position.copy(offset);arm.scale.setScalar(landscape?.88:short?.80:1);arm.rotation.z=.10+(reduced?0:Math.sin(time*.8)*.009);angles=clockAngles(date);hands[0].rotation.z=angles.hour;hands[1].rotation.z=angles.minute;hands[2].rotation.z=angles.second;},get diagnostics(){return {visible:root.visible,active:!!target,angles,amount};},dispose(){root.removeFromParent();texture.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
