// Shared deterministic cooking. The server owns time, heat and every control change.
export const MALLOW={rates:[.2,.11,.045,0],levels:['불 가까이','중간 높이','높이 들기','불 밖 · 식히기'],gold:.72};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function newMallow(now){return {version:1,at:now,level:1,face:0,faces:[0,0,0,0],flame:0,char:0,heat:.72,turns:0};}
export function advanceMallow(job,now,heat=job.roast?.heat??.72){
 const previous=job.roast||newMallow(job.startedAt),s={...previous,faces:[...previous.faces]};
 const end=Math.max(s.at,now),start=Math.max(s.at,end-120000); // Long unattended intervals are already enough to burn.
 for(let t=start;t<end;){const dt=Math.min(.25,(end-t)/1000),h=typeof heat==='function'?heat(t+dt*500):heat;s.heat=Number.isFinite(h)?h:.72;
  const rate=MALLOW.rates[s.level]*clamp(.6+s.heat*.45,.65,1.65);
  for(let i=0;i<4;i++){const d=(i-s.face+4)%4;s.faces[i]=Math.min(2.5,s.faces[i]+dt*rate*(d===0?1:d===2?.06:.22));}
  const exposed=s.faces[s.face],ignite=s.level===0&&exposed>1.05||s.level===1&&exposed>1.4;
  s.flame=clamp(s.flame+dt*(ignite?.8:s.level>=2?-.9:-.16),0,1);
  const max=Math.max(...s.faces);s.char=clamp(s.char+dt*((rate>0?Math.max(0,max-1.3)*.08:0)+s.flame*.07),0,1);
  t+=dt*1000;
 }
 s.at=end;return s;
}
export function mallowState(job,now,heat){
 const roast=advanceMallow(job,now,heat),min=Math.min(...roast.faces),avg=roast.faces.reduce((a,b)=>a+b)/4,max=Math.max(...roast.faces),burnt=roast.char>=1||max>=2.4,onFire=roast.flame>.12;
 const ready=min>=.52&&avg>=MALLOW.gold&&!burnt&&!onFire;
 return {roast,progress:clamp(Math.min(avg/MALLOW.gold,min/.52),0,1),scorch:clamp(Math.max(roast.char,(max-1.3)*.6),0,1),ready,burnt,onFire,stage:burnt?'burnt':onFire?'flaming':ready?'ready':'cooking'};
}
