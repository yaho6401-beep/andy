import {DECK_FIXTURES,DECK_SEATS,seatFootprint} from './deck-fixtures.js';
// Metres, shared by architecture, furniture collisions and pedestrian routing.
import {SHIP_LENGTH,SHIP_BEAM} from '../camp/cruise-dimensions.js';
export {SHIP_LENGTH,SHIP_BEAM};
export const DECK_Y=10.2,UPPER_Y=14.4,LOWER_Y=8.1,CABIN_Y=7,ROOF_Y=18.9;
export const SHIP_ZONES=[
 {name:'메인 갑판',z:0,y:DECK_Y,target:{x:0,z:4,y:DECK_Y}},
 {name:'선수',z:-48,y:LOWER_Y,target:{x:0,z:-53,y:LOWER_Y}},
 {name:'선미',z:48,y:LOWER_Y,target:{x:0,z:54,y:LOWER_Y}},
 {name:'선교',z:-34,y:UPPER_Y,target:{x:0,z:-42,y:UPPER_Y}},
 {name:'식당',z:34,y:UPPER_Y,target:{x:0,z:34,y:UPPER_Y}},
 {name:'좌현 윙',z:-42,y:UPPER_Y,target:{x:-15.2,z:-42,y:UPPER_Y}},
 {name:'우현 윙',z:-42,y:UPPER_Y,target:{x:15.2,z:-42,y:UPPER_Y}},
 {name:'레이더 데크',z:-35,y:ROOF_Y,target:{x:-5,z:-35,y:ROOF_Y}},
 {name:'나의 객실',z:6,y:CABIN_Y,target:{x:6,z:6,y:CABIN_Y}}
];
export const SHIP_STAIRS=[{id:'bridge',label:'선교 · 전망 라운지',x:-15.3,fromZ:0,toZ:-17,w:2.6,fromY:DECK_Y,toY:UPPER_Y},{id:'dining',label:'파노라마 다이닝',x:15.3,fromZ:0,toZ:17,w:2.6,fromY:DECK_Y,toY:UPPER_Y},
 ...[-1,1].flatMap(side=>[-7.5,7.5].map(x=>({id:`end-${side}-${x}`,label:side<0?'선수 계단':'선미 계단',x,fromZ:side*31,toZ:side*41,w:2.8,fromY:DECK_Y,toY:LOWER_Y}))),
 {id:'radar',label:'레이더 · 상부 데크',x:11.8,fromZ:-20,toZ:-33,w:2.6,fromY:UPPER_Y,toY:ROOF_Y},
 {id:'cabins',label:'객실층 · 나의 객실',x:-12,fromZ:6,toZ:17,w:2.6,fromY:DECK_Y,toY:CABIN_Y}];
