import {INGREDIENTS} from './scent-exhibits.js';
import {paintPublicPosts,PAPER} from './board-art.js';
export const escapeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeText,date=value=>value?new Intl.DateTimeFormat('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Seoul'}).format(new Date(value)):'';
export function ingredientHTML(s,full=false){return `<p class="tiny">${e(s.code)} / ${e(s.zone)} · ${e(s.english)}</p>${full?`<h2>${e(s.name)}</h2>`:''}<p class="museum-character">${e(s.character)}</p><p>${e(s.description)}</p>${full?`<h3>조합을 상상해보세요</h3><p>${e(s.blending)}</p><p class="museum-pairs">함께 살펴볼 향 · ${s.pairs.map(code=>e(code+' '+INGREDIENTS.find(n=>n.code===code)?.name)).join(' / ')}</p><h3>향으로 남길 이야기</h3><p>${e(s.memory)}</p><p class="muted">${e(s.source)} · 향료의 인상을 풀어 쓴 감성 안내입니다.</p>`:`<p class="museum-memory">${e(s.memory)}</p>`}`;}
export function publicPostHTML(n){return `<article class="reader-note public-post" style="--paper:${PAPER[n.color]||PAPER.butter}"><small>${e({message:'한마디',request:'요청사항',improvement:'개선사항'}[n.category]||'한마디')}</small><p>${e(n.body)}</p><footer><b>${e(n.nickname)}</b><time>${e(date(n.created_at))}</time></footer><small>♡ ${Number(n.hearts)||0} · 댓글 ${Number(n.comments)||0}</small></article>`;}
export class MuseumGuide{
 constructor({detail,openLocalBoard}){
  this.detail=detail;this.openLocalBoard=openLocalBoard;this.cache=new Map();this.version=0;this.key='';
  this.panel=document.createElement('aside');this.panel.id='museum-guide';this.panel.className='museum-guide';this.panel.hidden=true;this.panel.setAttribute('aria-label','가까운 전시와 게시글 안내');
  document.body.append(this.panel);
  this.panel.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.hasAttribute('data-guide-fold')){this.folded=!this.folded;this.renderProximity();}if(b.hasAttribute('data-read-ingredient'))this.openIngredient(b.dataset.readIngredient);if(b.hasAttribute('data-read-public-board'))this.openPublicBoard();if(b.hasAttribute('data-retry-board'))this.load(1,true);});
  document.getElementById('detail-content').addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.publicPage)this.openPublicBoard(Number(b.dataset.publicPage));if(b.hasAttribute('data-public-retry'))this.openPublicBoard(this.page||1,true);if(b.hasAttribute('data-local-board')){document.getElementById('detail').close();this.openLocalBoard();}});
 }
 async load(page=1,force=false){
  const old=this.cache.get(page);if(!force&&old?.at>Date.now()-20000)return old.data;if(!force&&old?.promise)return old.promise;
  const promise=(async()=>{const r=await fetch('/api/archive-public-board?page='+page,{method:'GET',signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('board');const data=await r.json();if(!Array.isArray(data.items))throw Error('board');this.cache.set(page,{data,at:Date.now()});if(page===1){this.latest=data;paintPublicPosts(data.items,'ready');this.renderProximity();}return data;})();
  this.cache.set(page,{promise});try{return await promise;}catch(error){this.cache.delete(page);if(page===1){this.failed=true;this.latest=null;paintPublicPosts([],'error');this.renderProximity();}throw error;}
 }
 update(near,{enabled,modal,room}){
  const wanted=enabled&&near&&['ingredient','board'].includes(near.type)?near:null,key=wanted?.id||'';
  if(key!==this.key){this.key=key;this.near=wanted;this.folded=false;this.room=room;this.renderProximity();if(wanted?.type==='board')this.load(1).catch(()=>{});}
  this.panel.hidden=!wanted||modal;return !!wanted;
 }
 renderProximity(){
  if(!this.near)return;
  const s=INGREDIENTS.find(s=>s.id===this.near.id),isBoard=this.near.type==='board';
  this.panel.dataset.kind=isBoard?'board':'ingredient';
  this.panel.innerHTML=`<div class="museum-guide-head"><b>${isBoard?'게시판 · 실제로 남긴 이야기':e((s?.code||'')+' · '+(s?.name||''))}</b><button data-guide-fold aria-label="전시 안내 접기">${this.folded?'펼치기':'접기'}</button></div>${this.folded?'':`<div class="museum-guide-body">${isBoard?(this.latest?`<p class="tiny">홈페이지 공개 방명록 · ${this.latest.total}개</p>${this.latest.items.slice(0,3).map(publicPostHTML).join('')}`:this.failed?'<p>게시글을 불러오지 못했어요.</p><button data-retry-board>다시 읽기</button>':'<p>실제 게시글을 읽어오는 중…</p>'):s?ingredientHTML(s):''}</div><button class="museum-guide-open" ${isBoard?'data-read-public-board':`data-read-ingredient="${e(s?.id)}"`}>${isBoard?'전체 게시글 보기':'전시 해설 더 읽기'} ↗</button>`}`;
 }
 openIngredient(id){const s=INGREDIENTS.find(s=>s.id===id);if(s)this.detail(ingredientHTML(s,true));}
 async openPublicBoard(page=1,force=false){
  this.page=page;const version=++this.version;this.detail('<p class="tiny">BOOKS & SCENTS · PUBLIC BOARD</p><h2>함께 남긴 이야기</h2><p>실제 공개 게시글을 불러오고 있어요…</p>');
  const body=document.getElementById('detail-content');body.dataset.publicVersion=String(version);
  try{const data=await this.load(page,force);if(version!==this.version||body.dataset.publicVersion!==String(version)||!document.getElementById('detail').open)return;
   body.innerHTML=`<p class="tiny">HOMEPAGE GUESTBOOK · 공개 게시글</p><h2>함께 남긴 이야기</h2><p>책과향기 홈페이지에 실제로 남겨주신 ${data.total}개의 메모예요.</p><div class="note-board">${data.items.map(publicPostHTML).join('')||'<p>아직 공개된 메모가 없어요.</p>'}</div><nav class="note-pages"><button class="secondary" data-public-page="${Math.max(1,data.page-1)}" ${data.page<=1?'disabled':''}>이전</button><span>${data.page} / ${data.pages}</span><button class="secondary" data-public-page="${Math.min(data.pages,data.page+1)}" ${data.page>=data.pages?'disabled':''}>다음</button></nav><a class="primary" href="https://andy-plum.vercel.app/#feedback" target="_blank" rel="noopener noreferrer">홈페이지에서 글 남기기 ↗</a><button class="secondary" data-local-board>이 공간의 포스트잇 보기·남기기</button><p class="muted">공개 방명록을 읽어오는 게시판입니다. 비공개 신청서와 개인정보는 표시하지 않아요.</p>`;
  }catch{if(version===this.version&&body.dataset.publicVersion===String(version)&&document.getElementById('detail').open)body.innerHTML='<h2>게시글을 불러오지 못했어요.</h2><p>잠시 후 다시 읽어주세요.</p><button class="primary" data-public-retry>다시 읽기</button>';}
 }
}
