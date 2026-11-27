import * as T from 'three';
import {GARDEN} from './garden-layout.js';
import {CruiseMapJourney} from './cruise-map-journey.js';

export class CruiseMapDiscovery{
 constructor(api){
  this.api=api;this.journey=new CruiseMapJourney(api);this.inside=false;
  document.body.insertAdjacentHTML('beforeend',`<button id="cruise-gift-discover" class="cruise-gift-discover" hidden><span aria-hidden="true">✧</span> 작은 선물상자 발견</button>
   <dialog id="cruise-map-dialog" class="cruise-map-dialog" aria-labelledby="cruise-map-title"><button id="cruise-map-close" class="cruise-map-close" aria-label="지도 닫기">×</button><p class="cruise-map-kicker">A LITTLE SECRET · BLUE HORIZON</p><div class="cruise-map-illustration" aria-hidden="true"><svg viewBox="0 0 300 136" fill="none"><path d="M14 35 90 19l119 15 76-17v100l-76 13-119-16-76 16Z" fill="#ece3cd"/><path d="m90 19 0 95m119-80v96" stroke="#d4c4a4"/><path d="M49 95c20-60 64-63 102-32s53 24 83-6" stroke="#82928b" stroke-width="2" stroke-dasharray="4 5"/><path d="m222 57 12-7 8 16m-12-26h17l9 14h-36Zm-9 19h47l-8 10h-31Z" fill="#526e6b"/><circle cx="50" cy="94" r="4" fill="#b59760"/><path d="m60 46 9-17 9 17Zm9-17v31" stroke="#71846b" stroke-width="2"/></svg></div><h2 id="cruise-map-title">크루즈 가는 지도를 발견했다!</h2><p>상자 속에 작은 승선 티켓이 있다.<br>캠핑장 끝 조각배를 타면,<br>수평선 너머 크루즈로 이어진다는데…</p><div class="cruise-map-choices"><button id="cruise-map-go" class="primary">가볼까? <span aria-hidden="true">↗</span></button><button id="cruise-map-later" class="secondary">나중에</button></div><small>선택하면 조각배까지 달려간 뒤, 배를 타고 크루즈에 올라요.</small></dialog>`);
  this.dialog=document.getElementById('cruise-map-dialog');this.button=document.getElementById('cruise-gift-discover');
  this.button.onclick=()=>this.open();
  for(const id of ['cruise-map-close','cruise-map-later'])document.getElementById(id).onclick=()=>this.dialog.close();
  document.getElementById('cruise-map-go').onclick=()=>{this.dialog.close();if(this.journey.start(performance.now()))api.toast('지도를 따라 캠핑장 조각배로 출발해요.');};
  this.dialog.addEventListener('close',()=>{this.inside=true;});
  const g=GARDEN.cruiseGift;this.bounds=new T.Box3(new T.Vector3(g.x-.65,0,g.z-.55),new T.Vector3(g.x+.65,1.1,g.z+.55));this.hit=new T.Vector3();
  this.cancelButton=document.createElement('button');this.cancelButton.id='cruise-map-cancel';this.cancelButton.textContent='자동 승선 그만하기';this.cancelButton.className='cruise-map-cancel';this.cancelButton.hidden=true;document.getElementById('sea-boat-guide').append(this.cancelButton);this.cancelButton.onclick=()=>this.journey.cancel();
 }
 open(){const s=this.api.state(),p=s.position;if(!s.joined||s.room!=='garden'||!p||Math.hypot(p.x-GARDEN.cruiseGift.x,p.z-GARDEN.cruiseGift.z)>3.2||s.blocked||this.journey.active)return;this.api.stop();this.inside=true;this.button.hidden=true;this.dialog.showModal();}
 touch(ray){const s=this.api.state();if(s.room==='garden'&&s.position&&Math.hypot(s.position.x-GARDEN.cruiseGift.x,s.position.z-GARDEN.cruiseGift.z)<3.2&&ray.ray.intersectBox(this.bounds,this.hit)){this.open();return true;}return false;}
 frame(now){
  this.journey.frame(now);const s=this.api.state(),p=s.position,distance=s.room==='garden'&&p?Math.hypot(p.x-GARDEN.cruiseGift.x,p.z-GARDEN.cruiseGift.z):Infinity;
  if(distance>4.2)this.inside=false;
  const available=s.joined&&s.room==='garden'&&!s.blocked&&!s.player?.seat&&!this.journey.active;
  this.button.hidden=!available||distance>3.1;
  if(available&&distance<2.35&&!this.inside)this.open();
  this.cancelButton.hidden=!['launching','sailing'].includes(this.journey.stage);
 }
 get diagnostics(){return {stage:this.journey.stage,discovered:this.inside,open:this.dialog.open,gift:{...GARDEN.cruiseGift}};}
 dispose(){this.journey.cancel();this.dialog.remove();this.button.remove();this.cancelButton.remove();}
}
