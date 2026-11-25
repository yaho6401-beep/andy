import {SEA,seabedHeight} from './shore-state.js';
import {ISLAND} from './sea-geometry.js';
export {ISLAND} from './sea-geometry.js';
export function islandRadius(x,z){return Math.hypot((x-ISLAND.x)/ISLAND.rx,(z-ISLAND.z)/ISLAND.rz);}
export function islandHeight(x,z){const r=islandRadius(x,z);return r>=1.22&&r<2?-.3-(r-1.22)/.78*3:r<1.22?-.3+1.12*Math.pow(Math.max(0,1-r/1.22),.65)+.035*Math.sin(x*1.6)*Math.sin(z*1.3)*Math.max(0,1-r):seabedHeight(z);}
export function seaFloor(x,z){return z< -65?islandHeight(x,z):seabedHeight(z);}
export const depthAt=(x,z)=>Math.max(0,SEA.surface-seaFloor(x,z));
export const onIsland=(x,z)=>islandRadius(x,z)<1.05&&depthAt(x,z)<.18;
export function swimmerHeight(x,z,time=0){return Math.max(seaFloor(x,z),SEA.surface-.91+Math.sin(time*3)*.035);}
export function canStartSwimming(p){const d=depthAt(p.x,p.z);return p.room==='camp'&&!p.seat&&!p.seaRescue&&!p.swimming&&(d>=.32&&d<SEA.rescueDepth);}
export const SWIM_LINES=['헤엄을 쳐볼까… 저 작은 섬까지.','수영을 해볼까? 파도에 천천히 몸을 맡겨보자.','저 섬에는 무엇이 있을까… 헤엄쳐 가보자.','물살이 잔잔하다. 천천히 수영해볼까.'];
export const FISH_SPECIES=[
 {id:'mackerel',name:'고등어',color:'#789fa9',weight:12},
 {id:'horse-mackerel',name:'전갱이',color:'#a8b8a2',weight:11},
 {id:'sardine',name:'정어리',color:'#b4cbd1',weight:10},
 {id:'saury',name:'꽁치',color:'#748d9c',weight:9},
 {id:'rockfish',name:'우럭',color:'#786b62',weight:9},
 {id:'sea-bream',name:'참돔',color:'#d59e91',weight:7},
 {id:'black-bream',name:'감성돔',color:'#8b9196',weight:6},
 {id:'sea-bass',name:'농어',color:'#a4b3b6',weight:6},
 {id:'flatfish',name:'광어',color:'#a09378',weight:5},
 {id:'flounder',name:'도다리',color:'#9b8969',weight:5},
 {id:'filefish',name:'쥐치',color:'#b9a374',weight:5},
 {id:'greenling',name:'노래미',color:'#ad8e63',weight:5},
 {id:'mullet',name:'숭어',color:'#9eb0a3',weight:4},
 {id:'yellowtail',name:'방어',color:'#729c96',weight:4},
 {id:'spanish-mackerel',name:'삼치',color:'#7e9cae',weight:2}
];
export function rollSeaCatch(random=Math.random){const chance=random();if(chance>=.88)return {kind:'trash',name:['빈 깡통','낡은 장화','빈 플라스틱병'][Math.min(2,Math.floor(random()*3))]};if(chance>=.72)return {kind:'seaweed',name:'미역 한 줄기'};let pick=random()*FISH_SPECIES.reduce((a,f)=>a+f.weight,0);const species=FISH_SPECIES.find(f=>(pick-=f.weight)<0)||FISH_SPECIES.at(-1);return {kind:'fish',species:species.id,name:species.name,cm:Math.round(16+random()*30)};}
// The same bounded integration is used for server decisions and client interpolation.
export function advanceAngling(job,now){const next={...job};if(next.stage==='waiting'&&now>=next.biteAt){next.stage='bite';next.at=next.biteAt;}if(next.stage==='bite'&&now>next.biteAt+(next.seated?2800:4800)){next.stage='escaped';next.line='찌가 조용해졌다… 다음 물결을 기다려볼까.';next.at=now;}if(next.stage!=='fight')return next;
 const end=Math.max(next.at,now);for(let t=next.at;t<end;){const dt=Math.min(100,end-t)/1000,phase=(t-next.hookedAt)/1000+next.seed,surge=Math.sin(phase*(next.seated?2.05:1.7))>.38;
  next.surge=surge;next.tension=Math.max(0,next.tension+(next.mode==='pull'?(surge?.29:.14)*(next.seated?1.35:1):next.mode==='release'?-.24:-.065)*dt);
  next.distance=Math.max(0,Math.min(1,next.distance+(next.mode==='pull'?(surge?-.045:-.12)*(next.seated?.8:1):next.mode==='release'?.035:.014)*dt));next.slack=next.tension<.1?(next.slack||0)+dt:0;
  t+=dt*1000;if(next.tension>=1||next.slack>(next.seated?2.4:3)){next.stage='escaped';next.line=next.tension>=1?'팽팽하던 줄이 풀렸다… 다음에는 조금 쉬어가며 당겨보자.':'줄이 너무 느슨해졌다… 물고기가 유유히 돌아갔다.';break;}if(next.distance<=.025){next.stage='landed';break;}
 }next.at=end;if(end-next.hookedAt>65000&&next.stage==='fight'){next.stage='escaped';next.line='한참 씨름하다 놓쳤다… 잠깐 숨을 고르자.';}return next;
}
