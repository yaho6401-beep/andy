import {readRecord,writeStored} from '../src/client-state.js';
import {RELATIONSHIP_GUIDE} from './reading-guide.js';
import {BIBLE_BOOKS} from './bible-catalog.js';
import {CLASSIC_BOOKS} from './classics-catalog.js';
import {validLoan,loanRemaining,borrowBook} from './library-loan.js';
export {BIBLE_BOOKS};
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const TENT_BOOKS=[{id:'bible',x:-8.6,z:-5.15,title:'성경전서 · 펼쳐볼까?'},{id:'carnegie',x:7.4,z:-5.15,title:'인간관계론 · 펼쳐볼까?'}];
export const LIBRARY_BOOKS=[{id:'bible',title:'성경전서 개역한글판',author:'대한성서공회',mood:'구약 39권 · 신약 27권, 전체 66권'},{id:'carnegie',title:'인간관계론 · 독서 가이드',author:'책과향기 자체 해설',mood:'데일 카네기의 책을 읽는 이를 위한 8편의 글 · 완역본 아님'},...CLASSIC_BOOKS];
const ids=LIBRARY_BOOKS.map(b=>b.id);
export class TentReading{
 constructor(api){
  this.api=api;this.cache=new Map();this.state=readRecord('localStorage','bookscents-tent-reading',{});this.font=Math.max(18,Math.min(30,Number(this.state.font)||21));this.request=0;
  this.loan=validLoan(readRecord('localStorage','bookscents-library-loan',{}),ids);
  document.body.insertAdjacentHTML('beforeend',`<dialog id="tent-reader" class="tent-reader" aria-label="책과향기 독서창"><header><span><small>BOOKS & SCENTS · 조용한 독서</small><b id="reader-title"></b></span><button id="reader-close" aria-label="책 닫기">×</button></header><nav class="reader-tools"><select id="reader-book" aria-label="성경 책 선택"></select><select id="reader-chapter" aria-label="읽을 부분 선택"></select><button id="reader-smaller" aria-label="글자 작게">가−</button><button id="reader-larger" aria-label="글자 크게">가+</button></nav><article id="reader-text" tabindex="0"></article><footer><button id="reader-prev">이전</button><span id="reader-position"></span><button id="reader-next">다음</button></footer><div class="reader-loan"><button id="reader-borrow">책 빌려가기</button><span id="reader-loan-status" role="status"></span></div><p id="reader-credit"></p></dialog>
  <dialog id="library-catalog" class="tent-reader library-catalog" aria-label="책과향기 고전 서가"><header><span><small>THE READING GARDEN</small><b>모닥불 곁으로 가져갈 한 권</b></span><button id="library-close" aria-label="서가 닫기">×</button></header><p class="library-intro">성경전서와 인간관계론 독서 가이드, 한국어 고전 30편.<br>한 권을 빌리면 모닥불 앞에서도 읽을 수 있어요. 다른 책으로 바꾸기는 10분마다 가능합니다.</p><label class="library-search">책·작가 찾기<input id="library-search" type="search" placeholder="제목 또는 작가 이름" maxlength="80"></label><p id="library-count" class="library-count" aria-live="polite"></p><div id="library-list" class="library-list"></div><p class="library-license">고전은 옛 표기를 유지한 한국어 원작입니다. 작품별 원문 출처·전자 판본 이용 조건은 독서창 아래에서 확인할 수 있어요.</p></dialog>
  <button id="library-open" class="library-open" hidden>▤ 고전 서가 · 책 빌리기</button><button id="camp-borrowed-book" class="camp-borrowed-book" hidden></button>`);
  $('reader-close').onclick=()=>$('tent-reader').close();$('reader-book').onchange=()=>{this.book=$('reader-book').value;this.chapter=1;this.load();};$('reader-chapter').onchange=()=>{this.chapter=Number($('reader-chapter').value);this.render();};$('reader-smaller').onclick=()=>this.size(-1);$('reader-larger').onclick=()=>this.size(1);$('reader-prev').onclick=()=>this.turn(-1);$('reader-next').onclick=()=>this.turn(1);$('reader-borrow').onclick=()=>this.borrow(this.kind);
  $('library-close').onclick=()=>$('library-catalog').close();$('library-search').oninput=()=>this.renderCatalog();$('library-open').onclick=()=>this.openCatalog();$('camp-borrowed-book').onclick=()=>this.open(this.loan?.id);
  $('library-list').onclick=e=>{const b=e.target.closest('button[data-read]');if(b){$('library-catalog').close();this.open(b.dataset.read);}};
  this.onKey=e=>{if(!$('tent-reader').open||/SELECT|INPUT|BUTTON/.test(e.target.tagName))return;if(e.key==='ArrowLeft'){e.preventDefault();this.turn(-1);}if(e.key==='ArrowRight'){e.preventDefault();this.turn(1);}};document.addEventListener('keydown',this.onKey);
 }
 openCatalog(){this.api.stopInputs();$('library-search').value='';this.renderCatalog();if(!$('library-catalog').open)$('library-catalog').showModal();}
 renderCatalog(){const q=$('library-search').value.trim().toLocaleLowerCase(),books=LIBRARY_BOOKS.filter(b=>(b.title+' '+b.author).toLocaleLowerCase().includes(q));$('library-count').textContent=books.length+'권';$('library-list').innerHTML=books.map((b,i)=>`<article class="library-book" style="--spine:${['#72876b','#9b7968','#79788f','#a28e60'][i%4]}"><span class="library-book-spine" aria-hidden="true">${esc(b.author)}</span><div><small>${esc(b.author)}</small><h3>${esc(b.title)}</h3><p>${esc(b.mood)}</p><button data-read="${b.id}">펼쳐보기${this.loan?.id===b.id?' · 빌린 책':''} ↗</button></div></article>`).join('')||'<p>검색한 책이 없어요. 다른 제목이나 작가를 찾아보세요.</p>';}
 open(id){
  if(!ids.includes(id))return;this.api.stopInputs();this.kind=id;this.book=id==='bible'?(BIBLE_BOOKS.some(b=>b[0]===this.state.book)?this.state.book:'proverbs'):id;
  this.chapter=Math.max(1,Number(this.state[id]?.chapter)||1);$('reader-book').hidden=id!=='bible';$('reader-book').innerHTML=BIBLE_BOOKS.map(([key,name],i)=>'<option value="'+key+'">'+(i<39?'구약 · ':'신약 · ')+name+'</option>').join('');$('reader-book').value=this.book;
  $('reader-text').textContent='책을 펼치고 있어요…';$('reader-title').textContent=LIBRARY_BOOKS.find(b=>b.id===id).title;$('reader-borrow').disabled=true;$('reader-credit').textContent='';$('reader-prev').disabled=true;$('reader-next').disabled=true;
  if(!$('tent-reader').open)$('tent-reader').showModal();this.load();
 }
 async load(){const request=++this.request,book=this.book;try{
  if(this.kind!=='carnegie'&&!this.cache.has(book)){
   $('reader-text').textContent='책을 펼치고 있어요…';const r=await fetch('/archive/camp/reading/'+book+'.json');if(!r.ok)throw Error('본문을 불러오지 못했어요. 잠시 후 다시 펼쳐주세요.');const data=await r.json();
   if(!Array.isArray(data.chapters)||!data.chapters.length||(this.kind==='bible'&&data.chapters.length!==BIBLE_BOOKS.find(b=>b[0]===book)?.[2]))throw Error('본문 구성을 확인할 수 없어요.');
   if(this.cache.size>=4)this.cache.delete(this.cache.keys().next().value);this.cache.set(book,data);
  }
  if(request!==this.request||book!==this.book)return;this.render();
 }catch(e){if(request===this.request){$('reader-text').textContent=e.message;$('reader-borrow').disabled=true;}}
 }
 size(d){this.font=Math.max(18,Math.min(30,this.font+d));$('reader-text').style.fontSize=this.font+'px';this.save();}
 turn(d){const max=this.data()?.chapters.length||1;this.chapter=Math.max(1,Math.min(max,this.chapter+d));this.render();}
 data(){return this.kind==='carnegie'?RELATIONSHIP_GUIDE:this.cache.get(this.book);}
 save(){this.state={...this.state,font:this.font,book:this.kind==='bible'?this.book:this.state.book,[this.kind]:{chapter:this.chapter}};writeStored('localStorage','bookscents-tent-reading',JSON.stringify(this.state));}
 borrow(id){const result=borrowBook(this.loan,id,ids);if(!result.ok){this.paintLoan();return;}this.loan=result.loan;writeStored('localStorage','bookscents-library-loan',JSON.stringify(this.loan));this.api.toast?.('책을 챙겼어요. 모닥불 앞에서 빌린 책을 펼쳐보세요.');this.paintLoan();}
 paintLoan(){if(!this.kind)return;const same=this.loan?.id===this.kind,remaining=loanRemaining(this.loan);$('reader-borrow').disabled=!this.data()||same||remaining>0;$('reader-borrow').textContent=same?'가져온 책이에요':remaining>0?'다음 대여까지 '+Math.ceil(remaining/60000)+'분':'책 빌려가기';$('reader-loan-status').textContent=same?'모닥불 앞의 책 버튼으로 언제든 다시 읽을 수 있어요.':remaining>0?'지금 빌린 책은 계속 읽을 수 있어요.':'한 권씩, 다른 책으로 바꾸기는 10분마다.';}
 render(){const data=this.data();if(!data)return;this.chapter=Math.max(1,Math.min(data.chapters.length,this.chapter));const chapter=data.chapters[this.chapter-1],bible=this.kind==='bible';$('reader-title').textContent=bible?'성경전서 개역한글판 · '+data.book:data.book;$('reader-chapter').innerHTML=data.chapters.map((c,i)=>'<option value="'+(i+1)+'">'+(bible?(i+1)+'장':esc(c.title))+'</option>').join('');$('reader-chapter').value=this.chapter;
  $('reader-text').innerHTML=bible?'<h2>'+esc(data.book)+' '+this.chapter+'장</h2>'+chapter.verses.map(v=>'<p><sup>'+v.verse+'</sup>'+esc(v.text)+'</p>').join(''):'<h2>'+esc(chapter.title)+'</h2>'+chapter.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+(chapter.question?'<aside>잠깐 생각해보기<br>'+esc(chapter.question)+'</aside>':'');$('reader-text').style.fontSize=this.font+'px';$('reader-text').scrollTop=0;$('reader-position').textContent=this.chapter+' / '+data.chapters.length;$('reader-prev').disabled=this.chapter===1;$('reader-next').disabled=this.chapter===data.chapters.length;
  $('reader-credit').innerHTML=bible?'성경전서 개역한글판 (대한성서공회, 1961) · <a href="https://www.bskorea.or.kr/bbs/content.php?co_id=subpage2_3_4_1" target="_blank" rel="noopener">판본·이용 안내</a> · <a href="https://github.com/yuhwan/Bible-krv" target="_blank" rel="noopener">전자 본문 출처</a>':this.kind==='carnegie'?'책과향기 자체 해설 · 데일 카네기 『인간관계론』 독서 가이드 · 완역본 아님':esc(data.author)+' · '+esc(data.edition)+' · <a href="'+esc(data.source)+'" target="_blank" rel="noopener">원문·기여자 이력</a> · <a href="'+esc(data.license)+'" target="_blank" rel="noopener">전자 판본 CC BY-SA 4.0</a><br>'+esc(data.changes);
  this.save();this.paintLoan();
 }
 frame(){const s=this.api.state(),modal=!!document.querySelector('dialog[open]'),chat=!$('chat-panel').hidden;$('library-open').hidden=!s.joined||s.room!=='books'||modal||chat;const b=LIBRARY_BOOKS.find(b=>b.id===this.loan?.id),carried=$('camp-borrowed-book');carried.hidden=!s.joined||s.room!=='camp'||!this.api.focused()||modal||chat||document.body.classList.contains('camp-sky-active')||!b;carried.textContent=b?'▤ 빌린 책 · '+b.title:'';carried.setAttribute('aria-label',b?'빌린 책 읽기 · '+b.title:'빌린 책 읽기');carried.title=b?'빌린 책 읽기 · '+b.title:'';if($('tent-reader').open&&Date.now()-(this.loanPaintAt||0)>1000){this.loanPaintAt=Date.now();this.paintLoan();}}
 dispose(){document.removeEventListener('keydown',this.onKey);['tent-reader','library-catalog','library-open','camp-borrowed-book'].forEach(id=>$(id).remove());}
}
