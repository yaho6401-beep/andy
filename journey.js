(function(g){
  'use strict';
  const ids=['story','profile','selection'],labels={story:'이야기로 향 찾기',profile:'스타일로 향 찾기',selection:'직접 조합하기'};
  let active=null;
  function show(id,{scroll=true}={}){
    if(!ids.includes(id))return;active=id;
    for(const name of ids)document.getElementById(name).hidden=name!==id;
    for(const button of document.querySelectorAll('[data-journey]'))button.setAttribute('aria-pressed',String(button.dataset.journey===id));
    document.getElementById('journey-toolbar').hidden=false;
    document.getElementById('journey-current').textContent=labels[id];
    document.getElementById('journey-reservation').hidden=false;
    if(scroll)document.getElementById('journey-toolbar').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  for(const button of document.querySelectorAll('[data-journey]'))button.addEventListener('click',()=>show(button.dataset.journey));
  document.getElementById('journey-back').addEventListener('click',()=>{for(const id of ids)document.getElementById(id).hidden=true;active=null;document.getElementById('journey-toolbar').hidden=true;document.getElementById('journey-reservation').hidden=true;for(const b of document.querySelectorAll('[data-journey]'))b.setAttribute('aria-pressed','false');document.querySelector('.journey-choices').scrollIntoView({behavior:'smooth',block:'center'});});
  g.ScentJourney={show,get active(){return active;}};
  if(ids.includes(location.hash.slice(1)))show(location.hash.slice(1),{scroll:false});
})(globalThis);
