import {VOYAGE_KEY,VOYAGE_ROUTES,homeVoyage,departVoyage,returnVoyage,restoreVoyage,updateVoyage,voyagePose,voyagePosition,departureSeconds} from './voyage-state.js';
import {harborSceneFor} from './coastal-scenery.js';
import {createPortWorld} from './port-world.js';
const $=id=>document.getElementById(id),time=n=>`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;
export class CruiseVoyage{
 constructor(environment,api){
  this.environment=environment;this.api=api;this.heading=0;this.storage=api.storage||localStorage;this.clock=api.clock||Date.now;this.phase=null;this.milestones=new Set();
  try{this.value=restoreVoyage(JSON.parse(this.storage.getItem(VOYAGE_KEY)),this.clock());}catch{this.value=homeVoyage();}
  document.body.insertAdjacentHTML('beforeend',`<button id="voyage-strip" class="voyage-strip" hidden aria-label="항해 안내 열기"><span id="voyage-title"></span><small id="voyage-detail"></small><i><em id="voyage-progress"></em></i></button><aside id="captain-caption" class="captain-caption" hidden aria-live="polite"></aside><dialog id="voyage-dialog" class="voyage-dialog" aria-labelledby="voyage-dialog-title"><div class="voyage-heading"><span><small>BLUE HORIZON · BRIDGE</small><h2 id="voyage-dialog-title">선장과 항해하기</h2></span><button id="voyage-close" aria-label="항해 안내 닫기">×</button></div><p id="voyage-greeting"></p><p class="voyage-trial">단축 항해 시연 · 지역을 참고한 생성 배경과 움직이는 3D 선박으로 구성한 가상 항구입니다.</p><div id="voyage-routes"></div><section id="voyage-current" hidden><p id="voyage-summary"></p><button id="voyage-view" class="voyage-primary" hidden>항구 풍경 크게 보기</button><button id="voyage-return" class="voyage-primary">모항으로 귀항하기</button><small>귀항하는 동안에도 산책하거나 빌린 책을 읽을 수 있어요.</small></section></dialog>`);
  this.dialog=$('voyage-dialog');$('voyage-current').after($('voyage-routes'));const choices=document.createElement('p');choices.id='voyage-choices-title';choices.textContent='다음 항구로 계속 항해하기';$('voyage-routes').before(choices);$('voyage-close').onclick=()=>this.dialog.close();$('voyage-strip').onclick=()=>this.value.phase==='home'?api.meetCaptain():this.open();
  const today=Math.floor(this.clock()/86400000)%VOYAGE_ROUTES.length,ordered=[VOYAGE_ROUTES[today],...VOYAGE_ROUTES.filter((_,i)=>i!==today)];
  for(const route of ordered){const button=document.createElement('button');button.className='voyage-route';button.dataset.sail=route.id;button.style.setProperty('--port-color',route.color);button.innerHTML=`<span class="voyage-route-number">${String(VOYAGE_ROUTES.indexOf(route)+1).padStart(2,'0')}</span><span><small>${route.sea}${route===ordered[0]?' · 오늘의 추천':''}</small><b>${route.name}</b><span>${route.description}</span><small>단축 항해 ${time(route.seconds)} · 출항 ↗</small></span>`;button.onclick=()=>this.depart(route.id);$('voyage-routes').append(button);}
  $('voyage-view').onclick=()=>{this.dialog.close();this.api.watchHarbor();};
  $('voyage-return').onclick=()=>this.requestReturn();this.returnHandler=e=>{if(this.value.phase!=='home'){e.preventDefault();this.open();}};$('return-camp').addEventListener('click',this.returnHandler);
  this.ensurePort();this.save();
 }
 save(){try{this.storage.setItem(VOYAGE_KEY,JSON.stringify(this.value));}catch{}}
 ensurePort(p=voyagePose(this.value,this.clock())){const {id}=harborSceneFor(this.value,p);if(this.portId===id)return;this.port?.dispose();this.port=null;this.portId=id;if(id){this.port=createPortWorld(this.environment,id);const end=voyagePosition(id,1);this.port.root.position.set(end.x-Math.sin(end.heading)*380,0,end.z-Math.cos(end.heading)*380);this.port.root.rotation.y=end.heading;}}
 open(){this.api.pause();this.render(this.clock());if(!this.dialog.open)this.dialog.showModal();}
 depart(id){
  if(!['home','port'].includes(this.value.phase)||this.value.routeId===id&&this.value.phase==='port')return;
  const me=this.api.player();if(this.value.phase==='home'&&(me.room!==3||Math.hypot(me.position.x-4.5,me.position.z+43)>3)){this.dialog.close();this.api.meetCaptain();return;}
  this.value=departVoyage(this.value,id,this.clock());this.milestones.clear();this.save();this.ensurePort();this.api.depart(VOYAGE_ROUTES.find(r=>r.id===id));this.render(this.clock());this.dialog.close();this.say(`선장 · 자, 이제 떠나볼까. ${VOYAGE_ROUTES.find(r=>r.id===id).name} 쪽으로 가세.`,6500);
 }
 requestReturn(){if(this.value.phase==='home'||this.value.phase==='returning')return;this.value=returnVoyage(this.value,this.clock());this.save();this.render(this.clock());this.dialog.close();this.say('선장 · 항로를 돌려 모항으로 돌아가겠네. 갑판에서 조금 쉬고 있게나.',6000);}
 say(text,duration=5000){this.captionText=text;this.captionUntil=this.clock()+duration;}
 render(now){
  const p=voyagePose(this.value,now),home=p.phase==='home',returning=p.phase==='returning',atPort=p.phase==='port',origin=this.value.originId;
  document.body.classList.toggle('cruise-at-sea',!home);$('voyage-strip').hidden=home&&this.api.player().room!==3;document.body.classList.toggle('cruise-voyage-hud',!$('voyage-strip').hidden);
  $('voyage-title').textContent=home?'선장과 떠나는 열두 항구':`${p.route.name} · ${returning?'귀항 중':p.phase==='port'?'먼 항구 앞바다':Math.round(p.u*100)+'%'}`;
  $('voyage-detail').textContent=home?'선교에서 선장을 만나보세요':p.phase==='port'?'풍경을 둘러보거나 다음 항구를 골라보세요':p.turning?'새 항로를 향해 천천히 선회하고 있어요':`${returning?'모항까지':'항구 풍경까지'} ${time(p.remaining)} · 단축 시연`;
  $('voyage-progress').style.width=(home?0:p.u*100)+'%';$('return-camp').textContent=home?'← 캠핑장 돌아가기':returning?`← 귀항 중 ${time(p.remaining)}`:'← 캠핑장으로 귀항';
  $('voyage-routes').hidden=!(home||atPort);$('voyage-current').hidden=home;$('voyage-choices-title').hidden=!atPort;for(const button of $('voyage-routes').children){const id=button.dataset.sail;button.hidden=atPort&&id===this.value.routeId;button.disabled=!(home||atPort);const line=button.querySelector('span+span>small:last-child');if(line)line.textContent='단축 항해 '+time(departureSeconds(atPort?this.value.routeId:null,id)+(atPort?6:0))+' · 출항 ↗';}
  $('voyage-greeting').textContent=home?`“자, 이제 떠나볼까. 열두 항구 중 어디로 가고 싶은가?”`:p.phase==='port'?`“${p.route.name} 앞바다에 도착했네. 다음 항구를 골라 계속 여행해도 좋겠네.”`:returning?'“모항으로 돌아가는 중이네. 바다를 바라보며 기다려 주게.”':`“${p.route.sea} 쪽으로 항해하고 있네. 선수에 서면 풍경이 더 잘 보일 걸세.”`;
  $('voyage-summary').textContent=home?'':p.phase==='port'?`${p.route.name} 앞바다 · 다른 열한 항구 중 다음 목적지를 골라보세요`:p.turning?'선회 중 · 항로를 천천히 바꾸고 있어요.':`${returning?'모항까지':'항구까지'} ${time(p.remaining)} · ${origin?'이번 항로':'모항에서'} ${Math.round(p.u*100)}% ${origin?'진행':'멀어진 곳'}`;
  $('voyage-view').hidden=p.phase!=='port';$('voyage-return').disabled=returning;$('voyage-return').textContent=returning?'귀항하고 있어요':'모항으로 귀항하기';
 }
 frame(dt,elapsed){
  const now=this.clock(),next=updateVoyage(this.value,now);if(next.phase!==this.value.phase){this.value=next;this.save();this.ensurePort();if(next.phase==='port')this.say(`선장 · ${voyagePose(next,now).route.name} 앞바다에 도착했네. 천천히 둘러보게.`,6500);if(next.phase==='home')this.say('선장 · 모항에 무사히 돌아왔네. 이제 캠핑장으로 내려도 좋네.',6500);}
  const p=voyagePose(this.value,now);this.ensurePort(p);const {extra}=harborSceneFor(this.value,p);if(this.port&&(p.phase==='port'||p.phase==='outbound'&&p.u>.74))this.api.harborWater?.(this.port.state.sea,dt);this.port?.update(elapsed,{night:this.api.night?.()?1:0,extra,haze:this.api.horizon?.(),eye:this.api.eye?.()});const diff=Math.atan2(Math.sin(p.heading-this.heading),Math.cos(p.heading-this.heading));this.heading+=diff*(1-Math.exp(-dt*1.8));const c=Math.cos(this.heading),s=Math.sin(this.heading);this.environment.rotation.y=-this.heading;this.environment.position.set(-c*p.x+s*p.z,0,-s*p.x-c*p.z);this.pose={...p,heading:this.heading};
  if(p.phase==='outbound')for(const [u,key,line]of [[.12,'leave','선장 · 방금 머문 해안이 멀어지는군. 다음 풍경을 만나러 가세.'],[.5,'sea','선장 · 사방이 바다로 열렸네. 선미에서 길게 남는 항적을 보게.'],[.83,'land',`선장 · 수평선 너머로 ${p.route.name}의 해안이 보이는군.`]])if(p.u>=u&&!this.milestones.has(key)){this.milestones.add(key);this.say(line,5500);}
  if(Math.floor(now/1000)!==this.lastSecond){this.lastSecond=Math.floor(now/1000);this.render(now);}
  $('captain-caption').hidden=!this.captionText||now>this.captionUntil||!!document.querySelector('dialog[open]');if(!$('captain-caption').hidden)$('captain-caption').textContent=this.captionText;
  return this.pose;
 }
 get state(){const p=this.pose||voyagePose(this.value,this.clock());return {phase:p.phase,routeId:p.route?.id||null,routeName:p.route?.name||null,progress:p.u,originId:this.value.originId||null,originName:VOYAGE_ROUTES.find(r=>r.id===this.value.originId)?.name||null,homeProgress:p.homeProgress,returnFromProgress:p.returnFromProgress,position:{x:p.x,z:p.z},heading:p.heading,speed:p.speed,remaining:p.remaining,port:this.port?.state||null,environmentOffset:this.environment.position.toArray(),trial:true};}
 dispose(){this.port?.dispose();this.save();$('return-camp').removeEventListener('click',this.returnHandler);this.dialog.close();for(const id of ['voyage-dialog','voyage-strip','captain-caption'])$(id)?.remove();document.body.classList.remove('cruise-at-sea','cruise-voyage-hud','cruise-bridge');}
}
