const HINTS=['달빛이 밝다… 잠깐 올려다볼까.','오늘은 별이 참 아름답다.','가지 하나 던져볼까…','장작을 살짝 건드려볼까요?','감자를 구워 먹으면 맛있겠다.','고구마를 구워 먹으면 딱 좋겠어요.','마시멜로를 노릇하게 구워볼까요?'];
export const RAIN_HINTS=['비가 와서 불이 금방 약해진다…','비가 오는데 텐트에서 잠깐 쉬다 올까…','비가 오니 더 운치 있네…','빗소리를 듣고 있으니 마음이 차분해진다…'];
export const HEAVY_RAIN_HINTS=['비가 와서 불이 금방 약해진다…','옷이 젖겠어… 텐트에서 잠깐 쉬다 올까.','빗줄기가 굵어졌다… 불씨만 조용히 남았네.','비가 오니 더 운치 있네…'];
export class FireCaptions{
 constructor(element,random=Math.random){this.element=element;this.random=random;this.index=0;this.until=0;this.next=Infinity;this.priority=0;this.count=0;}
 open(now){this.rainEvent=null;this.next=now+18000;this.show('오늘은, 불만 바라봐도 좋아요.',now,3200);}
 show(text,now=performance.now(),duration=3600,priority=1){if(now<this.until&&priority<this.priority)return;this.element.textContent=text;this.element.hidden=false;this.element.style?.setProperty('--caption-duration',duration+'ms');this.element.classList.remove('is-visible');void this.element.offsetWidth;this.element.classList.add('is-visible');this.until=now+duration;this.priority=priority;this.count++;}
 tick(now,{active,paused=false,roasting=false,weather=null,heat=1}){if(!active){this.clear();this.rainEvent=null;return;}const raining=weather?.kind==='rain';if(raining&&this.rainEvent!==weather.eventId){this.rainEvent=weather.eventId;this.rainIndex=0;this.next=Math.min(this.next,now+6500);}if(!raining&&this.rainEvent){this.rainEvent=null;this.next=now+18000;}if(now>=this.until)this.element.hidden=true;if(!paused&&now>=this.next&&now>=this.until){if(roasting&&!raining){this.next=now+8000;return;}const pool=raining?(weather.intensity>=.78?HEAVY_RAIN_HINTS:RAIN_HINTS):HINTS;let text=pool[raining?this.rainIndex++%pool.length:this.index++%pool.length];if(text.includes('불씨만')&&heat>.5)text='굵은 빗방울이 모닥불 위로 떨어진다…';this.next=now+(raining?8500+this.random()*3500:28000+this.random()*12000);this.show(text,now,3500,0);}}
 clear(){this.element.hidden=true;this.until=0;this.priority=0;}
}
