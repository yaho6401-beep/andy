'use strict';
let catalog,selectedMain=null,selectedSingles=new Set(),lastResult=null;
const $=id=>document.getElementById(id);
const escapeHtml=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cleanName(s){return s.name.replace(/\s*type\s*$/i,'');}
function currentSingles(){return catalog.singleScents.filter(s=>selectedSingles.has(s.id));}
function renderMain(){
  const query=$('search').value.toLowerCase().replace(/\s/g,'');
  const filtered=catalog.mainScents.filter(s=>(s.number+' '+s.name).toLowerCase().replace(/\s/g,'').includes(query));
  $('main-list').innerHTML=filtered.length?filtered.map(s=>`<button class="scent-option" data-main="${s.id}" aria-pressed="${selectedMain===s.id}"><span class="scent-number">${s.number}</span><span class="scent-name">${escapeHtml(cleanName(s))}</span></button>`).join(''):'<p class="hint">검색한 향이 없어요. 이름이나 번호를 다시 확인해주세요.</p>';
}
function renderSingles(){
  $('single-list').innerHTML=['top','middle','base'].map((note,i)=>`<section class="note-group" data-note="${note}"><h3 class="note-heading"><span class="note-dot" aria-hidden="true"></span>${['탑 노트','미들 노트','베이스 노트'][i]}<small>${['THE FIRST IMPRESSION','THE HEART OF YOUR SCENT','THE LASTING MEMORY'][i]}</small></h3><div class="single-options">${catalog.singleScents.filter(s=>s.note===note).map(s=>`<button class="single-option" data-single="${s.id}" aria-pressed="${selectedSingles.has(s.id)}">${escapeHtml(ScentStyle.singleName(s))}</button>`).join('')}</div></section>`).join('');
  $('single-count').textContent=selectedSingles.size+'개 선택';
}
function updateSummary(){
  const main=catalog.mainScents.find(s=>s.id===selectedMain),singles=currentSingles();
  $('selection-summary').innerHTML=main?`<strong>${escapeHtml(main.number)}. ${escapeHtml(cleanName(main))}</strong>${singles.length?`<div class="selected-tags">${singles.map(s=>`<span>${escapeHtml(ScentStyle.singleName(s))}</span>`).join('')}</div>`:'단일향을 더하거나 메인향만으로 스타일을 확인해보세요.'}`:'메인향을 선택하면 여기에 조합이 표시돼요.';
  $('recommend').disabled=!main;
  if(lastResult){lastResult=null;$('result').innerHTML='<div class="empty-state"><div class="empty-shape" aria-hidden="true">✧</div><h3>향 조합이 바뀌었어요</h3><p>스타일 보기 버튼을 눌러<br>새로운 조합의 분위기를 확인해주세요.</p></div>';$('result-actions').hidden=true;}
  $('status').textContent='';
}
function outfitSvg(style){return `<svg class="outfit" viewBox="0 0 100 120" fill="none" aria-hidden="true"><path d="M30 12 41 7Q50 15 59 7L70 12 90 38 76 50 66 37 67 76H33L34 37 24 50 10 38Z" fill="${style.colors[0][1]}" stroke="#68735a" stroke-width=".8"/><path d="m41 7 9 17 9-17M50 24v45" stroke="#7f8268" stroke-width=".8"/><path d="M34 77H66L70 115H53L50 88 47 115H30Z" fill="${style.colors[1][1]}" stroke="#68735a" stroke-width=".8"/><circle cx="53" cy="34" r="1" fill="#9a997f"/><circle cx="53" cy="44" r="1" fill="#9a997f"/></svg>`;}
function showResult(scroll=true){
  const main=catalog.mainScents.find(s=>s.id===selectedMain);if(!main)return;
  lastResult=ScentStyle.recommend(main,currentSingles());
  const [first,...others]=lastResult.ranked;
  if(!first){$('result').innerHTML='<div class="missing-notice">이 메인향은 원본에 향 설명이 없어 아직 스타일을 추천하기 어려워요. 단일향을 추가하면 선택한 단일향을 바탕으로 제안해드려요.</div>';}
  else{$('result').innerHTML=`${lastResult.missing?'<p class="missing-notice">이 메인향의 설명이 없어 선택한 단일향만을 바탕으로 추천했어요.</p>':''}<article class="style-card"><div class="style-visual" style="--style-bg:${first.bg}">${outfitSvg(first)}<span class="visual-label">${first.english.replace('\n','<br>')}</span></div><div class="style-content"><p class="eyebrow">YOUR SCENT INSPIRES</p><h3>${first.name}</h3><p class="style-description">${first.reason}</p><p class="detail-label">이렇게 입어보세요</p><p class="look">${first.look}</p><p class="detail-label">어울리는 색</p><div class="palette">${first.colors.map(([name,color])=>`<span class="swatch"><i style="background:${color}"></i>${name}</span>`).join('')}</div><div class="style-extra">소재 · ${first.fabric}<br>어울리는 순간 · ${first.occasion}</div></div></article>${others.length?`<div class="alternatives">${others.map((s,i)=>`<article class="alternative"><small>ANOTHER MOOD 0${i+2}</small><h4>${s.name}</h4><p>${s.look}</p></article>`).join('')}</div>`:''}<details class="style-extra" style="margin-top:17px"><summary>이번 제안의 기준 보기</summary><p style="margin-top:9px">메인향 자료: ${main.description?escapeHtml(main.description.replace(/\s+/g,' ')):'원본 설명 없음'}<br>추가한 단일향: ${currentSingles().length?currentSingles().map(s=>escapeHtml(ScentStyle.singleName(s))).join(', '):'없음'}<br>단일향은 향 계열별로 작성한 스타일 연결 기준을 사용합니다. 배합량을 계산하거나 실제 혼합향을 예측하지 않습니다.</p></details>`;}
  $('result-actions').hidden=false;$('status').textContent='';
  const params=new URLSearchParams();params.set('main',selectedMain);if(selectedSingles.size)params.set('notes',[...selectedSingles].sort().join(','));
  history.replaceState(null,'',location.pathname+'?'+params.toString());
  if(scroll&&matchMedia('(max-width: 900px)').matches)$('result').scrollIntoView({behavior:'smooth',block:'start'});
}
async function init(){
  try{
    const response=await fetch('/data/fragrance-catalog.json');if(!response.ok)throw new Error('catalog');catalog=await response.json();
    $('main-total').textContent=catalog.mainScents.length+'개';
    const params=new URLSearchParams(location.search),main=params.get('main');
    if(catalog.mainScents.some(s=>s.id===main))selectedMain=main;
    const validIds=new Set(catalog.singleScents.map(s=>s.id));for(const id of (params.get('notes')||'').split(','))if(validIds.has(id))selectedSingles.add(id);
    renderMain();renderSingles();updateSummary();if(selectedMain)showResult(false);
    $('search').addEventListener('input',renderMain);
    $('main-list').addEventListener('click',e=>{const button=e.target.closest('[data-main]');if(!button)return;selectedMain=button.dataset.main;renderMain();updateSummary();});
    $('single-list').addEventListener('click',e=>{const button=e.target.closest('[data-single]');if(!button)return;const id=button.dataset.single;if(selectedSingles.has(id))selectedSingles.delete(id);else selectedSingles.add(id);button.setAttribute('aria-pressed',String(selectedSingles.has(id)));$('single-count').textContent=selectedSingles.size+'개 선택';updateSummary();});
    $('recommend').addEventListener('click',()=>showResult());
    $('share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('status').textContent='조합 링크를 복사했어요. 같은 조합과 추천을 열 수 있어요.';}catch{$('status').textContent='주소창의 링크를 복사해주세요. 현재 조합이 링크에 담겨 있어요.';}});
    $('reset').addEventListener('click',()=>{selectedMain=null;selectedSingles.clear();$('search').value='';renderMain();renderSingles();updateSummary();history.replaceState(null,'',location.pathname);$('selection').scrollIntoView({behavior:'smooth'});});
  }catch(error){$('main-list').innerHTML='<p class="missing-notice">향 목록을 불러오지 못했어요. 네트워크 연결을 확인한 뒤 새로고침해주세요.</p>';$('main-total').textContent='불러오기 실패';}
}
init();
