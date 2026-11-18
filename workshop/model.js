import {INGREDIENTS} from '../archive/src/scent-exhibits.js';
export const GROUPS=[{note:'top',prefix:'T',label:'TOP',title:'첫인상',description:'가장 먼저 만나는 산뜻한 시작'},{note:'middle',prefix:'M',label:'MIDDLE',title:'중심',description:'이야기의 분위기를 만드는 향'},{note:'base',prefix:'L',label:'LAST',title:'여운',description:'천천히 남는 마지막 인상'}];
export const FAMILIES={citrus:{name:'시트러스',color:'#e4bf51',intro:'맑고 경쾌한',detail:'껍질을 스칠 때처럼 산뜻한 밝기'},fruit:{name:'프루티',color:'#d48479',intro:'발랄하고 달콤한',detail:'촉촉한 과즙을 닮은 생기'},green:{name:'그린·허벌',color:'#8b9d78',intro:'싱그럽고 담백한',detail:'잎과 허브를 닮은 정돈된 초록'},floral:{name:'플로럴',color:'#c898ab',intro:'부드럽고 우아한',detail:'꽃잎처럼 은은하게 번지는 분위기'},marine:{name:'아쿠아',color:'#8bb9c1',intro:'시원하고 투명한',detail:'물과 바람을 떠올리는 여백'},wood:{name:'우디',color:'#b08e6c',intro:'차분하고 깊이 있는',detail:'숲과 나무를 닮은 안정적인 결'},soft:{name:'머스크·파우더리',color:'#c0b6c7',intro:'보송하고 편안한',detail:'깨끗한 옷감처럼 포근한 마무리'},warm:{name:'앰버·스위트',color:'#c69960',intro:'따뜻하고 아늑한',detail:'크리미한 단맛과 둥근 온기'}};
const byFamily={citrus:['T1','T2','T5','T6'],fruit:['T4','T7','T8','T9','T10'],green:['T3','M7','M8','M10','L10'],floral:['M1','M2','M3','M4','M6','M9'],marine:['M5'],wood:['L1','L2','L3','L4'],soft:['L5','L8','L9'],warm:['L6','L7']};
export const SCENTS=INGREDIENTS.map(s=>({...s,family:Object.keys(byFamily).find(f=>byFamily[f].includes(s.code))}));
const index=new Map(SCENTS.map(s=>[s.code,s]));
export const DEFAULT_TARGET=70,MAX_SCENTS=8,MIN_SCENTS=3,RECORD_KEY='books-scents-workshop-records-v1';
function positive(value){return /^\d+$/.test(String(value))&&Number.isSafeInteger(Number(value))&&Number(value)>0&&Number(value)<=9999;}
export function validateRecipe(recipe){
 const entries=Array.isArray(recipe?.ingredients)?recipe.ingredients:[],errors=[],target=positive(recipe?.targetTotal)?Number(recipe.targetTotal):null;
 if(entries.length<MIN_SCENTS||entries.length>MAX_SCENTS)errors.push('향은 최소 3개, 최대 8개 골라주세요.');
 if(new Set(entries.map(s=>s.code)).size!==entries.length||entries.some(s=>!index.has(s.code)))errors.push('향 번호를 다시 확인해주세요.');
 if(target===null)errors.push('목표 방울 수는 1~9,999 사이의 정수로 적어주세요.');
 if(entries.some(s=>!positive(s.drops)))errors.push('선택한 향마다 1방울 이상 정수로 입력해주세요.');
 const total=entries.reduce((sum,s)=>sum+(positive(s.drops)?Number(s.drops):0),0);
 if(target!==null&&total!==target)errors.push(total<target?`${target-total}방울 더 입력하면 목표와 같아져요.`:`목표보다 ${total-target}방울 많아요.`);
 return {valid:errors.length===0,errors,total,target,count:entries.length};
}
const subject=name=>{const c=name.charCodeAt(name.length-1)-0xac00;return c>=0&&c<=11171&&c%28?'이':'가';};
export function blendRecipe(recipe){
 const checked=validateRecipe(recipe);if(!checked.valid)throw Error(checked.errors[0]);
 const ingredients=recipe.ingredients.map(s=>({...index.get(s.code),drops:Number(s.drops)})).sort((a,b)=>SCENTS.indexOf(index.get(a.code))-SCENTS.indexOf(index.get(b.code)));
 const totals=Object.fromEntries(GROUPS.map(g=>[g.note,ingredients.filter(s=>s.note===g.note).reduce((n,s)=>n+s.drops,0)]));
 const families=Object.entries(FAMILIES).map(([id,f])=>({id,...f,drops:ingredients.filter(s=>s.family===id).reduce((n,s)=>n+s.drops,0)})).filter(f=>f.drops).sort((a,b)=>b.drops-a.drops);
 const [first,second]=families,leaders=[...ingredients].sort((a,b)=>b.drops-a.drops).slice(0,2),names=leaders.map(s=>s.name).join(' · ');
 const lines=[`${first.intro} ${first.name}${second?'에 '+second.name+'의 인상이 더해진':'의 결이 중심인'} 조합이에요.`,`${names}${subject(leaders.at(-1).name)} 조합의 중심을 이룹니다.`,totals.top/checked.total>=.5?'가볍고 산뜻한 첫인상을 상상해보세요.':totals.base/checked.total>=.5?'천천히 머무는 잔향 쪽에 무게를 둔 스타일이에요.':totals.middle/checked.total>=.5?'이야기의 중심이 되는 향이 부드럽게 펼쳐지는 스타일이에요.':'산뜻한 시작에서 중심과 여운으로 이어지는 흐름을 상상해보세요.'];
 return {version:1,kind:'individual',base:null,ingredients:ingredients.map(({id,code,name,note,drops,family})=>({id,code,name,note,drops,family})),targetTotal:checked.target,totalDrops:checked.total,noteTotals:totals,families,description:lines,mood:first.name,color:first.color,accent:second?.color||first.color};
}
export function createRecord(blend,name,{id=globalThis.crypto.randomUUID(),now=new Date()}={}){
 name=String(name??'').trim();if(!name||name.length>40)throw Error('향수 이름을 1~40자로 적어주세요.');
 const result=blendRecipe(blend);return {version:1,id,createdAt:now.toISOString(),name,...result};
}
function validRecord(r){try{return r?.version===1&&typeof r.id==='string'&&r.id.length<=100&&typeof r.name==='string'&&r.name.trim().length>0&&r.name.length<=40&&Number.isFinite(Date.parse(r.createdAt))&&validateRecipe(r).valid&&r.totalDrops===Number(r.targetTotal)&&Array.isArray(r.description)&&r.description.length<=4&&r.description.every(s=>typeof s==='string'&&s.length<1000);}catch{return false;}}
export function readRecords(storage){
 const raw=storage.getItem(RECORD_KEY);if(!raw)return [];
 let data;try{data=JSON.parse(raw);}catch{throw Error('저장된 기록을 읽지 못했어요. 기존 데이터는 그대로 보관하고 있어요.');}
 if(data?.version!==1||!Array.isArray(data.records)||!data.records.every(validRecord))throw Error('저장된 기록 형식을 확인할 수 없어 덮어쓰지 않았어요.');
 return data.records;
}
export function saveRecord(storage,record){
 if(!validRecord(record))throw Error('기록 내용을 다시 확인해주세요.');const records=readRecords(storage);if(records.some(r=>r.id===record.id))return records;
 if(records.length>=200)throw Error('기록이 200개예요. 필요 없는 기록을 지운 뒤 다시 저장해주세요.');
 const next=[record,...records];storage.setItem(RECORD_KEY,JSON.stringify({version:1,records:next}));return next;
}
export function deleteRecord(storage,id){const next=readRecords(storage).filter(r=>r.id!==id);storage.setItem(RECORD_KEY,JSON.stringify({version:1,records:next}));return next;}
