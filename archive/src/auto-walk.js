import {PORTALS} from './protocol.js';
import {directEntry} from './room-entry.js';

export const WALK_DESTINATIONS=[['garden','햇살 정원'],['lobby','로비'],['scents','향기박물관'],['books','북라운지'],['salon','향기카페'],['camp','별빛 캠핑장']];
export function roomRoute(from,to){
 if(!Object.hasOwn(PORTALS,from)||!Object.hasOwn(PORTALS,to))return null;
 const queue=[[from]],seen=new Set([from]);
 for(let i=0;i<queue.length;i++){const path=queue[i],last=path.at(-1);if(last===to)return path;for(const gate of PORTALS[last])if(!seen.has(gate.to)){seen.add(gate.to);queue.push([...path,gate.to]);}}
 return null;
}
export function roomLanding(room){const p=directEntry(room);return p?{x:p.x,z:p.z}:room==='garden'?{x:0,z:5.5}:null;}

export class AutoWalk{
 constructor(api){
  this.api=api;this.destination=null;this.leg=null;this.room=null;this.standing=false;this.lastPlan=0;this.progressAt=0;
  const button=document.createElement('button');button.id='walk-shortcuts-open';button.className='dock-button';button.type='button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','walk-shortcuts');button.innerHTML='<span aria-hidden="true">↗</span>바로가기';document.querySelector('.dock-row').append(button);
  document.body.insertAdjacentHTML('beforeend','<section id="walk-shortcuts" class="walk-shortcuts" aria-label="걸어서 바로가기" hidden><header><strong>어디로 걸어갈까요?</strong><button id="walk-shortcuts-close" aria-label="바로가기 닫기">×</button></header><p>문을 지나 목적지까지 자동으로 걸어요.</p><div>'+WALK_DESTINATIONS.map(([id,label])=>'<button type="button" data-walk-room="'+id+'">'+label+'<span aria-hidden="true">↗</span></button>').join('')+'</div></section><button id="walk-cancel" class="walk-cancel" hidden><span id="walk-status"></span><span>취소 ×</span></button>');
  this.button=button;this.menu=document.getElementById('walk-shortcuts');this.cancelButton=document.getElementById('walk-cancel');
  button.onclick=()=>{this.menu.hidden=!this.menu.hidden;button.setAttribute('aria-expanded',String(!this.menu.hidden));this.paint();};document.getElementById('walk-shortcuts-close').onclick=()=>this.closeMenu();this.menu.onclick=e=>{const b=e.target.closest('[data-walk-room]');if(b)this.start(b.dataset.walkRoom);};this.cancelButton.onclick=()=>this.cancel();
 }
 closeMenu(){this.menu.hidden=true;this.button.setAttribute('aria-expanded','false');}
 start(room){
  const s=this.api.state();if(!s.joined||!roomRoute(s.room,room))return;
  this.api.stopInputs();this.closeMenu();this.destination=room;this.leg=null;this.room=null;this.standing=false;this.started=performance.now();this.progressAt=this.started;this.lastPosition=null;this.paint();
 }
 cancel(notify=true){const was=this.active;this.destination=null;this.leg=null;this.api.stopWalk();this.cancelButton.hidden=true;if(was&&notify)this.api.toast('자동 걷기를 멈췄어요.');}
 get active(){return this.destination!==null;}
 paint(){const s=this.api.state(),key=[s.room,s.joined,s.focused,this.destination].join('|');if(key===this.paintKey)return;this.paintKey=key;for(const b of this.menu.querySelectorAll('[data-walk-room]'))b.setAttribute('aria-current',b.dataset.walkRoom===s.room?'location':'false');this.button.hidden=!s.joined;this.cancelButton.hidden=!this.active||s.focused;document.getElementById('walk-status').textContent=this.active?WALK_DESTINATIONS.find(d=>d[0]===this.destination)[1]+'로 걷는 중':'';}
 frame(now){
  this.paint();if(!this.active)return;const s=this.api.state();if(!s.joined||s.focused||s.modal||s.chat){this.cancel(false);return;}
  if(s.manual){this.cancel(false);return;}
  if(s.seat){if(!this.standing){this.standing=true;this.api.stand();}return;}this.standing=false;
  if(s.transitioning)return;
  if(s.room!==this.room){this.room=s.room;this.leg=null;this.progressAt=now;this.lastPosition=null;}
  const p=s.position;if(!p)return;
  if(!this.lastPosition||Math.hypot(p.x-this.lastPosition.x,p.z-this.lastPosition.z)>.25){this.progressAt=now;this.lastPosition={x:p.x,z:p.z};}
  if(now-this.progressAt>14000){this.cancel(false);this.api.toast('길이 잠시 막혀 있어요. 열린 바닥에서 다시 선택해주세요.');return;}
  if(this.leg){const distance=Math.hypot(p.x-this.leg.point.x,p.z-this.leg.point.z);if(this.leg.kind==='final'&&distance<.5){const label=WALK_DESTINATIONS.find(d=>d[0]===this.destination)[1];this.cancel(false);this.api.toast(label+'에 도착했어요.');return;}if(this.leg.kind==='clear'&&s.armed||this.leg.kind==='portal'&&!s.armed)this.leg=null;else if(s.walking||distance<.2||now-this.lastPlan<600)return;else this.leg=null;}
  if(this.leg)return;
  const route=roomRoute(s.room,this.destination);if(!route){this.cancel(false);return;}
  const kind=!s.armed?'clear':route.length===1?'final':'portal',point=kind==='portal'?PORTALS[s.room].find(g=>g.to===route[1]):roomLanding(s.room);
  if(!point){this.cancel(false);return;}this.lastPlan=now;
  if(!this.api.walkTo(point)){this.cancel(false);this.api.toast('이 자리에서는 길을 찾지 못했어요. 열린 바닥에서 다시 선택해주세요.');return;}
  this.leg={kind,point};
 }
 dispose(){this.button.remove();this.menu.remove();this.cancelButton.remove();}
}
