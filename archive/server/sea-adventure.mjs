import {SEA} from '../camp/shore-state.js';
import {ISLAND,depthAt,onIsland,canStartSwimming,advanceAngling,rollSeaCatch} from '../camp/sea-adventure-state.js';
import {packFor} from './snacks.mjs';
const near=(p,o,r)=>Math.hypot(p.x-o.x,p.z-o.z)<=r;
export function settleAngling(s,p){const pack=s.packs.get(p.id),job=pack?.angling;if(!job)return;
 if(['waiting','bite','fight'].includes(job.stage)&&(p.room!=='camp'||p.seaRescue||p.swimming||!near(p,ISLAND.fish,3.2))){pack.angling=null;p.angling=null;return;}
 const next=advanceAngling(job,s.clock());if(next.stage==='landed'){
  const caught=next.catch;if(caught.kind==='fish'){pack.items.fish??=0;pack.fish??=[];if(pack.items.fish<3){pack.items.fish++;pack.fish.push({species:caught.species,name:caught.name,cm:caught.cm});next.line=caught.name+' '+caught.cm+'cm! 모닥불에 돌아가 노릇하게 구워볼까.';}else next.line='꾸러미가 가득해서 물고기는 다시 바다로 보내주었다.';}
  else{pack.seaCleaned=(pack.seaCleaned||0)+1;next.line=caught.kind==='seaweed'?'미역 한 줄기가 올라왔다… 바다 냄새가 물씬 난다.':caught.name+'을 건졌다. 바다의 쓰레기 하나를 챙겼다.';}
  next.stage='result';next.at=s.clock();pack.updatedAt=s.clock();
 }pack.angling=next;p.angling=['waiting','bite','fight'].includes(next.stage)?{stage:next.stage,castAt:next.castAt,hookedAt:next.hookedAt||null}:null;
}
export function adventureAction(s,id,input){if(!['sea-swim','sea-rod','sea-cast','sea-reel','sea-cancel'].includes(input.type))return null;const p=s.clients.get(id),now=s.clock();if(p.room!=='camp'||p.seaRescue)throw Error('바닷가에서 천천히 시도해 주세요.');const pack=packFor(s,id);settleAngling(s,p);
 if(input.type==='sea-swim'){if(input.active===false){if(depthAt(p.x,p.z)>.32&&!onIsland(p.x,p.z))throw Error('해변이나 섬의 얕은 곳에서 물 밖으로 나와주세요.');p.swimming=false;}else{if(!canStartSwimming(p))throw Error('물이 허리까지 오기 전, 얕은 바다에서 수영을 시작해 주세요.');p.swimming=true;p.swimAt=now;pack.angling=null;p.angling=null;}p.epoch++;p.seq=0;p.lastMove=now;p.moveCredit=2.1;p.motion='idle';return {ok:true,swimming:p.swimming};}
 if(input.type==='sea-cancel'){pack.angling=null;p.angling=null;return {ok:true};}
 if(p.swimming||!onIsland(p.x,p.z))throw Error('작은 섬에 올라와 낚싯대를 찾아보세요.');
 if(input.type==='sea-rod'){if(!near(p,ISLAND.rod,2.2))throw Error('섬의 나무 상자 옆 낚싯대에 가까이 와주세요.');pack.rod=true;pack.updatedAt=now;return {ok:true,foundRod:true};}
 if(!pack.rod||!near(p,ISLAND.fish,3.2))throw Error('낚싯대를 챙겨 섬 북쪽의 낚시 자리로 와주세요.');
 if(input.type==='sea-cast'){if(pack.angling&&['waiting','bite','fight'].includes(pack.angling.stage))throw Error('던져둔 찌를 먼저 살펴보세요.');if((pack.items.fish||0)>=3)throw Error('생선은 세 마리까지 챙길 수 있어요. 모닥불에서 먼저 구워볼까요?');if(now-(pack.castAt||0)<3500)throw Error('천천히 다음 물결에 던져보세요.');p.yaw=Math.PI;pack.castAt=now;pack.angling={id:crypto.randomUUID(),stage:'waiting',castAt:now,biteAt:now+4000+s.random()*6000,at:now,distance:1,tension:.42,slack:0,mode:'neutral',seed:s.random()*6,catch:rollSeaCatch(s.random)};p.angling={stage:'waiting',castAt:now};pack.updatedAt=now;return {ok:true,cast:true};}
 const job=pack.angling;if(!job||input.id!==job.id||!['bite','fight'].includes(job.stage))throw Error('찌가 움직일 때 오른쪽 당기기로 낚아채 주세요.');if(!['pull','release','neutral'].includes(input.mode))throw Error('낚싯줄 조작을 확인해 주세요.');
 if(job.stage==='bite'){if(input.mode!=='pull')return {ok:true};job.stage='fight';job.hookedAt=now;job.at=now;job.tension=.42;job.distance=1;}job.mode=input.mode;job.controlAt=now;settleAngling(s,p);return {ok:true};
}
