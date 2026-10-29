(function(root){
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let selected=new Set(),recipes=[];
  const examples=[
    '사랑하는 사람과 햇살 좋은 봄날, 오래 기억할 데이트를 하고 싶어요.',
    '새로운 일을 시작하는 오늘, 활기와 용기를 담고 싶어요.',
    '친구들과 함께 웃고 축하했던 행복하고 즐거운 하루를 기억하고 싶어요.',
    '비 오는 날 창가에서 책을 읽으며 차분하게 나를 돌아보고 싶어요.'
  ];
  function init(catalog,apply){
    const renderChips=()=>{$('story-points').innerHTML=['마음','이야기','날씨'].map(group=>`<div class="story-point-group"><h3>${group}</h3><div>${StoryScent.themes.filter(t=>t.group===group).map(t=>`<button type="button" class="story-chip" data-story-point="${t.id}" aria-pressed="${selected.has(t.id)}">${t.label}</button>`).join('')}</div></div>`).join('');};
    renderChips();
    $('story-examples').innerHTML=examples.map((text,i)=>`<button type="button" class="story-example" data-example="${i}">${['사랑하는 날','새로운 시작','행복한 하루','비 오는 휴식'][i]} ↗</button>`).join('');
    function invalidate(){recipes=[];if($('story-results').innerHTML)$('story-results').innerHTML='<p class="hint">이야기의 포인트가 바뀌었어요. 향기 찾기를 눌러 새 조합을 확인해주세요.</p>';}
    $('story-text').addEventListener('input',()=>{$('story-char-count').textContent=$('story-text').value.length+' / 800';invalidate();});
    $('story-points').addEventListener('click',e=>{const b=e.target.closest('[data-story-point]');if(!b)return;const id=b.dataset.storyPoint;if(selected.has(id))selected.delete(id);else selected.add(id);b.setAttribute('aria-pressed',String(selected.has(id)));invalidate();});
    $('story-examples').addEventListener('click',e=>{const b=e.target.closest('[data-example]');if(!b)return;selected.clear();renderChips();$('story-text').value=examples[Number(b.dataset.example)];$('story-char-count').textContent=$('story-text').value.length+' / 800';invalidate();$('story-text').focus();});
    $('story-form').addEventListener('submit',e=>{
      e.preventDefault();const text=$('story-text').value.trim().slice(0,800);const points=StoryScent.analyze(text,[...selected]);
      if(!points.length){recipes=[];$('story-results').innerHTML='<p class="missing-notice">이야기에 담고 싶은 마음이나 날씨를 아래 포인트에서 하나 이상 골라주세요. 짧게 적거나 단어만 선택해도 괜찮아요.</p>';return;}
      recipes=StoryScent.buildRecommendations(catalog,points);
      $('story-results').innerHTML=`<div class="story-result-heading"><p class="eyebrow">THE SCENT OF YOUR STORY</p><h3>당신의 이야기에서 발견한 향의 단서</h3><div class="story-detected">${points.map(p=>`<span>${p.theme.label}<small>${p.explicit?'직접 선택':esc(p.matches.slice(0,2).join(' · '))}</small></span>`).join('')}</div><p class="story-interpretation">${points.slice(0,3).map(p=>esc(p.theme.meaning)).join(' ')}</p></div><div class="story-recipe-grid">${recipes.map((r,i)=>`<article class="story-recipe"><div class="story-card-meta"><span>STORY BLEND 0${i+1}</span><span>${r.main.tier}</span></div><h4>${esc(r.title)}</h4><p class="story-main-label">MAIN SCENT</p><h5>${esc(r.main.number)}. ${esc(r.main.name)}</h5><div class="story-added-notes">${r.singles.map(s=>`<span>+ ${esc(ScentStyle.singleName(s))}</span>`).join('')}</div><div class="story-reasons">${r.reasons.map(reason=>`<p><b>${esc(reason.point)}</b><span>${reason.notes.map(esc).join(' · ')}의 이미지를 연결했어요.</span></p>`).join('')}</div><p class="story-pairing">${esc(r.pairing)}</p><div class="story-card-actions"><button type="button" class="secondary" data-detail="${r.main.id}">메인향 노트 확인 △</button><button type="button" class="story-apply" data-story-apply="${i}">이 이야기 조합 선택 →</button><button type="button" class="text-button" data-story-share="${i}">조합 링크 복사</button></div></article>`).join('')}</div><p class="story-footnote">이야기와 향의 이미지를 연결한 공방의 편집 제안입니다. 메인향의 노트는 참고 원향 자료이며, 최종 조합은 시향으로 골라보세요.</p><p id="story-action-status" role="status" class="status"></p>`;
    });
    $('story-results').addEventListener('click',async e=>{
      const use=e.target.closest('[data-story-apply]');if(use){const r=recipes[Number(use.dataset.storyApply)];if(r){apply(r);$('story-action-status').textContent='메인향과 단일향을 조합 영역에 적용했어요.';}return;}
      const share=e.target.closest('[data-story-share]');if(share){const r=recipes[Number(share.dataset.storyShare)];if(!r)return;const params=new URLSearchParams({main:r.main.id,notes:r.singles.map(s=>s.id).join(',')});const url=location.origin+location.pathname+'?'+params.toString();try{await navigator.clipboard.writeText(url);$('story-action-status').textContent='향 조합 링크를 복사했어요. 작성한 이야기 원문은 링크에 포함되지 않아요.';}catch{$('story-action-status').textContent='링크 복사를 지원하지 않는 환경이에요. 조합을 선택한 뒤 아래 스타일 보기에서 공유해주세요.';}}
    });
  }
  root.StoryUI={init};
})(globalThis);