export const SHIP_COLUMNS=SHIP_ZONES.slice(3,5).flatMap(zone=>[-12.7,12.7].flatMap(x=>[-14,-7,0,7,14].map(offset=>({x,z:zone.z+offset,w:.34,d:.34,y:Math.abs(zone.z+offset)>41?LOWER_Y:DECK_Y}))));
export const POOL={x:3,z:-6,w:6.4,d:12.4};
export const BRIDGE_CREW=[{id:'captain',name:'선장',x:4.5,z:-43,y:UPPER_Y},{id:'helmsman',name:'조타수',x:-4.5,z:-45.5,y:UPPER_Y}];
export const CAPTAIN_CONTACT={x:2.3,z:-41.5,y:UPPER_Y};
export const DINING_TABLES=[-9,0,9].flatMap(x=>[-11,-3,5].map(z=>({x,z})));
export const DECK_LOUNGERS=[
 ...[-9,-6].flatMap(x=>[-10,-5,0].map(z=>({zone:0,x,z}))),
 ...[-9,-5,5,9].flatMap(x=>[-4,1,6].map(z=>({zone:2,x,z}))),
 ...[-8,8].map(x=>({zone:1,x,z:1}))
];
export const SHIP_EQUIPMENT=DECK_FIXTURES.map(p=>({...p,y:SHIP_ZONES[p.zone].y}));
export const SHIP_BENCHES=DECK_SEATS.map(p=>({...p,y:SHIP_ZONES[p.zone].y}));
export function hullHalfBeam(z){const t=Math.max(0,(-z-44)/26,(z-56)/14);return 14*Math.sqrt(Math.max(0,1-t*t));}
export function stairLanding(stair,upper){const direction=Math.sign(stair.toZ-stair.fromZ),side=Math.sign(stair.x),external=['bridge','dining'].includes(stair.id);return {x:external?side*13.95:stair.x,z:(upper?stair.toZ:stair.fromZ)+(upper?direction:-direction)*.9,w:external?5.5:3.8,d:1.8,y:upper?stair.toY:stair.fromY};}
export const BRIDGE_WALLS=[{x:0,z:-50.45,w:21.6,d:.3},...[-1,1].flatMap(s=>[{x:s*6.15,z:-28,w:9.3,d:.28},{x:s*10.8,z:-48.8,w:.25,d:3.4},{x:s*10.8,z:-34.75,w:.25,d:13.5}])].map(p=>({...p,y:UPPER_Y}));
export const CABIN_WALLS=[{x:8.1,z:0,w:8.6,d:.22},{x:8.1,z:11,w:8.6,d:.22},{x:12.4,z:5.5,w:.22,d:11},...[[2.35,4.7],[9,4]].map(([z,d])=>({x:3.8,z,w:.22,d}))].map(p=>({...p,y:CABIN_Y}));
export const CABIN_FURNITURE=[{x:9,z:3,w:4.1,d:3.7,y:CABIN_Y},{x:11.4,z:8,w:1,d:3.2,y:CABIN_Y},{x:5.5,z:.8,w:2.3,d:1,y:CABIN_Y}];
const OBSTACLES=[...SHIP_EQUIPMENT,...SHIP_BENCHES.map(seatFootprint),...SHIP_COLUMNS,...BRIDGE_WALLS,...CABIN_WALLS,...CABIN_FURNITURE,...BRIDGE_CREW.map(p=>({...p,w:.8,d:.8})),{...POOL,w:POOL.w+.8,d:POOL.d+.8,y:DECK_Y},{x:9,z:9,w:1.5,d:7.5,y:DECK_Y},
 {x:0,z:-47,w:23,d:1.4,y:UPPER_Y},
 ...DINING_TABLES.map(p=>({x:p.x,z:p.z+34,w:2.1,d:2.1,y:UPPER_Y})),
 ...DECK_LOUNGERS.map(p=>({x:p.x,z:p.z+SHIP_ZONES[p.zone].z,w:.95,d:2,y:SHIP_ZONES[p.zone].y})),
 {x:0,z:-42,w:1.5,d:1.5,y:ROOF_Y},...[-8,8].map(x=>({x,z:-29,w:3,d:3,y:ROOF_Y})),...[-4.5,4.5].map(x=>({x,z:-60,w:2.6,d:3.2,y:LOWER_Y})),{x:0,z:62,w:3.2,d:2,y:LOWER_Y}];
