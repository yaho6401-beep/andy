// Shared by the garden renderer and the authoritative room server.
export const SNACKS={
 potato:{name:'감자',emoji:'🥔',seconds:25,color:'#c29a64',done:'포슬포슬한 감자가 익었어요. 잠시 식혀 한입 드세요.'},
 sweetpotato:{name:'고구마',emoji:'🍠',seconds:30,color:'#9b5960',done:'고구마가 달콤하게 익었어요. 따뜻한 속을 호호 불어 드세요.'},
 marshmallow:{name:'마시멜로',emoji:'☁',seconds:12,color:'#fff1d9',done:'겉은 노릇, 속은 말랑. 마시멜로가 알맞게 구워졌어요.'}
};
export const HARVESTS=[
 {id:'potato-west',kind:'potato',x:-1.3,z:10.6},
 {id:'sweet-east',kind:'sweetpotato',x:1.3,z:10.6},
 {id:'potato-south',kind:'potato',x:-1.3,z:11.9},
 {id:'sweet-south',kind:'sweetpotato',x:1.3,z:11.9}
];
export const PACK_LIMIT=3,HARVEST_PAUSE=300000,SERVICE_PAUSE=60000,PACK_TTL=7200000;
