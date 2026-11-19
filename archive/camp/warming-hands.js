import * as T from 'three';
export const HAND_LINES=[[2000,'손이 녹는다… 따뜻해진다.'],[7000,'조금 뜨겁다…'],[11000,'너무너무 뜨겁다…'],[15000,'이러다 손이 타버릴 것 같다…'],[18000,'앗 뜨거!!!']];
export class WarmingState{
 constructor(){this.started=null;this.line=-1;this.coolUntil=0;}
 start(now){if(now<this.coolUntil)return false;this.started=now;this.line=-1;return true;}
 stop(){this.started=null;this.line=-1;}
 tick(now){if(this.started===null)return null;const age=now-this.started;let text=null;for(let i=0;i<HAND_LINES.length;i++)if(age>=HAND_LINES[i][0]&&i>this.line){this.line=i;text=HAND_LINES[i][1];}if(age>=18000){this.stop();this.coolUntil=now+5000;return {text:'앗 뜨거!!!',forced:true};}return text?{text,forced:false}:null;}
 get active(){return this.started!==null;}
}
export function createWarmingHands(parent){
 const root=new T.Group();root.name='my-warming-hands';parent.add(root);root.visible=false;
 const geo=new T.SphereGeometry(1,10,7),skin=new T.MeshStandardMaterial({color:'#e9bd9a',roughness:.86}),cuff=new T.MeshLambertMaterial({color:'#a9becb'}),hands=[];
 const ball=(p,m,x,y,z,sx,sy,sz)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o;};
 for(const side of [-1,1]){const g=new T.Group();g.rotation.set(-.18,side*.18,side*.12);root.add(g);ball(g,cuff,0,-.025,.24,.115,.075,.16);ball(g,skin,0,0,.055,.135,.055,.17);for(let i=0;i<4;i++)ball(g,skin,(i-1.5)*.059,0,-.12-(i===1||i===2?.025:0),.029,.041,.105+(i===1||i===2?.02:0));const thumb=ball(g,skin,side*.14,-.005,.03,.047,.047,.11);thumb.rotation.y=side*.5;hands.push({g,side});}
 let target=0,amount=0,heat=0,visibleFrames=0;const offset=new T.Vector3(),warmColor=new T.Color('#e5a47e');
 return {set(active,age=0){target=active?1:0;heat=Math.min(1,age/18000);},update(time,camera,reduced=false){amount=reduced?target:T.MathUtils.lerp(amount,target,target? .13:.3);root.visible=amount>.015;if(!root.visible)return;visibleFrames++;root.position.copy(camera.position);root.quaternion.copy(camera.quaternion);for(const {g,side}of hands){offset.set(side*(.39+(1-amount)*.35),-.43-(1-amount)*.65,-1.85);g.position.copy(offset);g.rotation.z=side*.12+(reduced?0:Math.sin(time*7+side)*heat*.025);}skin.color.set('#e9bd9a').lerp(warmColor,heat*.3);},get diagnostics(){return {visible:root.visible,amount,target,meshes:14,visibleFrames};},dispose(){root.removeFromParent();geo.dispose();skin.dispose();cuff.dispose();}};
}
