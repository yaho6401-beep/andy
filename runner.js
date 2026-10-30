(function(g){
 'use strict';
 const $=id=>document.getElementById(id),dialog=$('runner-dialog'),canvas=$('runner-canvas'),ctx=canvas.getContext('2d'),E=g.PerfumeRunnerEngine,config=g.FeedbackConfig;
 const labels={discount1000:'매장 1,000원 할인권',discount2000:'매장 2,000원 할인권',discount3000:'매장 3,000원 할인권',extra5:'5ml 제공권',extra3:'3ml 제공권',bottleUpgrade:'공병 1단계 업그레이드 쿠폰'};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let state=E.create(1),session=null,events=[],savedTick=0,playing=false,raf=0,last=0,acc=0,lastSync=0,syncPromise=null,loading=false,reload=false,drawBusy=false,draw=null,coupon=null,wallet=[],adminToken=g.FeedbackAdmin?.token||null,checkedCoupon=null;
 let registeredNickname='',boardVersion=0;try{$('runner-nickname').value=localStorage.getItem('scent-runner-nickname')||'';}catch{}
 let best=0;try{best=Number(localStorage.getItem('scent-runner-best'))||0;}catch{}
 const visitor=g.FeedbackVisitor||crypto.randomUUID(),time=n=>String(Math.floor(n/3600)).padStart(2,'0')+':'+String(Math.floor(n/60)%60).padStart(2,'0');
 const date=v=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(v));
 const text=s=>g.ScentI18n?.text(s)||s;
 function status(message){$('runner-status').textContent=message;}
 async function api(path,body){const r=await fetch(config.endpoint+'/game/'+path,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json',...(adminToken?{Authorization:'Bearer '+adminToken}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});const data=await r.json();if(!r.ok){const error=Error(data.error||'게임과 연결하지 못했어요. 잠시 후 다시 시도해주세요.');error.status=r.status;throw error;}return data;}
 function validNickname(){const value=$('runner-nickname').value.normalize('NFC').trim().replace(/\s+/g,' ');if(!value||[...value].length>12||/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/.test(value)){status('게임을 시작하기 전에 닉네임을 1~12자로 적어주세요.');$('runner-nickname').focus();return null;}return value;}
 function renderLeaderboard(data){if(!data)return;const mine=data.mine;$('runner-total-score').textContent=String(mine?.score||0);$('runner-place').textContent=mine?.place?String(mine.place):'—';$('runner-player-code').textContent=mine?.code||'';if(mine?.nickname&&!$('runner-nickname').value.trim())$('runner-nickname').value=mine.nickname;$('runner-ranking-list').innerHTML=data.leaders?.length?data.leaders.map(row=>'<tr'+(row.code===mine?.code?' class="runner-own-rank"':'')+'><td>'+Number(row.place)+'</td><td><strong data-no-i18n>'+esc(row.nickname)+'</strong><small data-no-i18n>'+esc(row.code)+'</small></td><td>'+Number(row.score).toLocaleString('en-US')+'</td></tr>').join(''):'<tr><td colspan="3">첫 번째 누적 랭커를 기다려요.</td></tr>';$('runner-ranking-status').textContent='';}
 function acceptBoard(data){if(data){boardVersion++;renderLeaderboard(data);}}
 async function loadLeaderboard(){const version=++boardVersion;$('runner-ranking-status').textContent='랭킹을 불러오고 있어요…';try{const data=await api('leaderboard',{visitor});if(version===boardVersion)renderLeaderboard(data);}catch(error){if(version===boardVersion)$('runner-ranking-status').textContent=error.message;}}
 $('runner-ranking-refresh').addEventListener('click',loadLeaderboard);
 function queue(change){events.push({t:state.tick+1,...change});}
 function release(){if(session)queue({j:0,s:0});}
 function pause(){playing=false;release();try{localStorage.setItem('scent-runner-best',String(best));}catch{}update();}
 function update(){
  best=Math.max(best,state.score);$('runner-best').textContent=String(best);$('runner-combo').textContent=String(state.combo||0);
  $('runner-time').textContent=time(state.active);$('runner-score').textContent=String(state.score);$('runner-hearts').textContent='♥'.repeat(Math.max(0,state.hp))+'♡'.repeat(3-Math.max(0,state.hp));
  $('runner-progress').value=Math.min(1,Math.min(state.active/E.GOAL_TICKS,state.score/E.GOAL_SCORE));
  $('runner-play').textContent=loading?'연결 중…':playing?'일시정지':state.over&&session?'다시 달리기':session?'이어 하기':'게임 시작';
  $('runner-nickname').disabled=playing||loading;$('runner-play').disabled=loading;$('runner-jump').disabled=!playing||state.over;$('runner-spray').disabled=!playing||state.over;
 }
 async function connect(){const nickname=validNickname();if(!nickname)return false;loading=true;update();try{if(syncPromise)await syncPromise;const data=await api('start',{visitor,nickname});registeredNickname=data.profile?.nickname||nickname;$('runner-nickname').value=registeredNickname;try{localStorage.setItem('scent-runner-nickname',registeredNickname);}catch{}acceptBoard(data.leaderboard);session={id:data.id,version:data.version};state=data.state;E.upgrade(state);savedTick=state.tick;events=[];reload=false;draw=data.draw;wallet=data.coupons||[];renderWallet();if(draw)showDraw(draw);status('플레이 기록은 자동으로 저장돼요.');return true;}catch(error){status(error.message);return false;}finally{loading=false;update();}}
 async function claim(){
  if(draw||drawBusy)return;drawBusy=true;
  try{const result=await api('claim',{visitor,id:session.id});draw=result.draw;pause();showDraw(draw);if(draw.prize!=='none'){wallet.unshift(draw);renderWallet();}status('오늘의 향기 미션을 완료했어요!');}
  catch(error){status(error.message);}finally{drawBusy=false;}
 }
 async function sync(){
  if(syncPromise)return syncPromise;if(!session||state.tick<=savedTick)return;
  const toTick=state.tick,inputs=events.filter(e=>e.t>savedTick&&e.t<=toTick);
  syncPromise=(async()=>{try{const result=await api('checkpoint',{visitor,id:session.id,version:session.version,toTick,events:inputs});session.version=result.version;savedTick=toTick;acceptBoard(result.leaderboard);events=events.filter(e=>e.t>toTick);$('runner-save-state').textContent='저장됨';if(result.verifiedActive>=E.GOAL_TICKS&&result.score>=E.GOAL_SCORE&&!draw)await claim();}catch(error){pause();reload=true;status(error.message+' 이어 하기를 눌러주세요.');$('runner-save-state').textContent='연결 확인 필요';}finally{syncPromise=null;}})();return syncPromise;
 }
 $('runner-play').addEventListener('click',async()=>{
  if(loading)return;if(playing){pause();await sync();return;}
  const nickname=validNickname();if(!nickname)return;if(!session||reload||nickname!==registeredNickname){if(session)await sync();if(!await connect())return;}
  if(state.over)queue({r:1});release();playing=true;acc=0;last=0;status('점프하고, 칙! 향기로 친구를 구해보세요.');update();
 });
 function control(button,key){button.addEventListener('pointerdown',e=>{if(!playing||state.over)return;e.preventDefault();try{button.setPointerCapture(e.pointerId);}catch{}queue({[key]:1});});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>{if(session)queue({[key]:0});});}
 control($('runner-jump'),'j');control($('runner-spray'),'s');
 document.addEventListener('keydown',e=>{if(!dialog.open||!playing||e.repeat||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const key=['Space','ArrowUp','KeyW'].includes(e.code)?'j':['KeyF','ArrowRight'].includes(e.code)?'s':null;if(key){e.preventDefault();queue({[key]:1});}});
 document.addEventListener('keyup',e=>{if(!dialog.open||!session||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const key=['Space','ArrowUp','KeyW'].includes(e.code)?'j':['KeyF','ArrowRight'].includes(e.code)?'s':null;if(key){e.preventDefault();queue({[key]:0});}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&dialog.open){pause();sync();}});
 window.addEventListener('blur',()=>{if(dialog.open){pause();sync();}});
 function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
 function animal(x,y,type,size,happy=false){
  ctx.save();ctx.translate(x,y);ctx.scale(size/70,size/70);
  const raccoon=type==='raccoon',rabbit=type==='rabbit',bear=type==='bear';const body=raccoon?'#a5b4a8':bear?'#b3987a':rabbit?'#d9b9c3':'#b4b8c0';
  if(raccoon){ctx.save();ctx.rotate(-.4);ellipse(33,-19,29,12,'#a5b4a8');ctx.strokeStyle='#657a6b';ctx.lineWidth=7;for(const n of [27,40]){ctx.beginPath();ctx.moveTo(n,-29);ctx.lineTo(n,-9);ctx.stroke();}ctx.restore();}
  ellipse(0,-23,24,26,body);ellipse(-13,-2,11,6,'#64796b');ellipse(13,-2,11,6,'#64796b');
  if(rabbit){ellipse(-14,-78,9,25,body);ellipse(14,-78,9,25,body);ellipse(-14,-79,4,16,'#ecd0d4');ellipse(14,-79,4,16,'#ecd0d4');}else{ellipse(-24,-65,raccoon?12:14,raccoon?13:14,body);ellipse(24,-65,raccoon?12:14,raccoon?13:14,body);ellipse(-24,-65,6,7,'#e8c7c5');ellipse(24,-65,6,7,'#e8c7c5');}
  ellipse(0,-48,33,28,body);if(raccoon){ellipse(-16,-49,14,10,'#526e61');ellipse(16,-49,14,10,'#526e61');}
  ellipse(0,-36,17,12,'#f5ead6');ctx.strokeStyle='#40574a';ctx.lineWidth=2.5;
  for(const ex of [-13,13]){if(happy){ctx.beginPath();ctx.arc(ex,-48,5,Math.PI,0);ctx.stroke();}else ellipse(ex,-48,3.5,4,'#304638');}
  ellipse(0,-38,4.5,3,'#41594b');ctx.beginPath();ctx.arc(0,-34,7,0,Math.PI);ctx.stroke();ellipse(-24,-35,5,3,'#d79caa');ellipse(24,-35,5,3,'#d79caa');
  if(raccoon){ctx.fillStyle='#d5c2e1';ctx.fillRect(18,-31,13,23);ctx.fillStyle='#657f65';ctx.fillRect(20,-37,9,7);}
  if(!raccoon&&!happy){ctx.fillStyle='#909d7b';for(let i=0;i<3;i++)ellipse(-29+i*25,-100-(Math.sin(state.tick/10+i)*7),8,8,'#b0b59a66');}
  ctx.restore();
 }
 function render(){
  ctx.clearRect(0,0,900,440);const grad=ctx.createLinearGradient(0,0,0,440);grad.addColorStop(0,'#e9eede');grad.addColorStop(1,'#fbf6e9');ctx.fillStyle=grad;ctx.fillRect(0,0,900,440);
  for(let i=0;i<6;i++){const x=((i*210-state.tick*.25)%1250+1250)%1250-160;ellipse(x,75+i%2*40,58,15,'#fffdf5');}
  const offset=state.tick*(4+Math.min(state.active/3600,5.5));
  for(let i=0;i<10;i++){const x=((i*130-offset*.15)%1300+1300)%1300-100;ctx.fillStyle=i%2?'#ced9be':'#d9dfca';ctx.fillRect(x,215,70,125);ellipse(x+35,212,50,54,ctx.fillStyle);}
  ctx.fillStyle='#b9c8a2';ctx.fillRect(0,343,900,5);ctx.fillStyle='#e9e0cb';ctx.fillRect(0,348,900,92);ctx.strokeStyle='#cfc7b5';ctx.lineWidth=2;for(let i=0;i<14;i++){const x=((i*80-offset)%1120+1120)%1120;ctx.beginPath();ctx.moveTo(x,373);ctx.lineTo(x+25,373);ctx.stroke();}
  for(const e of state.enemies){if(e.type==='obstacle'){ctx.fillStyle='#baaa8b';ctx.fillRect(e.x-20,292,40,48);ctx.fillStyle='#819878';ctx.fillRect(e.x-25,285,50,10);ctx.fillStyle='#a3b18c';ellipse(e.x,277,20,17,'#a3b18c');}else if(e.type==='stink'){ellipse(e.x,e.y-17,18,17,'#899475');ellipse(e.x-6,e.y-21,4,4,'#ccd1ac');}else{animal(e.x,e.y,e.type,e.boss?110:e.type==='bear'?75:63);if(e.boss){ctx.fillStyle='#cfcab5';ctx.fillRect(e.x-54,e.y-132,108,9);ctx.fillStyle='#a87991';ctx.fillRect(e.x-54,e.y-132,108*e.hp/e.maxHp,9);ctx.fillStyle='#68795d';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText(text('악취 보스'),e.x,e.y-143);}}}
  for(const b of state.bolts){
   const age=b.age||0,radius=Math.min(b.fever?95:78,14+age*4),alpha=Math.max(0,1-age/22);ctx.save();ctx.globalAlpha=alpha*.55;const mist=ctx.createRadialGradient(b.x,b.y,3,b.x+radius*.3,b.y,radius);mist.addColorStop(0,b.fever?'#ead0a5':'#d5c4e8');mist.addColorStop(1,'#e3e7ed00');ctx.fillStyle=mist;ctx.beginPath();ctx.moveTo(157,b.y);ctx.bezierCurveTo(b.x+radius,b.y-radius*.8,b.x+radius*1.2,b.y+radius*.8,157,b.y+5);ctx.fill();for(let i=0;i<32;i++){const angle=(i*2.399+b.id)*.8,distance=radius*(.2+(i%9)/11),x=b.x+Math.abs(Math.cos(angle))*distance,y=b.y+Math.sin(angle)*distance*.55;ellipse(x,y,1.3+i%4,1.3+i%4,i%3?'#f6f6fa':'#d3b9dc');}ctx.restore();
  }
  if(state.fever>0){ctx.strokeStyle='#d8ad69';ctx.lineWidth=7;ctx.strokeRect(4,4,892,432);ctx.fillStyle='#b38b4d';ctx.font='bold 18px sans-serif';ctx.textAlign='right';ctx.fillText(text('안개 피버!')+' '+Math.ceil(state.fever/60)+'s',875,34);}
  if(state.noticeTTL>0){ctx.save();ctx.globalAlpha=Math.min(1,state.noticeTTL/20);ctx.fillStyle=state.notice==='fever'?'#b48a46':'#a66e8f';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText(text(state.notice==='fever'?'5콤보! 향기 점수 2배':state.notice==='boss'?'보스 구출 성공!':'퍼펙트 타이밍!'),450,77);ctx.restore();}
  if(state.combo>1){ctx.fillStyle='#9a7789';ctx.font='bold 20px sans-serif';ctx.textAlign='left';ctx.fillText('COMBO ×'+state.combo,23,36);}
  for(const f of state.friends){ctx.globalAlpha=f.t/100;if(f.type!=='stink')animal(f.x,f.y,f.type,f.boss?95:63,true);ctx.fillStyle='#c7889c';ctx.font='24px sans-serif';ctx.textAlign='center';ctx.fillText('♥',f.x+28,f.y-95);ctx.globalAlpha=1;}
  if(!state.shield||Math.floor(state.tick/6)%2)animal(132,state.y,'raccoon',74,true);
  ctx.fillStyle='#6b7e5f';ctx.font='14px sans-serif';ctx.textAlign='left';ctx.fillText(text('책과향기 · 향기로 행복을 전해요'),22,412);
  if(!playing){ctx.fillStyle='#f9f7eac9';ctx.fillRect(0,0,900,440);ctx.textAlign='center';ctx.fillStyle='#3d5b43';ctx.font='bold 29px sans-serif';ctx.fillText(text(state.over?'잠깐 쉬고, 다시 달려볼까요?':session?'준비되면 이어 달려요!':'너구리의 향기로운 달리기'),450,183);ctx.font='17px sans-serif';ctx.fillStyle='#7d8b71';ctx.fillText(text(state.over?'점수와 플레이 시간은 유지돼요.':'점프로 장애물을 넘고, 칙! 악취 친구를 구해주세요.'),450,221);animal(450,319,'raccoon',85,true);}
 }
 function frame(ts){
  if(!dialog.open)return;const dt=last?Math.min(.1,(ts-last)/1000):0;last=ts;
  if(playing&&!document.hidden){acc+=dt;let steps=0;while(acc>=1/60&&steps++<6){if(state.over&&!events.some(e=>e.t===state.tick+1&&e.r)){playing=false;acc=0;break;}const input={};for(const event of events)if(event.t===state.tick+1)Object.assign(input,event);E.step(state,input);acc-=1/60;}if(state.over&&!events.some(e=>e.t===state.tick+1&&e.r))playing=false;}
  render();update();if(session&&state.tick>savedTick&&ts-lastSync>12000){lastSync=ts;sync();}raf=requestAnimationFrame(frame);
 }
 function renderWallet(){$('runner-wallet-list').innerHTML=wallet.length?wallet.map((c,i)=>`<button type="button" data-wallet="${i}">${esc(labels[c.prize])} <small>${esc(date(c.expires_at))}</small></button>`).join(''):'<p>아직 발급된 쿠폰이 없어요.</p>';}
 function showDraw(result){
  $('runner-reward').hidden=false;if(result.prize==='none'){coupon=null;$('runner-prize').textContent='오늘은 쿠폰이 나오지 않았어요.';$('runner-coupon-details').hidden=true;$('runner-save-coupon').hidden=true;return;}
  coupon=result;$('runner-prize').textContent=labels[result.prize];$('runner-code').textContent=result.code;$('runner-expiry').textContent=date(result.expires_at);$('runner-coupon-details').hidden=false;$('runner-save-coupon').hidden=false;
  $('runner-coupon-state').textContent=result.status==='redeemed'?'사용 완료':result.status==='void'?'발급 취소':new Date(result.expires_at)<=new Date()?'기간 만료':'사용 가능';
 }
 $('runner-wallet-load').addEventListener('click',async()=>{pause();await sync();if(!await connect())return;$('runner-wallet').open=true;});
 $('runner-wallet-list').addEventListener('click',e=>{const b=e.target.closest('[data-wallet]');if(b)showDraw(wallet[Number(b.dataset.wallet)]);});
 $('runner-save-coupon').addEventListener('click',async()=>{
  if(!coupon)return;const c=document.createElement('canvas');c.width=1100;c.height=1450;const x=c.getContext('2d');x.fillStyle='#f8f4e9';x.fillRect(0,0,c.width,c.height);x.strokeStyle='#9aaa85';x.lineWidth=4;x.strokeRect(40,40,1020,1370);x.textAlign='center';x.fillStyle='#3b5840';x.font='42px sans-serif';x.fillText('책과향기',550,165);x.font='24px sans-serif';x.fillText('향수 미니게임 · 향기 선물',550,235);x.font='bold '+(coupon.prize==='bottleUpgrade'?43:62)+'px sans-serif';x.fillText(labels[coupon.prize],550,430);x.font='bold 47px monospace';x.fillText(coupon.code,550,590);x.font='29px sans-serif';x.fillText('유효기간: '+date(coupon.expires_at)+'까지',550,710);x.font='25px sans-serif';for(const [i,line] of ['방문당 1장 · 다른 쿠폰과 중복 불가','매장에서 쿠폰 번호 확인 후 사용 처리','발급일: '+date(coupon.issued_at)].entries())x.fillText(line,550,850+i*55);x.font='30px serif';x.fillText('당신의 이야기에 향을 입히세요.',550,1160);x.font='23px sans-serif';x.fillText('실제 사용 여부는 매장 조회 결과를 기준으로 합니다.',550,1290);const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=coupon.code+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
 });
 function adminState(){$('runner-admin-login').hidden=Boolean(adminToken);$('runner-admin-check').hidden=!adminToken;if(!adminToken){checkedCoupon=null;$('runner-admin-confirm').hidden=true;$('runner-admin-result').textContent='';}}
 $('runner-admin-login').addEventListener('submit',async e=>{e.preventDefault();const password=$('runner-admin-password').value;$('runner-admin-password').value='';$('runner-admin-login-button').disabled=true;try{await g.FeedbackAdmin.login(password);$('runner-admin-status').textContent='관리자 모드예요.';}catch(error){$('runner-admin-status').textContent=error.message;}finally{$('runner-admin-login-button').disabled=false;}});
 function showChecked(c){checkedCoupon=c;$('runner-admin-result').textContent=labels[c.prize]+' · '+(c.status==='redeemed'?'사용 완료':c.status==='void'?'발급 취소':new Date(c.expires_at)<=new Date()?'기간 만료':'사용 가능')+' · '+date(c.expires_at);$('runner-admin-confirm').hidden=c.status!=='issued'||new Date(c.expires_at)<=new Date();}
 $('runner-admin-check').addEventListener('submit',async e=>{e.preventDefault();$('runner-admin-confirm').hidden=true;try{const data=await api('check-coupon',{code:$('runner-admin-code').value});showChecked(data.coupon);$('runner-admin-status').textContent='';}catch(error){$('runner-admin-status').textContent=error.message;if(error.status===401){adminToken=null;g.FeedbackAdmin?.invalidate();adminState();}}});
 $('runner-redeem').addEventListener('click',async()=>{if(!checkedCoupon)return;$('runner-redeem').disabled=true;try{const result=await api('redeem',{code:checkedCoupon.code,action:'redeemed'});showChecked(result.coupon);$('runner-admin-status').textContent='쿠폰을 사용 완료로 처리했어요.';}catch(error){$('runner-admin-status').textContent=error.message;}finally{$('runner-redeem').disabled=false;}});
 for(const b of document.querySelectorAll('[data-runner-game]'))b.addEventListener('click',()=>{dialog.showModal();loadLeaderboard();if(!session)$('runner-nickname').focus();last=0;acc=0;render();update();raf=requestAnimationFrame(frame);});
 $('runner-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{pause();cancelAnimationFrame(raf);sync().then(()=>sync());$('runner-admin-password').value='';});
 g.PerfumeRunner={setAdminToken(token){adminToken=token;adminState();}};adminState();renderWallet();update();render();
})(globalThis);
