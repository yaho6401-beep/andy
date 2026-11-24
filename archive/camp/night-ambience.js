// A slow clearing in the cloud cover, shared by moon, water and captions.
export function moonlightAt(now,weather){const phase=((now%110000)+110000)%110000,pulse=phase>72000&&phase<96000?Math.sin(Math.PI*(phase-72000)/24000)**2:0;return pulse*(weather?.kind==='rain'?.06:weather?.kind==='wind'?.65:1);}
export function clearAirFlare(now,weather){const p=((now%78000)+78000)%78000;return weather?.kind==='clear'&&p>41000&&p<47000?Math.sin(Math.PI*(p-41000)/6000)**2:0;}
export const STIR_LINES=['앗, 뜨거! 불티가 톡 튀었다.','장작 사이에서 불씨가 반짝 쏟아진다…','타닥! 불꽃이 잠깐 힘차게 피어올랐다.','불티가 가까이 날아왔네… 조금 떨어져 바라보자.'];
export const RESCUE_LINES=['이제 좀 괜찮아! 자나 깨나 불조심.','휴… 불길이 낮아졌다. 불은 늘 조심히 다뤄야지.','물이 닿으니 한결 잦아들었다. 작은 불씨도 다시 살펴보자.','이제 안심이 된다… 다음엔 조금씩만 보태야겠어.'];
export const DANGER_LINES=['위험하다! 이러다 텐트에 불이 옮겨가겠어…','불이 줄어들지 않아… 텐트의 물을 가져와 부어야겠어!','너무 많이 보탰네. 더 넣지 말고 물통을 가져오자.'];
