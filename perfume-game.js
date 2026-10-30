(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  let step=0,done=false,timer;
  const missions=[
    {title:'첫 번째 미션 · 어디에 뿌릴까요?',prompt:'너구리에게 향기를 입혀주세요.',choices:[['neck','목 옆에 살짝'],['wrist','손목에 살짝'],['face','얼굴 가까이에']],correct:['neck','wrist'],tip:'목 옆이나 손목처럼 맥박이 느껴지는 곳에 가볍게 뿌려보세요. 얼굴과 눈 주변은 피해주세요.',retry:'얼굴 가까이는 피해요! 목 옆이나 손목을 골라보세요.'},
    {title:'두 번째 미션 · 얼마나 뿌릴까요?',prompt:'곁에 있는 친구도 편안하게 느끼도록!',choices:[['light','소량부터 시작해요'],['lots','계속 많이 뿌려요']],correct:['light'],tip:'향의 농도와 공간에 따라 다르게 느껴져요. 소량부터 시작하고, 향이 퍼지는 모습을 기다려보세요.',retry:'많이 뿌리기보다 소량부터! 은은하게 시작해보세요.'},
    {title:'마지막 미션 · 뿌린 다음에는?',prompt:'향기로운 여운을 남기는 작은 습관.',choices:[['dry','자연스럽게 말려요'],['rub','손목을 세게 비벼요']],correct:['dry'],tip:'뿌린 뒤에는 손목을 세게 비비지 말고 자연스럽게 말려주세요.',retry:'손목을 세게 비비지 않아요. 자연스럽게 말리기를 골라보세요.'}
  ];
  function raccoon(girl=false){return `<g class="${girl?'game-girl':'game-boy'}"><path d="M48 138q49-40 61 5 5 27-52 23" fill="#9caaa2"/><path d="m68 126 8 37m9-39 8 31" stroke="#657c75" stroke-width="10"/><ellipse cy="151" rx="39" ry="12" fill="#516754" opacity=".12"/><path d="M-36 52Q-61 66-62 116l14 6 17-35-4 57q35 13 70 0l-4-57 17 35 14-6Q61 66 36 52Z" fill="${girl?'#d5a9ae':'#e9dfc4'}"/><path d="M-16 46v17q16 12 32 0V46" fill="#b4bfb5"/><circle cx="-34" cy="-35" r="17" fill="#889e96"/><circle cx="34" cy="-35" r="17" fill="#889e96"/><circle cx="-34" cy="-35" r="9" fill="#e5c9c5"/><circle cx="34" cy="-35" r="9" fill="#e5c9c5"/><ellipse cy="0" rx="49" ry="45" fill="#b5c4b8"/><path d="M-43-7Q-30-28-7-8L0-1 7-8Q30-28 43-7L40 9Q22 29 4 10L0 7-4 10Q-22 29-40 9Z" fill="#566e66"/><ellipse cy="22" rx="23" ry="16" fill="#f5e9d5"/><circle cx="-23" cy="0" r="5" fill="#f5f0dc"/><circle cx="23" cy="0" r="5" fill="#f5f0dc"/><circle cx="-23" cy="1" r="2.8" fill="#354c44"/><circle cx="23" cy="1" r="2.8" fill="#354c44"/><path d="M-7 16Q0 11 7 16L0 23Z" fill="#52685c"/><path d="M0 23v5m0-1q-8 7-12 0m12 0q8 7 12 0" stroke="#657864" stroke-width="1.5" fill="none"/><ellipse cx="-34" cy="18" rx="7" ry="4" fill="#df9da4" opacity=".7"/><ellipse cx="34" cy="18" rx="7" ry="4" fill="#df9da4" opacity=".7"/>${girl?'<path d="M15-37Q3-67 27-52 54-65 42-38L28-45Z" fill="#c58498"/><circle cx="28" cy="-45" r="5" fill="#edc0c6"/>':'<path d="m-17 64 17 13 17-13m-17 13v61" fill="none" stroke="#b5ad91" stroke-width="1.2"/>'}</g>`;}
  $('spray-game-art').innerHTML=`<svg viewBox="0 0 420 280" aria-hidden="true"><ellipse cx="204" cy="252" rx="152" ry="11" fill="#b1b8a1" opacity=".15"/><circle cx="160" cy="135" r="105" fill="#e4e8d8"/><path d="m44 37 3 8 9 2-9 3-3 8-2-8-9-3 9-2m316 13 2 7 8 2-8 2-2 7-2-7-7-2 7-2" fill="#c9b47f"/><g transform="translate(160 96)">${raccoon()}</g><g class="game-date" transform="translate(335 139) scale(.63)">${raccoon(true)}</g><g class="game-perfume" transform="translate(32 156) rotate(-16)"><rect x="-12" y="15" width="30" height="47" rx="7" fill="#c6b4d2" stroke="#a498ad"/><rect x="-5" y="2" width="15" height="16" rx="2" fill="#a6b6a2"/><rect x="-8" y="-4" width="22" height="10" rx="3" fill="#647c65"/><path d="M-2 34H11m-13 6H11" stroke="#fff5e4"/><text x="3" y="53" text-anchor="middle" font-size="5" fill="#fff5e4">STORY</text></g><g class="game-mist" fill="#b3c2b2"><circle cx="92" cy="137" r="3"/><circle cx="108" cy="127" r="2"/><circle cx="109" cy="146" r="4"/><circle cx="130" cy="132" r="3"/><circle cx="143" cy="145" r="2"/></g><g class="game-hearts" fill="#cb8e9f"><path d="M274 80q-12-17-19-4-5 9 19 23 25-15 18-24-8-11-18 5"/><path d="M312 58q-6-9-10-2-3 4 10 12 12-8 9-12-4-6-9 2"/></g></svg><div class="game-speech" id="spray-game-speech">으흠~ 좋아! ♡</div>`;
  function draw(){
    const mission=missions[step];$('spray-game-title').textContent=done?'향기 매너 미션 성공!':mission.title;
    $('spray-game-prompt').textContent=done?'은은한 향기로, 너구리의 하루가 더 다정해졌어요.':mission.prompt;
    $('spray-game-progress').innerHTML=['맥박 포인트','적당한 양','자연 건조'].map((label,i)=>`<span class="${i<step||done?'is-complete':''}" ${i===step&&!done?'aria-current="step"':''}>${i<step||done?'✓':i+1} ${label}</span>`).join('');
    $('spray-game-choices').innerHTML=done?'':mission.choices.map(([id,label])=>`<button type="button" data-spray-choice="${id}">${label}</button>`).join('');
    $('spray-game-next').hidden=true;$('spray-game-restart').hidden=!done;$('spray-game-booking').hidden=!done;
    $('spray-game-tip').textContent=done?'소량으로, 얼굴을 피해, 비비지 않고. 오늘의 향기 팁을 기억해주세요.':'선택하면 너구리가 향수 뿌리기를 도와드려요.';
  }
  function reset(){step=0;done=false;clearTimeout(timer);$('spray-game-art').classList.remove('is-spraying','is-happy');draw();}
  document.addEventListener('click',e=>{if(e.target.closest('[data-spray-game]')){reset();$('spray-game').showModal();}});
  $('spray-game-close').addEventListener('click',()=>$('spray-game').close());
  $('spray-game').addEventListener('close',()=>clearTimeout(timer));
  $('spray-game-choices').addEventListener('click',e=>{
    const button=e.target.closest('[data-spray-choice]');if(!button||done||!$('spray-game-next').hidden)return;
    const mission=missions[step],choice=button.dataset.sprayChoice;
    if(!mission.correct.includes(choice)){$('spray-game-tip').textContent=mission.retry;return;}
    $('spray-game-tip').textContent=mission.tip;$('spray-game-next').hidden=false;$('spray-game-next').textContent=step===2?'미션 완성하기 ♡':'다음 팁 알아보기 →';
    const art=$('spray-game-art');art.dataset.point=choice;art.classList.remove('is-spraying','is-happy');void art.offsetWidth;art.classList.add('is-spraying','is-happy');
    clearTimeout(timer);timer=setTimeout(()=>art.classList.remove('is-spraying'),1100);
  });
  $('spray-game-next').addEventListener('click',()=>{if($('spray-game-next').hidden)return;if(step===2)done=true;else step++;draw();});
  $('spray-game-restart').addEventListener('click',reset);
  draw();
})();
