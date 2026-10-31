import {handleLounge} from './lounge.ts';
import {handleGalleryEvent} from './gallery-event.ts';
import {handleGallery} from './gallery.ts';
import {handleScent} from './scent.ts';
import {handleGame} from './game.ts';
// Public guestbook: application-key authorization, bounded input, service-only tables.
const url=Deno.env.get('SUPABASE_URL')!;
const secretKeys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}');
const secret=secretKeys.default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const publicKeys=Object.values(JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}'));
const allowedKeys=new Set([...publicKeys,Deno.env.get('SUPABASE_ANON_KEY')].filter(Boolean));
const origins=new Set(['https://andy-plum.vercel.app']);
const categories=['improvement','request','message'];
const colors=['butter','rose','lavender','sage','sky','peach'];
const animals=['rat','ox','tiger','bunny','dragon','snake','horse','goat','monkey','rooster','dog','pig','bear','cat','fox'];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dbHeaders={'apikey':secret,'Content-Type':'application/json',...(secret.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${secret}`})};
const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');
async function digest(value:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));}
async function visitorHash(value:string){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('visitor:'+value)));
}
async function rpc(name:string,body:unknown){return fetch(`${url}/rest/v1/rpc/${name}`,{method:'POST',headers:dbHeaders,body:JSON.stringify(body)});}
async function limited(req:Request,kind:string,max:number){const r=await rpc('feedback_action_limit',{p_key:kind+':'+await rateKeyFor(req),p_limit:max});if(!r.ok)throw Error('limit');return await r.json();}
const cleanText=(value:unknown)=>typeof value==='string'?value.normalize('NFC').trim().replace(/\s+/g,' '):'';
async function passwordHash(password:string,salt:string,iterations=210000){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations,hash:'SHA-256'},key,256));
}
function equalHash(a:string,b:string){let different=a.length^b.length;for(let i=0;i<a.length;i++)different|=a.charCodeAt(i)^(b.charCodeAt(i)||0);return different===0;}
async function rateKeyFor(req:Request){
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||req.headers.get('cf-connecting-ip')||'unknown';
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${new Date().toISOString().slice(0,10)}:${ip}`)));
}
async function sessionHash(req:Request){
  const token=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  if(!/^[0-9a-f]{64}$/.test(token))return null;
  const hash=await digest(token);
  const query=new URLSearchParams({select:'token_hash',token_hash:`eq.${hash}`,expires_at:`gt.${new Date().toISOString()}`,limit:'1'});
  const result=await fetch(`${url}/rest/v1/workshop_feedback_sessions?${query}`,{headers:dbHeaders});
  if(!result.ok)throw Error('session');
  return (await result.json()).length?hash:null;
}

