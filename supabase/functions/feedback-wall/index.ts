// Public guestbook: application-key authorization, bounded input, service-only tables.
const url=Deno.env.get('SUPABASE_URL')!;
const secretKeys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}');
const secret=secretKeys.default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const publicKeys=Object.values(JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}'));
const allowedKeys=new Set([...publicKeys,Deno.env.get('SUPABASE_ANON_KEY')].filter(Boolean));
const origins=new Set(['https://andy-plum.vercel.app']);
const categories=['improvement','request','message'];
const colors=['butter','rose','lavender','sage','sky','peach'];
const animals=['bear','bunny','cat','fox'];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dbHeaders={'apikey':secret,'Content-Type':'application/json',...(secret.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${secret}`})};

Deno.serve(async req=>{
  const origin=req.headers.get('origin');
  const headers:Record<string,string>={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
  if(origin&&origins.has(origin))Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'apikey, content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'});
  const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(origin&&!origins.has(origin))return reply({error:'접근할 수 없는 주소입니다.'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(!allowedKeys.has(req.headers.get('apikey')||''))return reply({error:'연결 정보를 확인해주세요.'},401);
  try{
    if(req.method==='GET'){
      const before=new URL(req.url).searchParams.get('before');
      if(before&&(before.length>40||Number.isNaN(Date.parse(before))))return reply({error:'잘못된 페이지입니다.'},400);
      const query=new URLSearchParams({select:'id,body,category,color,animal,created_at',hidden:'eq.false',order:'created_at.desc,id.desc',limit:'25'});
      if(before)query.set('created_at',`lt.${before}`);
      const result=await fetch(`${url}/rest/v1/workshop_feedback?${query}`,{headers:dbHeaders});
      if(!result.ok)throw new Error('read');
      const rows=await result.json();
      return reply({items:rows.slice(0,24),next:rows.length>24?rows[23].created_at:null});
    }
    if(req.method!=='POST')return reply({error:'지원하지 않는 요청입니다.'},405);
    if(!req.headers.get('content-type')?.includes('application/json'))return reply({error:'올바른 형식으로 보내주세요.'},415);
    // Bound streamed bodies as well as requests with Content-Length.
    const reader=req.body?.getReader();if(!reader)return reply({error:'한 줄을 적어주세요.'},400);
    const chunks:Uint8Array[]=[];let size=0;
    while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return reply({error:'글이 너무 길어요.'},413);}chunks.push(value);}
    const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
    let input;try{input=JSON.parse(new TextDecoder().decode(bytes));}catch{return reply({error:'글을 다시 확인해주세요.'},400);}
    if(!input||typeof input!=='object'||typeof input.body!=='string')return reply({error:'한 줄을 적어주세요.'},400);
    const body=input.body.normalize('NFC').trim().replace(/[\r\n\t]+/g,' ').replace(/ {2,}/g,' ');
    if(!body||[...body].length>100||/[\u0000-\u001f\u007f]/.test(body)||!uuid.test(input.id||'')||!categories.includes(input.category)||!colors.includes(input.color)||!animals.includes(input.animal))return reply({error:'100자 이내 한 줄과 메모 모양을 확인해주세요.'},400);
    if(input.website)return reply({error:'잠시 후 다시 시도해주세요.'},400);
    const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||req.headers.get('cf-connecting-ip')||'unknown';
    const hashKey=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const signature=await crypto.subtle.sign('HMAC',hashKey,new TextEncoder().encode(`${new Date().toISOString().slice(0,10)}:${ip}`));
    const rateKey=Array.from(new Uint8Array(signature)).map(b=>b.toString(16).padStart(2,'0')).join('');
    const result=await fetch(`${url}/rest/v1/rpc/submit_workshop_feedback`,{method:'POST',headers:dbHeaders,body:JSON.stringify({p_id:input.id,p_body:body,p_category:input.category,p_color:input.color,p_animal:input.animal,p_rate_key:rateKey})});
    if(!result.ok){const error=await result.text();if(error.includes('feedback_rate_limit'))return reply({error:'메모가 많이 도착했어요. 잠시 후 다시 남겨주세요.'},429);if(error.includes('feedback_conflict'))return reply({error:'새 메모로 다시 남겨주세요.'},409);throw new Error('write');}
    return reply({item:await result.json()},201);
  }catch{return reply({error:'보드와 연결하지 못했어요. 잠시 후 다시 시도해주세요.'},503);}
});
