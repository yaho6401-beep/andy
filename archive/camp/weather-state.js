// A short shower every three minutes, with about two and a half dry minutes between.
export const WEATHER_CYCLE=180000,RAIN_START=120000,RAIN_DURATION=24000;
export function weatherAt(now){const cycle=Math.floor(now/WEATHER_CYCLE),phase=((now%WEATHER_CYCLE)+WEATHER_CYCLE)%WEATHER_CYCLE,kind=phase>=RAIN_START&&phase<RAIN_START+RAIN_DURATION?'rain':phase>=50000&&phase<66000?'wind':'clear';return {kind,cycle,eventId:cycle+':'+kind,at:now,intensity:kind==='rain'?.4+.6*Math.sin(Math.PI*(phase-RAIN_START)/RAIN_DURATION)**.7:0,endsAt:cycle*WEATHER_CYCLE+(kind==='rain'?RAIN_START+RAIN_DURATION:kind==='wind'?66000:WEATHER_CYCLE)};}
export function fireWind(weather,time){const amount=weather?.kind==='wind'?1:weather?.kind==='rain'?.22:0,gust=.33+.10*Math.sin(time*2.1)+.055*Math.sin(time*4.7+1);return {x:amount*gust,z:amount*(-.14-.035*Math.sin(time*1.7)),strength:amount};}
export function rainHeat(heat){return Math.max(.16,heat>2.5?2.5:heat>1.35?1.18:heat>.73?.65:heat-.22);}
export function weatherHeat(heat,weather){return weather?.kind==='rain'?rainHeat(heat):heat;}
