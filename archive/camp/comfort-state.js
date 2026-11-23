export const DRY_NATURAL=300000,DRY_FIRE=30000,JOY_TIME=120000;
// One tide clock for the visible foam and authoritative wet-clothes checks.
export function tideEdge(at){const phase=((at/1000%48)+48)%48;return -15.2+(phase<9?Math.sin(Math.PI*phase/9)*6.15:0);}
export function comfortSpeed(effect){return (effect?.wetness>0?.6:1)*(effect?.joyRemaining>0?1.5:1);}
export function monthKey(at){return new Date(at+9*3600000).toISOString().slice(0,7);}
export const JOY_LINES={potato:['포슬포슬한 감자에 기분이 좋아졌다.','따뜻한 한입, 마음도 든든해졌다.','담백하고 고소하다. 잠시 웃음이 난다.','속까지 따뜻해지는 맛이다.'],sweetpotato:['달콤하다. 마음까지 포근해진다.','노란 속살 한입에 기분이 좋아졌다.','달큰한 고구마가 오늘의 작은 행복이다.','따뜻한 한입에 미소가 번진다.'],marshmallow:['마음까지 달달해진다.','노릇한 한입에 기분이 좋아졌다.','사르르 녹는 달콤함이 좋다.','작은 구름을 먹은 듯 마음이 가벼워진다.']};
