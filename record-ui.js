(function(g){'use strict';const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let catalog;
const stages={saved:'조합 저장',made:'제작 완료',next:'다음 방문 예정'};
const date=v=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(v));
function link(row){const u=new URL('/',location.origin);u.searchParams.set('main',row.main_id);u.searchParams.set('notes',(row.single_ids||[]).join(','));return u.pathname+u.search;}
function names(row){const main=catalog?.mainScents.find(s=>s.id===row.main_id);const singles=(row.single_ids||[]).map(id=>catalog?.singleScents.find(s=>s.id===id)).filter(Boolean);return {main:main?main.number+'. '+main.name:row.main_id,singles:singles.map(s=>g.ScentStyle?.singleName(s)||s.name.replace(/\s+/g,' '))};}
function composition(row){const n=names(row);return '<div class="record-composition"><strong>'+esc(n.main)+'</strong><p>'+(n.singles.length?n.singles.map(s=>'<span>'+esc(s)+'</span>').join(''):'<span>단일향 없음</span>')+'</p></div>';}
g.ScentRecords={esc,stages,date,link,names,composition,async ready(){if(!catalog){const r=await fetch('/data/fragrance-catalog.json');if(!r.ok)throw Error('향 목록을 불러오지 못했어요.');catalog=await r.json();}return catalog;}};
})(globalThis);
