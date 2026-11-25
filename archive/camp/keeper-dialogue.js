import {NpcReplies} from '../src/npc-dialogue.js';
export const SECRET_MS=10*60*1000;
export const cleanQuestion=value=>String(value??'').normalize('NFKC').replace(/\s+/g,' ').trim().slice(0,200);
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[^가-힣a-z0-9]/g,'');
export function isSecretQuestion(value){const q=norm(cleanQuestion(value));if(/목사.{0,3}(아니|아닌|아닙|안했|안하)/.test(q))return false;return /목사(?:님)?(?:이?셨|였|이었|세|이세|맞|라면서|라고|하셨)/.test(q)||/(?:전에|이전|전직|예전).{0,12}목사(?:님)?(?:이|였|셨|세|요|죠)/.test(q);}
export function validSecretUntil(value,now=Date.now()){const n=Number(value);return Number.isFinite(n)&&n>now&&n<=now+SECRET_MS+5000?n:0;}
export function secretActive(until,now=Date.now()){return validSecretUntil(until,now)>0;}
export const SMALL_TALK=[
 {id:'hello',label:'오늘은 어떠세요?',answer:'잘 쉬고 계세요? 저는 바닷가를 한 바퀴 돌아왔어요. 별일 없는 하루도 이렇게 앉아 있으면 꽤 괜찮더라고요.'},
 {id:'meal',label:'오늘 뭐 드셨어요?',answer:'따뜻한 밥에 국 한 그릇이요. 캠핑장에서는 감자 하나만 구워도 괜히 더 맛있어요. 오늘은 어떤 음식이 생각나세요?'},
 {id:'weather',label:'날씨가 좋네요',answer:'맑은 날은 달빛이 좋고, 비 오는 날은 빗소리가 좋지요. 다만 옷이 젖었다면 불가에서 잠깐 말리고 가세요.'},
 {id:'books',label:'무슨 책을 읽을까요?',answer:'오늘 마음이 가는 책 한 권이면 충분해요. 두 텐트에는 성경전서가 있고, 도서관에는 세계명작도 있어요. 한 부분만 읽어도 괜찮아요.'},
 {id:'rest',label:'그냥 쉬러 왔어요',answer:'잘 오셨어요. 뭘 꼭 해내지 않아도 되는 시간도 있어야지요. 불이 타는 소리만 잠깐 같이 들어볼까요?'},
 {id:'cats',label:'고양이가 귀여워요',answer:'여기 고양이들은 저보다 길을 잘 알아요. 비가 오면 먼저 텐트로 들어가고요. 가끔 곁에 와 앉으면 저도 말없이 같이 있어요.'},
 {id:'sea',label:'바다 보러 갈까요?',answer:'해변 벤치에서 파도를 보고 오셔도 좋아요. 발목까지 물을 밟았다면 돌아와 따뜻한 불을 쬐고요.'},
 {id:'day',label:'오늘 좀 힘들었어요',answer:'그런 날이 있지요. 오늘 일을 다 설명하지 않아도 괜찮아요. 잠깐 숨을 고르고 따뜻한 것을 한 모금 마셔보세요.'}
];
export function casualReply(question,random=Math.random,replies=null,topic=null){const q=norm(question),rules=[[/고마|감사/,'thanks'],[/커피|음료|차한잔/,'drinks'],[/안녕|반가|누구|이름|오늘.*어떠|안부/,'hello'],[/밥|식사|점심|저녁|먹|드셨|배고/,'meal'],[/날씨|비가|바람|춥|덥|달빛/,'weather'],[/책|독서|성경/,'books'],[/고양|야옹/,'cats'],[/바다|파도|해변/,'sea'],[/힘들|슬프|지쳐|피곤|우울/,'day'],[/휴식|쉬러|불멍|조용/,'rest']];return (replies||new NpcReplies(random)).reply(topic||rules.find(([rx])=>rx.test(q))?.[1]||'rest');}
export function findGlossary(entries,question,limit=3){const q=norm(cleanQuestion(question));if(!q)return [];const words=cleanQuestion(question).split(/[^가-힣A-Za-z0-9]+/).map(norm).map(w=>w.replace(/(?:이라는|이란|에서는|에서|이랑|은|는|을|를|이|가|에|의|도|와|과)$/,'')).filter(w=>w.length>=2&&!/^(무엇|뭐예요|뜻인가요|설명해주세요|알려주세요)$/.test(w));return entries.map((entry,index)=>{const t=norm(entry.term);let score=0;if(t===q)score=100;else if(t.length>=2&&q.includes(t))score=80+Math.min(15,t.length);else if(t.length===1&&(q===t||new RegExp('^'+t+'(?:은|는|이|가|을|를|뜻|뭐|무엇)').test(q)))score=70;else if(words.some(w=>w.length>=2&&t.startsWith(w)))score=50;else{const text=norm(entry.paragraphs.join(' '));score=words.reduce((s,w)=>s+(text.includes(w)?Math.min(w.length,7):0),0);if(score<2)score=0;}return {entry,score,index};}).filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,limit).map(r=>r.entry);}
