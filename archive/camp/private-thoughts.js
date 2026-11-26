export const DREAMS=[
 '오늘의 나에게 수고했다고 해주고 싶다.','내일 아침에는 조금 천천히 일어나볼까.','나중에 이 밤을 생각하면 어떤 향이 떠오를까.','누군가에게 안부 한 줄 보내볼까.','다음에 올 때는 친구도 함께 오면 좋겠다.','따뜻한 감자 하나면 충분한 밤이야.','문득 어릴 때 걷던 골목이 떠오른다.','책 한 장만 더 읽고 일어날까.','한동안 아무 생각 없이 있어도 괜찮겠다.','파도는 쉬지 않는데 나는 잠깐 쉬어도 되겠지.','오늘 웃었던 순간이 하나쯤 있었지.','집에 가는 길에 달도 함께 걸어오겠네.','좋아하는 사람은 지금 무엇을 하고 있을까.','이 순간을 작은 수첩에 접어두고 싶다.','숲 냄새가 날 것 같은 밤이다.','별 이름 하나쯤 알아두면 좋겠다.','미뤄둔 일이 있어도 지금은 쉬는 시간.','내일은 평소와 다른 길로 걸어볼까.','나를 기분 좋게 하는 건 의외로 작구나.','살짝 졸린데 이 온기가 참 좋다.'
];
export function thoughtPool(custom=[],defaults=[]){return [...new Set([...custom,...defaults,...DREAMS])].filter(Boolean);}
export function randomThought(lines,previous,random=Math.random){const choices=lines.filter(t=>t!==previous);return choices[Math.floor(random()*choices.length)]||lines[0]||DREAMS[0];}
export function rememberThought(rows,text,now=Date.now()){text=String(text||'').trim().slice(0,100);if(!text)return rows;return [{text,at:now},...rows.filter(r=>r.text!==text)].slice(0,100);}
