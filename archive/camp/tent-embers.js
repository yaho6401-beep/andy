import {WEATHER_CYCLE} from './weather-state.js';
// A single short gust per danger/wind overlap. Fixed existing particle slots, no spawned objects.
export function threatAge(fire,now){if(!fire?.dangerAt||fire.weather?.kind!=='wind')return -1;const windStart=Math.floor(now/WEATHER_CYCLE)*WEATHER_CYCLE+50000;return now-Math.max(windStart,fire.dangerAt);}
export function tentEmberAt(index,ageMs){const t=(ageMs-index*65)/3100;if(t<=0||t>=1)return null;const ease=t*t*(3-2*t),spread=Math.sin(index*2.4)*.45;return {x:(7.2+spread)*ease,z:(-3.3+Math.cos(index*1.7)*.4)*ease,y:.5+Math.sin(t*Math.PI)*2.5+t*2,fade:Math.min(1,t*8)*Math.min(1,(1-t)*5),size:.07+(index%4)*.012};}
