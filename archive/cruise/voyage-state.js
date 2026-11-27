// Personal, time-compressed trial voyages. Ship-local walking coordinates never move.
import {geographicLegTrack,geographicTrack,geographicReturnTrack} from './geographic-voyage.js';
export const VOYAGE_KEY='bookscents-cruise-voyage-v1';
export const VOYAGE_ROUTES=[
 {id:'bergen',name:'베르겐 · 피오르',sea:'북유럽 · 노르웨이',seconds:110,x:-430,z:-950,color:'#adc5bd',description:'깊은 피오르와 산자락, 붉은 목조 창고가 이어지는 항구'},
 {id:'copenhagen',name:'코펜하겐',sea:'북유럽 · 덴마크',seconds:115,x:400,z:-1050,color:'#d5bd9b',description:'파스텔빛 운하의 집들과 구릿빛 첨탑, 작은 범선들'},
 {id:'madeira',name:'마데이라',sea:'대서양 · 포르투갈',seconds:135,x:-740,z:-1100,color:'#b7c7a0',description:'대서양의 푸른 물결 너머, 초록 절벽과 층층이 놓인 하얀 마을'},
 {id:'seychelles',name:'세이셸',sea:'인도양 · 섬의 정원',seconds:130,x:550,z:-1130,color:'#94cfc4',description:'연둣빛 바다와 밝은 모래, 화강암 바위와 흔들리는 야자수'},
 {id:'singapore',name:'싱가포르 항',sea:'동남아시아 · 말라카 해협',seconds:125,x:750,z:-960,color:'#a9bfd0',description:'유리빛 스카이라인과 항만 크레인, 열대의 푸른 해안'},
 {id:'southampton',name:'사우샘턴',sea:'유럽 · 영국',seconds:130,x:-600,z:-1050,color:'#bdc9bd',description:'넓은 하구와 초록 해안, 크루즈 터미널이 이어지는 영국 항구'},
 {id:'busan',name:'부산항',sea:'동아시아 · 대한민국',seconds:100,x:470,z:-1000,color:'#a6bccc',description:'산자락의 도시와 항만대교, 익숙하고도 새로운 부산 북항의 풍경'},
 {id:'hongkong',name:'홍콩항',sea:'동아시아 · 빅토리아 하버',seconds:115,x:630,z:-1080,color:'#a0bdb4',description:'산과 마천루 사이로 페리가 오가는 빅토리아 하버'},
 {id:'ningbo',name:'닝보·저우산항',sea:'동아시아 · 중국',seconds:110,x:-520,z:-1070,color:'#a9b9bf',description:'푸른 섬과 대형 크레인, 동중국해의 넓은 항만'},
 {id:'shenzhen',name:'선전·옌톈항',sea:'동아시아 · 중국',seconds:115,x:540,z:-1030,color:'#a5bfae',description:'짙은 녹음의 산 아래 컨테이너 부두가 길게 펼쳐진 해안'},
 {id:'dubai',name:'두바이·라시드항',sea:'중동 · 아랍에미리트',seconds:130,x:-660,z:-1100,color:'#d0c4ab',description:'옅은 모래빛 해안 너머, 아스라이 떠오르는 두바이의 스카이라인'},
 {id:'abudhabi',name:'아부다비·자이드항',sea:'중동 · 아랍에미리트',seconds:135,x:660,z:-1110,color:'#c6cbb8',description:'잔잔한 걸프의 바다와 밝은 터미널, 따뜻한 빛의 해안 도시'},
 {id:'newyork',name:'뉴욕항',sea:'북아메리카 · 미국',seconds:155,x:680,z:-1190,color:'#a7bbca',description:'내로스의 양쪽 해안과 현수교를 지나 맨해튼 스카이라인으로'},
 {id:'sanfrancisco',name:'샌프란시스코',sea:'북아메리카 · 미국',seconds:135,x:-710,z:-1200,color:'#a9bfae',description:'골든게이트의 붉은 현수교와 양옆 언덕 사이로 들어가는 만'},
 {id:'rio',name:'리우데자네이루',sea:'남아메리카 · 브라질',seconds:155,x:720,z:-1230,color:'#9dc7b6',description:'슈거로프와 니테로이 해안을 양옆에 둔 과나바라만 입항'},
 {id:'buenosaires',name:'부에노스아이레스',sea:'남아메리카 · 아르헨티나',seconds:160,x:-750,z:-1250,color:'#c8c0ab',description:'넓은 라플라타강 하구에서 만나는 도시와 크루즈 부두'}
];
const longestSeaLeg=Math.max(...VOYAGE_ROUTES.map(r=>geographicTrack(r.id).total),...VOYAGE_ROUTES.flatMap(a=>VOYAGE_ROUTES.filter(b=>a!==b).map(b=>geographicLegTrack(a.id,b.id).total)));
// Playable compressed duration: local passages near one minute, longest sea routes three.
export function distanceDurationSeconds(nauticalMiles){if(!Number.isFinite(nauticalMiles)||nauticalMiles<0)return 0;return Math.round(60+120*Math.sqrt(Math.min(1,nauticalMiles/longestSeaLeg)));}
for(const route of VOYAGE_ROUTES){route.legacySeconds=route.seconds;route.seconds=distanceDurationSeconds(geographicTrack(route.id).total);}
export const routeById=id=>VOYAGE_ROUTES.find(r=>r.id===id)||null;
export const homeVoyage=()=>({version:1,phase:'home',routeId:null});
const clamp=t=>Math.max(0,Math.min(1,t)),ease=t=>t*t*(3-2*t);
export function departureSeconds(originId,destinationId){const route=routeById(destinationId);if(!route)return 0;if(!originId)return route.seconds;const leg=geographicLegTrack(originId,destinationId);return leg?distanceDurationSeconds(leg.total)-6:0;}
const sailingSeconds=state=>state.sailSeconds??(state.originId?Math.round(Math.max(65,Math.min(145,Math.sqrt(geographicLegTrack(state.originId,state.routeId).total)*1.4))):routeById(state.routeId).legacySeconds);
const outboundDuration=state=>sailingSeconds(state)*1000+(state.originId?6000:0);
export function voyageTotalSeconds(state){if(!routeById(state.routeId)||state.phase==='home')return 0;return state.phase==='returning'?(state.durationMs+state.turnMs)/1000:outboundDuration(state)/1000;}
export function departVoyage(state,routeId,now){
 if(!['home','port'].includes(state.phase))throw Error('항구에 도착한 뒤 다음 목적지를 골라 주세요.');
 if(!routeById(routeId)||!Number.isFinite(now))throw Error('항로를 확인해 주세요.');
 if(state.phase==='port'){if(!routeById(state.routeId)||state.routeId===routeId)throw Error('현재 항구와 다른 목적지를 골라 주세요.');return {version:1,phase:'outbound',originId:state.routeId,routeId,at:now,sailSeconds:departureSeconds(state.routeId,routeId)};}
 return {version:1,phase:'outbound',routeId,at:now,sailSeconds:departureSeconds(null,routeId)};
}
function travelPoint(route,u){
 if(u===0)return {x:0,z:0};
 return bezier(coursePoints(route),u);
}
function coursePoints(route){const side=Math.sign(route.x)||1;return [{x:0,z:0},{x:0,z:-90},{x:side*240,z:-170},{x:side*310,z:route.z*.58},{x:route.x,z:route.z*.82},{x:route.x,z:route.z}];}
function bezier(points,t){const n=points.length-1,weights=n===5?[1,5,10,10,5,1]:[1,4,6,4,1],out={x:0,z:0};for(let i=0;i<=n;i++){const f=weights[i]*(1-t)**(n-i)*t**i;out.x+=points[i].x*f;out.z+=points[i].z*f;}return out;}
function travelDerivative(route,u){const points=coursePoints(route),differences=points.slice(1).map((p,i)=>({x:5*(p.x-points[i].x),z:5*(p.z-points[i].z)}));return bezier(differences,u);}
// The departure arc clears the home coast before heading into open sea.
export function voyagePosition(routeId,u){const route=routeById(routeId);if(!route)return {x:0,z:0,heading:0};u=clamp(u);const p=travelPoint(route,u),d=travelDerivative(route,u);return {...p,heading:Math.atan2(-d.x,-d.z)};}
function interportPoints(origin,route){return [{x:origin.x,z:origin.z},{x:origin.x,z:origin.z+180},{x:origin.x,z:-500},{x:route.x,z:-500},{x:route.x,z:route.z+180},{x:route.x,z:route.z}];}
export function legPosition(originId,routeId,u){if(!originId)return voyagePosition(routeId,u);const origin=routeById(originId),route=routeById(routeId);if(!origin||!route)return {x:0,z:0,heading:0};const points=interportPoints(origin,route);u=clamp(u);const p=bezier(points,u),d=bezier(points.slice(1).map((p,i)=>({x:5*(p.x-points[i].x),z:5*(p.z-points[i].z)})),u);return {...p,heading:Math.atan2(-d.x,-d.z)};}
export function updateVoyage(state,now){
 const route=routeById(state.routeId);if(!route)return homeVoyage();
 if(state.phase==='outbound'&&now>=state.at+outboundDuration(state))return {...state,phase:'port',arrivedAt:state.at+outboundDuration(state)};
 if(state.phase==='returning'&&now>=state.at+state.turnMs+state.durationMs)return homeVoyage();
 return state;
}
export function voyagePose(state,now){
 const route=routeById(state.routeId);if(!route||state.phase==='home')return {phase:'home',u:0,x:0,z:0,heading:0,speed:0,moving:false,remaining:0,route:null};
 let u=1,remaining=0,turning=false;
 if(state.originId){
  if(state.phase==='outbound'){const turn=6000,t=clamp((now-state.at-turn)/(sailingSeconds(state)*1000));u=ease(t);turning=now<state.at+turn;remaining=Math.max(0,Math.ceil((state.at+outboundDuration(state)-now)/1000));const p=legPosition(state.originId,state.routeId,u),after=legPosition(state.originId,state.routeId,clamp(u+.0001)),before=legPosition(state.originId,state.routeId,clamp(u-.0001)),speed=turning?0:Math.hypot(after.x-before.x,after.z-before.z)/Math.max(.000001,clamp(u+.0001)-clamp(u-.0001))*6*t*(1-t)/sailingSeconds(state);return {phase:state.phase,u,...p,heading:turning?Math.PI*ease(clamp((now-state.at)/turn)):p.heading,speed,moving:speed>.1,turning,remaining,route,originId:state.originId};}
  if(state.phase==='returning'){const start=legPosition(state.originId,state.routeId,state.fromU),synthetic={x:start.x,z:start.z},t=clamp((now-state.at-state.turnMs)/state.durationMs),homeProgress=ease(t),point=travelPoint(synthetic,1-homeProgress),d=travelDerivative(synthetic,1-homeProgress),diff=Math.atan2(Math.sin(Math.PI-start.heading),Math.cos(Math.PI-start.heading));turning=now<state.at+state.turnMs;const heading=turning?start.heading+diff*ease(clamp((now-state.at)/state.turnMs)):Math.atan2(-d.x,-d.z)+Math.PI,speed=turning?0:Math.hypot(d.x,d.z)*6*t*(1-t)/(state.durationMs/1000);return {phase:state.phase,u:1-homeProgress,...point,heading,speed,moving:speed>.1,turning,remaining:Math.max(0,Math.ceil((state.at+state.turnMs+state.durationMs-now)/1000)),route,originId:state.originId,homeProgress,returnFromProgress:state.fromU};}
 }
 if(state.phase==='outbound'){const t=clamp((now-state.at)/(sailingSeconds(state)*1000));u=ease(t);remaining=Math.max(0,Math.ceil((state.at+sailingSeconds(state)*1000-now)/1000));}
 if(state.phase==='returning'){turning=now<state.at+state.turnMs;const t=clamp((now-state.at-state.turnMs)/state.durationMs);u=state.fromU*(1-ease(t));remaining=Math.max(0,Math.ceil((state.at+state.turnMs+state.durationMs-now)/1000));}
 const p=voyagePosition(route.id,u),direction=state.phase==='returning'?-1:1;
 let heading=p.heading;
 if(direction<0){const turn=ease(clamp((now-state.at)/state.turnMs));heading+=Math.PI*turn;}
 let speed=0;
 if(state.phase==='outbound'||state.phase==='returning'&&!turning){const t=state.phase==='outbound'?clamp((now-state.at)/(sailingSeconds(state)*1000)):clamp((now-state.at-state.turnMs)/state.durationMs),seconds=state.phase==='outbound'?sailingSeconds(state):state.durationMs/1000,d=travelDerivative(route,u);
  speed=Math.hypot(d.x,d.z)*6*t*(1-t)*(state.phase==='returning'?state.fromU:1)/seconds;}
 return {phase:state.phase,u,...p,heading,speed,moving:speed>.1,turning,remaining,route};
}
export function returnVoyage(state,now){
 const current=updateVoyage(state,now);if(current.phase==='home'||current.phase==='returning')return current;
 const p=voyagePose(current,now),distance=current.originId?geographicReturnTrack(current.originId,current.routeId,p.u).total:geographicTrack(current.routeId).total*p.u,result={version:1,phase:'returning',routeId:current.routeId,at:now,fromU:p.u,turnMs:6000,durationMs:(distanceDurationSeconds(distance)-6)*1000};if(current.originId)result.originId=current.originId;return result;
}
export function restoreVoyage(value,now){
 if(!value||value.version!==1||!routeById(value.routeId)||!['outbound','port','returning'].includes(value.phase)||!Number.isFinite(value.at)||value.at>now+2000||value.at<now-86400000)return homeVoyage();
 if(value.originId!==undefined&&(!routeById(value.originId)||value.originId===value.routeId))return homeVoyage();
 if(value.sailSeconds!==undefined&&(!Number.isInteger(value.sailSeconds)||value.sailSeconds<(value.originId?54:60)||value.sailSeconds>(value.originId?174:180)))return homeVoyage();
 if(value.phase==='returning'&&(!Number.isFinite(value.fromU)||value.fromU<0||value.fromU>1||value.turnMs!==6000||!Number.isFinite(value.durationMs)||value.durationMs<8000||value.durationMs>174000))return homeVoyage();
 // Copy only known fields; local records never provide URLs or executable state.
 const state={version:1,phase:value.phase,routeId:value.routeId,at:value.at};if(value.originId)state.originId=value.originId;if(value.sailSeconds!==undefined)state.sailSeconds=value.sailSeconds;if(value.phase==='returning')Object.assign(state,{fromU:value.fromU,turnMs:6000,durationMs:value.durationMs});return updateVoyage(state,now);
}
