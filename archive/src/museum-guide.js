import {INGREDIENTS} from './scent-exhibits.js';
import {ingredientPhotoHTML} from './ingredient-photos.js';
import {paintPublicPosts,PAPER} from './board-art.js';
import {MuseumFocus} from './museum-focus.js';
export const escapeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeText,date=value=>value?new Intl.DateTimeFormat('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Seoul'}).format(new Date(value)):'';
export function ingredientHTML(s,full=false,revealed=false,activeTab='impression'){
 const copy=revealed?s:s.blind;
 if(full){
  const tabs=[['impression','향의 느낌',copy.description],['blending','조합 힌트',copy.blending],['memory','기억 한 줄',copy.memory]],selected=tabs.some(t=>t[0]===activeTab)?activeTab:'impression';
  return `<section class="ingredient-reader" data-ingredient-card="${e(s.id)}">${ingredientPhotoHTML(s,true,revealed)}<header class="ingredient-heading"><p class="tiny">${e(s.code)} / ${e(s.zone)}</p><h2 class="ingredient-answer">${e(s.code)} · ${revealed?e(s.name):'어떤 향일까요?'}${revealed?`<small>${e(s.english)}</small>`:''}</h2><p class="museum-character">${e(s.character)}</p></header><nav class="ingredient-tabs" role="tablist" aria-label="전시 해설">${tabs.map(([id,label])=>`<button type="button" role="tab" id="ingredient-tab-${e(s.id)}-${id}" aria-controls="ingredient-panel-${e(s.id)}-${id}" aria-selected="${selected===id}" tabindex="${selected===id?0:-1}" data-ingredient-tab="${id}">${label}</button>`).join('')}</nav><div class="ingredient-reading">${tabs.map(([id,label,value])=>`<section role="tabpanel" id="ingredient-panel-${e(s.id)}-${id}" aria-labelledby="ingredient-tab-${e(s.id)}-${id}" ${selected===id?'':'hidden'}><h3>${label}</h3><p>${e(value)}</p>${id==='blending'?`<p class="museum-pairs">함께 살펴볼 향 · ${s.pairs.map(e).join(' / ')}</p>`:''}</section>`).join('')}</div><footer class="ingredient-reader-actions">${revealed?'<span class="ingredient-revealed">향 이름을 확인했어요</span>':`<button class="ingredient-reveal" data-reveal-ingredient="${e(s.id)}">향 이름 확인하기</button>`}<a href="/workshop/" target="_blank" rel="noopener noreferrer">나만의 향 조합하기 ↗</a></footer><p class="ingredient-reader-source">${e(s.source)} · 향료의 인상을 풀어 쓴 감성 안내</p></section>`;
 }
 return `<section data-ingredient-card="${e(s.id)}"><p class="tiny">${e(s.code)} / ${e(s.zone)}</p>${ingredientPhotoHTML(s,false,revealed)}${revealed?`<h2 class="ingredient-answer">${e(s.code)} · ${e(s.name)}<small>${e(s.english)}</small></h2>`:''}<p class="museum-character">${e(s.character)}</p><p>${e(copy.description)}</p><p class="museum-memory">${e(copy.memory)}</p></section>`;
}
export function publicPostHTML(n){return `<article class="reader-note public-post" style="--paper:${PAPER[n.color]||PAPER.butter}"><small>${e({message:'한마디',request:'요청사항',improvement:'개선사항'}[n.category]||'한마디')}</small><p>${e(n.body)}</p><footer><b>${e(n.nickname)}</b><time>${e(date(n.created_at))}</time></footer><small>♡ ${Number(n.hearts)||0} · 댓글 ${Number(n.comments)||0}</small></article>`;}
export class MuseumGuide{
 constructor({detail,openLocalBoard}){
  this.detail=detail;this.openLocalBoard=openLocalBoard;this.cache=new Map();this.version=0;this.key='';this.revealed=new Set();this.focus=new MuseumFocus();this.activeTab='impression';
  this.panel=document.createElement('aside');this.panel.id='museum-guide';this.panel.className='museum-guide';this.panel.hidden=true;this.panel.setAttribute('aria-label','가까운 전시와 게시글 안내');
  document.body.append(this.panel);
  this.panel.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.hasAttribute('data-guide-fold')){this.folded=!this.folded;this.renderProximity();}if(b.hasAttribute('data-reveal-ingredient'))this.revealIngredient(b.dataset.revealIngredient);if(b.hasAttribute('data-read-ingredient'))this.openIngredient(b.dataset.readIngredient);if(b.hasAttribute('data-read-public-board'))this.openPublicBoard();if(b.hasAttribute('data-retry-board'))this.load(1,true);});
  document.getElementById('detail-content').addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.hasAttribute('data-ingredient-tab'))this.selectTab(b.dataset.ingredientTab);if(b.hasAttribute('data-reveal-ingredient'))this.revealIngredient(b.dataset.revealIngredient);if(b.dataset.publicPage)this.openPublicBoard(Number(b.dataset.publicPage));if(b.hasAttribute('data-public-retry'))this.openPublicBoard(this.page||1,true);if(b.hasAttribute('data-local-board')){document.getElementById('detail').close();this.openLocalBoard();}});
  document.getElementById('detail-content').addEventListener('keydown',event=>{const tab=event.target.closest('[data-ingredient-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...tab.closest('[role=tablist]').querySelectorAll('[role=tab]')],i=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;this.selectTab(tabs[next].dataset.ingredientTab);tabs[next].focus();});
 }
 async load(page=1,force=false){
  const old=this.cache.get(page);if(!force&&old?.at>Date.now()-20000)return old.data;if(!force&&old?.promise)return old.promise;
  const promise=(async()=>{const r=await fetch('/api/archive-public-board?page='+page,{method:'GET',signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('board');const data=await r.json();if(!Array.isArray(data.items))throw Error('board');this.cache.set(page,{data,at:Date.now()});if(page===1){this.latest=data;paintPublicPosts(data.items,'ready');this.renderProximity();}return data;})();
  this.cache.set(page,{promise});try{return await promise;}catch(error){this.cache.delete(page);if(page===1){this.failed=true;this.latest=null;paintPublicPosts([],'error');this.renderProximity();}throw error;}
 }
 update(near,options){
  const wanted=this.focus.update(near,options),key=wanted?.id||'',{room}=options;
  if(key!==this.key){this.key=key;this.near=wanted;this.folded=false;this.room=room;this.renderProximity();if(wanted?.type==='board')this.load(1).catch(()=>{});}
  this.panel.hidden=!wanted;return !!wanted;
 }
 renderProximity(){
  if(!this.near)return;
  const s=INGREDIENTS.find(s=>s.id===this.near.id),isBoard=this.near.type==='board';
  this.panel.dataset.kind=isBoard?'board':'ingredient';
  this.panel.innerHTML=`<div class="museum-guide-head"><b>${isBoard?'게시판 · 실제로 남긴 이야기':e(s?.code)}</b><button data-guide-fold aria-label="전시 안내 접기">${this.folded?'펼치기':'접기'}</button></div>${this.folded?'':`<div class="museum-guide-body">${isBoard?(this.latest?`<p class="tiny">홈페이지 공개 방명록 · ${this.latest.total}개</p>${this.latest.items.slice(0,3).map(publicPostHTML).join('')}`:this.failed?'<p>게시글을 불러오지 못했어요.</p><button data-retry-board>다시 읽기</button>':'<p>실제 게시글을 읽어오는 중…</p>'):s?ingredientHTML(s,false,this.revealed.has(s.id)):''}</div><div class="museum-guide-actions">${!isBoard&&s&&!this.revealed.has(s.id)?`<button class="ingredient-reveal" data-reveal-ingredient="${e(s.id)}">향 이름 확인하기</button>`:''}<button class="museum-guide-open" ${isBoard?'data-read-public-board':`data-read-ingredient="${e(s?.id)}"`}>${isBoard?'전체 게시글 보기':'해설 더 읽기'} ↗</button></div>`}`;
 }
 openIngredient(id){const s=INGREDIENTS.find(s=>s.id===id);if(s){this.activeTab='impression';this.detail(ingredientHTML(s,true,this.revealed.has(id)));}}
 selectTab(id){if(!['impression','blending','memory'].includes(id))return;this.activeTab=id;const body=document.getElementById('detail-content');for(const tab of body.querySelectorAll('[data-ingredient-tab]')){const active=tab.dataset.ingredientTab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=!active;}}
 revealIngredient(id){
  const s=INGREDIENTS.find(s=>s.id===id);if(!s)return;
  this.revealed.add(id);this.renderProximity();
  const body=document.getElementById('detail-content');
  if(document.getElementById('detail').open&&body.querySelector('[data-ingredient-card]')?.dataset.ingredientCard===id){body.innerHTML=ingredientHTML(s,true,true,this.activeTab);document.getElementById('detail').scrollTop=0;}
 }
 async openPublicBoard(page=1,force=false){
  this.page=page;const version=++this.version;this.detail('<p class="tiny">BOOKS & SCENTS · PUBLIC BOARD</p><h2>함께 남긴 이야기</h2><p>실제 공개 게시글을 불러오고 있어요…</p>');
  const body=document.getElementById('detail-content');body.dataset.publicVersion=String(version);
  try{const data=await this.load(page,force);if(version!==this.version||body.dataset.publicVersion!==String(version)||!document.getElementById('detail').open)return;
   body.innerHTML=`<p class="tiny">HOMEPAGE GUESTBOOK · 공개 게시글</p><h2>함께 남긴 이야기</h2><p>책과향기 홈페이지에 실제로 남겨주신 ${data.total}개의 메모예요.</p><div class="note-board">${data.items.map(publicPostHTML).join('')||'<p>아직 공개된 메모가 없어요.</p>'}</div><nav class="note-pages"><button class="secondary" data-public-page="${Math.max(1,data.page-1)}" ${data.page<=1?'disabled':''}>이전</button><span>${data.page} / ${data.pages}</span><button class="secondary" data-public-page="${Math.min(data.pages,data.page+1)}" ${data.page>=data.pages?'disabled':''}>다음</button></nav><a class="primary" href="https://andy-plum.vercel.app/#feedback" target="_blank" rel="noopener noreferrer">홈페이지에서 글 남기기 ↗</a><button class="secondary" data-local-board>이 공간의 포스트잇 보기·남기기</button><p class="muted">공개 방명록을 읽어오는 게시판입니다. 비공개 신청서와 개인정보는 표시하지 않아요.</p>`;
  }catch{if(version===this.version&&body.dataset.publicVersion===String(version)&&document.getElementById('detail').open)body.innerHTML='<h2>게시글을 불러오지 못했어요.</h2><p>잠시 후 다시 읽어주세요.</p><button class="primary" data-public-retry>다시 읽기</button>';}
 }
}
