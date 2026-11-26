const LABELS={tuna:'참치캔',noodles:'컵라면'};
export class HiddenSnackSession{
 constructor(api){this.api=api;this.el=document.createElement('details');this.el.className='camp-hidden-snacks';this.el.hidden=true;this.el.innerHTML='<summary>발견한 간식</summary><div></div>';document.body.append(this.el);this.el.onclick=e=>{const b=e.target.closest('[data-hidden-eat]');if(!b||this.pending)return;this.pending=performance.now();api.send({type:'camp-hidden-eat',kind:b.dataset.hiddenEat});};}
 frame(){const s=this.api.state(),pack=s.snapshot?.myPack,items=pack?.hiddenSnacks,find=pack?.hiddenFind;if(s.joined&&find&&find.id!==this.seen){this.seen=find.id;if(s.snapshot.at-find.at<10000)this.api.toast('오? '+LABELS[find.kind]+'을 주웠다!'+(find.kind==='noodles'?' 온유 할아버지에게 뜨거운 물을 부탁해 볼까?':''));}
  if(this.pending&&performance.now()-this.pending>12000)this.pending=0;
  const total=(items?.tuna||0)+(items?.noodles||0);this.el.hidden=!s.joined||s.room!=='camp'||!total||!!document.querySelector('dialog[open]')||!document.getElementById('chat-panel')?.hidden;
  const parent=s.focused?document.querySelector('#camp-snack-box .camp-snack-panel'):document.getElementById('camp-prop-tools');if(parent&&this.el.parentNode!==parent)parent.append(this.el);this.el.classList.toggle('is-roaming',false);
  const key=[items?.tuna,items?.noodles,items?.hotWater,!!this.pending].join('|');if(this.key===key)return;this.key=key;this.el.querySelector('summary').textContent='발견한 간식 · '+total;
  const box=this.el.querySelector('div');box.replaceChildren();for(const kind of ['tuna','noodles'])if(items?.[kind]>0){const b=document.createElement('button');b.dataset.hiddenEat=kind;const water=kind==='noodles'&&!(items.hotWater>0);b.textContent=LABELS[kind]+' '+items[kind]+'개 · '+(water?'뜨거운 물이 필요해요':'먹기');b.disabled=!!this.pending||water;box.append(b);}const p=document.createElement('small');p.textContent=items?.noodles>0&&!(items.hotWater>0)?'온유 할아버지에게 뜨거운 물을 부탁해요.':'한 입의 행복 · 10분 동안 이동 ×2';box.append(p);
 }
 receipt(d){this.pending=0;this.key=null;if(d.hiddenEaten)this.api.toast(LABELS[d.kind]+'을 먹으니 기분이 좋아서 달릴 수 있게 되었다! 10분 동안 이동 ×2');}
 dispose(){this.el.remove();}
}