const rect=(x,z,cx,cz,w,d)=>Math.abs(x-cx)<=w/2&&Math.abs(z-cz)<=d/2;
const obstacleBuckets=new Map();for(const o of OBSTACLES)for(let k=Math.floor((o.z-o.d/2-.1)/4);k<=Math.floor((o.z+o.d/2+.1)/4);k++){if(!obstacleBuckets.has(k))obstacleBuckets.set(k,[]);obstacleBuckets.get(k).push(o);}
export function shipSurfaces(x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z))return [];
 const heights=[];
 if(Math.abs(z)<=66&&Math.abs(x)<=Math.min(13.55,hullHalfBeam(z)-.5)){
  if(Math.abs(z)<=31&&!rect(x,z,-12,11.5,2.6,11))heights.push(DECK_Y);
  if(Math.abs(z)>=41)heights.push(LOWER_Y);
 }
 if(rect(x,z,0,0,25,42)&&!rect(x,z,-12,11.5,2.6,11))heights.push(CABIN_Y);
 for(const zone of SHIP_ZONES.slice(3,5))if(rect(x,z,0,zone.z,26.6,34)&&!rect(x,z,11.8,-26.5,2.6,13))heights.push(UPPER_Y);
 if(rect(x,z,0,-36.5,23.6,26)&&!rect(x,z,11.8,-28,2.6,10))heights.push(ROOF_Y);
 for(const s of [-1,1])if(rect(x,z,s*13.8,-42.5,6,7))heights.push(UPPER_Y);
 for(const stair of SHIP_STAIRS){
  const onFlight=rect(x,z,stair.x,(stair.fromZ+stair.toZ)/2,stair.w,Math.abs(stair.toZ-stair.fromZ));
  if(onFlight){const t=(z-stair.fromZ)/(stair.toZ-stair.fromZ);heights.push(stair.fromY+(stair.toY-stair.fromY)*Math.max(0,Math.min(1,t)));}
  for(const upper of [false,true]){const landing=stairLanding(stair,upper);if(!onFlight&&rect(x,z,landing.x,landing.z,landing.w,landing.d))heights.push(landing.y);}
 }
 return [...new Set(heights)].filter(y=>!(obstacleBuckets.get(Math.floor(z/4))||[]).some(o=>Math.abs(y-o.y)<.3&&rect(x,z,o.x,o.z,o.w+.2,o.d+.2)));
}
export function shipFloor(x,z,previousY){return shipSurfaces(x,z).filter(y=>Math.abs(y-previousY)<.58).sort((a,b)=>Math.abs(a-previousY)-Math.abs(b-previousY))[0]??null;}
export function shipStep(from,to){const distance=Math.hypot(to.x-from.x,to.z-from.z),samples=Math.max(1,Math.ceil(distance/.035)),rise=distance/samples*.5+.012;let y=from.y;for(let i=1;i<=samples;i++){const options=shipSurfaces(from.x+(to.x-from.x)*i/samples,from.z+(to.z-from.z)*i/samples).filter(next=>Math.abs(next-y)<=rise).sort((a,b)=>Math.abs(a-y)-Math.abs(b-y));if(!options.length)return null;y=options[0];}if(Number.isFinite(to.y)&&Math.abs(y-to.y)>.1)return null;return {x:to.x,z:to.z,y};}
export function shipZone(p){if(p.y>ROOF_Y-.65)return 7;if(p.y<CABIN_Y+.6)return 8;if(p.y>UPPER_Y-.6&&p.z< -37&&Math.abs(p.x)>10.9)return p.x<0?5:6;if(p.y>(DECK_Y+UPPER_Y)/2)return p.z<0?3:4;return p.z< -31?1:p.z>31?2:0;}
let graph;
function navigation(){if(graph)return graph;const nodes=[],cells=new Map(),step=.8;for(let ix=-23;ix<=23;ix++)for(let iz=-83;iz<=83;iz++){const x=ix*step,z=iz*step,cell=[];for(const y of shipSurfaces(x,z)){const n={index:nodes.length,x,z,y,ix,iz,edges:[]};nodes.push(n);cell.push(n);}if(cell.length)cells.set(ix+','+iz,cell);}for(const n of nodes)for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){if(!dx&&!dz)continue;for(const q of cells.get((n.ix+dx)+','+(n.iz+dz))||[])if(q.index>n.index&&Math.abs(q.y-n.y)<.56&&shipStep(n,q)&&(Math.abs(q.y-n.y)<.001||shipStep(q,n))){n.edges.push(q.index);q.edges.push(n.index);}}return graph={nodes};}
function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z,a.y-b.y);}
export function findShipPath(from,to){
 if(![from.x,from.y,from.z,to.x,to.y,to.z].every(Number.isFinite))return [];
 const {nodes}=navigation(),nearest=p=>nodes.reduce((best,n)=>distance(n,p)<distance(best,p)&&Math.abs(n.y-p.y)<.65&&shipStep(p,n)?n:best,nodes.find(n=>Math.abs(n.y-p.y)<.65&&shipStep(p,n))||nodes[0]),start=nearest(from),end=nearest(to);
 if(distance(start,from)>2||distance(end,to)>2)return [];
 const open=new Set([start.index]),score=new Map([[start.index,0]]),parent=new Map(),heuristic=n=>distance(n,to);let checks=0;
 while(open.size&&checks++<nodes.length){let current=-1,best=Infinity;for(const i of open){const f=score.get(i)+heuristic(nodes[i]);if(f<best){best=f;current=i;}}if(current===end.index){const path=[];let at=current;while(at!==undefined){path.unshift({x:nodes[at].x,y:nodes[at].y,z:nodes[at].z});at=parent.get(at);}if(shipStep(path.at(-1),to))path.push({...to});return path;}open.delete(current);for(const i of nodes[current].edges){const next=score.get(current)+distance(nodes[current],nodes[i]);if(next<(score.get(i)??Infinity)){score.set(i,next);parent.set(i,current);open.add(i);}}}
 return [];
}
