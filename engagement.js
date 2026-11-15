(function(g){
 'use strict';
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const diaryKey='books-scents-daily-cards-v1',recentKey='books-scents-recent-blends-v1';
 const themes=[
  {word:'가벼운 시작',line:'어제와 조금 다른 나를 만나고 싶은 날.',question:'오늘 새롭게 시작하고 싶은 일은?',mainId:'main-1',singleIds:['single-top-5','single-middle-5','single-base-5']},
  {word:'다정한 설렘',line:'소중한 사람에게 먼저 말을 건네고 싶은 날.',question:'오늘 다정함을 전하고 싶은 사람은?',mainId:'main-3',singleIds:['single-top-9','single-middle-1','single-base-5']},
  {word:'나만의 속도',line:'잠깐의 여백으로 마음을 고르는 날.',question:'오늘 나에게 허락하고 싶은 쉼표는?',mainId:'main-27',singleIds:['single-middle-2','single-base-9']},
  {word:'작은 모험',line:'익숙한 길에서 새로운 풍경을 발견하는 날.',question:'오늘 조금 다르게 해보고 싶은 일은?',mainId:'main-53',singleIds:['single-top-3','single-middle-10','single-base-10']},
  {word:'느긋한 오후',line:'부드러운 햇살처럼 편안하게 머무는 날.',question:'오늘 마음이 편안해졌던 순간은?',mainId:'main-54',singleIds:['single-middle-7','single-base-8']},
  {word:'푸른 산책',line:'초록의 기운으로 하루를 환기하는 날.',question:'지금 산책을 간다면 어디로 가고 싶나요?',mainId:'main-30',singleIds:['single-top-1','single-middle-10','single-base-4']},
  {word:'나답게 빛나기',line:'좋아하는 것을 더 선명하게 표현하는 날.',question:'오늘의 나를 표현하는 단어 하나는?',mainId:'main-58',singleIds:['single-top-3','single-base-5']}
 ];
 const rooms={garden:{title:'햇살 향기 정원',description:'아바타로 천천히 걸으며, 오늘의 문장을 만나보세요.',activity:'정원에서 오늘의 문장 찾기'},scents:{title:'향기박물관',description:'전시된 향을 살펴보고, 나만의 향 조합도 만들어보세요.',activity:'향의 이야기 읽고 조합해보기'},books:{title:'북라운지',description:'책장을 둘러보고, 좋아하는 책과 한 줄의 생각을 나눠보세요.',activity:'책 추천과 포스트잇 남기기'},salon:{title:'향기카페',description:'바리스타에게 음료를 주문하고, 마음에 드는 자리에 앉아보세요.',activity:'음료 주문하고 테이블에 앉기'}};
 let catalog,diary=[],recent=[],today,theme,dayTimer;
 function read(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
 function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
 function dayKey(now=new Date()){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(k=>p.find(v=>v.type===k).value).join('-');}
 function valid(value){return value&&catalog.mainScents.some(s=>s.id===value.mainId)&&Array.isArray(value.singleIds)&&value.singleIds.length<=30&&value.singleIds.every(id=>catalog.singleScents.some(s=>s.id===id));}
 function link(value){const u=new URL('/',location.origin);u.searchParams.set('main',value.mainId);if(value.singleIds.length)u.searchParams.set('notes',value.singleIds.join(','));if(g.ScentI18n?.lang&&g.ScentI18n.lang!=='ko')u.searchParams.set('lang',g.ScentI18n.lang);u.hash='make';return u.pathname+u.search+u.hash;}
 function translated(s){return g.ScentI18n?.text(s)||s;}
 function renderCollection(){
  const host=$('daily-collection'),saved=diary.find(v=>v.day===today),button=$('daily-keep');if(!host||!button)return;
  button.textContent=saved?'오늘의 카드 수정하기':'오늘의 향기 카드 담기';$('daily-thought').value=saved?.thought||'';
  $('daily-card-count').textContent=String(diary.length);
  host.innerHTML=diary.length?diary.map(v=>{const scent=catalog.mainScents.find(s=>s.id===v.mainId);return `<article class="scent-postcard"><time data-no-i18n>${esc(v.day.slice(5).replace('-','.'))}</time><h4>${esc(themes[v.theme]?.word||'오늘의 향')}</h4><p data-no-i18n>${esc(scent.number+'. '+scent.name)}</p>${v.thought?'<blockquote data-no-i18n>'+esc(v.thought)+'</blockquote>':''}<a href="${esc(link(v))}" class="eng-text-link">이 향 다시 열기 <span aria-hidden="true">↗</span></a></article>`;}).join(''):'<p class="eng-empty">마음에 드는 오늘의 향을 담아보세요. 하루 한 장씩 모을 수 있어요.</p>';
 }
 function renderDaily(){
  today=dayKey();const index=Math.floor(Date.parse(today+'T00:00:00Z')/86400000)%themes.length;theme={...themes[index],index};const scent=catalog.mainScents.find(s=>s.id===theme.mainId);
  $('daily-date').textContent=new Intl.DateTimeFormat(({ko:'ko-KR',en:'en-US',zh:'zh-CN',ja:'ja-JP'})[g.ScentI18n?.lang||'ko'],{timeZone:'Asia/Seoul',month:'long',day:'numeric',weekday:'short'}).format(new Date(today+'T12:00:00+09:00'));
  $('daily-word').textContent=translated(theme.word);$('daily-line').textContent=translated(theme.line);$('daily-question').textContent=translated(theme.question);$('daily-scent-name').textContent=scent.number+'. '+scent.name;$('daily-blend-link').href=link(theme);$('daily-status').textContent='';renderCollection();
 }
 function renderRecent(){
  const host=$('recent-blends'),section=$('recent-section');if(!host||!section)return;section.hidden=!recent.length;
  host.innerHTML=recent.map(v=>{const scent=catalog.mainScents.find(s=>s.id===v.mainId);return `<a class="recent-blend" href="${esc(link(v))}"><span class="recent-bottle" aria-hidden="true">${esc(scent.number)}</span><span><strong data-no-i18n>${esc(scent.name)}</strong><small data-no-i18n>${v.singleIds.length?v.singleIds.map(id=>g.BlindScents.code(catalog.singleScents.find(s=>s.id===id))).join(' · '):translated('단일향 없음')}</small></span><span aria-hidden="true">↗</span></a>`;}).join('');
 }
 function remember(value){if(!catalog||!valid(value))return;const item={mainId:value.mainId,singleIds:[...new Set(value.singleIds)].sort(),at:Date.now()};recent=[item,...recent.filter(v=>v.mainId!==item.mainId||JSON.stringify([...v.singleIds].sort())!==JSON.stringify(item.singleIds))].slice(0,5);if(!write(recentKey,recent))return;renderRecent();}
 async function init(){
  try{catalog=await g.ScentRecords.ready();diary=read(diaryKey).filter(v=>valid(v)&&/^\d{4}-\d{2}-\d{2}$/.test(v.day)&&Number.isInteger(v.theme)&&v.theme>=0&&v.theme<themes.length&&typeof v.thought==='string'&&v.thought.length<=100).filter((v,i,a)=>a.findIndex(x=>x.day===v.day)===i).sort((a,b)=>b.day.localeCompare(a.day)).slice(0,60);recent=read(recentKey).filter(valid).slice(0,5);renderDaily();renderRecent();
   const p=new URLSearchParams(location.search);if(p.has('main'))remember({mainId:p.get('main'),singleIds:(p.get('notes')||'').split(',').filter(Boolean)});
   $('daily-keep').disabled=false;
   dayTimer=setInterval(()=>{if(dayKey()!==today)renderDaily();},60000);
  }catch{$('daily-status').textContent=translated('오늘의 향을 불러오지 못했어요. 잠시 후 다시 열어주세요.');}
 }
 document.addEventListener('scent:blend-complete',e=>remember(e.detail));
 $('daily-keep')?.addEventListener('click',()=>{if(!catalog||!theme)return;if(dayKey()!==today){renderDaily();return;}const value={day:today,theme:theme.index,mainId:theme.mainId,singleIds:[...theme.singleIds],thought:$('daily-thought').value.trim().slice(0,100)};const next=[value,...diary.filter(v=>v.day!==today)].sort((a,b)=>b.day.localeCompare(a.day)).slice(0,60);if(!write(diaryKey,next)){$('daily-status').textContent=translated('브라우저 저장소를 사용할 수 없어요.');return;}diary=next;renderCollection();$('daily-status').textContent=translated('오늘의 카드를 담았어요. 내일은 다른 향의 이야기가 기다려요.');});
 $('clear-recent')?.addEventListener('click',()=>{if(!write(recentKey,[]))return;recent=[];renderRecent();});
 $('clear-daily')?.addEventListener('click',()=>{if(!diary.length)return;if(!confirm(translated('이 브라우저에 모은 향기 카드를 모두 지울까요?')) )return;if(!write(diaryKey,[]))return;diary=[];renderCollection();$('daily-status').textContent=translated('향기 카드를 비웠어요.');});
 document.querySelectorAll('[data-preview-room]').forEach(button=>button.addEventListener('click',()=>{const room=button.dataset.previewRoom,info=rooms[room];if(!info)return;const image=$('lounge-preview-image');image.src='/assets/lounge-preview/'+room+'.jpg';image.alt=translated(info.title)+' · '+translated('실제 3D 공간 화면');$('preview-room-title').textContent=translated(info.title);$('preview-room-description').textContent=translated(info.description);$('preview-room-activity').textContent=translated(info.activity);for(const b of document.querySelectorAll('[data-preview-room]'))b.setAttribute('aria-pressed',String(b===button));}));
 document.getElementById('language-select')?.addEventListener('change',()=>{if(catalog)renderDaily();renderRecent();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&catalog&&dayKey()!==today)renderDaily();});

 const toolCards=[["[data-journal-open]","<path d=\"M5 4h14v22H5zM9 4v22M12 10h4m-4 5h4\"/>","좋아하는 조합을 저장하고, 다음 방문의 향을 계획해요."],["[data-spray-game]","<rect x=\"5\" y=\"13\" width=\"13\" height=\"15\" rx=\"3\"/><path d=\"M9 13V7h5v6M9 7V4h8m3 2h1m3 0h2m-6 4h1m3 1h2\"/>","어디에, 어떻게 뿌릴지 가볍게 배워보세요."],["[data-runner-game]","<path d=\"m16 3 4 8 9 1-7 6 2 10-8-5-8 5 2-10-7-6 9-1Z\"/>","타이밍에 맞춰 칙! 향기 점수에 도전해요."],["[data-longevity-open]","<circle cx=\"16\" cy=\"17\" r=\"11\"/><path d=\"M16 10v8l5 3M12 3h8M16 3v3\"/>","향을 오래 즐기는 사용법을 살펴보세요."]];for(const [selector,icon,description]of toolCards){const button=document.querySelector('.header-tool-grid '+selector);if(!button)continue;button.querySelector('.tool-symbol').innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true">'+icon+'</svg>';const desc=document.createElement('span');desc.className='tool-desc';desc.textContent=translated(description);button.append(desc);}
 init();
})(globalThis);
