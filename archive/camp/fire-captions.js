const HINTS=['달빛이 밝다… 잠깐 올려다볼까.','오늘은 별이 참 아름답다.','가지 하나 던져볼까…','장작을 살짝 건드려볼까요?','감자를 구워 먹으면 맛있겠다.','고구마를 구워 먹으면 딱 좋겠어요.','마시멜로를 노릇하게 구워볼까요?'];
export class FireCaptions{
 constructor(element,random=Math.random){this.element=element;this.random=random;this.index=0;this.until=0;this.next=Infinity;this.priority=0;this.count=0;}
 open(now){this.next=now+18000;this.show('오늘은, 불만 바라봐도 좋아요.',now,3200);}
 show(text,now=performance.now(),duration=3600,priority=1){if(now<this.until&&priority<this.priority)return;this.element.textContent=text;this.element.hidden=false;this.element.style?.setProperty('--caption-duration',duration+'ms');this.element.classList.remove('is-visible');void this.element.offsetWidth;this.element.classList.add('is-visible');this.until=now+duration;this.priority=priority;this.count++;}
 tick(now,{active,paused=false,roasting=false}){if(!active){this.clear();return;}if(now>=this.until)this.element.hidden=true;if(!paused&&now>=this.next&&now>=this.until){if(roasting){this.next=now+8000;return;}this.next=now+28000+this.random()*12000;this.show(HINTS[this.index++%HINTS.length],now,3500,0);}}
 clear(){this.element.hidden=true;this.until=0;this.priority=0;}
}
