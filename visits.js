(function(){
  'use strict';
  const config=globalThis.FeedbackConfig;
  let visitor;
  try{visitor=localStorage.getItem('books-scents-visitor-v1');if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(visitor||'')){visitor=crypto.randomUUID();localStorage.setItem('books-scents-visitor-v1',visitor);}}catch{visitor=crypto.randomUUID();}
  globalThis.FeedbackVisitor=visitor;
  async function stats(){
    try{const response=await fetch(config.endpoint+'/stats',{headers:{apikey:config.key},signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('stats');const data=await response.json();document.getElementById('today-visitors').textContent=Number(data.visitors).toLocaleString('ko-KR');document.getElementById('today-views').textContent=Number(data.views).toLocaleString('ko-KR');document.getElementById('total-views').textContent=Number.isFinite(Number(data.totalViews))?Number(data.totalViews).toLocaleString('ko-KR'):'—';document.getElementById('visitor-stats-note').textContent='한국 시간 기준 · 방문은 같은 브라우저에서 하루 한 번 집계해요.';}catch{document.getElementById('visitor-stats-note').textContent='방문 통계를 잠시 불러오지 못했어요.';}
  }
  async function record(kind,position=''){
    try{const response=await fetch(config.endpoint+'/visit',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),visitor,kind,position}),keepalive:true,signal:AbortSignal.timeout(12000)});if(kind==='visit')await stats();}catch{if(kind==='visit')await stats();}
  }
  document.addEventListener('click',e=>{const link=e.target.closest('[data-reservation]');if(link)record('booking',link.dataset.reservation);});
  record('visit');
})();
