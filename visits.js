(function(){
 'use strict';
 const config=globalThis.FeedbackConfig;if(!config)return;
 const visitorKey='books-scents-visitor-v1',sessionKey='books-scents-session-v2',excludeKey='books-scents-analytics-exclude',uuid=/^[0-9a-f-]{36}$/i;
 const read=key=>{try{return localStorage.getItem(key);}catch{return null;}},write=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
 let visitor=read(visitorKey);if(!uuid.test(visitor||'')){visitor=crypto.randomUUID();write(visitorKey,visitor);}globalThis.FeedbackVisitor=visitor;
 const enabled=()=>read(excludeKey)!=='1';
 const label=v=>String(v||'').toLowerCase().replace(/[^a-z0-9_.-]/g,'').slice(0,60);
 const params=new URLSearchParams(location.search);let referrerHost='';try{referrerHost=new URL(document.referrer).hostname;}catch{}
 const device=/iPad|Tablet|Android(?!.*Mobile)/i.test(navigator.userAgent)?'tablet':/Mobi|iPhone/i.test(navigator.userAgent)?'mobile':'desktop';
 const incoming={utmSource:label(params.get('utm_source')),utmMedium:label(params.get('utm_medium')),utmCampaign:label(params.get('utm_campaign')),utmContent:label(params.get('utm_content')),referrerHost,device};
 let memorySession;
 function session(){
  let s;try{s=JSON.parse(read(sessionKey));}catch{}s=s||memorySession;
  // Keep one attribution per session; inactivity of 30 minutes starts a new one.
  if(!s||!uuid.test(s.id||'')||!Number.isFinite(s.last)||Date.now()-s.last>1800000){s={id:crypto.randomUUID(),last:Date.now(),entry:incoming};}
  s.last=Date.now();memorySession=s;write(sessionKey,JSON.stringify(s));return s;
 }
 const text=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
 async function stats(){if(!document.getElementById('today-visitors'))return;
  try{const r=await fetch(config.endpoint+'/stats',{headers:{apikey:config.key},signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error();const d=await r.json();for(const [id,v]of [['today-visitors',d.visitors],['today-views',d.views],['total-views',d.totalViews]])text(id,Number.isFinite(Number(v))?Number(v).toLocaleString('ko-KR'):'—');text('visitor-stats-note','한국 시간 기준 · 방문은 같은 브라우저에서 하루 한 번 집계해요.');}catch{text('visitor-stats-note','방문 통계를 잠시 불러오지 못했어요.');}
 }
 async function record(kind,position=''){
  if(!enabled())return;
  const s=session();try{await fetch(config.endpoint+'/visit',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),visitor,kind,position,sessionId:s.id,...s.entry,page:location.pathname}),keepalive:true,signal:AbortSignal.timeout(12000)});}catch{}
 }
 const seen=new Map();function action(name){if(!name||!enabled())return;const now=Date.now();if(now-(seen.get(name)||0)<2000)return;seen.set(name,now);record('action',name);}
 const destinations=new Set(['home','make','community','explore','studio','visit','gallery','feedback','story','profile','selection']);
 function route(){const hash=location.hash.slice(1);action(destinations.has(hash)?hash:location.pathname.startsWith('/archive')?'archive':location.pathname.startsWith('/camp')?'camp':new URLSearchParams(location.search).has('main')?'make':'home');}
 document.addEventListener('click',e=>{
  const el=e.target.closest('a,button');if(!el)return;
  if(el.hasAttribute('data-reservation'))record('booking',el.dataset.reservation);
  if(el.dataset.journey)action(el.dataset.journey);
  for(const [selector,name] of [['[data-journal-open]','journal'],['[data-spray-game]','spray'],['[data-runner-game]','runner'],['[data-longevity-open]','longevity'],['[data-save-blend]','blend_save']])if(el.matches(selector))action(name);
  if(el.id==='recommend'&&!el.disabled&&document.querySelector('#result .blend-finish')&&document.querySelector('#result .blend-finish'))action('blend_complete');
  if(el.matches('[data-lounge]'))action(el.dataset.lounge==='vip'?'vip':'solo');
  if(el.id==='solo-announcement-link')action('solo');
  if(el.tagName==='A'){let u;try{u=new URL(el.href);}catch{return;}
   if(u.origin===location.origin&&destinations.has(u.hash.slice(1)))action(u.hash.slice(1));
   if(u.origin===location.origin&&u.pathname.startsWith('/archive'))action('archive');
   if(u.origin===location.origin&&u.pathname.startsWith('/camp'))action('camp');
   if(/(^|\.)instagram\.com$/.test(u.hostname))action('instagram');
   if(/(^|\.)(youtube\.com|youtu\.be)$/.test(u.hostname))action('youtube');
  }
 });
 window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
 const note=document.createElement('details');note.className='analytics-notice';note.innerHTML='<summary>방문 통계 안내</summary><p>서비스 개선을 위해 익명 브라우저 식별자, 방문 시각, 유입 출처와 메뉴·예약 링크 이용을 기록합니다. 입력한 이야기·연락처·검색어와 전체 URL은 방문 통계로 수집하지 않습니다. 같은 브라우저를 기준으로 하며, 기기 변경이나 저장소 삭제 시 기록이 분리됩니다.</p><label><input type="checkbox"> 이 브라우저의 방문 통계 수집 제외</label>';
 const box=note.querySelector('input');box.checked=!enabled();box.addEventListener('change',()=>write(excludeKey,box.checked?'1':'0'));document.querySelector('.visitor-stats')?.after(note);
 record('visit').finally(stats);route();
})();
