import '../feedback-config.js';
const endpoint='https://jqlrwwheiwjdrobluifx.supabase.co/functions/v1/feedback-wall';
const cfg=globalThis.FeedbackConfig;
const clean=(v,max)=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max):'';
const count=v=>Math.max(0,Math.min(1000000,Math.floor(Number(v)||0)));
export function publicPage(value){const page=Number(value||1);if(!Number.isInteger(page)||page<1||page>10000)throw Error('페이지 번호를 확인해 주세요.');return page;}
export function cleanPublicPage(data){
 if(!data||!Array.isArray(data.items))throw Error('게시판 응답을 확인할 수 없어요.');
 return {page:Math.max(1,count(data.page)),pages:Math.max(1,count(data.pages)),total:count(data.total),items:data.items.slice(0,9).filter(n=>n&&n.hidden!==true&&/^[0-9a-f-]{36}$/i.test(n.id||'')).map(n=>({id:n.id,nickname:clean(n.nickname,20)||'익명',body:clean(n.body,200),category:['message','request','improvement'].includes(n.category)?n.category:'message',color:['butter','rose','lavender','sage','sky','peach'].includes(n.color)?n.color:'butter',animal:clean(n.animal,16),created_at:Number.isFinite(Date.parse(n.created_at))?new Date(n.created_at).toISOString():null,hearts:count(n.hearts),comments:count(n.comments)}))};
}
export function createPublicBoardReader({fetchImpl=fetch,clock=Date.now}={}){
 const cache=new Map();
 return async rawPage=>{
  const page=publicPage(rawPage),previous=cache.get(page);
  if(previous?.expires>clock())return previous.value;if(previous?.pending)return previous.pending;
  const pending=(async()=>{
   if(cfg?.endpoint!==endpoint||!cfg?.key?.startsWith('sb_publishable_'))throw Error('공개 게시판 연결을 확인해 주세요.');
   // Only this known public GET is allowed. Never forward visitor/admin credentials.
   const response=await fetchImpl(endpoint+'?page='+page,{method:'GET',headers:{apikey:cfg.key},signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw Error('공개 게시글을 불러오지 못했어요.');
   const value=cleanPublicPage(await response.json());cache.set(page,{value,expires:clock()+20000});
   while(cache.size>24)cache.delete(cache.keys().next().value);return value;
  })();cache.set(page,{pending});
  try{return await pending;}catch(error){cache.delete(page);throw error;}
 };
}
export const readPublicBoard=createPublicBoardReader();
export default async function handler(req,res){
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'게시판 읽기만 지원합니다.'});}
 let page;try{page=publicPage(new URL(req.url,'http://localhost').searchParams.get('page'));}catch(error){return res.status(400).json({error:error.message});}
 try{const result=await readPublicBoard(page);res.setHeader('Cache-Control','public, s-maxage=15, stale-while-revalidate=15');return res.status(200).json(result);}
 catch{return res.status(502).json({error:'게시글을 불러오지 못했어요. 잠시 후 다시 열어주세요.'});}
}
