import * as T from 'three';
export const HAND_LINES=[[2000,'손이 녹는다… 따뜻해진다.'],[7000,'조금 뜨겁다…'],[11000,'너무너무 뜨겁다…'],[15000,'이러다 손이 타버릴 것 같다…'],[18000,'앗 뜨거!!!']];
export class WarmingState{
 constructor(){this.started=null;this.line=-1;this.coolUntil=0;this.flipped=false;this.lastFlip=-Infinity;this.comfort=0;this.startPending=null;this.flipPending=null;this.retryAfter=0;}
 start(now){if(now<this.coolUntil)return false;this.started=now;this.line=-1;this.flipped=false;this.lastFlip=-Infinity;this.comfort=0;this.startPending=this.flipPending=null;this.retryAfter=0;return true;}
 requestStart(now){if(!this.start(now))return false;this.startPending=now;return true;}
 age(now){return this.started===null||this.startPending!==null?0:Math.max(0,(this.flipPending??now)-this.started);}
 canFlip(now){return this.active&&this.startPending===null&&this.flipPending===null&&now>=this.retryAfter&&now-this.started>=1200&&now-this.lastFlip>=1200&&now-this.started<18000;}
 requestFlip(now){if(!this.canFlip(now))return false;this.flipPending=now;return true;}
 turn(now,age){this.comfort=age>=2500&&age<=10000?this.comfort+1:0;this.started=now;this.line=0;this.lastFlip=now;this.flipped=!this.flipped;return this.comfort>=2?'손을 번갈아 쬐니 기분까지 따뜻해진다…':'손을 살짝 뒤집어, 고르게 온기를 나눠요.';}
 flip(now){return this.canFlip(now)?this.turn(now,now-this.started):null;}
 acknowledge(d,now){if(!this.active||d.startedAt==null)return null;const serverAge=Math.max(0,(d.at??d.startedAt)-d.startedAt);if(d.flipped){if(this.flipPending===null)return null;const line=this.turn(now,this.age(now));this.flipPending=null;this.started=now-serverAge;return line;}if(this.startPending!==null){this.startPending=null;this.started=now-serverAge;}return null;}
 deferFlip(now){this.flipPending=null;this.retryAfter=now+1200;}
 stop(){this.started=null;this.line=-1;this.startPending=this.flipPending=null;}
 tick(now,serverHot=false){if(!this.active)return null;const pending=this.startPending??this.flipPending;if(pending!==null&&!serverHot){if(now-pending<12000)return null;this.stop();return {text:'연결이 늦어져 손을 잠시 거뒀어요. 다시 쬐어주세요.',connectionTimeout:true};}const age=now-this.started;let text=null;for(let i=0;i<HAND_LINES.length;i++)if(age>=HAND_LINES[i][0]&&i>this.line){this.line=i;text=HAND_LINES[i][1];}if(serverHot||age>=18000){this.stop();this.coolUntil=now+5000;return {text:'앗 뜨거! 손이 데인 듯하다… 잠깐 쉬어가자.',forced:true};}return text?{text,forced:false}:null;}
 get active(){return this.started!==null;}
}
// Only the approved illustrated hands can appear, including during a slow load.
export function createWarmingHands(parent,{loadTexture}={}){
 const root=new T.Group();root.name='my-warming-hands';root.visible=false;parent.add(root);
 const released=new WeakSet(),release=t=>{if(t&&!released.has(t)){released.add(t);t.dispose();}};
 let atlas=null,loaded=false,loading=false,failed=false,disposed=false,target=0,amount=0,flipTarget=0,flip=0,lastTime=null,visibleFrames=0;
 const material=new T.ShaderMaterial({transparent:true,side:T.DoubleSide,forceSinglePass:true,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{atlas:{value:null}},vertexShader:'varying vec2 handUV;void main(){handUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D atlas;varying vec2 handUV;void main(){vec2 uv=vec2(handUV.x,handUV.y*.5+(gl_FrontFacing?.5:0.));vec4 col=texture2D(atlas,uv);if(col.a<.78)discard;gl_FragColor=vec4(col.rgb*.96,col.a);\n#include <colorspace_fragment>\n}'});
 const hands=[-1,1].map(side=>{const geometry=new T.PlaneGeometry(.5067,.38);if(side===1){const uv=geometry.attributes.uv;for(let k=0;k<uv.count;k++)uv.setX(k,1-uv.getX(k));}const pose=new T.Group(),sprite=new T.Mesh(geometry,material);sprite.renderOrder=500;pose.add(sprite);root.add(pose);return {side,pose,sprite,geometry};});
 function prepare(){if(loaded||loading||failed||disposed||(!loadTexture&&typeof document==='undefined'))return;loading=true;
  const ready=t=>{if(disposed){release(t);return;}atlas=t;t.colorSpace=T.SRGBColorSpace;material.uniforms.atlas.value=t;loaded=true;loading=false;amount=0;lastTime=null;};
  const fail=()=>{if(disposed)return;loading=false;failed=true;target=0;root.visible=false;};
  try{atlas=loadTexture?loadTexture(ready,fail):new T.TextureLoader().load('/assets/camp/warming-hands-world-v4.png',ready,undefined,fail);}catch{fail();}
 }
 prepare();
 return {set(active,age=0,flipped=false){if(active&&!target){amount=0;flip=flipped?Math.PI:0;}if(active)prepare();target=active&&!failed?1:0;flipTarget=flipped?Math.PI:0;},update(time,camera,reduced=false){const dt=lastTime===null?1/60:Math.min(.06,Math.max(0,time-lastTime));lastTime=time;const readyTarget=loaded?target:0;amount=reduced?readyTarget:T.MathUtils.damp(amount,readyTarget,readyTarget?8:20,dt);root.visible=loaded&&amount>.015;if(!root.visible)return;visibleFrames++;flip=reduced?flipTarget:T.MathUtils.damp(flip,flipTarget,10,dt);root.position.copy(camera.position);root.quaternion.copy(camera.quaternion);const half=Math.tan(T.MathUtils.degToRad(camera.fov||58)/2)*1.85/(camera.zoom||1),aspect=camera.aspect||1,spread=Math.min(.34,half*aspect*.56),size=Math.min(1,half*aspect/.48);for(const {pose,sprite,side}of hands){sprite.rotation.y=side*flip;pose.position.set(side*(spread+(1-amount)*.35),-half*(aspect<1&&(globalThis.innerHeight||844)<650?.31:.46)-(1-amount)*.65,-1.85);pose.scale.setScalar(size*1.15);pose.rotation.z=side*.14;}},get diagnostics(){return {style:'cozy-world-atlas-v4',atlasLoaded:loaded,loading,loadFailed:failed,visible:root.visible,amount,target,flipped:flipTarget!==0,meshes:2,visibleFrames};},dispose(){if(disposed)return;disposed=true;release(atlas);root.removeFromParent();hands.forEach(h=>h.geometry.dispose());material.dispose();}};
}
