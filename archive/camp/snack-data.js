import {mallowState} from './marshmallow-state.js';
// Shared by the garden renderer and the authoritative room server.
export const SNACKS={
 potato:{name:'감자',emoji:'🥔',seconds:25,color:'#c29a64',done:'포슬포슬한 감자가 익었어요. 잠시 식혀 한입 드세요.'},
 sweetpotato:{name:'고구마',emoji:'🍠',seconds:30,color:'#9b5960',done:'고구마가 달콤하게 익었어요. 따뜻한 속을 호호 불어 드세요.'},
 marshmallow:{name:'마시멜로',emoji:'☁',seconds:12,color:'#fff1d9',done:'겉은 노릇, 속은 말랑. 마시멜로가 알맞게 구워졌어요.'}
};
export const HARVESTS=[
 {id:'potato-west',kind:'potato',x:-1.3,z:10.6},
 {id:'sweet-east',kind:'sweetpotato',x:1.3,z:10.6},
 {id:'potato-south',kind:'potato',x:-1.3,z:11.9},
 {id:'sweet-south',kind:'sweetpotato',x:1.3,z:11.9}
];
export const PACK_LIMIT=3,HARVEST_PAUSE=10000,WOOD_PAUSE=60000,SERVICE_PAUSE=1000,PACK_TTL=7200000;
export const SHARE_TTL=600000;
// A calm twenty-second serving window, then gradual scorching. Shared food is off the fire.
export const ROAST={graceMs:20000,scorchMs:30000};
export const cookingRate=heat=>Math.max(.55,Math.min(3.5,.45+(Number.isFinite(heat)?heat:.72)*.85));
export function advanceVegetable(job,now,heat=job.cook?.heat??.72){
 const previous=job.cook||{at:job.startedAt,elapsed:0,heat:.72},s={...previous},end=Math.max(s.at,now),start=Math.max(s.at,end-300000);
 for(let t=start;t<end;){const dt=Math.min(500,end-t),h=typeof heat==='function'?heat(t+dt/2):heat;s.heat=h;s.elapsed+=dt*cookingRate(h);t+=dt;}
 s.at=end;return s;
}
export function roastState(job,now){
 if(job.kind==='marshmallow'&&job.roast&&!job.shared)return mallowState(job,now);
 if(job.cook&&!job.shared){const cook=advanceVegetable(job,now),target=SNACKS[job.kind].seconds*1000,progress=Math.min(1,cook.elapsed/target),scorch=Math.max(0,Math.min(1,(cook.elapsed-target-ROAST.graceMs)/ROAST.scorchMs));return {progress,scorch,ready:progress>=1,burnt:scorch>=1,stage:progress<1?'cooking':scorch>=1?'burnt':scorch>0?'scorching':'ready'};}
 const progress=Math.max(0,Math.min(1,(now-job.startedAt)/Math.max(1,job.readyAt-job.startedAt)));
 const scorch=job.shared||job.kind==='marshmallow'?0:Math.max(0,Math.min(1,(now-job.readyAt-ROAST.graceMs)/ROAST.scorchMs));
 return {progress,scorch,ready:now>=job.readyAt,burnt:scorch>=1,stage:now<job.readyAt?'cooking':scorch>=1?'burnt':scorch>0?'scorching':'ready'};
}
export const WOOD_FINDS=[
 {id:'camp-east-wood',kind:'firewood',room:'camp',x:13.6,z:6},
 {id:'camp-west-wood',kind:'firewood',room:'camp',x:-13.6,z:6},
 {id:'camp-north-wood',kind:'firewood',room:'camp',x:-13.6,z:-9},
 {id:'camp-east-pine-wood',kind:'firewood',room:'camp',x:13.6,z:-4},
 {id:'camp-west-pine-wood',kind:'firewood',room:'camp',x:-13.6,z:1},
 {id:'camp-south-pine-wood',kind:'firewood',room:'camp',x:13.6,z:10}
];
export function biteLine(kind){return kind==='marshmallow'?'말랑한 한입, 마음까지 달달해진다…':'호호, 한입. 속까지 따뜻해진다…';}
