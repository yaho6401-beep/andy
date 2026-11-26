import {CAMP_PROPS,propHeld,nearbyCampProp} from './portable-props.js';
export class PortablePropsSession{
 constructor(api){this.api=api;this.pending=0;this.el=document.createElement('aside');this.el.id='camp-prop-tools';this.el.className='camp-prop-tools';this.el.hidden=true;this.el.setAttribute('aria-label','가까운 캠핑 물품');document.body.append(this.el);this.el.onclick=e=>{const b=e.target.closest('button[data-prop]');if(!b||this.pending)return;this.pending=performance.now();api.stop();api.send({type:b.dataset.action,spot:b.dataset.prop});};}
 frame(now){const s=this.api.state(),p=s.me?.mesh.position,pack=s.snapshot?.myPack;this.api.camp()?.setCanPack(pack,s.me);const blocked=!s.joined||s.room!=='camp'||!p||s.me.state.seat||s.me.state.swimming||s.me.state.voyage||s.focused||document.querySelector('dialog[open]')||!document.getElementById('chat-panel').hidden;this.el.hidden=!!blocked;if(blocked)return;if(this.pending&&now-this.pending>12000)this.pending=0;
  const near=nearbyCampProp(pack,p),held=CAMP_PROPS.filter(c=>propHeld(pack,c));const key=[near?.id,...held.map(c=>c.id),!!this.pending].join('|');if(key===this.key)return;this.key=key;this.el.replaceChildren();const add=(spot,action,label)=>{const b=document.createElement('button');b.type='button';b.dataset.prop=spot.id;b.dataset.action=action;b.textContent=label;b.disabled=!!this.pending;this.el.append(b);};if(near)add(near,'camp-prop-pickup',near.name+' 챙기기');for(const spot of held)add(spot,'camp-prop-drop',(spot.kind==='speaker'?'스피커':spot.name)+' 내려놓기');this.el.hidden=!this.el.childElementCount;
 }
 receipt(d){this.pending=0;this.key=null;this.api.toast(d.name+(d.dropped?'을 가까운 바닥에 내려놓았어요.':'을 챙겼어요.')+(d.kind==='speaker'&&d.picked?' 불멍 자리에서 음악을 틀 수 있어요.':''));}
 error(){this.pending=0;this.key=null;}
 dispose(){this.el.remove();}
}
