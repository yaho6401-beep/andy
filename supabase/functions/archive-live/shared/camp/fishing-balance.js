const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const fishChance=seated=>seated?.80:.48;
export const biteWait=(seated,roll=.5)=>(seated?9000:22000)+clamp(roll,0,1)*(seated?14000:26000);
export function catchStrength(caught){if(caught?.kind==='trash')return .32;if(caught?.kind==='seaweed')return .45;return .75+clamp(((caught?.cm||31)-16)/30,0,1)*.9;}
export function anglingSettings(job){const strength=clamp(job.challenge??catchStrength(job.catch),.3,1.7),easy=strength<.6,seated=!!job.seated;return {strength,easy,biteMs:easy?7500:seated?6000:3300,tension:seated?.88:1.08,reel:seated?1.12:.92,slack:easy?7:seated?3.8:3,timeout:easy?45000:100000};}
export function settleWaiting(job,now){if(!job.wait)return;const wait={...job.wait},duration=biteWait(job.seated,wait.roll);job.biteAt=wait.at+(1-wait.progress)*duration;wait.progress=clamp(wait.progress+Math.max(0,Math.min(now,job.biteAt)-wait.at)/duration,0,1);wait.at=Math.min(now,job.biteAt);job.wait=wait;}
