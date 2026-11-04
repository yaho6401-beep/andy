import * as T from 'three';
import {createAvatar,animateAvatar} from '../src/avatar.js';
import {appearance} from '../src/protocol.js';
import {createCamp} from './world.js';
import {campMove,nearestSeat,CAMP_SEATS} from './layout.js';
import {CampTransport} from './transport.js';
import {initializeGraphics,graphicsDescription} from './graphics.js';
import {installReading} from './reading-ui.js';
const $=id=>document.getElementById(id),events=new AbortController(),keys=new Set(),axis={x:0,z:0};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let look={};try{look=appearance(JSON.parse(localStorage.getItem('archive-look')||'{}')||{});}catch{look=appearance();}
let readingUI;
let renderer,camp,fallback=false,disposed=false,frameId,last=performance.now(),sample=last,frames=0;
let joined=false,connecting=false,selfId='solo',snapshot=null,transport=null,seat=null,pointer=null,statusTimer;
let trail=[],sequence=0,lastSent=0,lastPacket='',lastEpoch=null,lastCorrection=null,lastMessages='',lastPeople='',reportTarget=null;
const local={x:0,z:5.8,yaw:Math.PI},solo={id:'solo',nickname:'나의 아바타',appearance:look,motion:'idle',emote:null,emoteAt:0};
const actors=new Map(),avatarMaterials=new Set(),labels=document.createElement('div');labels.id='labels';document.body.append(labels);
const listen=(target,type,fn)=>target.addEventListener(type,fn,{signal:events.signal});
function status(text,sticky=false){clearTimeout(statusTimer);$('status').textContent=text;$('status').hidden=false;if(!sticky)statusTimer=setTimeout(()=>$('status').hidden=true,4500);}
function openDialog(id){clearInput();$(id).showModal();}
function clearInput(){keys.clear();axis.x=axis.z=0;pointer=null;$('thumb').style.transform='';}
const scene=new T.Scene();scene.background=new T.Color('#344c58');scene.fog=new T.Fog('#344c58',24,48);
const camera=new T.OrthographicCamera(-10,10,10,-10,.1,90);camera.position.set(12,16,18);camera.lookAt(0,.3,0);
scene.add(new T.HemisphereLight('#e9e5ef','#7a937f',2.6));const moonlight=new T.DirectionalLight('#ece1cf',1.8);moonlight.position.set(-5,10,7);scene.add(moonlight);
function buildFallback(reason='webgl-unavailable'){
 fallback=true;$('scene').classList.add('fallback');
 const trees=Array.from({length:18},(_,i)=>{const a=i*Math.PI/9,x=Math.sin(a)*7.5,z=Math.cos(a)*7;if(z < -4.2)return '';return `<path d="M${x} ${z-.7}l-.5 1h1z" fill="${i%2?'#82a593':'#6f968c'}"/>`;}).join('');
 const seats=CAMP_SEATS.map(s=>`<circle cx="${s.x}" cy="${s.z}" r=".42" fill="#bc9671" stroke="#e5c99d" stroke-width=".08"/>`).join('');
 $('scene').innerHTML=`<svg id="camp-map" viewBox="-9 -10 18 18.5" role="img" aria-label="바다가 보이는 캠핑장 2D 지도. 뒤편 바다와 작은 해변, 중앙 모닥불과 의자 6개, 이동 중인 아바타"><defs><clipPath id="camp-coast-clip"><rect x="-9" y="-6.4" width="18" height="15"/></clipPath></defs><rect x="-9" y="-10" width="18" height="4.2" rx=".6" fill="#477d93"/><rect x="-9" y="-7.7" width="18" height="1.9" fill="#6697a6"/><g class="map-waves" stroke="#b3d5d3" stroke-width=".065" stroke-linecap="round"><path d="M-7-8.7h2.4m3.1-.4h2m3 .6h2.8M-6-7.7h1.4m3.6.5h2.8m3.1-.6h1.2"/></g><text x="0" y="-9.25" text-anchor="middle" font-size=".32" letter-spacing=".12" fill="#dce6dc">별빛 바다</text><ellipse rx="8.5" ry="7.8" fill="#64877a" clip-path="url(#camp-coast-clip)"/><path d="M-7.5-6.4Q0-5.8 7.5-6.4" fill="none" stroke="#d9c8a4" stroke-width=".6" stroke-linecap="round"/><circle r="4.1" fill="#aaa995"/>${trees}${seats}<path d="M-6.4-2.3L-5-5.6l1.4 3.3z" fill="#dab7a4"/><path d="M3.7-2.4L5-5.6l1.3 3.2z" fill="#b8bfd3"/><rect x="2.2" y="-6.2" width="2.8" height=".8" rx=".12" fill="#c2aa7a"/><text x="3.6" y="-5.7" text-anchor="middle" font-size=".3" fill="#435c52">오늘의 한 문장</text><circle r="1" fill="#7e776d"/><path d="M-.55.45Q-.8-.3 0-1Q.7-.1.45.5z" fill="#f3b66c"/><path d="M-.2.4Q-.3 0 .1-.5Q.4.2.2.5z" fill="#ffe8ad"/><g id="map-actors"></g></svg>`;
 const note=document.createElement('p');note.className='fallback-note';note.textContent=graphicsDescription('2d',reason);document.body.append(note);
 $('performance').textContent='2D 대체 화면 · 3D FPS 측정 불가';
}
const graphics=initializeGraphics(T,createCamp,scene);
renderer=graphics.renderer||null;camp=graphics.world||null;
$('graphics-status').textContent=graphicsDescription(graphics.mode,graphics.reason);
$('graphics-retry').hidden=graphics.mode==='3d';
if(renderer){
 $('scene').append(renderer.domElement);
 listen(renderer.domElement,'webglcontextlost',e=>{
  e.preventDefault();if(!renderer||disposed)return;
  const old=renderer;renderer=null;for(const id of [...actors.keys()])dropActor(id);camp?.dispose();camp=null;old.dispose();buildFallback('context-lost');positions();
  $('graphics-status').textContent=graphicsDescription('2d','context-lost');$('graphics-retry').hidden=false;
  status('3D 연결이 끊겨 가벼운 화면으로 전환했어요. 대화는 계속할 수 있어요.');
 });
}else buildFallback(graphics.reason);
listen($('graphics-retry'),'click',()=>location.reload());