Deno.serve(async req=>{
  const origin=req.headers.get('origin');
  const headers:Record<string,string>={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
  if(origin&&origins.has(origin))Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'apikey, content-type, authorization','Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS'});
  const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(origin&&!origins.has(origin))return reply({error:'접근할 수 없는 주소입니다.'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(!allowedKeys.has(req.headers.get('apikey')||''))return reply({error:'연결 정보를 확인해주세요.'},401);
  try{
    const path=new URL(req.url).pathname.replace(/\/$/,'');
    const params=new URL(req.url).searchParams;
    if(/\/lounge\/(?:apply|applications(?:\/(?:status|delete))?)$/.test(path))return await handleLounge(req,{url,dbHeaders,reply,limited,sessionHash,visitorHash,cleanText});
    if(/\/game\/(?:start|checkpoint|claim|check-coupon|redeem|leaderboard)$/.test(path))return await handleGame(req,{url,dbHeaders,reply,rpc,limited,sessionHash,visitorHash});
    if(/\/scent(?:\/(?:like|review|delete|staff(?:\/delete)?))?$/.test(path))return await handleScent(req,{url,dbHeaders,reply,rpc,limited,sessionHash,visitorHash,passwordHash,equalHash,rateKeyFor,cleanText});
    if(/\/gallery\/(?:event|like|contacts|finalize)$/.test(path))return await handleGalleryEvent(req,{url,dbHeaders,reply,rpc,limited,sessionHash,visitorHash});
    if(/\/gallery(?:\/delete)?$/.test(path))return await handleGallery(req,{url,dbHeaders,reply,limited,sessionHash,passwordHash,equalHash,cleanText});
    if(req.method==='DELETE'){
      if(!await sessionHash(req))return reply({error:'관리자 로그인이 필요해요.'},401);
      const id=new URL(req.url).searchParams.get('id');if(!id||!uuid.test(id))return reply({error:'메모를 확인해주세요.'},400);
      const table=params.get('target')==='comment'?'workshop_feedback_comments':'workshop_feedback';
      const result=await fetch(`${url}/rest/v1/${table}?id=eq.${id}`,{method:'DELETE',headers:{...dbHeaders,Prefer:'return=representation'}});
      if(!result.ok)throw Error('delete');
      return reply({deleted:true});
    }
    if(req.method==='POST'&&path.endsWith('/admin/logout')){
      const hash=await sessionHash(req);
      if(hash){const result=await fetch(`${url}/rest/v1/workshop_feedback_sessions?token_hash=eq.${hash}`,{method:'DELETE',headers:dbHeaders});if(!result.ok)throw Error('logout');}
      return reply({loggedOut:true});
    }
    if(req.method==='GET'){
      if(path.endsWith('/stats')){
        const result=await rpc('workshop_visit_stats',{});if(!result.ok)throw Error('stats');const stats=await result.json();
        if(path.endsWith('/admin/stats')){if(!await sessionHash(req))return reply({error:'관리자 로그인이 필요해요.'},401);return reply(stats);}
        const all=await fetch(`${url}/rest/v1/workshop_site_events?select=id&kind=eq.visit`,{method:'HEAD',headers:{...dbHeaders,Prefer:'count=exact'}});
        if(!all.ok)throw Error('total stats');
        const total=all.headers.get('content-range')?.split('/')[1];
        if(!total||!/^\d+$/.test(total))throw Error('total count');
        return reply({date:stats.date,visitors:stats.visitors,views:stats.views,totalViews:Number(total)});
      }
      const page=Number(params.get('page')||1);if(!Number.isInteger(page)||page<1||page>10000)return reply({error:'잘못된 페이지입니다.'},400);
      if(path.endsWith('/comments')){
        const id=params.get('id');if(!id||!uuid.test(id))return reply({error:'메모를 확인해주세요.'},400);
        const parent=await fetch(`${url}/rest/v1/workshop_feedback?select=id&id=eq.${id}&hidden=eq.false`,{headers:dbHeaders});
        if(!parent.ok)throw Error('parent');if(!(await parent.json()).length)return reply({error:'삭제된 메모예요.'},404);
        const query=new URLSearchParams({select:'id,feedback_id,nickname,body,created_at',feedback_id:`eq.${id}`,order:'created_at.asc,id.asc',limit:'9',offset:String((page-1)*9)});
        let result=await fetch(`${url}/rest/v1/workshop_feedback_comments?${query}`,{headers:{...dbHeaders,Prefer:'count=exact'}});
        let actualPage=page;
        if(result.status===416){const total=Number(result.headers.get('content-range')?.split('/')[1]||0);actualPage=Math.max(1,Math.ceil(total/9));query.set('offset',String((actualPage-1)*9));result=await fetch(`${url}/rest/v1/workshop_feedback_comments?${query}`,{headers:{...dbHeaders,Prefer:'count=exact'}});}
        if(!result.ok)throw Error('comments');
        const total=Number(result.headers.get('content-range')?.split('/')[1]||0);
        return reply({items:await result.json(),page:actualPage,pages:Math.max(1,Math.ceil(total/9)),total});
      }
      const visitor=params.get('visitor');
      const result=await rpc('workshop_feedback_page',{p_page:page,p_visitor_hash:visitor&&uuid.test(visitor)?await visitorHash(visitor):''});
      if(!result.ok)throw Error('read');return reply(await result.json());
    }
    if(req.method!=='POST')return reply({error:'지원하지 않는 요청입니다.'},405);
    if(!req.headers.get('content-type')?.includes('application/json'))return reply({error:'올바른 형식으로 보내주세요.'},415);
    // Bound streamed bodies as well as requests with Content-Length.
    const reader=req.body?.getReader();if(!reader)return reply({error:'한 줄을 적어주세요.'},400);
    const chunks:Uint8Array[]=[];let size=0;
    while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return reply({error:'글이 너무 길어요.'},413);}chunks.push(value);}
    const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
    let input;try{input=JSON.parse(new TextDecoder().decode(bytes));}catch{return reply({error:'글을 다시 확인해주세요.'},400);}
    if(path.endsWith('/admin/login')){
      const limit=await fetch(`${url}/rest/v1/rpc/feedback_login_attempt`,{method:'POST',headers:dbHeaders,body:JSON.stringify({p_rate_key:await rateKeyFor(req)})});
      if(!limit.ok)throw Error('login limit');
      if(!await limit.json())return reply({error:'로그인 시도가 많아요. 15분 후 다시 시도해주세요.'},429);
      if(!input||typeof input.password!=='string'||input.password.length>100)return reply({error:'비밀번호를 확인해주세요.'},401);
      const settings=await fetch(`${url}/rest/v1/workshop_feedback_admin?select=password_hash,salt,iterations&id=eq.true&limit=1`,{headers:dbHeaders});
      if(!settings.ok)throw Error('settings');const [admin]=await settings.json();if(!admin)throw Error('no settings');
      const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(input.password),'PBKDF2',false,['deriveBits']);
      const candidate=hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(admin.salt),iterations:admin.iterations,hash:'SHA-256'},key,256));
      let mismatch=0;for(let i=0;i<64;i++)mismatch|=candidate.charCodeAt(i)^admin.password_hash.charCodeAt(i);
      if(mismatch)return reply({error:'비밀번호가 맞지 않아요.'},401);
      const token=hex(crypto.getRandomValues(new Uint8Array(32)).buffer);const expiresAt=new Date(Date.now()+2*60*60*1000).toISOString();
      const saved=await fetch(`${url}/rest/v1/workshop_feedback_sessions`,{method:'POST',headers:dbHeaders,body:JSON.stringify({token_hash:await digest(token),expires_at:expiresAt})});
      if(!saved.ok)throw Error('save session');
      await fetch(`${url}/rest/v1/workshop_feedback_sessions?expires_at=lt.${new Date().toISOString()}`,{method:'DELETE',headers:dbHeaders});
      return reply({token,expiresAt});
    }
    if(path.endsWith('/admin/settings')||path.endsWith('/admin/hearts')){
      if(!await sessionHash(req))return reply({error:'관리자 로그인이 필요해요.'},401);
      if(path.endsWith('/admin/settings')){
        if(!input||!['posting_open','comments_open','likes_open'].every(k=>typeof input[k]==='boolean'))return reply({error:'설정을 확인해주세요.'},400);
        const settings={posting_open:input.posting_open,comments_open:input.comments_open,likes_open:input.likes_open};
        const result=await fetch(`${url}/rest/v1/workshop_feedback_settings?id=eq.true`,{method:'PATCH',headers:dbHeaders,body:JSON.stringify(settings)});if(!result.ok)throw Error('settings');return reply({settings});
      }
      if(!input||!uuid.test(input.id||''))return reply({error:'메모를 확인해주세요.'},400);
      const result=await fetch(`${url}/rest/v1/workshop_feedback_hearts?feedback_id=eq.${input.id}`,{method:'DELETE',headers:dbHeaders});if(!result.ok)throw Error('reset');return reply({hearts:0,liked:false});
    }
    if(path.endsWith('/delete')){
      if(!input||!uuid.test(input.id||''))return reply({error:'메모를 확인해주세요.'},400);
      if(!await sessionHash(req)){
        const limit=await rpc('feedback_login_attempt',{p_rate_key:'delete:'+await rateKeyFor(req)});if(!limit.ok)throw Error('delete limit');
        if(!await limit.json())return reply({error:'삭제 시도가 많아요. 15분 후 다시 시도해주세요.'},429);
        if(typeof input.password!=='string'||input.password.length<4||input.password.length>64)return reply({error:'작성할 때 설정한 비밀번호를 입력해주세요.'},401);
        const result=await fetch(`${url}/rest/v1/workshop_feedback_edit_keys?feedback_id=eq.${input.id}&select=password_hash,salt,iterations&limit=1`,{headers:dbHeaders});
        if(!result.ok)throw Error('delete key');const [key]=await result.json();
        if(!key||!equalHash(await passwordHash(input.password,key.salt,key.iterations),key.password_hash))return reply({error:'비밀번호가 맞지 않거나 수정 비밀번호가 없는 메모예요.'},401);
      }
      const result=await fetch(`${url}/rest/v1/workshop_feedback?id=eq.${input.id}`,{method:'DELETE',headers:{...dbHeaders,Prefer:'return=representation'}});
      if(!result.ok)throw Error('owner delete');if(!(await result.json()).length)return reply({error:'삭제된 메모예요.'},404);
      return reply({deleted:true});
    }
    if(path.endsWith('/edit')){
      const body=cleanText(input?.body),nickname=cleanText(input?.nickname)||'향기를 남긴 손님';
      if(!input||!uuid.test(input.id||'')||!body||[...body].length>100||[...nickname].length>20||/[\u0000-\u001f\u007f]/.test(body+nickname))return reply({error:'닉네임은 20자, 메모는 100자 이내로 적어주세요.'},400);
      const isAdmin=Boolean(await sessionHash(req));
      if(!isAdmin){
        const limit=await rpc('feedback_login_attempt',{p_rate_key:'edit:'+await rateKeyFor(req)});if(!limit.ok)throw Error('edit limit');
        if(!await limit.json())return reply({error:'수정 시도가 많아요. 15분 후 다시 시도해주세요.'},429);
        if(typeof input.password!=='string'||input.password.length<4||input.password.length>64)return reply({error:'작성할 때 설정한 비밀번호를 입력해주세요.'},401);
        const result=await fetch(`${url}/rest/v1/workshop_feedback_edit_keys?feedback_id=eq.${input.id}&select=password_hash,salt,iterations&limit=1`,{headers:dbHeaders});
        if(!result.ok)throw Error('edit key');const [key]=await result.json();
        if(!key||!equalHash(await passwordHash(input.password,key.salt,key.iterations),key.password_hash))return reply({error:'비밀번호가 맞지 않거나 수정 비밀번호가 없는 메모예요.'},401);
      }
      const result=await fetch(`${url}/rest/v1/workshop_feedback?id=eq.${input.id}&hidden=eq.false`,{method:'PATCH',headers:{...dbHeaders,Prefer:'return=representation'},body:JSON.stringify({body,nickname,edited_at:new Date().toISOString()})});
      if(!result.ok)throw Error('edit');const [item]=await result.json();if(!item)return reply({error:'삭제된 메모예요.'},404);
      return reply({item});
    }
    if(path.endsWith('/visit')){
      if(!input||!uuid.test(input.id||'')||!uuid.test(input.visitor||'')||!['visit','booking'].includes(input.kind))return reply({error:'잘못된 요청입니다.'},400);
      if(!await limited(req,'events',1000))return reply({error:'잠시 후 다시 시도해주세요.'},429);
      const result=await fetch(`${url}/rest/v1/workshop_site_events?on_conflict=id`,{method:'POST',headers:{...dbHeaders,Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({id:input.id,visitor_hash:await visitorHash(input.visitor),kind:input.kind,position:cleanText(input.position).slice(0,40)})});if(!result.ok)throw Error('event');return reply({recorded:true});
    }
    if(path.endsWith('/heart')){
      if(!input||!uuid.test(input.id||'')||!uuid.test(input.visitor||'')||typeof input.liked!=='boolean')return reply({error:'잘못된 요청입니다.'},400);
      if(!await limited(req,'hearts',180))return reply({error:'잠시 후 다시 눌러주세요.'},429);
      const result=await rpc('workshop_feedback_heart',{p_id:input.id,p_visitor_hash:await visitorHash(input.visitor),p_liked:input.liked});
      if(!result.ok){const error=await result.text();if(error.includes('feedback_closed'))return reply({error:'지금은 공감을 쉬고 있어요.'},403);if(error.includes('feedback_not_found'))return reply({error:'삭제된 메모예요.'},404);throw Error('heart');}return reply(await result.json());
    }
    if(path.endsWith('/comments')){
      const body=cleanText(input?.body),nickname=cleanText(input?.nickname)||'향기를 남긴 손님';
      if(!input||!uuid.test(input.id||'')||!uuid.test(input.feedback_id||'')||!body||[...body].length>200||[...nickname].length>20||/[\u0000-\u001f\u007f]/.test(body+nickname))return reply({error:'닉네임은 20자, 댓글은 200자 이내로 적어주세요.'},400);
      if(!await limited(req,'comments',30))return reply({error:'댓글이 많아요. 잠시 후 남겨주세요.'},429);
      const parent=await fetch(`${url}/rest/v1/workshop_feedback?select=id&id=eq.${input.feedback_id}&hidden=eq.false`,{headers:dbHeaders});if(!parent.ok)throw Error('parent');if(!(await parent.json()).length)return reply({error:'삭제된 메모예요.'},404);
      const row={id:input.id,feedback_id:input.feedback_id,body,nickname};
      const result=await fetch(`${url}/rest/v1/workshop_feedback_comments?on_conflict=id`,{method:'POST',headers:{...dbHeaders,Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify(row)});
      if(!result.ok){const error=await result.text();if(error.includes('feedback_closed'))return reply({error:'지금은 댓글 작성을 쉬고 있어요.'},403);throw Error('comment');}
      const items=await result.json();
      if(!items.length){const existing=await fetch(`${url}/rest/v1/workshop_feedback_comments?id=eq.${input.id}&select=*`,{headers:dbHeaders});if(!existing.ok)throw Error('existing');const [item]=await existing.json();if(!item||item.body!==body||item.nickname!==nickname||item.feedback_id!==input.feedback_id)return reply({error:'새 댓글로 다시 남겨주세요.'},409);return reply({item},201);}
      return reply({item:items[0]},201);
    }
    if(!input||typeof input!=='object'||typeof input.body!=='string')return reply({error:'한 줄을 적어주세요.'},400);
    const body=input.body.normalize('NFC').trim().replace(/[\r\n\t]+/g,' ').replace(/ {2,}/g,' ');
    const nickname=(typeof input.nickname==='string'?input.nickname:'').normalize('NFC').trim().replace(/\s+/g,' ')||'향기를 남긴 손님';
    if([...nickname].length>20||/[\u0000-\u001f\u007f]/.test(nickname))return reply({error:'닉네임은 20자 이내로 적어주세요.'},400);
    if(!body||[...body].length>100||/[\u0000-\u001f\u007f]/.test(body)||!uuid.test(input.id||'')||!categories.includes(input.category)||!colors.includes(input.color)||!animals.includes(input.animal))return reply({error:'100자 이내 한 줄과 메모 모양을 확인해주세요.'},400);
    if(input.website)return reply({error:'잠시 후 다시 시도해주세요.'},400);
    if(typeof input.password!=='string'||input.password.length<4||input.password.length>64)return reply({error:'글 수정용 비밀번호를 4~64자로 설정해주세요.'},400);
    const salt=hex(crypto.getRandomValues(new Uint8Array(24)).buffer);
    const result=await rpc('submit_feedback_with_edit',{p_id:input.id,p_body:body,p_category:input.category,p_color:input.color,p_animal:input.animal,p_nickname:nickname,p_rate_key:await rateKeyFor(req),p_hash:await passwordHash(input.password,salt),p_salt:salt});
    if(!result.ok){const error=await result.text();if(error.includes('feedback_closed'))return reply({error:'지금은 새 메모 작성을 쉬고 있어요.'},403);if(error.includes('feedback_rate_limit'))return reply({error:'메모가 많이 도착했어요. 잠시 후 다시 남겨주세요.'},429);if(error.includes('feedback_conflict'))return reply({error:'새 메모로 다시 남겨주세요.'},409);throw new Error('write');}
    return reply({item:await result.json()},201);
  }catch{const lounge=new URL(req.url).pathname.includes('/lounge/');return reply({error:lounge?'신청서를 접수하지 못했어요. 입력 내용은 유지되니 잠시 후 다시 신청해주세요.':'보드와 연결하지 못했어요. 잠시 후 다시 시도해주세요.'},503);}
});
