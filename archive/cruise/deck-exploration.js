import * as T from 'three';
import {SHIP_BENCHES,SHIP_EQUIPMENT,shipSurfaces} from './ship-layout.js';
import {seatApproach} from './deck-fixtures.js';
export function nearbyBench(viewer,radius=2.5){return SHIP_BENCHES.filter(s=>Math.abs(s.y-viewer.y)<.25&&Math.hypot(s.x-viewer.x,s.z-viewer.z)<radius).sort((a,b)=>Math.hypot(a.x-viewer.x,a.z-viewer.z)-Math.hypot(b.x-viewer.x,b.z-viewer.z))[0]||null;}
export function scenicEye(p,kind,base){const scope=SHIP_EQUIPMENT.find(f=>f.kind==='binocular'),eye=kind==='binocular'?new T.Vector3(scope.x+.9,scope.y+1.34,scope.z):new T.Vector3(p.x,p.y+1.6,p.z);if(kind!=='binocular'){if(Math.abs(Math.sin(base))>.6)eye.x=Math.sign(Math.sin(base))*17.7;else eye.z=Math.cos(base)>0?(p.z>31?71.5:-22.5):-71.5;}return eye;}
export const viewTurnSign=side=>side==='left'?1:-1;
export function viewAngles(kind,yaw,pitch){const limit=kind==='binocular'?Math.PI/3:Math.PI*.48;return{yaw:T.MathUtils.clamp(yaw,-limit,limit),pitch:T.MathUtils.clamp(pitch,-.3,.3)};}
// Only a visible, upward-facing deck hit can initiate travel. Never pick through equipment.
export function deckTarget(hit){if(!hit||!hit.object?.isMesh||!hit.face)return null;const n=hit.face.normal.clone().applyNormalMatrix(new T.Matrix3().getNormalMatrix(hit.object.matrixWorld));if(n.y<.65)return null;const p=hit.point,ys=shipSurfaces(p.x,p.z).filter(y=>Math.abs(y-p.y)<.12);return ys.length?{x:p.x,z:p.z,y:ys.sort((a,b)=>Math.abs(a-p.y)-Math.abs(b-p.y))[0]}:null;}
export function tapGesture(down,up){return !!down&&!down.cancelled&&Math.hypot(up.x-down.startX,up.y-down.startY)<=7;}

