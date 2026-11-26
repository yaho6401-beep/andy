// One connected ship in metres. Both walking and the rendered stairs use this data.
export const DECK_Y=3,UPPER_Y=7.2;
export const SHIP_ZONES=[
 {name:'메인 갑판',z:0,y:DECK_Y,target:{x:0,z:3,y:DECK_Y}},
 {name:'선수',z:-28,y:DECK_Y,target:{x:0,z:-28,y:DECK_Y}},
 {name:'선미',z:28,y:DECK_Y,target:{x:0,z:28,y:DECK_Y}},
 {name:'선교',z:-18.5,y:UPPER_Y,target:{x:0,z:-20.9,y:UPPER_Y}},
 {name:'식당',z:18.5,y:UPPER_Y,target:{x:0,z:18.5,y:UPPER_Y}}
];
export const SHIP_STAIRS=[{id:'bridge',label:'선교',x:-10.2,fromZ:0,toZ:-11,w:2.2},{id:'dining',label:'식당',x:10.2,fromZ:0,toZ:11,w:2.2}];
export const SHIP_COLUMNS=SHIP_ZONES.slice(3).flatMap(zone=>[-7.8,7.8].flatMap(x=>[-6,0,6].map(offset=>({x,z:zone.z+offset,w:.32,d:.32,y:DECK_Y}))));
export function stairLanding(stair,upper){const direction=Math.sign(stair.toZ-stair.fromZ),side=Math.sign(stair.x);return {x:(stair.x+side*7.6)/2,z:(upper?stair.toZ:stair.fromZ)+(upper?direction:-direction)*.6,w:4.8,d:1.2,y:upper?UPPER_Y:DECK_Y};}
const OBSTACLES=[...SHIP_COLUMNS,{x:6,z:6,w:4.7,d:5.7,y:3},{x:0,z:-24.7,w:14.4,d:1.25,y:7.2},...[-5,0,5].map(x=>({x,z:12.7,w:1.85,d:1.85,y:7.2}))];
const rect=(x,z,cx,cz,w,d)=>Math.abs(x-cx)<=w/2&&Math.abs(z-cz)<=d/2;
export function shipSurfaces(x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z))return [];
 const heights=[];
 if(Math.abs(x)<=8.25&&Math.abs(z)<=36.1)heights.push(DECK_Y);
 for(const zone of SHIP_ZONES.slice(3))if(rect(x,z,0,zone.z,16.5,16.1))heights.push(UPPER_Y);
 for(const stair of SHIP_STAIRS){
  const onFlight=rect(x,z,stair.x,(stair.fromZ+stair.toZ)/2,stair.w,Math.abs(stair.toZ-stair.fromZ));
  if(onFlight){const t=(z-stair.fromZ)/(stair.toZ-stair.fromZ);heights.push(DECK_Y+(UPPER_Y-DECK_Y)*Math.max(0,Math.min(1,t)));}
  for(const upper of [false,true]){const landing=stairLanding(stair,upper);if(!onFlight&&rect(x,z,landing.x,landing.z,landing.w,landing.d))heights.push(landing.y);}
 }
 return [...new Set(heights)].filter(y=>!OBSTACLES.some(o=>Math.abs(y-o.y)<.3&&rect(x,z,o.x,o.z,o.w+.2,o.d+.2)));
}
export function shipFloor(x,z,previousY){return shipSurfaces(x,z).filter(y=>Math.abs(y-previousY)<.58).sort((a,b)=>Math.abs(a-previousY)-Math.abs(b-previousY))[0]??null;}
export function shipStep(from,to){const distance=Math.hypot(to.x-from.x,to.z-from.z),samples=Math.max(1,Math.ceil(distance/.035)),rise=distance/samples*.5+.012;let y=from.y;for(let i=1;i<=samples;i++){const options=shipSurfaces(from.x+(to.x-from.x)*i/samples,from.z+(to.z-from.z)*i/samples).filter(next=>Math.abs(next-y)<=rise).sort((a,b)=>Math.abs(a-y)-Math.abs(b-y));if(!options.length)return null;y=options[0];}return {x:to.x,z:to.z,y};}
export function shipZone(p){if(Math.abs(p.x)>8.1&&p.y>4.3)return p.x<0?3:4;return p.y>5.35?(p.z<0?3:4):p.z< -20?1:p.z>20?2:0;}
let graph;
function navigation(){if(graph)return graph;const nodes=[],cells=new Map(),step=.8;for(let ix=-14;ix<=14;ix++)for(let iz=-46;iz<=46;iz++){const x=ix*step,z=iz*step,cell=[];for(const y of shipSurfaces(x,z)){const n={index:nodes.length,x,z,y,ix,iz,edges:[]};nodes.push(n);cell.push(n);}if(cell.length)cells.set(ix+','+iz,cell);}for(const n of nodes)for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){if(!dx&&!dz)continue;for(const q of cells.get((n.ix+dx)+','+(n.iz+dz))||[])if(Math.abs(q.y-n.y)<.56&&shipStep(n,q))n.edges.push(q.index);}return graph={nodes};}
function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z,a.y-b.y);}
export function findShipPath(from,to){
 if(![from.x,from.y,from.z,to.x,to.y,to.z].every(Number.isFinite))return [];
 const {nodes}=navigation(),nearest=p=>nodes.reduce((best,n)=>distance(n,p)<distance(best,p)&&Math.abs(n.y-p.y)<.65&&shipStep(p,n)?n:best,nodes.find(n=>Math.abs(n.y-p.y)<.65&&shipStep(p,n))||nodes[0]),start=nearest(from),end=nearest(to);
 if(distance(start,from)>2||distance(end,to)>2)return [];
 const open=new Set([start.index]),score=new Map([[start.index,0]]),parent=new Map(),heuristic=n=>distance(n,to);let checks=0;
 while(open.size&&checks++<nodes.length){let current=-1,best=Infinity;for(const i of open){const f=score.get(i)+heuristic(nodes[i]);if(f<best){best=f;current=i;}}if(current===end.index){const path=[];let at=current;while(at!==undefined){path.unshift({x:nodes[at].x,y:nodes[at].y,z:nodes[at].z});at=parent.get(at);}if(shipStep(path.at(-1),to))path.push({...to});return path;}open.delete(current);for(const i of nodes[current].edges){const next=score.get(current)+distance(nodes[current],nodes[i]);if(next<(score.get(i)??Infinity)){score.set(i,next);parent.set(i,current);open.add(i);}}}
 return [];
}
