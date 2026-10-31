(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  let step=0,done=false,timer;
  const missions=[
    {title:'첫 번째 미션 · 어디에 뿌릴까요?',prompt:'너구리에게 향기를 입혀주세요.',choices:[['neck','목 옆에 살짝'],['wrist','손목에 살짝'],['face','얼굴 가까이에']],correct:['neck','wrist'],tip:'목 옆이나 손목처럼 맥박이 느껴지는 곳에 가볍게 뿌려보세요. 얼굴과 눈 주변은 피해주세요.',retry:'얼굴 가까이는 피해요! 목 옆이나 손목을 골라보세요.'},
    {title:'두 번째 미션 · 얼마나 뿌릴까요?',prompt:'곁에 있는 친구도 편안하게 느끼도록!',choices:[['light','소량부터 시작해요'],['lots','계속 많이 뿌려요']],correct:['light'],tip:'향의 농도와 공간에 따라 다르게 느껴져요. 소량부터 시작하고, 향이 퍼지는 모습을 기다려보세요.',retry:'많이 뿌리기보다 소량부터! 은은하게 시작해보세요.'},
    {title:'마지막 미션 · 뿌린 다음에는?',prompt:'향기로운 여운을 남기는 작은 습관.',choices:[['dry','자연스럽게 말려요'],['rub','손목을 세게 비벼요']],correct:['dry'],tip:'뿌린 뒤에는 손목을 세게 비비지 말고 자연스럽게 말려주세요.',retry:'손목을 세게 비비지 않아요. 자연스럽게 말리기를 골라보세요.'}
  ];
  const artAsset=document.currentScript?.src?new URL('./assets/perfume-raccoons-cute-v3.png',document.currentScript.src).href:'/assets/perfume-raccoons-cute-v3.png';
  $('spray-game-art').innerHTML=`<div class="ritual-scene" aria-hidden="true"><div class="ritual-figure ritual-boy"><img src="${artAsset}" alt="" width="960" height="640"></div><div class="ritual-figure game-date"><img src="${artAsset}" alt="" width="960" height="640"></div><div class="game-mist ritual-mist"><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="game-speech" id="spray-game-speech">으흠~ 좋아! ♡</div>`;
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