export class DeckExplorer{
 constructor({ship,canvas,camera,...api}){
  this.ship=ship;this.canvas=canvas;this.camera=camera;this.api=api;this.seat=null;this.view=null;this.turn=0;this.abort=new AbortController();const signal=this.abort.signal;this.ray=new T.Raycaster();
  document.body.insertAdjacentHTML('beforeend',`<aside id="deck-nearby" hidden aria-label="가까운 벤치"><button id="deck-sit">벤치에 앉기</button><button id="deck-seat-view" hidden>먼 풍경 보기</button></aside>`);
  document.getElementById('hint').before(Object.assign(document.createElement('div'),{id:'deck-view-controls',hidden:true,innerHTML:'<button id="deck-view-left" aria-label="풍경 왼쪽으로 보기">‹</button><button id="deck-view-label" aria-label="하늘과 별 보기">먼 풍경</button><button id="deck-view-right" aria-label="풍경 오른쪽으로 보기">›</button><button id="deck-view-close">돌아가기</button>'}));
  this.nearby=document.getElementById('deck-nearby');this.controls=document.getElementById('deck-view-controls');
  document.getElementById('deck-sit').onclick=()=>{if(this.seat){this.stand();return;}const seat=nearbyBench(api.viewer());if(seat)api.routeTo(seatApproach(seat),{seatId:seat.id},'벤치');};
  document.getElementById('deck-seat-view').onclick=()=>this.open('landscape');document.getElementById('deck-view-close').onclick=()=>this.close();
  for(const[id,sign]of[['deck-view-left',viewTurnSign('left')],['deck-view-right',viewTurnSign('right')]]){const b=document.getElementById(id);b.addEventListener('pointerdown',e=>{this.turn=sign;b.setPointerCapture(e.pointerId);},{signal});for(const name of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>this.turn=0,{signal});b.addEventListener('click',e=>{if(e.detail===0)this.rotate(sign*.15,0);},{signal});}
  canvas.addEventListener('pointerdown',e=>{if(!e.isPrimary){if(this.drag)this.drag.cancelled=true;return;}if(e.button!==0||api.locked())return;this.drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,cancelled:false};canvas.setPointerCapture(e.pointerId);},{signal});
  canvas.addEventListener('pointermove',e=>{const d=this.drag;if(api.locked()||d?.id!==e.pointerId)return;if(Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>7)d.cancelled=true;if(d.cancelled){const x=e.clientX-d.x,y=e.clientY-d.y;if(this.view)this.rotate(x*.0045,-y*.0025);else api.orbit(x*.005);}d.x=e.clientX;d.y=e.clientY;},{signal});
  canvas.addEventListener('pointerup',e=>{const d=this.drag;this.drag=null;if(!d||d.id!==e.pointerId||this.view||!tapGesture(d,{x:e.clientX,y:e.clientY})||document.querySelector('dialog[open]')||api.locked())return;const r=canvas.getBoundingClientRect();this.ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=this.ray.intersectObject(ship,true).find(h=>h.object.isMesh&&(!h.object.material.transparent||h.object.material.opacity>.4)),target=deckTarget(hit);if(target)api.routeTo(target,null,'선택한 갑판');},{signal});
  for(const name of['pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>this.drag=null,{signal});
  addEventListener('keydown',e=>{if(!this.view||api.locked()||document.querySelector('dialog[open]'))return;if(e.key==='Escape'){this.close();e.preventDefault();}if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();this.rotate(viewTurnSign(e.key==='ArrowLeft'?'left':'right')*.08,0);}},{signal});addEventListener('blur',()=>this.turn=0,{signal});
 }
 get viewing(){return !!this.view;}
 sit(id){const s=SHIP_BENCHES.find(s=>s.id===id);if(!s)return;this.seat=s;this.api.setSeat(s);}
 stand(preserveInput=false){if(!this.seat)return;const s=this.seat;this.seat=null;this.api.stand(seatApproach(s));this.close(!preserveInput);}
 open(kind='landscape'){this.api.stop();const p=this.api.viewer();this.view={kind,base:this.seat?.yaw??(p.z>31?0:p.z< -41?Math.PI:p.x<0?-Math.PI/2:Math.PI/2),yaw:0,pitch:0};this.controls.hidden=false;document.body.classList.add('deck-scenic');this.nearby.hidden=true;document.getElementById('deck-view-label').textContent=kind==='binocular'?'망원경 · 좌우로 둘러보세요':'먼 풍경 · 좌우로 둘러보세요';}
 close(stop=true){this.view=null;this.turn=0;this.controls.hidden=true;document.body.classList.remove('deck-scenic');if(stop)this.api.stop();}
 rotate(x,y){if(this.view)Object.assign(this.view,viewAngles(this.view.kind,this.view.yaw+x,this.view.pitch+y));}
 frame(dt,{blocked,hidden,moving}){if(this.view&&!blocked)this.rotate(this.turn*dt*.65,0);const p=this.api.viewer(),s=this.seat||nearbyBench(p),show=!!s&&!blocked&&!hidden&&!moving&&!this.view;this.nearby.hidden=!show;if(show){document.getElementById('deck-sit').textContent=this.seat?'사뿐히 일어나기':(s?.label?s.label+'에 앉기':'벤치에 앉기');document.getElementById('deck-seat-view').hidden=!this.seat;}}
 applyCamera(dt){const p=this.api.viewer(),v=this.view;if(!v)return;const eye=scenicEye(p,v.kind,v.base);const yaw=v.base+v.yaw,dir=new T.Vector3(Math.sin(yaw)*Math.cos(v.pitch),Math.sin(v.pitch),Math.cos(yaw)*Math.cos(v.pitch));this.camera.position.lerp(eye,1-Math.exp(-dt*9));this.camera.fov=T.MathUtils.lerp(this.camera.fov,v.kind==='binocular'?24:58,1-Math.exp(-dt*7));this.camera.updateProjectionMatrix();this.camera.lookAt(this.camera.position.clone().addScaledVector(dir,200));}
 get state(){const p=this.api.viewer();return{seatId:this.seat?.id||null,nearby:nearbyBench(p)?.id||null,view:this.view?{...this.view}:null,benches:SHIP_BENCHES.length,screenTargets:[[-3,-3],[3,-3],[-3,0],[3,0],[0,-4]].flatMap(([dx,dz])=>{const x=p.x+dx,z=p.z+dz,y=shipSurfaces(x,z).find(y=>Math.abs(y-p.y)<.1);if(y===undefined)return[];const ndc=new T.Vector3(x,y+.01,z).project(this.camera);return[{x,y,z,ndc:ndc.toArray()}];})};}
 dispose(){this.abort.abort();this.nearby.remove();this.controls.remove();document.body.classList.remove('deck-scenic');}
}
