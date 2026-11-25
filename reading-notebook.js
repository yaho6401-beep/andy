import {Account} from './member-account.js';
import {QUOTE_LIMIT} from './reading-notebook-model.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
class ReadingNotebook{
 constructor(){
  if(!document.querySelector('link[data-notebook-style]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/reading-notebook.css?v=1';l.dataset.notebookStyle='';document.head.append(l);}
  this.items=[];this.page=0;this.generation=0;this.busy=false;
  document.body.insertAdjacentHTML('beforeend',`<dialog id="my-notebook" class="notebook-dialog" aria-labelledby="notebook-title"><header><div><small>MY COLLECTED PAGES</small><h2 id="notebook-title">내 수첩</h2></div><button type="button" data-notebook-close aria-label="수첩 닫기">×</button></header><p class="notebook-intro">마음에 남은 문장들을 모아, 나만의 한 권으로.<br>내 계정에 비공개로 보관합니다.</p><nav class="notebook-tools"><button type="button" id="notebook-add">＋ 직접 옮겨 적기</button><button type="button" id="notebook-export">글 파일로 보관</button></nav><label class="notebook-search">문장·책·내 생각 찾기<input id="notebook-search" type="search" maxlength="100" placeholder="수첩 속에서 찾아보세요"></label><p id="notebook-status" role="status" aria-live="polite"></p><section id="notebook-page" class="notebook-paper" tabindex="0"></section><footer><button type="button" id="notebook-prev">← 이전</button><span id="notebook-position"></span><button type="button" id="notebook-next">다음 →</button></footer></dialog>
  <dialog id="notebook-compose" class="notebook-dialog notebook-compose" aria-labelledby="notebook-compose-title"><header><div><small>A SENTENCE TO KEEP</small><h2 id="notebook-compose-title">내 수첩에 옮기기</h2></div><button type="button" data-notebook-close aria-label="옮겨 적기 닫기">×</button></header><form id="notebook-form"><label>페이지 제목<input name="title" maxlength="160" placeholder="오늘 마음에 남은 문장"></label><div class="notebook-source-fields"><label>책 이름 · 출처<input name="sourceTitle" maxlength="200" placeholder="어떤 책에서 만났나요?"></label><label>읽던 위치<input name="location" maxlength="180" placeholder="장·절 또는 쪽수"></label></div><label>간직할 문장<textarea name="quote" maxlength="4000" required placeholder="책에서 복사한 구절이나 문장을 여기에 붙여넣으세요."></textarea></label><small id="notebook-length"></small><label>나의 생각 · 선택<textarea name="note" maxlength="1000" placeholder="이 문장이 내게 남긴 것"></textarea></label><p class="notebook-privacy">로그인한 나만 다시 읽을 수 있어요. 출처를 함께 남겨주세요.</p><p id="notebook-compose-status" role="status" aria-live="polite"></p><button type="submit" class="notebook-primary">내 수첩에 저장</button></form></dialog>`);
  this.$=id=>document.getElementById(id);this.dialog=this.$('my-notebook');this.compose=this.$('notebook-compose');this.form=this.$('notebook-form');
  for(const d of [this.dialog,this.compose])d.querySelector('[data-notebook-close]').onclick=()=>d.close();
  this.$('notebook-search').oninput=()=>{this.page=0;this.paint();};this.$('notebook-prev').onclick=()=>{this.page--;this.paint();};this.$('notebook-next').onclick=()=>{this.page++;this.paint();};this.$('notebook-add').onclick=()=>this.edit();this.$('notebook-export').onclick=()=>this.export();
  this.form.elements.quote.oninput=()=>this.count();this.form.onsubmit=e=>{e.preventDefault();this.save();};
  this.$('notebook-page').onclick=e=>{const b=e.target.closest('button');if(!b||this.busy)return;const item=this.items.find(r=>r.id===(b.dataset.notebookEdit||b.dataset.notebookDelete));if(!item)return;if(b.dataset.notebookEdit)this.edit(item);else this.remove(item);};
  this.owner=Account.profile?.id;Account.subscribe(p=>{if(this.owner===p?.id)return;const hadOwner=!!this.owner;this.owner=p?.id;this.generation++;this.items=[];this.page=0;this.$('notebook-page').replaceChildren();this.dialog.close();if(hadOwner){this.compose.close();this.form.reset();this.draft=null;}});
  this.compose.addEventListener('close',()=>{this.form.reset();this.draft=null;});
 }
 async open(){
  if(!await Account.require('내 수첩은 로그인 후 펼칠 수 있어요. 같은 계정으로 다른 기기에서도 이어서 읽어요.'))return;
  const generation=++this.generation;this.owner=Account.profile.id;this.items=[];this.page=0;this.$('notebook-search').value='';this.paint();this.$('notebook-status').textContent='문장들을 불러오고 있어요…';if(!this.dialog.open)this.dialog.showModal();
  try{const items=await Account.records('notebook');if(generation!==this.generation)return;this.items=items.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));this.paint();this.$('notebook-status').textContent='';}catch(e){if(generation===this.generation)this.$('notebook-status').textContent=e.message;}
 }
 edit(value={}){
  if(this.busy)return;this.draft={...value};for(const key of ['title','sourceTitle','location','quote','note'])this.form.elements[key].value=value[key]||'';
  this.$('notebook-compose-title').textContent=value.id?'수첩의 한 페이지 다듬기':'내 수첩에 옮기기';this.$('notebook-compose-status').textContent='';this.count();if(!this.compose.open)this.compose.showModal();
 }
 count(){this.$('notebook-length').textContent=this.form.elements.quote.value.length.toLocaleString()+' / '+QUOTE_LIMIT.toLocaleString()+'자';}
 async save(){
  if(this.busy)return;const f=this.form,values=Object.fromEntries(new FormData(f));if(!values.quote.trim())return;
  this.busy=true;f.querySelector('[type=submit]').disabled=true;this.$('notebook-compose-status').textContent='내 계정에 옮기고 있어요…';
  const draft=this.draft||{},wasOwner=Account.profile?.id;try{
   const profile=await Account.require('선택한 문장을 내 수첩에 보관하려면 로그인해 주세요.');if(!profile)throw Error('문장은 그대로 두었어요. 로그인 후 저장해 주세요.');
   if(wasOwner&&wasOwner!==profile.id)throw Error('계정이 바뀌었어요. 수첩을 다시 열어주세요.');
   const row={...draft,...values,id:draft.id||crypto.randomUUID(),date:draft.date||new Date().toISOString()};
   const generation=this.generation,saved=await Account.save('notebook',row);if(generation!==this.generation||profile.id!==Account.profile?.id)return;this.items=[...this.items.filter(r=>r.id!==saved.id),saved].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));this.compose.close();if(this.dialog.open){this.$('notebook-search').value='';this.page=this.items.findIndex(r=>r.id===saved.id);this.paint();this.$('notebook-status').textContent='한 페이지를 간직했어요.';}else{this.onSaved?.();}
  }catch(e){this.$('notebook-compose-status').textContent=e.message;}finally{this.busy=false;f.querySelector('[type=submit]').disabled=false;}
 }
 filtered(){const q=this.$('notebook-search').value.trim().toLocaleLowerCase();return this.items.filter(r=>[r.quote,r.title,r.sourceTitle,r.location,r.note].join(' ').toLocaleLowerCase().includes(q));}
 paint(){
  const rows=this.filtered();this.page=Math.max(0,Math.min(rows.length-1,this.page));const row=rows[this.page];
  this.$('notebook-position').textContent=rows.length?(this.page+1)+' / '+rows.length+' 페이지':'아직 빈 수첩이에요';this.$('notebook-prev').disabled=!rows.length||this.page===0;this.$('notebook-next').disabled=!rows.length||this.page===rows.length-1;this.$('notebook-export').disabled=!this.items.length;
  this.$('notebook-page').innerHTML=row?`<small class="notebook-date">${esc(new Date(row.date).toLocaleDateString('ko-KR'))}</small><h3>${esc(row.title)}</h3><blockquote>${esc(row.quote)}</blockquote><p class="notebook-origin">${esc(row.sourceTitle)}${row.location?' · '+esc(row.location):''}${row.author?'<br>'+esc(row.author):''}</p>${row.note?'<aside><small>이 문장 곁에 남긴 나의 생각</small><p>'+esc(row.note)+'</p></aside>':''}${row.credit?'<p class="notebook-credit">'+esc(row.credit)+'</p>':''}<div class="notebook-credits">${this.link(row.sourceUrl,'원문 출처')}${this.link(row.licenseUrl,'판본 이용 안내')}</div><div class="notebook-page-actions"><button type="button" data-notebook-edit="${esc(row.id)}">다듬기</button><button type="button" data-notebook-delete="${esc(row.id)}">이 페이지 삭제</button></div>`:'<div class="notebook-empty"><span aria-hidden="true">▤</span><h3>'+ (this.items.length?'찾는 문장이 아직 없어요':'당신만의 책, 첫 페이지')+'</h3><p>책을 읽다가 마음에 남은 문장을 골라<br>‘내 수첩에 옮기기’를 눌러보세요.<br>직접 복사한 글도 붙여넣을 수 있어요.</p></div>';
  this.$('notebook-page').scrollTop=0;
 }
 link(url,label){try{const u=new URL(url);return u.protocol==='https:'?'<a href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer">'+label+' ↗</a>':'';}catch{return '';}}
 async remove(row){if(!confirm('이 페이지를 내 수첩에서 삭제할까요?'))return;this.busy=true;const generation=this.generation;try{await Account.remove('notebook',row.id);if(generation!==this.generation)return;this.items=this.items.filter(r=>r.id!==row.id);this.paint();this.$('notebook-status').textContent='페이지를 지웠어요.';}catch(e){if(generation===this.generation)this.$('notebook-status').textContent=e.message;}finally{this.busy=false;}}
 export(){const text='내 수첩 · 책과향기\n\n'+this.items.map(r=>r.title+'\n'+r.quote+'\n— '+r.sourceTitle+' '+r.location+(r.author?' · '+r.author:'')+(r.note?'\n\n나의 생각: '+r.note:'')+'\n'+[r.credit,r.sourceUrl,r.licenseUrl].filter(Boolean).join('\n')).join('\n\n──────────\n\n'),url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='책과향기_내수첩.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
export function notebook(){return globalThis.BooksScentsNotebook||(globalThis.BooksScentsNotebook=new ReadingNotebook());}
if(typeof document!=='undefined'&&!globalThis.booksScentsNotebookBound){globalThis.booksScentsNotebookBound=true;document.addEventListener('click',e=>{const b=e.target.closest('[data-notebook-open]');if(b){e.preventDefault();notebook().open();}});}
