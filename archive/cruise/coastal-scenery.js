import * as T from 'three';
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// A wide coast bends away into the distance instead of ending as a flat postcard.
export function coastalGeometry(waterline=.34){
 const g=new T.PlaneGeometry(3200,620,96,4),p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i),u=x/930;uv.setX(i,x/1860+.5);p.setXYZ(i,x,p.getY(i)+620*(.5-waterline),-25-285*u*u);}
 p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();return g;
}
// Finish fading before the 1200m camera clip plane can leave a visible straight cut.
export const COAST_FADE_NEAR=500,COAST_FADE_FAR=1040;
export function harborAtmosphere(distance,extra=0){return {visibility:1-smooth(COAST_FADE_NEAR,COAST_FADE_FAR,distance+extra),haze:smooth(300,COAST_FADE_FAR,distance+extra)*.9};}
// Inter-port travel hides scene handover in open sea, well before the new coast is legible.
export function harborSceneFor(state,p){
 if(p.phase==='home')return {id:null,extra:0};
 if(state.originId&&p.phase==='outbound')return p.u<.45?{id:state.originId,extra:1800*(p.u/.45)**2}:{id:state.routeId,extra:1800*((1-p.u)/.55)**2};
 if(p.phase==='returning'){if(state.originId){const from=state.fromU,old=from<.45,start=1800*(old?from/.45:(1-from)/.55)**2;return {id:old?state.originId:state.routeId,extra:start+1800*p.homeProgress**2};}return {id:state.routeId,extra:1800*(1-p.u)**2};}
 return {id:state.routeId,extra:0};
}
