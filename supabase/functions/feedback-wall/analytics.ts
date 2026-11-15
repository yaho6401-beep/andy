type Deps={reply:(body:unknown,status?:number)=>Response;rpc:(name:string,body:unknown)=>Promise<Response>;sessionHash:(req:Request)=>Promise<string|null>};
export const actions=new Set(['home','make','community','explore','studio','visit','gallery','feedback','story','profile','selection','journal','spray','runner','longevity','vip','solo','archive','camp','instagram','youtube','blend_complete','blend_save']);
export function attribution(input:any){
 const label=(v:unknown)=>typeof v==='string'?v.toLowerCase().replace(/[^a-z0-9_.-]/g,'').slice(0,60):'';
 const host=typeof input.referrerHost==='string'&&/^[a-z0-9.-]{1,120}$/i.test(input.referrerHost)?input.referrerHost.toLowerCase():'';
 const utm=label(input.utmSource),medium=label(input.utmMedium),campaign=label(input.utmCampaign),content=label(input.utmContent);
 const match=(domain:string)=>host===domain||host.endsWith('.'+domain);
 let source='direct_unknown';
 if(utm)source=({ig:'instagram',insta:'instagram',naver:'naver',google:'google',yt:'youtube',qr:'store_qr',instagram:'instagram',youtube:'youtube',store_qr:'store_qr'})[utm]||'other_campaign';
 else if(match('instagram.com'))source='instagram';
 else if(match('naver.com'))source='naver';
 else if(match('google.com')||match('google.co.kr'))source='google';
 else if(match('youtube.com')||match('youtu.be'))source='youtube';
 else if(host&&host!=='andy-plum.vercel.app')source='other_referral';
 const page=typeof input.page==='string'&&/^\/(?:archive\/?|camp\/?|index\.html)?$/.test(input.page)?input.page:'/';
 return {source,referrer_host:host||null,medium:medium||null,campaign:campaign||null,content:content||null,device:['mobile','tablet','desktop'].includes(input.device)?input.device:'unknown',page};
}
export async function handleAnalytics(req:Request,d:Deps){
 if(!await d.sessionHash(req))return d.reply({error:'관리자 로그인이 필요해요.'},401);
 if(req.method!=='GET')return d.reply({error:'지원하지 않는 요청입니다.'},405);
 const params=new URL(req.url).searchParams,days=Number(params.get('days')||30),page=Number(params.get('page')||1),visitor=params.get('visitor');
 if(![1,7,30,90].includes(days)||!Number.isInteger(page)||page<1||page>10000||(visitor&&!/^[a-f0-9]{64}$/.test(visitor)))return d.reply({error:'조회 조건을 확인해주세요.'},400);
 const result=await d.rpc('workshop_analytics',{p_days:days,p_page:page,p_visitor:visitor});
 if(!result.ok)throw Error('analytics read');
 return d.reply(await result.json());
}
