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
// Sculpted palms and articulated fingers share the watch's matte skin and sage sleeves.
export function createWarmingHands(parent){
 const root=new T.Group();root.name='my-warming-hands';parent.add(root);root.visible=false;
 const geometries=[],materials=[],own=g=>(geometries.push(g),g),material=o=>{const m=new T.MeshStandardMaterial(o);materials.push(m);return m;};
 const skin=material({color:'#dec0a7',roughness:.94}),cuff=material({color:'#6f806d',roughness:1}),rib=material({color:'#81917b',roughness:1}),nail=material({color:'#ead1be',roughness:.8}),crease=material({color:'#bca08b',roughness:1});
 const sphere=own(new T.SphereGeometry(1,12,8)),tube=own(new T.CylinderGeometry(1,1,1,12)),finger=own(new T.CapsuleGeometry(1,1,4,10));let meshes=0;
 const piece=(g,geo,m,x,y,z,sx,sy,sz)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);g.add(o);meshes++;return o;};
 const shape=new T.Shape();shape.moveTo(-.071,.11);shape.bezierCurveTo(-.092,.04,-.105,-.045,-.094,-.099);shape.quadraticCurveTo(-.04,-.125,.077,-.108);shape.quadraticCurveTo(.115,-.045,.092,.032);shape.lineTo(.065,.113);shape.closePath();
 const palm=own(new T.ExtrudeGeometry(shape,{depth:.048,bevelEnabled:true,bevelThickness:.017,bevelSize:.015,bevelSegments:3,steps:1,curveSegments:10}));palm.rotateX(Math.PI/2);palm.translate(0,.024,0);
 const hands=[];let atlas,loaded=false,loading=false,disposed=false;const sprites=[];const spriteMat=new T.ShaderMaterial({transparent:true,side:T.DoubleSide,forceSinglePass:true,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{atlas:{value:null}},vertexShader:"varying vec2 handUV;void main(){handUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:"uniform sampler2D atlas;varying vec2 handUV;void main(){vec2 uv=vec2(handUV.x,handUV.y*.5+(gl_FrontFacing?.5:0.));vec4 col=texture2D(atlas,uv);if(col.a<.78)discard;gl_FragColor=vec4(col.rgb*.96,col.a);\n#include <colorspace_fragment>\n}"});materials.push(spriteMat);
 function loadAtlas(){if(loading||disposed||typeof document==='undefined')return;loading=true;atlas=new T.TextureLoader().load('/assets/camp/warming-hands-world-v4.png',t=>{if(disposed){t.dispose();return;}t.colorSpace=T.SRGBColorSpace;spriteMat.uniforms.atlas.value=t;loaded=true;},undefined,()=>{loading=false;});}

 for(const side of [-1,1]){const pose=new T.Group(),g=new T.Group();pose.add(g);root.add(pose);g.rotation.x=1.02;g.rotation.y=side*.20;
  piece(g,palm,skin,0,0,0,1,1,1);
  const sleeve=piece(g,tube,cuff,0,-.005,.287,.091,.27,.073);sleeve.rotation.x=Math.PI/2;
  const wrist=piece(g,tube,skin,0,-.005,.129,.064,.15,.042);wrist.rotation.x=Math.PI/2;
  for(let k=0;k<4;k++){const c=piece(g,tube,rib,0,-.004,.198+k*.008,.093,.003,.075);c.rotation.x=Math.PI/2;}
  for(let i=0;i<4;i++){const x=(i-1.5)*.049,length=[.125,.153,.142,.107][i],f=new T.Group();f.position.set(x,0,-.09);f.rotation.set(-.08,(i-1.5)*-.045,0);g.add(f);const r=[.023,.024,.023,.02][i];const a=piece(f,finger,skin,0,-.004,-length*.28,r,length*.25,r*.84);a.rotation.x=Math.PI/2;const b=piece(f,finger,skin,0,-.016,-length*.7,r*.89,length*.22,r*.78);b.rotation.x=Math.PI/2-.2;piece(f,sphere,nail,0,.001,-length*.85,r*.65,.0025,.017);piece(f,sphere,crease,0,.018,-length*.37,r*.64,.001,.0017);}
  const thumb=new T.Group();thumb.position.set(side*.087,-.012,.025);thumb.rotation.y=-side*.65;g.add(thumb);const a=piece(thumb,finger,skin,0,0,-.03,.031,.039,.026);a.rotation.x=Math.PI/2;const b=piece(thumb,finger,skin,0,-.008,-.087,.026,.027,.023);b.rotation.x=Math.PI/2-.18;piece(thumb,sphere,nail,0,.012,-.105,.018,.003,.022);
  for(const [x,z,turn,len]of [[-.025,.005,.35,.05],[.015,-.04,-.2,.065]]){const fold=piece(g,sphere,crease,x,-.044,z,len,.0012,.0016);fold.rotation.y=turn;}
  const sg=own(new T.PlaneGeometry(.5067,.38));if(side===1){const uv=sg.attributes.uv;for(let k=0;k<uv.count;k++)uv.setX(k,1-uv.getX(k));}const sprite=new T.Mesh(sg,spriteMat);sprite.renderOrder=500;sprite.visible=false;pose.add(sprite);sprites.push(sprite);hands.push({pose,g,sprite,side});
 }
 let target=0,amount=0,heat=0,flipTarget=0,flip=0,visibleFrames=0,lastTime=null;
 const warm=new T.Color('#dfaa88');
 return {set(active,age=0,flipped=false){target=active?1:0;if(active)loadAtlas();heat=Math.min(1,age/18000);flipTarget=flipped?Math.PI:0;},update(time,camera,reduced=false){const dt=lastTime===null?1/60:Math.min(.06,Math.max(0,time-lastTime));lastTime=time;amount=reduced?target:T.MathUtils.damp(amount,target,target?8:20,dt);root.visible=amount>.015;if(!root.visible)return;visibleFrames++;flip=reduced?flipTarget:T.MathUtils.damp(flip,flipTarget,10,dt);root.position.copy(camera.position);root.quaternion.copy(camera.quaternion);const half=Math.tan(T.MathUtils.degToRad(camera.fov||58)/2)*1.85/(camera.zoom||1),aspect=camera.aspect||1,spread=Math.min(.34,half*aspect*.56),size=Math.min(1,half*aspect/.48);for(const {pose,g,sprite,side}of hands){g.visible=!loaded;sprite.visible=loaded;sprite.rotation.y=side*flip;pose.position.set(side*(spread+(1-amount)*.35),-half*(aspect<1&&(globalThis.innerHeight||844)<650?.31:.46)-(1-amount)*.65,-1.85);pose.scale.setScalar(size*1.15);pose.rotation.z=side*.14;g.rotation.z=side*flip+(reduced?0:Math.sin(time*5+side)*heat*.015);}skin.color.set('#dec0a7').lerp(warm,heat*.16);},get diagnostics(){return {style:'cozy-world-atlas-v4',atlasLoaded:loaded,visible:root.visible,amount,target,flipped:flipTarget!==0,meshes,visibleFrames};},dispose(){disposed=true;atlas?.dispose();root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
