import {weatherAt} from './weather-state.js';
export function advanceFire(state,at,seconds,weatherEnabled,holdUntil,oilUntil=0){
 const weather=weatherEnabled?weatherAt(at+seconds*500):null,rain=weather?.kind==='rain'?weather.intensity||.5:0,held=at<holdUntil;
 const oiled=at<oilUntil&&state.heat>.73;
 const dry=oiled?.012:state.heat>2.5?.13:state.heat>1.5?.055:held?.009:state.heat>.73?.022:.012;
 state.heat=Math.max(.16,Math.min(4.5,state.heat-(dry+(rain?.06+rain*.35:0))*seconds));
 const rate=(state.heat>2.5?.018:state.heat>1.35?.035:state.heat>.65?.075:.14)*(held?.65:1)*(1+rain*3);
 state.load=Math.max(0,Math.min(state.load-rate*seconds,7*Math.max(0,(state.heat-.16)/2.34)));
}
export function fireStateAt(fire,now){
 const at=Number.isFinite(fire?.at)?fire.at:now,state={heat:Math.max(.16,Math.min(4.5,Number.isFinite(fire?.heat)?fire.heat:.72)),load:Math.max(0,Math.min(7,fire?.branchLoad??fire?.branches??0))};
 if(now-at>300000)return {heat:.16,load:0};
 for(let t=at;t<now;){const ms=Math.min(500,now-t);advanceFire(state,t,ms/1000,fire.weatherEnabled,fire.holdUntil||0,fire.oilUntil||0);t+=ms;}
 return state;
}
