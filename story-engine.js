(function(root){
  'use strict';
  // Story-to-scent associations are editorial metaphors, not effects on mood.
  const themes=[
    {id:'love',label:'사랑',group:'마음',words:['사랑','연인','커플','데이트','기념일','고백','로맨스','장미'],title:'마음을 전하는 꽃 한 송이',meaning:'마음을 전하고 가까워지고 싶은 이야기를 장미의 이미지로 담았어요.',notes:['장미','로즈'],support:['피오니','자스민','프리지아','머스크'],singles:['single-middle-1','single-base-5'],pairing:'로즈는 사랑을 전하는 꽃의 이미지로, 화이트 머스크는 다정한 여운의 이미지로 더했어요.'},
    {id:'energy',label:'활기',group:'마음',words:['활기','에너지','기운','상쾌','운동','달리','활발','생동','힘차'],title:'가볍게 뛰어오르는 하루',meaning:'힘차게 움직이는 하루를 밝고 톡 쏘는 시트러스의 이미지로 연결했어요.',notes:['시트러스','자몽','레몬','유자','베르가못','만다린'],support:['민트','마린','그린'],singles:['single-top-2','single-middle-5'],pairing:'자몽의 선명한 첫인상과 마린의 시원한 이미지를 포인트로 골랐어요.'},
    {id:'happiness',label:'행복',group:'마음',words:['행복','행운','기쁨','기쁜','기쁘','감사','축하','생일','합격','성공','축복'],title:'오래 기억하고 싶은 좋은 순간',meaning:'소중한 기쁨을 잘 익은 과일과 화사한 꽃의 이미지로 담았어요.',notes:['복숭아','넥타린','만다린','오렌지','프루티'],support:['프리지아','피오니','꽃','바닐라'],singles:['single-top-6','single-middle-6'],pairing:'만다린의 밝은 인상에 아카시아의 꽃 이미지를 더해 좋은 순간을 표현했어요.'},
    {id:'joy',label:'즐거움',group:'마음',words:['즐거','즐겁','재미','재밌','웃음','웃고','웃는','신나','신났','신나는','축제','파티','친구','놀러'],title:'웃음이 번지는 한 장면',meaning:'함께 웃고 즐기는 장면을 경쾌한 과일과 꽃의 이미지로 풀었어요.',notes:['딸기','망고','패션프루트','사과','애플','프루티'],support:['플로럴','프리지아','바닐라'],singles:['single-top-4','single-middle-2'],pairing:'애플의 통통 튀는 첫인상과 라일락의 꽃 이미지를 조합했어요.'},
    {id:'excitement',label:'설렘',group:'마음',words:['설렘','설레','두근','첫만남','첫 만남','소개팅','첫사랑','기대'],title:'첫 장을 넘기는 설렘',meaning:'다가올 순간을 기다리는 마음을 피오니와 프리지아처럼 가벼운 꽃의 이미지로 연결했어요.',notes:['피오니','프리지아','배','플로럴'],support:['자스민','화이트 머스크'],singles:['single-top-1','single-middle-2'],pairing:'베르가못으로 첫 장면을 맑게 열고, 라일락으로 설레는 꽃의 이미지를 더했어요.'},
    {id:'calm',label:'차분함',group:'마음',words:['차분','고요','평온','명상','사색','책','독서','조용','잔잔','마음정리','마음 정리'],title:'나에게 돌아오는 조용한 시간',meaning:'고요한 하루의 이야기를 차와 나무, 잎사귀의 이미지로 담았어요.',notes:['티','마테','샌달우드','시더우드','우디','모스'],support:['그린','머스크','베티버'],singles:['single-top-3','single-base-3'],pairing:'그린티와 샌달우드로 조용한 숲과 차 한 잔의 이미지를 표현했어요.'},
    {id:'comfort',label:'포근함 · 위로',group:'마음',words:['포근','위로','안정','편안','휴식','쉬고','쉬는','따뜻','다정','안아','지친','힘든','슬픈','슬프','피곤','속상'],title:'수고한 나를 안아주는 여운',meaning:'쉬어가고 싶은 날의 이야기를 코튼과 부드러운 파우더의 이미지로 담았어요.',notes:['머스키','머스크','파우더','코튼','바닐라'],support:['아이리스','샌달우드','앰버'],singles:['single-base-8','single-middle-7'],pairing:'코튼 블라썸과 라벤더로 편안한 옷과 작은 휴식의 장면을 떠올렸어요.'},
    {id:'beginning',label:'새로운 시작',group:'이야기',words:['시작','새로운','새출발','새 출발','도전','입학','입사','이직','졸업','용기','내일','첫날','첫 날'],title:'새로운 페이지의 첫 문장',meaning:'한 걸음을 내딛는 이야기를 맑은 시트러스와 싱그러운 잎의 이미지로 연결했어요.',notes:['베르가못','유자','시트러스','그린'],support:['프리지아','머스크','바질'],singles:['single-top-1','single-middle-10'],pairing:'베르가못과 바이올렛 리프로 새 종이를 펼치듯 맑고 푸른 인상을 골랐어요.'},
    {id:'freedom',label:'여행 · 자유',group:'이야기',words:['여행','자유','바다','휴가','떠나','떠났','공항','해변','모험','바람'],title:'낯선 풍경으로 떠나는 마음',meaning:'열린 풍경과 자유로운 걸음을 바다와 열대 과일의 이미지로 표현했어요.',notes:['마린','아쿠아틱','코코넛','라임','트로피컬'],support:['레몬','민트','시트러스'],singles:['single-top-5','single-middle-5'],pairing:'레몬과 마린으로 햇빛이 반짝이는 바다의 장면을 담았어요.'},
    {id:'memory',label:'추억 · 소중함',group:'이야기',words:['추억','기억','그리움','그리운','소중','가족','엄마','아빠','선물','오래'],title:'기억 속에 남겨두고 싶은 향',meaning:'소중한 사람과 시간을 꽃과 부드러운 나무의 여운으로 연결했어요.',notes:['장미','로즈','머스크','샌달우드'],support:['아이리스','파우더','앰버'],singles:['single-middle-1','single-base-3'],pairing:'로즈와 샌달우드로 소중한 장면의 부드러움과 깊이를 표현했어요.'},
    {id:'sunny',label:'맑은 날 · 햇살',group:'날씨',words:['맑은','맑고','화창','햇살','햇빛','쨍쨍','푸른 하늘','파란 하늘','여름'],title:'햇살을 닮은 밝은 한 방울',meaning:'햇살이 비치는 장면을 선명한 시트러스와 밝은 과일의 이미지로 담았어요.',notes:['시트러스','레몬','만다린','유자','프루티'],support:['마린','그린'],singles:['single-top-5','single-middle-6'],pairing:'레몬의 선명함과 아카시아의 화사한 이미지를 더했어요.'},
    {id:'rainy',label:'비 오는 날',group:'날씨',words:['비 오는','비오는','빗소리','빗방울','장마','우산','촉촉','비가','비 내리','비내리','흐린'],title:'빗소리 사이로 피어나는 이야기',meaning:'비 오는 풍경을 젖은 잎과 꽃, 부드러운 나무의 이미지로 표현했어요.',notes:['그린','장미','로즈','모스','우디','아쿠아틱','레인'],support:['바이올렛','머스크'],singles:['single-middle-10','single-base-1'],pairing:'바이올렛 리프와 모스로 빗방울이 맺힌 정원의 이미지를 담았어요.'},
    {id:'spring',label:'봄 · 꽃바람',group:'날씨',words:['봄','벚꽃','꽃바람','꽃길','피어나','꽃이'],title:'다시 피어나는 나의 계절',meaning:'새 계절의 이야기를 가볍고 화사한 꽃과 싱그러운 잎의 이미지로 연결했어요.',notes:['프리지아','피오니','튤립','플로럴'],support:['그린','배','자스민'],singles:['single-middle-2','single-top-7'],pairing:'라일락과 청포도로 봄날의 꽃과 생기 있는 과일 이미지를 더했어요.'},
    {id:'winter',label:'눈 오는 날 · 겨울',group:'날씨',words:['눈 오는','눈오는','눈이','겨울','추운','쌀쌀','찬바람','가을','낙엽'],title:'차가운 계절에 남기는 따뜻함',meaning:'서늘한 날의 이야기를 니트 같은 포근함과 나무의 이미지로 풀었어요.',notes:['바닐라','샌달우드','앰버','파우더','우디'],support:['머스크','시더우드'],singles:['single-base-7','single-middle-7'],pairing:'바닐라와 라벤더로 따뜻한 색감과 부드러운 여운의 이미지를 골랐어요.'}
  ];
  const compact=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\s+/g,'');
  function analyze(text,explicit=[]){
    const clean=compact(String(text||'').slice(0,800));
    const selected=new Set(explicit.filter(id=>themes.some(t=>t.id===id)));
    const detected=[];
    const negatives={happiness:/행복하지않|행복하지못|행복한게아니|기쁘지않|기쁘지못/,joy:/즐겁지않|즐겁지못|즐거운게아니|재미없|재밌지않/,excitement:/설레지않|설레지못/,love:/사랑이아니|사랑은아니|사랑하지않/,calm:/차분하지않|차분하지못/,energy:/활기없|활기가없|기운없|기운이없/};
    for(const theme of themes){const matches=theme.words.filter(word=>clean.includes(compact(word)));if(matches.length&&!negatives[theme.id]?.test(clean))detected.push({theme,matches:[...new Set(matches)]});}
    return themes.filter(t=>selected.has(t.id)||detected.some(d=>d.theme.id===t.id)).map(theme=>({theme,explicit:selected.has(theme.id),matches:detected.find(d=>d.theme.id===theme.id)?.matches||[]}));
  }
  function matchesNote(note,keywords){const clean=compact(note);return keywords.some(k=>!(k==='로즈'&&clean.includes('로즈마리'))&&clean.includes(compact(k)));}
  function buildRecommendations(catalog,points){
    if(!points.length)return [];
    const themesSelected=points.map(p=>p.theme);
    const love=themesSelected.some(t=>t.id==='love');
    const candidates=catalog.mainScents.filter(s=>s.noteSource).map(s=>{
      const notes=Object.values(s.notes||{}).flat();const matchText=[...notes,...(s.accords||[])];
      const matched=themesSelected.map(theme=>({theme,primary:matchText.filter(n=>matchesNote(n,theme.notes)),support:matchText.filter(n=>matchesNote(n,theme.support))})).filter(m=>m.primary.length||m.support.length);
      // When love is explicitly present, guarantee a rose-bearing reference.
      if(love&&!notes.some(n=>/장미|로즈/.test(n)&&!n.includes('로즈마리')))return null;
      let score=0;for(const m of matched)score+=Math.min(m.primary.length,3)*3+Math.min(m.support.length,2);
      score+=matched.length*2;if(!score)return null;
      return {main:s,score,matched};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||Number(a.main.number)-Number(b.main.number));
    const selected=[];const identities=new Set();
    for(const candidate of candidates){if(identities.has(candidate.main.id))continue;selected.push(candidate);identities.add(candidate.main.id);if(selected.length===3)break;}
    return selected.map((c,i)=>{
      // Vary the focal theme across alternatives while preserving the combined story.
      const theme=c.matched[i%c.matched.length]?.theme||themesSelected[0];
      const ids=[...new Set(theme.singles)].filter(id=>catalog.singleScents.some(s=>s.id===id));
      const singles=ids.map(id=>catalog.singleScents.find(s=>s.id===id));
      const reasons=c.matched.slice(0,3).map(m=>({point:m.theme.label,notes:[...new Set(m.primary.length?m.primary:m.support)].slice(0,3),meaning:m.theme.meaning}));
      return {main:c.main,singles,title:theme.title,pairing:theme.pairing,reasons,points:themesSelected.map(t=>t.label)};
    });
  }
  root.StoryScent={themes,analyze,buildRecommendations};
})(globalThis);
