'use strict';
let catalog,selectedMain=null,selectedSingles=new Set(),lastResult=null;
const $=id=>document.getElementById(id);
const escapeHtml=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cleanName(s){return s.name;}
function currentSingles(){return catalog.singleScents.filter(s=>selectedSingles.has(s.id));}
function renderMain(){
  const query=$('search').value.toLowerCase().replace(/\s/g,'');
  const filtered=catalog.mainScents.filter(s=>(s.number+' '+s.name).toLowerCase().replace(/\s/g,'').includes(query));
  $('main-list').innerHTML=filtered.length?[false,true].map(premium=>{
    const items=filtered.filter(s=>s.premium===premium);if(!items.length)return '';
    return `<div class="catalog-group-title ${premium?'premium-title':''}"><span>${premium?'프리미엄 향':'기본 향'}</span><small>${premium?'33–72':'01–32'}</small></div>`+items.map(s=>`<div class="scent-item ${premium?'premium-item':''}"><button class="scent-option" data-main="${s.id}" aria-pressed="${selectedMain===s.id}"><span class="scent-number">${s.number}</span><span class="scent-name">${escapeHtml(cleanName(s))}</span></button><button class="scent-detail-button" data-detail="${s.id}" aria-label="${escapeHtml(s.name)} 노트 구성 어코드 확인">노트 · 어코드 <span aria-hidden="true">△</span></button></div>`).join('');
  }).join(''):'<p class="hint">검색한 향이 없어요. 이름이나 번호를 다시 확인해주세요.</p>';
}
function pyramidMarkup(s){
  const n=s.notes;
  if(s.noteStatus!=='pyramid')return `<div class="key-note-visual"><span aria-hidden="true">△</span><p>${s.noteStatus==='key_notes'?'대표 노트':'원향 확인 중'}</p></div>${s.noteStatus==='key_notes'?`<div class="key-notes">${n.key.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div><p class="hint">이 참고 자료는 탑·미들·베이스를 나누지 않습니다. 공개된 대표 노트를 그대로 안내합니다.</p>`:'<p class="missing-notice">정확한 원향 제품명이 아직 확인되지 않아 노트 피라미드를 확정하지 않았습니다. 아래 매장 설명을 참고해주세요.</p>'}`;
  return `<div class="pyramid" role="img" aria-label="탑, 미들, 베이스 3단계 노트 피라미드. 상세 노트는 바로 아래 목록에서 확인할 수 있습니다."><svg viewBox="0 0 360 285" aria-hidden="true"><path d="M180 4 235 94H125Z" fill="#d7dfc7"/><path d="m125 98-56 91h222l-56-91Z" fill="#b9c9a4"/><path d="m67 193-55 88h336l-55-88Z" fill="#8da582"/></svg><div class="pyramid-label top-label"><b>TOP</b><span>${escapeHtml(n.top[0]||'미공개')}</span></div><div class="pyramid-label heart-label"><b>HEART</b><span>${escapeHtml(n.heart.slice(0,2).join(' · ')||'미공개')}</span></div><div class="pyramid-label base-label"><b>BASE</b><span>${escapeHtml(n.base.slice(0,2).join(' · ')||'미공개')}</span></div></div><dl class="note-list">${[['top','탑 노트 · 첫인상'],['heart','미들 노트 · 향의 중심'],['base','베이스 노트 · 여운']].map(([key,label])=>`<div><dt>${label}</dt><dd>${escapeHtml(n[key].join(' · ')||'자료 미공개')}</dd></div>`).join('')}</dl>`;
}
function openScentDetail(id){
  const s=catalog.mainScents.find(s=>s.id===id);if(!s)return;
  $('scent-dialog-body').innerHTML=`<span class="detail-tier ${s.premium?'detail-premium':''}">${s.tier} · ${s.number}번</span><h2 id="scent-dialog-title">${escapeHtml(s.name)}</h2><p class="dialog-description">${escapeHtml(s.shortDescription)}</p><h3 class="detail-subheading">노트 구성</h3>${pyramidMarkup(s)}<h3 class="detail-subheading">어코드 · 향의 전체적인 분위기</h3>${s.accords.length?`<div class="accords">${s.accords.map(a=>`<span>${escapeHtml(a)}</span>`).join('')}</div><p class="accord-explanation">공개 노트를 바탕으로 정리한 향 계열입니다. 원료 함량이나 향의 강도 비율을 의미하지 않습니다.</p>`:'<p class="hint">참고 원향 확인 후 향 계열을 연결합니다.</p>'}<div class="reference-notice">${escapeHtml(catalog.referenceNotice)}</div>${s.noteSource?`<p class="note-source">${escapeHtml(s.noteSource.reference)}<br><a href="${escapeHtml(s.noteSource.url)}" target="_blank" rel="noopener noreferrer">참고 노트 출처 · ${escapeHtml(s.noteSource.label)} ↗</a><br>자료 확인: ${escapeHtml(s.noteSource.checkedAt)}</p>`:''}<button class="primary" type="button" data-use="${s.id}">이 향으로 조합하기 <span aria-hidden="true">→</span></button>`;
  $('scent-dialog').showModal();
}
function selectMain(id){
  if(!catalog.mainScents.some(s=>s.id===id))return;
  selectedMain=id;renderMain();updateSummary();
}
function continueToSingles(){
  $('single-selection').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderMainChoice(){
  const main=catalog.mainScents.find(s=>s.id===selectedMain);
  $('main-step-title').textContent=main?'메인향이 선택됐어요':'메인향을 골라주세요';
  $('main-total').textContent=main?'1 / 1':catalog.mainScents.length+'개';
  $('main-step-hint').textContent=main?'메인향은 이 향 하나로 진행합니다. 아래에서 단일향을 여러 개 더해보세요.':'가장 마음에 드는 향 하나가 스타일의 시작이 됩니다.';
  $('main-picker').hidden=Boolean(main);
  $('main-choice').hidden=!main;
  $('main-choice').innerHTML=main?`<div class="chosen-main"><span class="chosen-label">선택한 메인향 · 1 / 1</span><strong>${escapeHtml(main.number)}. ${escapeHtml(main.name)}</strong><small>${main.tier}</small><div><button type="button" class="secondary" data-detail="${main.id}">노트 · 어코드 △</button><button type="button" class="text-button" id="change-main">다른 메인향으로 변경</button></div></div>`:'';
}
const selectedProfileStyles=new Set();
const styleLabels={minimal:'미니멀 · 깔끔함',romantic:'로맨틱 · 부드러움',natural:'내추럴 · 편안함',classic:'클래식 · 우아함',casual:'캐주얼 · 경쾌함',sporty:'스포티 · 활동적',chic:'시크 · 세련됨',cozy:'코지 · 포근함'};
function initProfile(){
  $('profile-styles').innerHTML=Object.entries(styleLabels).map(([id,label])=>`<button type="button" class="profile-style" data-style="${id}" aria-pressed="false">${label}</button>`).join('');
  $('profile-styles').addEventListener('click',e=>{const b=e.target.closest('[data-style]');if(!b)return;const id=b.dataset.style;if(selectedProfileStyles.has(id))selectedProfileStyles.delete(id);else selectedProfileStyles.add(id);b.setAttribute('aria-pressed',String(selectedProfileStyles.has(id)));markProfileChanged();});
  for(const id of ['profile-gender','profile-age','profile-hair'])$(id).addEventListener('change',markProfileChanged);
  $('profile-form').addEventListener('submit',e=>{
    e.preventDefault();
    const profile={gender:$('profile-gender').value,age:$('profile-age').value,hair:$('profile-hair').value,styles:[...selectedProfileStyles]};
    const results=ScentStyle.recommendForProfile(catalog.mainScents,profile);
    if(!results.length){$('profile-results').innerHTML='<p class="missing-notice">표현하고 싶은 분위기나 성별·연령대·헤어스타일 중 하나 이상을 골라주세요.</p>';return;}
    const labels=[...profile.styles.map(id=>styleLabels[id]),...['profile-gender','profile-age','profile-hair'].filter(id=>$(id).value!=='any').map(id=>$(id).selectedOptions[0].textContent)];
    $('profile-results').innerHTML=`<div class="profile-result-heading"><p class="eyebrow">YOUR SIGNATURE SCENTS</p><h3>당신의 이야기에 어울리는 향</h3><p>${escapeHtml(labels.join(' · '))}</p></div><div class="profile-grid">${results.map(({scent:s,matchedStyles},i)=>`<article class="profile-scent-card"><div class="profile-card-meta"><span>추천 0${i+1}</span><span class="${s.premium?'premium-text':''}">${s.tier}</span></div><h4><span>${s.number}.</span> ${escapeHtml(s.name)}</h4><p class="profile-match">${matchedStyles.map(st=>st.name).join(' · ')} 분위기에 어울리는 후보</p><p class="profile-scent-description">${escapeHtml(s.shortDescription)}</p><div class="profile-card-actions"><button type="button" class="secondary" data-detail="${s.id}">노트 · 어코드 △</button><button type="button" class="secondary" data-use="${s.id}">이 향 고르기 →</button></div></article>`).join('')}</div><p class="profile-note">선택한 연출 취향과 향 계열을 연결한 편집 추천입니다. 실제 시향으로 마음에 드는 향을 확인해보세요.</p>`;
  });
}
function markProfileChanged(){if($('profile-results').innerHTML)$('profile-results').innerHTML='<p class="hint">스타일이 바뀌었어요. 향 찾기 버튼을 눌러 새 추천을 확인해주세요.</p>';}
function renderSingles(){
  $('single-list').innerHTML=['top','middle','base'].map((note,i)=>`<section class="note-group" data-note="${note}"><h3 class="note-heading"><span class="note-dot" aria-hidden="true"></span>${['탑 노트','미들 노트','베이스 노트'][i]}<small>${['THE FIRST IMPRESSION','THE HEART OF YOUR SCENT','THE LASTING MEMORY'][i]}</small></h3><div class="single-options">${catalog.singleScents.filter(s=>s.note===note).map(s=>`<button class="single-option" data-single="${s.id}" aria-pressed="${selectedSingles.has(s.id)}">${escapeHtml(ScentStyle.singleName(s))}</button>`).join('')}</div></section>`).join('');
  $('single-count').textContent=selectedSingles.size+'개 선택';
}
function updateSummary(){
  const main=catalog.mainScents.find(s=>s.id===selectedMain),singles=currentSingles();
  renderMainChoice();
  $('selection-summary').innerHTML=main?`<strong>${escapeHtml(main.number)}. ${escapeHtml(cleanName(main))}</strong>${singles.length?`<div class="selected-tags">${singles.map(s=>`<span>${escapeHtml(ScentStyle.singleName(s))}</span>`).join('')}</div>`:'단일향을 더하거나 메인향만으로 스타일을 확인해보세요.'}`:'메인향을 선택하면 여기에 조합이 표시돼요.';
  $('recommend').disabled=!main;
  if(lastResult){lastResult=null;$('result').innerHTML='<div class="empty-state"><div class="empty-shape" aria-hidden="true">✧</div><h3>향 조합이 바뀌었어요</h3><p>조합 완성 버튼을 눌러<br>새로운 향의 한 줄 설명을 확인해주세요.</p></div>';$('result-actions').hidden=true;}
  $('status').textContent='';
}
function outfitPresentation(style,main){
  const preference=$('profile-gender').value;
  const feminine=preference==='female';
  const masculine=preference==='male';
  let kind=({minimal:'shirt',romantic:'dress',natural:'linen',classic:'suit',casual:'casual',sporty:'sport',chic:'jumpsuit',cozy:'cardigan'})[style.id]||'shirt';
  if(masculine&&kind==='dress')kind='soft-shirt';
  if(feminine&&style.id==='classic')kind='tailored-dress';
  if(feminine&&style.id==='chic')kind='evening-dress';
  const looks={dress:'허리선이 부드럽게 잡힌 우아한 원피스에 작은 진주 귀걸이와 스트랩 슈즈를 더해보세요.',suit:'구조적인 테일러드 정장에 밝은 셔츠와 가죽 로퍼를 매치해보세요.','tailored-dress':'단정한 테일러드 원피스에 얇은 벨트와 클래식 펌프스를 매치해보세요.','evening-dress':'매끈한 새틴 롱 원피스에 작은 금속 액세서리로 선명한 포인트를 더해보세요.',jumpsuit:'곧게 떨어지는 블랙 점프수트에 가죽 부츠와 작은 금속 액세서리를 더해보세요.','soft-shirt':'부드러운 크림 셔츠에 여유 있는 테일러드 팬츠와 작은 액세서리를 더해보세요.',cardigan:'포근한 카디건에 골지 이너와 코듀로이 팬츠, 스웨이드 슈즈를 매치해보세요.'};
  return {kind,look:looks[kind]||style.look};
}
function outfitSvg(style,kind){
 const [a,b,c]=style.colors.map(x=>x[1]);
 const pants='<path d="M35 67H65L69 111H55L50 82 45 111H31Z" fill="'+b+'"/>';
 const paths={
 dress:'<path d="M40 12 46 8Q50 14 54 8L60 12 67 35 58 39 62 52 80 103Q50 114 20 103L38 52 42 39 33 35Z" fill="'+a+'"/><path d="M38 51H62" stroke="'+c+'" stroke-width="3"/><path d="m41 63-8 36m18-36v40m8-40 8 36" opacity=".35"/>',
 'tailored-dress':'<path d="M37 12 46 8H54L63 12 72 42 63 45 59 29 60 53 69 104H31L40 53 41 29 37 45 28 42Z" fill="'+a+'"/><path d="m44 10 6 23 6-23M40 53h20" stroke="'+b+'" stroke-width="2"/><circle cx="51" cy="39" r="1.5"/>',
 'evening-dress':'<path d="m40 13 5-4 5 15 5-15 5 4-3 25 3 16 13 56H27L40 54 43 38Z" fill="'+a+'"/><path d="m54 63 8 41M43 54h14" stroke="'+b+'"/>',
 suit:pants+'<path d="M35 13 44 8H56L65 13 77 56 65 60 60 33 64 74 50 69 36 74 40 33 35 60 23 56Z" fill="'+a+'"/><path d="m44 9 6 13 6-13-6 42Z" fill="#f4f0e6"/><path d="m50 23-3 6 3 21 3-21Z" fill="'+c+'"/><path d="m42 11-5 15 13 18 13-18-5-15M50 44v25"/>',
 casual:pants+'<path d="M36 13 44 10Q50 20 56 10L64 13 78 34 65 42 60 32 62 69H38L40 32 35 42 22 34Z" fill="'+a+'"/><path d="M32 109h14v6H27Zm23 0h14l5 6H55Z" fill="#faf7ed"/>',
 sport:'<path d="M36 64H64L65 105H55L50 79 45 105H35Z" fill="'+c+'"/><path d="M36 17 43 10Q50 5 57 10L64 17 78 55 67 59 59 33 63 67H37L41 33 33 59 22 55Z" fill="'+a+'"/><path d="M43 11q7 20 14 0M50 26v39M37 45l11 4m4 0 11-4"/><path d="m35 105-7 9h18v-9m9 0v9h18l-8-9" fill="'+b+'"/>',
 jumpsuit:'<path d="M38 13 45 9 50 19 55 9 62 13 70 39 61 43 58 31 60 56 68 111H53L50 77 47 111H32L40 56 42 31 39 43 30 39Z" fill="'+a+'"/><path d="M40 55h20M50 20v34" stroke="'+b+'" stroke-width="2"/>',
 cardigan:pants+'<path d="M37 14 44 10H56L63 14 75 59 64 62 59 34 62 76H38L41 34 36 62 25 59Z" fill="'+a+'"/><path d="M44 10h12v52H44Z" fill="'+b+'"/><path d="m44 10 6 27 6-27M50 27v46M38 62h8m8 0h8"/>',
 linen:pants+'<path d="M36 14 44 10 50 16 56 10 64 14 76 55 64 59 59 33 63 76H37L41 33 36 59 24 55Z" fill="'+a+'"/><path d="m44 11 6 10 6-10M50 22v51M54 31h7v10h-7"/>'
 };
 const shirt=pants+'<path d="M35 14 44 9 50 16 56 9 65 14 78 47 66 53 60 32 62 69H38L40 32 34 53 22 47Z" fill="'+a+'"/><path d="m44 10 6 12 6-12M50 23v44"/>';
 return '<svg class="outfit outfit-'+kind+'" viewBox="0 0 100 120" fill="none" stroke="#6a6b60" stroke-width=".8" stroke-linejoin="round" role="img" aria-label="'+escapeHtml(({dress:'우아한 원피스',suit:'테일러드 정장','tailored-dress':'테일러드 원피스','evening-dress':'새틴 롱 원피스',jumpsuit:'시크한 점프수트',casual:'티셔츠와 데님',sport:'바람막이와 조거',cardigan:'니트 카디건',linen:'리넨 셔츠'})[kind]||'셔츠와 팬츠')+' 스타일 일러스트">'+(paths[kind]||shirt)+'</svg>';
}
function showResult(scroll=true){
  const main=catalog.mainScents.find(s=>s.id===selectedMain);if(!main)return;
  lastResult=ScentStyle.recommend(main,currentSingles());
  const [first,...others]=lastResult.ranked;
  const outfit=first?outfitPresentation(first,main):null;
  if(!first){$('result').innerHTML='<div class="missing-notice">이 메인향은 원본에 향 설명이 없어 아직 스타일을 추천하기 어려워요. 단일향을 추가하면 선택한 단일향을 바탕으로 제안해드려요.</div>';}
  else{$('result').innerHTML=`${lastResult.missing?'<p class="missing-notice">이 메인향의 설명이 없어 선택한 단일향만을 바탕으로 추천했어요.</p>':''}<article class="style-card"><div class="style-visual" style="--style-bg:${first.bg}">${outfitSvg(first,outfit.kind)}<span class="visual-label">${first.english.replace('\n','<br>')}</span></div><div class="style-content"><p class="eyebrow">YOUR SCENT INSPIRES</p><h3>${first.name}</h3><p class="style-description">${first.reason}</p><p class="detail-label">이렇게 입어보세요</p><p class="look">${outfit.look}</p><p class="detail-label">어울리는 색</p><div class="palette">${first.colors.map(([name,color])=>`<span class="swatch"><i style="background:${color}"></i>${name}</span>`).join('')}</div><div class="style-extra">소재 · ${first.fabric}<br>어울리는 순간 · ${first.occasion}</div></div></article>${others.length?`<div class="alternatives">${others.map((s,i)=>`<article class="alternative"><small>ANOTHER MOOD 0${i+2}</small><h4>${s.name}</h4><p>${s.look}</p></article>`).join('')}</div>`:''}<details class="style-extra" style="margin-top:17px"><summary>이번 제안의 기준 보기</summary><p style="margin-top:9px">메인향 자료: ${main.description?escapeHtml(main.description.replace(/\s+/g,' ')):'원본 설명 없음'}<br>추가한 단일향: ${currentSingles().length?currentSingles().map(s=>escapeHtml(ScentStyle.singleName(s))).join(', '):'없음'}<br>단일향은 향 계열별로 작성한 스타일 연결 기준을 사용합니다. 배합량을 계산하거나 실제 혼합향을 예측하지 않습니다.</p></details>`;}
  const blend=ScentStyle.describeBlend(main,currentSingles());
  const fashion=$('result').innerHTML;
  $('result').innerHTML=`<article class="blend-finish"><p class="eyebrow">YOUR PERSONAL SCENT</p><h3>완성된 향을 한마디로</h3><p class="blend-one-line">${escapeHtml(blend.sentence)}</p><div class="blend-keywords">${blend.facets.map(f=>`<span>${escapeHtml(f)}</span>`).join('')}</div><p class="blend-composition">메인향 1개 · 단일향 ${currentSingles().length}개</p><small>선택한 향의 설명과 이미지를 바탕으로 정리한 표현입니다.</small></article><details class="fashion-details"><summary>이 향에 어울리는 패션도 보기</summary>${fashion}</details>`;
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
    renderMain();renderSingles();updateSummary();initProfile();
    StoryUI.init(catalog,recipe=>{selectedMain=recipe.main.id;selectedSingles=new Set(recipe.singles.map(s=>s.id));$('search').value='';renderMain();renderSingles();updateSummary();$('status').textContent='메인향 1개와 추천 단일향을 적용했어요. 단일향은 자유롭게 추가하거나 해제할 수 있어요.';continueToSingles();});
    if(selectedMain)showResult(false);
    $('search').addEventListener('input',renderMain);
    $('main-list').addEventListener('click',e=>{const button=e.target.closest('[data-main]');if(!button)return;selectMain(button.dataset.main);continueToSingles();});
    document.addEventListener('click',e=>{
      const detail=e.target.closest('[data-detail]');if(detail){openScentDetail(detail.dataset.detail);return;}
      const change=e.target.closest('#change-main');if(change){$('main-picker').hidden=false;$('main-step-title').textContent='변경할 메인향을 골라주세요';$('search').focus();return;}
      const use=e.target.closest('[data-use]');if(use){selectMain(use.dataset.use);$('search').value='';renderMain();if($('scent-dialog').open)$('scent-dialog').close();continueToSingles();}
    });
    $('close-dialog').addEventListener('click',()=>$('scent-dialog').close());
    $('scent-dialog').addEventListener('click',e=>{if(e.target===$('scent-dialog')){const rect=e.target.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)e.target.close();}});
    $('single-list').addEventListener('click',e=>{const button=e.target.closest('[data-single]');if(!button)return;const id=button.dataset.single;if(selectedSingles.has(id))selectedSingles.delete(id);else selectedSingles.add(id);button.setAttribute('aria-pressed',String(selectedSingles.has(id)));$('single-count').textContent=selectedSingles.size+'개 선택';updateSummary();});
    $('recommend').addEventListener('click',()=>showResult());
    $('share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('status').textContent='조합 링크를 복사했어요. 같은 조합과 추천을 열 수 있어요.';}catch{$('status').textContent='주소창의 링크를 복사해주세요. 현재 조합이 링크에 담겨 있어요.';}});
    $('reset').addEventListener('click',()=>{selectedMain=null;selectedSingles.clear();$('search').value='';renderMain();renderSingles();updateSummary();history.replaceState(null,'',location.pathname);$('selection').scrollIntoView({behavior:'smooth'});});
  }catch(error){$('main-list').innerHTML='<p class="missing-notice">향 목록을 불러오지 못했어요. 네트워크 연결을 확인한 뒤 새로고침해주세요.</p>';$('main-total').textContent='불러오기 실패';}
}
init();
