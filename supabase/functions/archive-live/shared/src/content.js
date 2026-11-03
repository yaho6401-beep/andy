export const SPACES={garden:'햇살 향기 정원',lobby:'향기박물관 로비',scents:'향기 아카이브',books:'책의 정원',salon:'향기카페'};
export const SCENTS=[
 {id:'citrus',name:'햇살의 시트러스',family:'시트러스',color:'#e6c871',notes:'베르가모트 · 레몬 · 그린',mood:'산뜻함 · 활기',story:'낯선 도시의 아침. 가방을 가볍게 들고 골목으로 나서는 순간처럼 밝고 경쾌한 인상입니다.'},
 {id:'floral',name:'편지 속의 장미',family:'플로럴',color:'#d7a1b5',notes:'장미 · 피오니 · 소프트 머스크',mood:'다정함 · 설렘',story:'오래 접어 둔 편지를 펼칠 때처럼, 조심스럽게 마음을 건네는 꽃의 분위기입니다.'},
 {id:'woody',name:'오래된 서가',family:'우디',color:'#ad8865',notes:'시더 · 샌들우드 · 베티버',mood:'안정감 · 깊이',story:'손때 묻은 책장과 느린 오후. 따뜻한 나무의 인상으로 차분한 시간을 떠올려 보세요.'},
 {id:'musk',name:'깨끗한 페이지',family:'머스크',color:'#c6c9b7',notes:'화이트 머스크 · 앰브레트',mood:'포근함 · 친밀함',story:'잘 말린 셔츠와 새 공책. 가까이 있을 때 편안한, 부드러운 여백의 분위기입니다.'},
 {id:'powder',name:'라일락의 오후',family:'파우더리',color:'#b9a6cf',notes:'아이리스 · 바이올렛 · 파우더',mood:'단정함 · 여운',story:'햇빛이 비치는 창가에 앉아 오늘을 정리합니다. 분가루처럼 부드러운 인상을 상상해 보세요.'}
];
export const BOOKS=[
{id:'proust',name:'스완네 집 쪽으로',author:'마르셀 프루스트',genre:'소설 · 기억',color:'#c3b3cf',line:'어떤 향은 잊고 있던 시간으로 들어가는 작은 문이 됩니다.',intro:'『잃어버린 시간을 찾아서』의 첫 권. 차에 적신 마들렌의 감각이 어린 시절을 되살리는 장면으로, 감각과 기억의 관계를 이야기할 수 있어요.',question:'당신에게 오래된 장면을 떠올리게 하는 향은 무엇인가요?',source:'https://www.gutenberg.org/ebooks/7178'},
{id:'perfume',name:'향수: 어느 살인자의 이야기',author:'파트리크 쥐스킨트',genre:'소설 · 후각',color:'#b7bfa2',line:'눈으로만 보던 세계를, 오늘은 향의 언어로 상상해 봅니다.',intro:'탁월한 후각을 지닌 인물을 통해 향에 대한 집착과 인간의 욕망을 다루는 소설입니다. 이 전시에서는 줄거리를 길게 옮기지 않고 향을 묘사하는 방식에 주목해요.',question:'장소 하나를 색이나 모양 없이 냄새만으로 소개한다면?',source:'https://www.penguinrandomhouse.com/books/175395/perfume-by-patrick-suskind/'},
{id:'anne',name:'빨강 머리 앤',author:'루시 모드 몽고메리',genre:'소설 · 성장',color:'#d1b98b',line:'익숙한 풍경도 다정한 이름을 붙이면 새 이야기가 됩니다.',intro:'상상력이 풍부한 앤이 새로운 집과 마을에서 관계를 맺고 자라가는 이야기예요. 자연과 장소에 특별한 이름을 붙이는 마음을 나눠 보세요.',question:'지금 이 정원에 당신만의 이름을 붙여준다면?',source:'https://www.gutenberg.org/ebooks/45'},
{id:'pride',name:'오만과 편견',author:'제인 오스틴',genre:'소설 · 관계',color:'#c4a9b9',line:'처음의 인상보다, 함께 나눈 이야기가 오래 남기를.',intro:'엘리자베스와 다아시의 관계를 통해 첫인상과 판단, 오해와 이해를 살펴보는 소설입니다. 서로의 취향을 알아가는 대화와도 잘 어울려요.',question:'누군가와 대화한 뒤 첫인상이 달라진 적이 있나요?',source:'https://www.gutenberg.org/ebooks/1342'}
];
export const SCENT_STORIES=[{title:'향으로 기억하는 시간',line:'향기는 지나간 하루가 다시 건네는 인사입니다.',label:'책과향기 창작 문장',book:'proust'},{title:'보이지 않는 풍경',line:'이름을 붙이지 못한 마음에도, 어울리는 향은 있습니다.',label:'책과향기 창작 문장',book:'perfume'},{title:'나무가 품은 이야기',line:'오래된 서가에는 아직 펼치지 않은 오후가 남아 있습니다.',label:'책과향기 창작 문장',book:'anne'}];
export const QUESTIONS=['비 오는 날, 어떤 향이 떠오르나요?','첫사랑을 향으로 표현한다면?','내가 가장 좋아하는 계절의 향은?','나를 표현하는 향 한 가지는?','상대에게 추천하고 싶은 책은?','어떤 이야기에 가장 마음이 움직이나요?'];
export const BALANCE=[{question:'비 오는 날의 나',a:'젖은 숲과 오래된 서가',b:'따뜻한 차와 포근한 머스크'},{question:'첫 만남의 향',a:'밝고 가벼운 시트러스',b:'다정하게 피어나는 플로럴'},{question:'책을 고른다면',a:'새로운 세계로 가는 소설',b:'오늘의 마음을 돌보는 에세이'}];
export const PHASES=[{name:'입장 · 아바타 선택',minutes:5},{name:'향기로 자기소개',minutes:10},{name:'책과 향 소그룹 대화',minutes:20},{name:'취향 밸런스 게임',minutes:10},{name:'마무리 · 비공개 선택',minutes:5}];
export const CONTENT={scents:SCENTS,books:BOOKS,questions:QUESTIONS};
