type Deps={url:string;dbHeaders:Record<string,string>;reply:(body:unknown,status?:number)=>Response;rpc:(name:string,body:unknown)=>Promise<Response>;limited:(req:Request,kind:string,max:number)=>Promise<boolean>;sessionHash:(req:Request)=>Promise<string|null>;visitorHash:(id:string)=>Promise<string>;passwordHash:(password:string,salt:string,iterations?:number)=>Promise<string>;equalHash:(a:string,b:string)=>boolean;rateKeyFor:(req:Request)=>Promise<string>;cleanText:(value:unknown)=>string};
const validScent=(id:unknown)=>typeof id==='string'&&/^main-([1-9]|[1-6]\d|7[0-2])$/.test(id);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function handleScent(req:Request,d:Deps){
  const {url,dbHeaders,reply,rpc}=d,parsed=new URL(req.url),path=parsed.pathname;
  if(req.method==='GET'){
    const scent=parsed.searchParams.get('scent'),page=Number(parsed.searchParams.get('page')||1),visitor=parsed.searchParams.get('visitor')||'';
    if(!validScent(scent)||!Number.isInteger(page)||page<1||page>10000)return reply({error:'향과 페이지를 확인해주세요.'},400);
    const r=await rpc('workshop_scent_page',{p_scent:scent,p_page:page,p_visitor_hash:uuid.test(visitor)?await d.visitorHash(visitor):''});
    if(!r.ok)throw Error('scent page');return reply(await r.json());
  }
  if(req.method!=='POST')return reply({error:'지원하지 않는 요청입니다.'},405);
  if(!req.headers.get('content-type')?.includes('application/json'))return reply({error:'올바른 형식으로 보내주세요.'},415);
  const reader=req.body?.getReader();if(!reader)return reply({error:'내용을 확인해주세요.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>8192){await reader.cancel();return reply({error:'글이 너무 길어요.'},413);}chunks.push(value);}
  let input;try{input=JSON.parse(await new Blob(chunks).text());}catch{return reply({error:'내용을 확인해주세요.'},400);}
  if(!validScent(input?.scentId))return reply({error:'향을 확인해주세요.'},400);
  const scent=input.scentId;
  if(path.endsWith('/staff')||path.endsWith('/staff/delete')){
    if(!await d.sessionHash(req))return reply({error:'관리자 로그인이 필요해요.'},401);
    if(!['owner','manager'].includes(input.role))return reply({error:'작성자 역할을 확인해주세요.'},400);
    const deleting=path.endsWith('/delete'),body=d.cleanText(input.body);
    if(!deleting&&(!body||[...body].length>500||/[\u0000-\u001f\u007f]/.test(body)))return reply({error:'공식 코멘트는 500자 이내로 적어주세요.'},400);
    const r=await rpc('workshop_scent_staff_write',{p_scent:scent,p_role:input.role,p_body:deleting?null:body});
    if(!r.ok)throw Error('staff write');return reply({saved:true});
  }
  if(path.endsWith('/like')){
    if(!uuid.test(input.visitor||'')||!['scent','owner','manager'].includes(input.target)||typeof input.liked!=='boolean')return reply({error:'잘못된 요청입니다.'},400);
    if(!await d.limited(req,'scent-likes',180))return reply({error:'잠시 후 다시 눌러주세요.'},429);
    const r=await rpc('workshop_scent_like',{p_scent:scent,p_target:input.target,p_visitor_hash:await d.visitorHash(input.visitor),p_liked:input.liked});
    if(!r.ok){const error=await r.text();if(error.includes('feedback_closed'))return reply({error:'지금은 공감을 쉬고 있어요.'},403);if(error.includes('staff_not_found'))return reply({error:'삭제된 코멘트예요.'},404);throw Error('scent like');}
    return reply(await r.json());
  }
  if(path.endsWith('/delete')){
    if(!uuid.test(input.id||''))return reply({error:'소감을 확인해주세요.'},400);
    const admin=Boolean(await d.sessionHash(req));
    if(!admin){
      const limit=await rpc('feedback_login_attempt',{p_rate_key:'scent-delete:'+await d.rateKeyFor(req)});if(!limit.ok)throw Error('review delete limit');if(!await limit.json())return reply({error:'삭제 시도가 많아요. 15분 후 다시 시도해주세요.'},429);
      if(typeof input.password!=='string'||input.password.length<4||input.password.length>64)return reply({error:'작성할 때 설정한 비밀번호를 입력해주세요.'},401);
      const r=await fetch(`${url}/rest/v1/workshop_scent_reviews?id=eq.${input.id}&scent_id=eq.${scent}&select=password_hash,salt,iterations&limit=1`,{headers:dbHeaders});
      if(!r.ok)throw Error('review password');const [key]=await r.json();
      if(!key||!d.equalHash(await d.passwordHash(input.password,key.salt,key.iterations),key.password_hash))return reply({error:'비밀번호가 맞지 않아요.'},401);
    }
    const r=await fetch(`${url}/rest/v1/workshop_scent_reviews?id=eq.${input.id}&scent_id=eq.${scent}`,{method:'DELETE',headers:{...dbHeaders,Prefer:'return=representation'}});
    if(!r.ok)throw Error('review delete');if(!(await r.json()).length)return reply({error:'삭제된 소감이에요.'},404);
    return reply({deleted:true});
  }
  if(!path.endsWith('/review'))return reply({error:'지원하지 않는 요청입니다.'},404);
  const body=d.cleanText(input.body),nickname=d.cleanText(input.nickname)||'향기를 남긴 손님';
  if(!uuid.test(input.id||'')||!body||[...body].length>300||[...nickname].length>20||/[\u0000-\u001f\u007f]/.test(body+nickname))return reply({error:'닉네임은 20자, 소감은 300자 이내로 적어주세요.'},400);
  if(typeof input.password!=='string'||input.password.length<4||input.password.length>64)return reply({error:'삭제용 비밀번호를 4~64자로 설정해주세요.'},400);
  if(!await d.limited(req,'scent-reviews',10))return reply({error:'소감이 많아요. 잠시 후 다시 남겨주세요.'},429);
  const salt=Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>x.toString(16).padStart(2,'0')).join('');
  const row={id:input.id,scent_id:scent,body,nickname,password_hash:await d.passwordHash(input.password,salt),salt};
  const r=await fetch(`${url}/rest/v1/workshop_scent_reviews`,{method:'POST',headers:dbHeaders,body:JSON.stringify(row)});
  if(!r.ok){const error=await r.text();if(error.includes('feedback_closed'))return reply({error:'지금은 댓글 작성을 쉬고 있어요.'},403);if(r.status===409)return reply({error:'이미 등록된 소감이에요. 새로고침해 확인해주세요.'},409);throw Error('review save');}
  return reply({saved:true},201);
}
