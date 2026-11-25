// Shared by the coast, avatars and authoritative rescue. Metres, milliseconds.
export const SEA={surface:-.17,edge:-14.8,limit:-23.8,slope:.48,warnDepth:.85,rescueDepth:1.55,duration:10200};
const clamp=t=>Math.max(0,Math.min(1,t)),smooth=t=>{t=clamp(t);return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
export function seabedHeight(z){return -Math.min(3.3,Math.max(0,SEA.edge-z)*SEA.slope);}
export function waterDepth(z){return Math.max(0,SEA.surface-seabedHeight(z));}
export function shoreStage(z){const d=waterDepth(z);return d>=SEA.rescueDepth?'deep':d>=SEA.warnDepth?'warning':d>.08?'wading':'sand';}
export function rescuePose(rescue,now){
 const age=Math.max(0,now-rescue.at),from=rescue.from,shore=rescue.shore,approach=smooth(age/3500),ride=smooth((age-4600)/4200),step=smooth((age-8800)/1400),boarding=smooth((age-3500)/1100);
 const boat={x:mix(from.x+5,from.x,approach),z:mix(from.z-7,from.z,approach),y:SEA.surface+.15};
 if(age>=4600){boat.x=mix(from.x,shore.x,ride);boat.z=mix(from.z,-15.7,ride);}
 const player={x:age<4600?from.x:mix(from.x,shore.x,ride),z:age<4600?from.z:mix(from.z,-15.7,ride),y:mix(SEA.surface-1.34,SEA.surface+.18,boarding)};
 if(age>=8800){player.z=mix(-15.7,shore.z,step);player.y=mix(SEA.surface+.18,seabedHeight(shore.z),step);boat.x+=step*1.6;boat.z-=step*1.4;}
 const stage=age<3500?'struggle':age<4600?'boarding':age<8800?'aboard':age<SEA.duration?'landing':'safe';
 return {age,stage,boat,player,done:age>=SEA.duration,boatOpacity:1-smooth((age-9400)/800)};
}
export const RESCUED_LINES=['죽을 뻔했다… 조심해야지.','수영을 배워야겠다. 다음엔 안전한 곳에서만 놀자.','생명은 소중해… 물에서는 더 조심해야지.','물에 빠지니 무서웠어… 잠깐 쉬어야겠다.','휴… 무사해서 다행이다. 깊은 물은 조심하자.'];
