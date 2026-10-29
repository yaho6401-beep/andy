(function(root){
  'use strict';
  const styles = [
    {id:'minimal',name:'클린 미니멀',english:'Clean &\nMinimal',mood:'깨끗하고 담백한 분위기',bg:'#e2e8de',colors:[['아이보리','#eeeadd'],['세이지','#a4b29b'],['차콜','#50554e']],look:'아이보리 셔츠에 차콜 스트레이트 팬츠, 단정한 로퍼를 매치해보세요.',fabric:'코튼 · 매끈한 니트',occasion:'일상 · 출근 · 전시회',reason:'맑고 정돈된 향의 인상을 간결한 실루엣과 차분한 색으로 이어가는 스타일이에요.'},
    {id:'romantic',name:'소프트 로맨틱',english:'Soft &\nRomantic',mood:'부드럽고 화사한 분위기',bg:'#edddd8',colors:[['크림','#eee7d5'],['더스티 핑크','#cfa7a1'],['모브','#9b8190']],look:'크림 블라우스에 부드럽게 흐르는 스커트 또는 와이드 팬츠, 작은 액세서리를 더해보세요.',fabric:'시폰 · 실크 느낌 소재 · 얇은 니트',occasion:'데이트 · 브런치 · 기념일',reason:'꽃과 달콤한 향에서 연상되는 부드러움을 유연한 소재와 은은한 색으로 표현하는 스타일이에요.'},
    {id:'natural',name:'내추럴 무드',english:'Quiet &\nNatural',mood:'편안하고 여유로운 분위기',bg:'#dedfcc',colors:[['오트밀','#d7cdb8'],['올리브','#8a926c'],['브라운','#826a52']],look:'오트밀 니트 또는 리넨 셔츠에 여유 있는 베이지 팬츠, 스웨이드 슈즈를 골라보세요.',fabric:'리넨 · 코튼 · 스웨이드',occasion:'산책 · 카페 · 편안한 주말',reason:'풀과 나무에서 떠오르는 차분한 인상을 자연스러운 질감과 흙빛 색상으로 이어가는 스타일이에요.'},
    {id:'classic',name:'모던 클래식',english:'Modern &\nClassic',mood:'단정하고 깊이 있는 분위기',bg:'#dcdccc',colors:[['카멜','#b59a75'],['네이비','#3d4a59'],['에크루','#e8e2ce']],look:'네이비 재킷에 에크루 이너와 테일러드 팬츠, 가죽 로퍼를 매치해보세요.',fabric:'울 · 트윌 · 탄탄한 코튼',occasion:'출근 · 모임 · 격식 있는 자리',reason:'우디하거나 깊이 있는 향의 인상을 구조적인 재킷과 안정감 있는 색 조합으로 표현하는 스타일이에요.'},
    {id:'casual',name:'프레시 캐주얼',english:'Fresh &\nEasy',mood:'산뜻하고 경쾌한 분위기',bg:'#e4e5c9',colors:[['화이트','#f4f1e6'],['라이트 블루','#abc3cd'],['레몬','#ddd08a']],look:'화이트 티셔츠에 밝은 데님, 가벼운 스니커즈를 신고 작은 컬러 포인트를 더해보세요.',fabric:'코튼 · 데님 · 가벼운 저지',occasion:'주말 · 여행 · 친구와의 약속',reason:'과일과 시트러스의 경쾌한 인상을 밝은 색과 움직이기 편한 옷으로 풀어낸 스타일이에요.'},
    {id:'sporty',name:'쿨 스포티',english:'Cool &\nActive',mood:'시원하고 활기찬 분위기',bg:'#dbe5df',colors:[['아이스 블루','#b9d1d9'],['실버 그레이','#a9afb0'],['딥 네이비','#344a58']],look:'가벼운 바람막이에 깔끔한 티셔츠와 조거 또는 스트레이트 팬츠, 스니커즈를 매치해보세요.',fabric:'나일론 · 저지 · 가벼운 코튼',occasion:'야외 활동 · 여행 · 활동적인 주말',reason:'시원하고 상쾌한 향의 인상을 가벼운 겉옷과 활동적인 실루엣으로 이어가는 스타일이에요.'},
    {id:'chic',name:'딥 시크',english:'Deep &\nChic',mood:'선명하고 존재감 있는 분위기',bg:'#dcd4cb',colors:[['블랙','#353735'],['버건디','#74434b'],['웜 브라운','#987a60']],look:'블랙 셔츠 또는 니트에 곧게 떨어지는 팬츠, 가죽 재킷이나 작은 금속 액세서리를 더해보세요.',fabric:'가죽 · 새틴 · 촘촘한 니트',occasion:'저녁 약속 · 공연 · 특별한 모임',reason:'진하고 스파이시한 향에서 연상되는 존재감을 깊은 색과 선명한 실루엣으로 표현하는 스타일이에요.'},
    {id:'cozy',name:'코지 소프트',english:'Warm &\nCozy',mood:'포근하고 따뜻한 분위기',bg:'#e8dfce',colors:[['밀크 베이지','#dfd0b6'],['토프','#a2917d'],['코코아','#8a7161']],look:'밀크 베이지 니트에 편안한 팬츠, 부드러운 카디건과 스웨이드 슈즈를 더해보세요.',fabric:'니트 · 캐시미어 느낌 소재 · 코듀로이',occasion:'카페 · 휴식 · 편안한 만남',reason:'파우더와 달콤하고 포근한 향의 인상을 따뜻한 색과 부드러운 촉감으로 표현하는 스타일이에요.'}
  ];
  const rules=[
    [/비누|깨끗|머스크|섬유|화이트|은은/, {minimal:3,cozy:1}],
    [/플로럴|꽃향|프리지아|로즈|장미|부케|자스민|튤립|생화|피오니/, {romantic:3,natural:1}],
    [/시트러스|자몽|레몬|상큼|감귤|오렌지|만다린|활력/, {casual:3,sporty:1}],
    [/과일|프루티|복숭아|딸기|파인애플|사과|달콤|달달/, {casual:2,romantic:2}],
    [/우디|나무|우드|숲|풀향|풀잎|그린|허브|베티버/, {natural:3,classic:2}],
    [/시원|상쾌|바다|해변|아웃도어|스포티|역동|신선/, {sporty:3,casual:1}],
    [/클래식|고급|세련|우아|왕족|자신감/, {classic:3,chic:1}],
    [/포근|파우더|바닐라|크리미|코코넛/, {cozy:3,romantic:1}],
    [/가죽|스파이시|관능|강렬|오리엔탈|앰버|커피|초콜렛|진한|깊고/, {chic:3,classic:1}]
  ];
  // Editorial associations, not a measurement or simulation of the fixed recipe.
  const singleProfiles={
    top:[['베르가못',{casual:3,minimal:2}],['자몽',{casual:4,sporty:1}],['그린티',{natural:3,minimal:2}],['애플',{casual:3,romantic:1}],['레몬',{casual:3,sporty:2}],['만다린',{casual:3,romantic:1}],['청포도',{casual:3,minimal:1}],['스트로베리',{romantic:3,casual:2}],['퀸스 (모과)',{natural:2,casual:3}],['블랙체리',{romantic:2,chic:3}]],
    middle:[['로즈',{romantic:4,classic:1}],['라일락',{romantic:3,natural:1}],['자스민',{romantic:3,chic:1}],['일랑일랑',{romantic:2,chic:2}],['마린',{sporty:4,minimal:1}],['아카시아',{romantic:2,natural:2}],['라벤더',{natural:3,cozy:1}],['유칼립투스',{natural:2,sporty:3}],['카네이션',{classic:2,romantic:2}],['바이올렛 리프',{natural:3,minimal:2}]],
    base:[['모스 (이끼)',{natural:4,classic:1}],['패츌리',{chic:3,natural:2}],['샌달우드',{natural:3,cozy:2}],['시더우드',{classic:3,natural:2}],['화이트 머스크',{minimal:4,cozy:1}],['앰버',{chic:3,cozy:2}],['바닐라',{cozy:4,romantic:1}],['코튼 블라썸',{minimal:3,cozy:2}],['베이비 파우더',{cozy:4,romantic:1}],['밤부 (대나무)',{natural:3,minimal:2}]]
  };
  function singleName(s){return singleProfiles[s.note]?.[s.number-1]?.[0]||s.name;}
  function recommend(main,singles){
    if(!main)throw new Error('메인향을 먼저 선택해주세요.');
    const scores=Object.fromEntries(styles.map(s=>[s.id,0]));
    let evidence=0;
    for(const [regex,weights] of rules){if(regex.test(main.description||'')){for(const [id,v] of Object.entries(weights))scores[id]+=v;evidence++;}}
    // Keep total single-note influence stable as the number selected changes.
    for(const s of singles){const profile=singleProfiles[s.note]?.[s.number-1];if(profile)for(const [id,v] of Object.entries(profile[1]))scores[id]+=v*2/Math.max(singles.length,1);}
    if(!evidence&&!singles.length)return {ranked:[],missing:true,main,singles};
    const ranked=styles.map((s,index)=>({...s,score:scores[s.id],index})).filter(s=>s.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,3);
    return {ranked,missing:!main.description,main,singles};
  }
  root.ScentStyle={styles,singleName,recommend};
})(typeof globalThis!=='undefined'?globalThis:window);
