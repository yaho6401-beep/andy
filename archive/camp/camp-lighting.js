import {moonlightAt} from './night-ambience.js';
const clamp=v=>Math.max(0,Math.min(1,v));
// The sky can become very dark; fire remains a local warm light, never global daylight.
export function campLightAt(now,weather,heat=.72,moonTransmission=1,fireFocus=false){
 const cover=clamp(weather?.cloudCover||0),rain=weather?.kind==='rain'?weather.intensity||.5:0,clear=(1-cover)**2*(1-rain*.85),moon=moonlightAt(now,weather)*moonTransmission,night=clear*.16;
 return {moon,clear,ambient:(fireFocus ? .055 : .14)+night*1.7+moon*2.5,sun:.015+clear*.18+moon*4.4,sky:clamp(night+moon*.85),water:clamp(.015+clear*.23+moon*.8),moonTransmission,fire:clamp((heat-.16)/3),dark:cover>.7&&moon<.12,beams:moon*(1-cover)};
}
export const DARK_COAST_LINES=['바다가 하나도 보이지 않는다… 더 들어가면 너무 위험하다.','구름에 달빛이 가렸다. 물가에서는 한 발 물러서자.','어둠 속에서는 물의 깊이를 가늠할 수 없어… 조각배를 이용하자.','파도 소리만 들린다. 지금은 해변에서 쉬어야겠다.'];
