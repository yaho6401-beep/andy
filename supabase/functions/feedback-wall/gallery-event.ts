type EventDeps={url:string;dbHeaders:Record<string,string>;reply:(b:unknown,s?:number)=>Response;rpc:(name:string,args:Record<string,unknown>)=>Promise<any>;limited:(r:Request,k:string,n:number)=>Promise<boolean>;sessionHash:(r:Request)=>Promise<string|null>;visitorHash:(s:string)=>Promise<string>};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function handleGalleryEvent(req:Request,d:EventDeps){
 const call=async(name:string,args:Record<string,unknown>)=>{const r=await d.rpc(name,args);if(!r.ok)throw Error('event rpc');return r.json();};
 const path=new URL(req.url).pathname,admin=path.endsWith('/contacts')||path.endsWith('/finalize');
 if(admin&&!await d.sessionHash(req))return d.reply({error:'관리자 로그인이 필요해요.'},401);
 if(req.method==='GET'&&path.endsWith('/contacts')){
  const page=Number(new URL(req.url).searchParams.get('page')||1);if(!Number.isInteger(page)||page<1||page>10000)return d.reply({error:'사진 목록을 확인해주세요.'},400);
  const r=await fetch(d.url+'/rest/v1/workshop_gallery_contacts?select=photo_id,phone,consent_at,workshop_gallery(nickname,caption,created_at)&order=consent_at.desc&limit=200&offset='+((page-1)*200),{headers:d.dbHeaders});
  if(!r.ok)throw Error('event contacts');return d.reply({items:await r.json()});
 }
 if(req.method!=='POST')return d.reply({error:'지원하지 않는 요청입니다.'},405);
 if(!await d.limited(req,'gallery-event',60))return d.reply({error:'잠시 후 다시 시도해주세요.'},429);
 const reader=req.body?.getReader();if(!reader)return d.reply({error:'잘못된 요청입니다.'},400);
 let size=0,parts:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return d.reply({error:'요청이 너무 큽니다.'},413);}parts.push(value);}
 let input;try{input=JSON.parse(await new Blob(parts).text());}catch{return d.reply({error:'잘못된 요청입니다.'},400);}
 if(path.endsWith('/finalize')){
  if(!/^\d{4}-\d{2}-01$/.test(input.month||''))return d.reply({error:'마감할 월을 선택해주세요.'},400);
  try{return d.reply({award:await call('workshop_gallery_finalize',{p_month:input.month})});}catch{return d.reply({error:'지난달까지 마감할 수 있어요. 좋아요를 받은 참여 사진이 있어야 합니다.'},409);}
 }
 if(!uuid.test(input.visitorId||''))return d.reply({error:'브라우저 식별자를 확인해주세요.'},400);
 const visitor=await d.visitorHash(input.visitorId);
 if(path.endsWith('/like')){
  if(!uuid.test(input.id||''))return d.reply({error:'사진을 확인해주세요.'},400);
  return d.reply(await call('workshop_gallery_vote',{p_id:input.id,p_visitor:visitor}));
 }
 if(!Array.isArray(input.ids)||input.ids.length>9||input.ids.some((id:unknown)=>typeof id!=='string'||!uuid.test(id)))return d.reply({error:'사진 목록을 확인해주세요.'},400);
 return d.reply(await call('workshop_gallery_event',{p_ids:input.ids,p_visitor:visitor}));
}
