export const MENU=[
 ...['아메리카노','카페라테','카푸치노','바닐라라테','카페모카'].map((name,i)=>({id:'coffee-'+i,name,category:'커피',color:['#78543a','#c7a27a','#bd9c75','#d7b482','#a47d5c'][i],kind:'cup'})),
 ...['얼그레이','캐모마일','페퍼민트','루이보스','자스민티'].map((name,i)=>({id:'tea-'+i,name,category:'차',color:['#bda060','#d8c383','#adc59b','#ba8765','#c5c99c'][i],kind:'cup'})),
 ...['레몬에이드','자몽에이드','청포도에이드','딸기에이드','블루베리에이드'].map((name,i)=>({id:'ade-'+i,name,category:'에이드',color:['#e4cf7d','#e7b18f','#b9d59a','#d99eae','#bba6d1'][i],kind:'glass'})),
 ...['딸기케이크','치즈케이크','초콜릿 브라우니','크루아상','마카롱'].map((name,i)=>({id:'dessert-'+i,name,category:'디저트',color:['#ddb1bc','#e2d19a','#8a6552','#cea46c','#c4aed3'][i],kind:'dessert'}))
];
export const NPCS={salon:{id:'barista',name:'바리스타 모아',x:-1.3,z:-6.9,reach:{x:0,z:-4.2},greeting:'무얼 마시시겠어요?',description:'커피, 차, 에이드, 디저트가 준비되어 있어요. 주문하시면 30초 뒤 불러드릴게요.'},scents:{id:'curator',name:'향기 큐레이터 리브',x:-3.7,z:-5.1,reach:{x:-3.7,z:-4.2},greeting:'어떤 향의 이야기가 궁금하세요?',description:'향기 아카이브에 오신 걸 환영해요. 꽃, 나무, 과일의 기억을 함께 찾아볼까요?'}};
export const THOUGHTS=['무슨 생각 중…?','점심은 뭐 먹지…','저녁은 뭐 먹지…','오늘은 왠지 좋은 일이 생길 것 같아.','이 향, 어디서 맡아봤더라…','잠깐 쉬어 가도 괜찮겠지.'];
