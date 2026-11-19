import * as T from 'three';
export const HAND_LINES=[[2000,'손이 녹는다… 따뜻해진다.'],[7000,'조금 뜨겁다…'],[11000,'너무너무 뜨겁다…'],[15000,'이러다 손이 타버릴 것 같다…'],[18000,'앗 뜨거!!!']];
export class WarmingState{
 constructor(){this.started=null;this.line=-1;this.coolUntil=0;}
 start(now){if(now<this.coolUntil)return false;this.started=now;this.line=-1;return true;}
 stop(){this.started=null;this.line=-1;}
 tick(now){if(this.started===null)return null;const age=now-this.started;let text=null;for(let i=0;i<HAND_LINES.length;i++)if(age>=HAND_LINES[i][0]&&i>this.line){this.line=i;text=HAND_LINES[i][1];}if(age>=18000){this.stop();this.coolUntil=now+5000;return {text:'앗 뜨거! 손이 데인 듯하다… 잠깐 쉬어가자.',forced:true};}return text?{text,forced:false}:null;}
 get active(){return this.started!==null;}
}
export function createWarmingHands(parent){
 const root=new T.Group();root.name='my-warming-hands';parent.add(root);root.visible=false;
 const geo=new T.SphereGeometry(1,14,10),skin=new T.MeshStandardMaterial({color:'#e9bd9a',roughness:.82}),cuff=new T.MeshLambertMaterial({color:'#849dad'}),nail=new T.MeshStandardMaterial({color:'#eac4b0',roughness:.68}),crease=new T.MeshLambertMaterial({color:'#bd937b'}),hands=[];let meshes=0;
 const ball=(p,m,x,y,z,sx,sy,sz)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);meshes++;return o;};
 // Rounded palms, gently bent phalanges, subtle nails and ribbed sleeves share one geometry.
 for(const side of [-1,1]){const g=new T.Group();g.rotation.set(-.26,side*.24,side*.13);root.add(g);ball(g,cuff,0,-.025,.30,.113,.076,.17);ball(g,cuff,0,-.018,.20,.119,.081,.035);for(let j=0;j<4;j++)ball(g,cuff,0,-.012,.2+j*.035,.117,.079,.007);ball(g,skin,0,-.003,.14,.091,.051,.12);ball(g,skin,0,0,.025,.128,.053,.145);ball(g,skin,-side*.057,-.016,.045,.065,.044,.095);for(let i=0;i<4;i++){const x=(i-1.5)*.057,span=[.13,.155,.145,.108][i],base=-.075;const finger=ball(g,skin,x,-.002,base-span*.25,.027,.033,span*.56);finger.rotation.y=(i-1.5)*-.055;const tipZ=base-span*.82;ball(g,skin,x+(i-1.5)*.004,-.012,tipZ,.024,.029,span*.32);ball(g,nail,x+(i-1.5)*.004,.014,tipZ-.006,.017,.004,.026);ball(g,crease,x,.030,base-span*.35,.017,.002,.0028);}const thumb=ball(g,skin,side*.13,-.005,.025,.047,.039,.085);thumb.rotation.y=side*.6;const tip=ball(g,skin,side*.164,-.012,-.035,.035,.032,.061);tip.rotation.y=side*.62;ball(g,nail,side*.175,.012,-.061,.021,.004,.026).rotation.y=side*.6;hands.push({g,side});}
 let target=0,amount=0,heat=0,visibleFrames=0;const offset=new T.Vector3(),warmColor=new T.Color('#e5a47e');
 return {set(active,age=0){target=active?1:0;heat=Math.min(1,age/18000);},update(time,camera,reduced=false){amount=reduced?target:T.MathUtils.lerp(amount,target,target? .13:.3);root.visible=amount>.015;if(!root.visible)return;visibleFrames++;root.position.copy(camera.position);root.quaternion.copy(camera.quaternion);for(const {g,side}of hands){offset.set(side*(.39+(1-amount)*.35),-.43-(1-amount)*.65,-1.85);g.position.copy(offset);g.rotation.z=side*.12+(reduced?0:Math.sin(time*7+side)*heat*.025);}skin.color.set('#e9bd9a').lerp(warmColor,heat*.3);},get diagnostics(){return {visible:root.visible,amount,target,meshes,visibleFrames};},dispose(){root.removeFromParent();geo.dispose();[skin,cuff,nail,crease].forEach(m=>m.dispose());}};
}