function resize(){if(disposed||!renderer)return;const aspect=innerWidth/innerHeight,height=Math.max(16,19/aspect);camera.left=-height*aspect/2;camera.right=height*aspect/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
resize();status('의자 옆에서 쉬거나, 함께 쉬기를 눌러 대화해 보세요.');
function dropActor(id){const a=actors.get(id);if(!a)return;if(a.mesh){a.mesh.traverse(o=>o.geometry?.dispose());scene.remove(a.mesh);}a.label?.remove();a.map?.remove();actors.delete(id);}
function actor(p){let a=actors.get(p.id);if(!a){a={state:p};if(renderer){a.mesh=createAvatar(p.appearance);a.mesh.traverse(o=>{if(o.material)avatarMaterials.add(o.material);});scene.add(a.mesh);a.label=document.createElement('div');a.label.className='actor-label';a.label.innerHTML='<span class="speech" hidden></span><span class="nickname"></span>';labels.append(a.label);}else{a.map=document.createElementNS('http://www.w3.org/2000/svg','g');a.map.classList.add('map-player');a.map.innerHTML=`<circle r=".32" fill="${esc(p.appearance?.color||'#b7c6a1')}" stroke="#f7ead1" stroke-width=".06"/><circle cy="-.08" r=".17" fill="#edc5aa"/><text y=".7" text-anchor="middle" font-size=".28" fill="#fff7df"></text><text class="map-speech" y="-.65" text-anchor="middle" font-size=".32" fill="#fff8e8"></text>`;$('map-actors').append(a.map);}actors.set(p.id,a);}a.state=p;if(a.label)a.label.querySelector('.nickname').textContent=p.nickname+(p.listening?' · 듣는 중':'');if(a.map)a.map.querySelector('text').textContent=p.nickname;return a;}
function positions(){const rows=joined?snapshot?.players||[]:[{...solo,...local}];for(const id of actors.keys())if(!rows.some(p=>p.id===id))dropActor(id);for(const p of rows)actor(p);}
positions();
function send(data){if(joined)transport.send(data);}
function movePacket(){return {room:me()?.room,epoch:me()?.epoch,path:trail.map(p=>[...p]),x:local.x,z:local.z,yaw:local.yaw};}
function me(){return snapshot?.players.find(p=>p.id===selfId);}
function receive(s){
 snapshot=s;const p=s.players.find(p=>p.id===selfId);if(!p)return;
 const changed=p.epoch!==lastEpoch||p.correction!==lastCorrection;
 if(changed){Object.assign(local,{x:p.x,z:p.z,yaw:p.yaw});trail=[];sequence=p.seq||0;lastPacket='';lastSent=0;clearInput();}
 trail=trail.filter(point=>point[0]>(p.seq||0));lastEpoch=p.epoch;lastCorrection=p.correction;seat=p.seat;
 if(seat)Object.assign(local,{x:p.x,z:p.z,yaw:p.yaw});
 $('connection').textContent=`${s.rooms.find(r=>r.id===p.room)?.label||'모닥불'} · ${s.rooms.find(r=>r.id===p.room)?.people||1}/6명 · 미리보기`;
 $('topic').hidden=false;$('topic').textContent=s.topic.text;$('chat-topic').textContent=s.topic.text;
 $('listen').checked=!!p.listening;$('chat-input').disabled=!!p.listening;$('chat-form').querySelector('[type=submit]').disabled=!!p.listening;
 $('people-open').innerHTML='<span>♧</span>함께 있는 사람';$('host-controls').hidden=!['host','admin'].includes(p.role);
 positions();renderChat();renderPeople();
}
function renderChat(){const messages=snapshot?.messages||[],key=JSON.stringify(messages);if(key===lastMessages)return;lastMessages=key;const box=$('chat-messages'),atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<50;box.replaceChildren();if(!messages.length){const p=document.createElement('p');p.textContent='첫 이야기를 들려주세요. 조용히 듣기만 해도 좋아요.';box.append(p);}for(const m of messages){const p=document.createElement('p');if(m.scope==='whisper')p.className='whisper';const b=document.createElement('strong');b.textContent=m.nickname+(m.scope==='whisper'?' · 앉은 사람들에게':'');const text=document.createElement('span');text.textContent=m.text;p.append(b,text);box.append(p);}if(atBottom)box.scrollTop=box.scrollHeight;}
function renderPeople(){if(!snapshot)return;const p=me(),key=JSON.stringify([snapshot.rooms,snapshot.players.map(x=>[x.id,x.nickname,x.listening,x.seat?.id]),snapshot.preferences,snapshot.moderationTargets]);if(key===lastPeople)return;lastPeople=key;$('rooms').innerHTML=snapshot.rooms.map(r=>`<button data-room="${esc(r.id)}" aria-current="${r.id===p.room}">${esc(r.label)} · ${r.people}/6</button>`).join('');const prefs=snapshot.preferences,known=new Map([...snapshot.players,...snapshot.moderationTargets].map(x=>[x.id,x]));$('people-list').innerHTML=[...known.values()].map(q=>`<div class="person"><p>${esc(q.nickname)}${q.id===selfId?' · 나':q.listening?' · 듣는 중':''}</p>${q.id!==selfId?`<div><button data-mod="mute" data-id="${esc(q.id)}" class="${prefs.muted.includes(q.id)?'active':''}">${prefs.muted.includes(q.id)?'음소거 해제':'음소거'}</button><button data-mod="block" data-id="${esc(q.id)}" class="${prefs.blocked.includes(q.id)?'active':''}">${prefs.blocked.includes(q.id)?'차단 해제':'차단'}</button><button data-report="${esc(q.id)}">신고</button>${['host','admin'].includes(p.role)?`<button data-kick="${esc(q.id)}">퇴장·입장 제한</button>`:''}</div>`:''}</div>`).join('');}
function resetSolo(){seat=null;Object.assign(local,{x:0,z:5.8,yaw:Math.PI});solo.motion='idle';trail=[];sequence=0;positions();}
function leave(){transport?.close();transport=null;joined=false;snapshot=null;selfId='solo';lastEpoch=lastCorrection=null;lastMessages=lastPeople='';$('topic').hidden=true;$('connection').textContent='혼자 둘러보기 · 미리보기';$('people-open').innerHTML='<span>♧</span>함께 쉬기';for(const d of document.querySelectorAll('dialog[open]'))d.close();resetSolo();clearInput();status('함께 쉬기를 마쳤어요. 혼자 더 둘러보셔도 좋아요.');}
listen($('entry-form'),'submit',async e=>{e.preventDefault();if(connecting)return;connecting=true;const form=e.target,button=form.querySelector('[type=submit]');button.disabled=true;$('entry-status').textContent='모닥불에 연결하고 있어요…';const candidate=new CampTransport(receive,s=>{if(!joined)$('entry-status').textContent=s;});candidate.onWelcome=({id})=>{selfId=id;joined=true;$('camp-entry').close();};candidate.onError=text=>status(text);candidate.onKicked=text=>{leave();status(text,true);};candidate.onReceipt=r=>{if(r.action==='report')status('신고가 진행자에게 접수됐어요.');};transport=candidate;try{await candidate.connect({nickname:form.elements.nickname.value,adult:form.elements.adult.checked,hostKey:form.elements.hostKey.value,appearance:look});localStorage.setItem('camp-preview-nickname',form.elements.nickname.value);status('반가워요. 의자 옆에서 앉아 대화해 보세요.');}catch(error){candidate.close();if(transport===candidate)transport=null;joined=false;$('entry-status').textContent=error.message;}finally{connecting=false;button.disabled=false;form.elements.hostKey.value='';}});
try{$('entry-form').elements.nickname.value=localStorage.getItem('camp-preview-nickname')||'향기 여행자';}catch{}
function interact(){if(seat){if(joined)send({type:'stand'});else{Object.assign(local,seat.stand);seat=null;}return;}const target=nearestSeat(local.x,local.z);if(target&&target.distance<=1.35){if(joined){const index=CAMP_SEATS.findIndex(s=>s.id===target.id);send({type:'sit',seat:`${me().room}-seat-${index}`,position:movePacket()});}else{seat=target;Object.assign(local,{x:target.x,z:target.z,yaw:target.yaw});}return;}if(Math.hypot(local.x-3.6,local.z+5.8)<2.4)readingUI?.openQuote();}
listen($('interact'),'click',interact);listen($('quote-open'),'click',()=>readingUI?.openQuote());listen($('settings-open'),'click',()=>openDialog('settings'));listen($('people-open'),'click',()=>openDialog(joined?'people':'camp-entry'));listen($('chat-open'),'click',()=>openDialog(joined?'chat':'camp-entry'));listen($('leave-camp'),'click',leave);
listen($('reset'),'click',()=>{if(joined){status('함께 쉬기 종료 후 입구로 돌아갈 수 있어요.');openDialog('people');}else resetSolo();});
for(const button of document.querySelectorAll('[data-close]'))listen(button,'click',()=>$(button.dataset.close).close());
listen($('quality'),'change',()=>{if(renderer){renderer.setPixelRatio($('quality').value==='standard'?Math.min(devicePixelRatio,1.5):1);resize();}});
listen($('listen'),'change',e=>send({type:'listen',value:e.target.checked}));
listen($('chat-form'),'submit',e=>{e.preventDefault();const text=$('chat-input').value.trim();if(text){send({type:'chat',text,scope:$('chat-scope').value});$('chat-input').value='';}});
for(const button of document.querySelectorAll('[data-emote]'))listen(button,'click',()=>{send({type:'emote',value:button.dataset.emote});});
listen($('people'),'click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.room){send({type:'camp-switch',room:b.dataset.room});$('people').close();return;}if(b.dataset.mod){const list=snapshot.preferences[b.dataset.mod==='mute'?'muted':'blocked'];send({type:b.dataset.mod,target:b.dataset.id,value:!list.includes(b.dataset.id)});}if(b.dataset.report){reportTarget=b.dataset.report;$('report-name').textContent=(snapshot.players.find(p=>p.id===reportTarget)?.nickname||'방문자')+'님의 대화를 신고합니다.';openDialog('report');}if(b.dataset.kick)send({type:'host',command:'kick',value:{target:b.dataset.kick}});});
listen($('report-form'),'submit',e=>{e.preventDefault();send({type:'report',target:reportTarget,reason:e.target.elements.reason.value});e.target.reset();$('report').close();});
listen($('topic-form'),'submit',e=>{e.preventDefault();send({type:'host',command:'camp-question',value:{question:e.target.elements.question.value}});});
listen($('reports-load'),'click',async()=>{try{const data=await transport.admin();$('reports').textContent=data.reports.length?data.reports.map(r=>(data.members.find(m=>m.id===r.target)?.nickname||'방문자')+': '+r.reason).join('\n'):'접수된 신고가 없습니다.';}catch(e){status(e.message);}});
listen(window,'keydown',e=>{if(document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e'].includes(key)){e.preventDefault();if(key==='e'&&!e.repeat)interact();else keys.add(key);}});listen(window,'keyup',e=>keys.delete(e.key.toLowerCase()));listen(window,'blur',clearInput);listen(window,'resize',resize);
function joystick(e){const rect=$('joystick').getBoundingClientRect(),dx=e.clientX-rect.left-rect.width/2,dz=e.clientY-rect.top-rect.height/2,r=Math.hypot(dx,dz),max=29;axis.x=dx/Math.max(max,r);axis.z=dz/Math.max(max,r);$('thumb').style.transform=`translate(${axis.x*max}px,${axis.z*max}px)`;}
listen($('joystick'),'pointerdown',e=>{if(pointer!==null)return;pointer=e.pointerId;$('joystick').setPointerCapture(pointer);joystick(e);});listen($('joystick'),'pointermove',e=>{if(e.pointerId===pointer)joystick(e);});for(const type of ['pointerup','pointercancel','lostpointercapture'])listen($('joystick'),type,e=>{if(e.pointerId===pointer)clearInput();});
function frame(now){
 if(disposed)return;frameId=requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;let walking=false;
 if(!seat&&!document.querySelector('dialog[open]')&&trail.length<180){let x=axis.x+Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),z=axis.z+Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));const len=Math.hypot(x,z);if(len>.08){x/=Math.max(1,len);z/=Math.max(1,len);const wx=(x+z)*.7071,wz=(z-x)*.7071,ox=local.x,oz=local.z,nx=ox+wx*3.2*dt,nz=oz+wz*3.2*dt;const track=(px,pz)=>{local.x=px;local.z=pz;if(joined)trail.push([++sequence,Number(px.toFixed(5)),Number(pz.toFixed(5))]);};if(campMove(ox,oz,nx,nz)){if(Math.hypot(nx-ox,nz-oz)>.00001)track(nx,nz);}else{if(campMove(ox,oz,nx,oz)&&Math.abs(nx-ox)>.00001)track(nx,oz);if(campMove(local.x,oz,local.x,nz)&&Math.abs(nz-oz)>.00001)track(local.x,nz);}walking=Math.hypot(local.x-ox,local.z-oz)>.001;local.yaw=Math.atan2(wx,wz);}}
 const motion=seat?'sit':walking?'walk':'idle';if(joined&&now-lastSent>=500){const packet=[local.x.toFixed(3),local.z.toFixed(3),local.yaw.toFixed(3),motion,me()?.epoch].join();if(packet!==lastPacket){send({type:'move',...movePacket(),motion});lastPacket=packet;}lastSent=now;}
 const target=nearestSeat(local.x,local.z),board=Math.hypot(local.x-3.6,local.z+5.8)<2.4;$('interact').hidden=!seat&&!(target&&target.distance<=1.35)&&!board;$('interact').textContent=seat?'일어나기':target&&target.distance<=1.35?'앉아서 쉬기 · E':'칠판 살펴보기 · E';
 const time=Date.now()/1000;
 for(const [id,a]of actors){const self=id===selfId,p=a.state,pos=self?local:p,y=(p.seat||(self&&seat)) ? .23 : 0;const msg=(snapshot?.messages||[]).filter(m=>m.from===id&&snapshot.at-m.at<6000).at(-1);const speech=msg?.text||((Date.now()-(p.emoteAt||0)<3000)?({wave:'👋',clap:'👏',heart:'♡'}[p.emote]||''):'');
  if(a.mesh){a.mesh.position.set(pos.x,y||0,pos.z);a.mesh.rotation.y=pos.yaw;animateAvatar(a.mesh,{...p,motion:self?motion:p.motion},reduced?0:time);const projected=new T.Vector3(pos.x,(y||0)+2, pos.z).project(camera);a.label.style.left=(projected.x*.5+.5)*innerWidth+'px';a.label.style.top=(-projected.y*.5+.5)*innerHeight+'px';const b=a.label.querySelector('.speech');b.hidden=!speech;b.textContent=speech;}else if(a.map){a.map.setAttribute('transform',`translate(${pos.x} ${pos.z})`);a.map.querySelector('.map-speech').textContent=speech.slice(0,28);a.map.querySelector('circle').setAttribute('stroke',self?'#fff4b8':'#e2e9de');}
 }
 if(renderer){camp.update(now/1000,reduced);renderer.render(scene,camera);frames++;if(now-sample>=1000){$('performance').textContent=`${Math.round(frames*1000/(now-sample))} FPS · ${renderer.info.render.calls} draw calls · ${renderer.info.render.triangles.toLocaleString()} triangles`;frames=0;sample=now;}}
}
listen(document,'visibilitychange',()=>{clearInput();if(document.hidden){cancelAnimationFrame(frameId);frameId=null;}else if(!disposed&&frameId===null){last=performance.now();sample=last;frames=0;frameId=requestAnimationFrame(frame);}});
function dispose(){if(disposed)return;disposed=true;readingUI?.close();transport?.close();cancelAnimationFrame(frameId);clearTimeout(statusTimer);events.abort();for(const id of [...actors.keys()])dropActor(id);avatarMaterials.forEach(m=>m.dispose());camp?.dispose();renderer?.dispose();renderer?.forceContextLoss();labels.remove();}
listen(window,'pagehide',dispose);window.addEventListener('pageshow',e=>{if(e.persisted&&disposed)location.reload();});frameId=requestAnimationFrame(frame);

readingUI=installReading({openDialog,getTransport:()=>transport,getNickname:()=>$('entry-form').elements.nickname.value,isJoined:()=>joined,onShare:text=>send({type:'chat',text}),onQuote:q=>camp?.setQuote?.(q.text),onStatus:status});
