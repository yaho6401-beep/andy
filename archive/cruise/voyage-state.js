// Personal, time-compressed trial voyages. Ship-local walking coordinates never move.
export const VOYAGE_KEY='bookscents-cruise-voyage-v1';
export const VOYAGE_ROUTES=[
 {id:'bergen',name:'베르겐 · 피오르',sea:'북유럽 · 노르웨이',seconds:110,x:-430,z:-950,color:'#adc5bd',description:'깊은 피오르와 산자락, 붉은 목조 창고가 이어지는 항구'},
 {id:'copenhagen',name:'코펜하겐',sea:'북유럽 · 덴마크',seconds:115,x:400,z:-1050,color:'#d5bd9b',description:'파스텔빛 운하의 집들과 구릿빛 첨탑, 작은 범선들'},
 {id:'madeira',name:'마데이라',sea:'대서양 · 포르투갈',seconds:135,x:-740,z:-1100,color:'#b7c7a0',description:'대서양의 푸른 물결 너머, 초록 절벽과 층층이 놓인 하얀 마을'},
 {id:'seychelles',name:'세이셸',sea:'인도양 · 섬의 정원',seconds:130,x:550,z:-1130,color:'#94cfc4',description:'연둣빛 바다와 밝은 모래, 화강암 바위와 흔들리는 야자수'},
 {id:'singapore',name:'싱가포르 항',sea:'동남아시아 · 말라카 해협',seconds:125,x:750,z:-960,color:'#a9bfd0',description:'유리빛 스카이라인과 항만 크레인, 열대의 푸른 해안'}
];
export const routeById=id=>VOYAGE_ROUTES.find(r=>r.id===id)||null;
export const homeVoyage=()=>({version:1,phase:'home',routeId:null});
const clamp=t=>Math.max(0,Math.min(1,t)),ease=t=>t*t*(3-2*t);
export function departVoyage(state,routeId,now){
 if(state.phase!=='home')throw Error('지금 항해를 마친 뒤 새로운 항로를 골라 주세요.');
 if(!routeById(routeId)||!Number.isFinite(now))throw Error('항로를 확인해 주세요.');
 return {version:1,phase:'outbound',routeId,at:now};
}
function travelPoint(route,u){
 if(u===0)return {x:0,z:0};
 return bezier(coursePoints(route),u);
}
function coursePoints(route){const side=Math.sign(route.x);return [{x:0,z:0},{x:0,z:-90},{x:side*240,z:-170},{x:side*310,z:route.z*.58},{x:route.x,z:route.z*.82},{x:route.x,z:route.z}];}
function bezier(points,t){const n=points.length-1,weights=n===5?[1,5,10,10,5,1]:[1,4,6,4,1],out={x:0,z:0};for(let i=0;i<=n;i++){const f=weights[i]*(1-t)**(n-i)*t**i;out.x+=points[i].x*f;out.z+=points[i].z*f;}return out;}
function travelDerivative(route,u){const points=coursePoints(route),differences=points.slice(1).map((p,i)=>({x:5*(p.x-points[i].x),z:5*(p.z-points[i].z)}));return bezier(differences,u);}
// The departure arc clears the home coast before heading into open sea.
export function voyagePosition(routeId,u){const route=routeById(routeId);if(!route)return {x:0,z:0,heading:0};u=clamp(u);const p=travelPoint(route,u),d=travelDerivative(route,u);return {...p,heading:Math.atan2(-d.x,-d.z)};}
export function updateVoyage(state,now){
 const route=routeById(state.routeId);if(!route)return homeVoyage();
 if(state.phase==='outbound'&&now>=state.at+route.seconds*1000)return {...state,phase:'port',arrivedAt:state.at+route.seconds*1000};
 if(state.phase==='returning'&&now>=state.at+state.turnMs+state.durationMs)return homeVoyage();
 return state;
}
export function voyagePose(state,now){
 const route=routeById(state.routeId);if(!route||state.phase==='home')return {phase:'home',u:0,x:0,z:0,heading:0,speed:0,moving:false,remaining:0,route:null};
 let u=1,remaining=0,turning=false;
 if(state.phase==='outbound'){const t=clamp((now-state.at)/(route.seconds*1000));u=ease(t);remaining=Math.max(0,Math.ceil((state.at+route.seconds*1000-now)/1000));}
 if(state.phase==='returning'){turning=now<state.at+state.turnMs;const t=clamp((now-state.at-state.turnMs)/state.durationMs);u=state.fromU*(1-ease(t));remaining=Math.max(0,Math.ceil((state.at+state.turnMs+state.durationMs-now)/1000));}
 const p=voyagePosition(route.id,u),direction=state.phase==='returning'?-1:1;
 let heading=p.heading;
 if(direction<0){const turn=ease(clamp((now-state.at)/state.turnMs));heading+=Math.PI*turn;}
 let speed=0;
 if(state.phase==='outbound'||state.phase==='returning'&&!turning){const t=state.phase==='outbound'?clamp((now-state.at)/(route.seconds*1000)):clamp((now-state.at-state.turnMs)/state.durationMs),seconds=state.phase==='outbound'?route.seconds:state.durationMs/1000,d=travelDerivative(route,u);
  speed=Math.hypot(d.x,d.z)*6*t*(1-t)*(state.phase==='returning'?state.fromU:1)/seconds;}
 return {phase:state.phase,u,...p,heading,speed,moving:speed>.1,turning,remaining,route};
}
export function returnVoyage(state,now){
 const current=updateVoyage(state,now);if(current.phase==='home'||current.phase==='returning')return current;
 const p=voyagePose(current,now);return {version:1,phase:'returning',routeId:current.routeId,at:now,fromU:p.u,turnMs:6000,durationMs:Math.round(8000+52000*p.u)};
}
export function restoreVoyage(value,now){
 if(!value||value.version!==1||!routeById(value.routeId)||!['outbound','port','returning'].includes(value.phase)||!Number.isFinite(value.at)||value.at>now+2000||value.at<now-86400000)return homeVoyage();
 if(value.phase==='returning'&&(!Number.isFinite(value.fromU)||value.fromU<0||value.fromU>1||value.turnMs!==6000||!Number.isFinite(value.durationMs)||value.durationMs<8000||value.durationMs>60000))return homeVoyage();
 // Copy only known fields; local records never provide URLs or executable state.
 const state={version:1,phase:value.phase,routeId:value.routeId,at:value.at};if(value.phase==='returning')Object.assign(state,{fromU:value.fromU,turnMs:6000,durationMs:value.durationMs});return updateVoyage(state,now);
}
