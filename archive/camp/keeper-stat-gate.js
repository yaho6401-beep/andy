export const STAT_TALK_MS=300000;
export const statCode=q=>String(q||'').normalize('NFKC').replace(/[\s.!?。？！]/g,'').match(/^피카[츄추](?:요)?$/)?.[0]?.replace(/요$/,'')||null;
export function asksCampVisitors(q){q=String(q||'').normalize('NFKC').replace(/\s/g,'');return /방문객|방문자|방문통계|조회수|(?:사람|손님).*(?:많|몇|얼마|통계|조회|인원|왔|오셨|방문)|(?:캠핑장|여기|이곳).*(?:인원|몇명|몇분|얼마나왔|많이왔)|(?:오늘|이번주|이번달).*(?:몇명|몇분|몇사람|얼마나왔)|(?:몇명|몇분).*(?:왔|방문|찾)/.test(q);}
export const SECRET_VISIT_REPLIES=['그건 비밀이에요. 캠핑장 기록은 조용히 간직하고 있지요.','비밀이랍니다. 다들 편히 쉬고 가셨으면 좋겠네요.','죄송한데, 그건 알려드릴 수 없어요. 우리끼리의 비밀이라서요.','그건 살짝 비밀로 해둘까요? 기록은 제가 잘 챙겨두고 있답니다.'];
