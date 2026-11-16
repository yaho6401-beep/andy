import {validPosition,validMove} from './protocol.js';
// A bounded grid search with swept collision checks and line-of-sight smoothing.
export function findWalkPath(room,start,target){
 if(!validPosition(room,start.x,start.z)||!Number.isFinite(target.x)||!Number.isFinite(target.z)||Math.abs(target.x)>8.3||Math.abs(target.z)>8.3)return [];
 let goal={...target};
 if(!validPosition(room,goal.x,goal.z)){
  let best=null;
  for(let r=.2;r<=1.6&&!best;r+=.2)for(let i=0;i<24;i++){
   const a=i*Math.PI/12,p={x:target.x+Math.cos(a)*r,z:target.z+Math.sin(a)*r};
   if(validPosition(room,p.x,p.z)&&(!best||Math.hypot(p.x-start.x,p.z-start.z)<Math.hypot(best.x-start.x,best.z-start.z)))best=p;
  }
  if(!best)return [];goal=best;
 }
 if(validMove(room,start.x,start.z,goal.x,goal.z))return [goal];
 const step=.35,origin=-7.7,n=45,key=(x,z)=>x+z*n,point=(x,z)=>({x:origin+x*step,z:origin+z*step});
 const nodes=new Map(),open=[];
 // Seed only reachable nearby cells, avoiding an invalid rounded start cell.
 const sx=Math.round((start.x-origin)/step),sz=Math.round((start.z-origin)/step);
 for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){
  const x=sx+dx,z=sz+dz,p=point(x,z);if(x<0||z<0||x>=n||z>=n||!validMove(room,start.x,start.z,p.x,p.z))continue;
  const g=Math.hypot(p.x-start.x,p.z-start.z),node={x,z,g,f:g+Math.hypot(goal.x-p.x,goal.z-p.z),parent:null};nodes.set(key(x,z),node);open.push(node);
 }
 let found=null;
 while(open.length){open.sort((a,b)=>b.f-a.f);const cur=open.pop();if(cur.closed)continue;cur.closed=true;const p=point(cur.x,cur.z);
  if(Math.hypot(p.x-goal.x,p.z-goal.z)<.65&&validMove(room,p.x,p.z,goal.x,goal.z)){found=cur;break;}
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){
   if(!dx&&!dz)continue;const x=cur.x+dx,z=cur.z+dz;if(x<0||z<0||x>=n||z>=n)continue;
   const q=point(x,z);if(!validMove(room,p.x,p.z,q.x,q.z))continue;const g=cur.g+Math.hypot(dx,dz)*step,k=key(x,z),old=nodes.get(k);if(old&&old.g<=g)continue;
   const node={x,z,g,f:g+Math.hypot(goal.x-q.x,goal.z-q.z),parent:cur};nodes.set(k,node);open.push(node);
  }
 }
 if(!found)return [];
 const raw=[goal];for(let c=found;c;c=c.parent)raw.unshift(point(c.x,c.z));
 const path=[];let from=start,i=0;
 while(i<raw.length){let j=raw.length-1;while(j>i&&!validMove(room,from.x,from.z,raw[j].x,raw[j].z))j--;path.push(raw[j]);from=raw[j];i=j+1;}
 return path;
}
