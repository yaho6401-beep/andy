type JournalDeps={url:string;dbHeaders:Record<string,string>;reply:(b:unknown,s?:number)=>Response;limited:(r:Request,k:string,n:number)=>Promise<boolean>;sessionHash:(r:Request)=>Promise<string|null>;digest:(s:string)=>Promise<string>;passwordHash:(p:string,s:string)=>Promise<string>;equalHash:(a:string,b:string)=>boolean;cleanText:(s:unknown)=>string};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const stages=['saved','made','next'];
const fields='id,title,main_id,single_ids,sentence,reflection,next_plan,stage,created_at,updated_at';
export async function handleJournal(req:Request,d:JournalDeps){
 const {url,dbHeaders,reply}=d,path=new URL(req.url).pathname,params=new URL(req.url).searchParams;
 const admin=path.includes('/management/');
 async function db(table:string,query:Record<string,string>,method='GET',body?:unknown){const r=await fetch(url+'/rest/v1/'+table+'?'+new URLSearchParams(query),{method,headers:{...dbHeaders,Prefer:'return=representation,count=exact'},...(body===undefined?{}:{body:JSON.stringify(body)})});return r;}
 async function session(){const token=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';if(!/^[0-9a-f]{64}$/.test(token))return null;const r=await db('workshop_scent_sessions',{select:'account_id',token_hash:'eq.'+await d.digest(token),expires_at:'gt.'+new Date().toISOString(),limit:'1'});if(!r.ok)throw Error('journal session');return (await r.json())[0]?.account_id||null;}
 let owner:string|null=null;
 if(admin){if(!await d.sessionHash(req))return reply({error:'관리자 로그인이 필요해요.'},401);}
 else if(!path.endsWith('/register')&&!path.endsWith('/login')){owner=await session();if(!owner)return reply({error:'기록장에 로그인해주세요.'},401);}
 if(req.method==='GET'){
  const page=Number(params.get('page')||1);if(!Number.isInteger(page)||page<1||page>10000)return reply({error:'페이지를 확인해주세요.'},400);
  if(admin&&path.endsWith('/summary')){
   const counts=await Promise.all(['workshop_scent_records','workshop_lounge_applications','workshop_feedback'].map(async table=>{const q:Record<string,string>={select:'id',limit:'0'};if(table==='workshop_lounge_applications')q.expires_at='gt.'+new Date().toISOString();const r=await db(table,q);if(!r.ok)throw Error('management count');return Number(r.headers.get('content-range')?.split('/')[1]||0);}));return reply({records:counts[0],applications:counts[1],memos:counts[2]});
  }
  const memo=admin&&path.endsWith('/memos');
  const q:Record<string,string>={select:memo?'id,nickname,body,category,hidden,created_at,edited_at,admin_reviewed_at':admin?fields+',staff_note,workshop_scent_accounts(nickname)':fields,order:'created_at.desc,id.desc',limit:'20',offset:String((page-1)*20)};
  if(!admin)q.account_id='eq.'+owner;
  let r=await db(memo?'workshop_feedback':'workshop_scent_records',q),actualPage=page;if(r.status===416){const count=Number(r.headers.get('content-range')?.split('/')[1]||0);actualPage=Math.max(1,Math.ceil(count/20));q.offset=String((actualPage-1)*20);r=await db(memo?'workshop_feedback':'workshop_scent_records',q);}if(!r.ok)throw Error('journal list');const total=Number(r.headers.get('content-range')?.split('/')[1]||0);return reply({items:await r.json(),page:actualPage,pages:Math.max(1,Math.ceil(total/20)),total});
 }
 if(req.method!=='POST')return reply({error:'지원하지 않는 요청입니다.'},405);
 if(!req.headers.get('content-type')?.includes('application/json'))return reply({error:'올바른 형식으로 보내주세요.'},415);
 if(!await d.limited(req,admin?'management-write':path.endsWith('/login')||path.endsWith('/register')?'journal-auth':'journal-write',admin?120:40))return reply({error:'요청이 많아요. 잠시 후 다시 시도해주세요.'},429);
 const reader=req.body?.getReader();if(!reader)return reply({error:'내용을 확인해주세요.'},400);let size=0;const parts:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>12000){await reader.cancel();return reply({error:'내용이 너무 길어요.'},413);}parts.push(value);}let input;try{input=JSON.parse(await new Blob(parts).text());}catch{return reply({error:'내용을 확인해주세요.'},400);}if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'내용을 확인해주세요.'},400);
 if(path.endsWith('/register')||path.endsWith('/login')){
  const nickname=d.cleanText(input.nickname),password=input.password,loginKey=nickname.toLowerCase();if(!/^[\p{L}\p{N}_-]{2,20}$/u.test(nickname)||typeof password!=='string'||password.length<6||password.length>64)return reply({error:'닉네임은 공백 없이 2~20자, 비밀번호는 6~64자로 적어주세요.'},400);
  if(path.endsWith('/register')&&input.consent!==true)return reply({error:'기록 저장 및 관리자 열람에 동의해주세요.'},400);
  const r=await db('workshop_scent_accounts',{select:'id,nickname,password_hash,salt',login_key:'eq.'+loginKey,limit:'1'});if(!r.ok)throw Error('journal account');let account=(await r.json())[0];
  if(path.endsWith('/register')){if(account)return reply({error:'이미 사용 중인 닉네임이에요. 로그인하거나 다른 닉네임을 골라주세요.'},409);const salt=crypto.randomUUID()+crypto.randomUUID();const saved=await db('workshop_scent_accounts',{},'POST',{nickname,login_key:loginKey,salt,password_hash:await d.passwordHash(password,salt)});if(saved.status===409)return reply({error:'이미 사용 중인 닉네임이에요. 로그인하거나 다른 닉네임을 골라주세요.'},409);if(!saved.ok)throw Error('journal register');account=(await saved.json())[0];}
  else{const candidate=await d.passwordHash(password,account?.salt||'unregistered-journal-account');if(!account||!d.equalHash(candidate,account.password_hash))return reply({error:'닉네임이나 비밀번호를 확인해주세요.'},401);}
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join(''),expiresAt=new Date(Date.now()+2*60*60*1000).toISOString();const saved=await db('workshop_scent_sessions',{},'POST',{token_hash:await d.digest(token),account_id:account.id,expires_at:expiresAt});if(!saved.ok)throw Error('journal login');return reply({token,nickname:account.nickname,expiresAt});
 }
 if(path.endsWith('/logout')){const token=req.headers.get('authorization')!.replace(/^Bearer /,'');const r=await db('workshop_scent_sessions',{token_hash:'eq.'+await d.digest(token)},'DELETE');if(!r.ok)throw Error('journal logout');return reply({loggedOut:true});}
 const id=input.id;if(!uuid.test(id||''))return reply({error:'기록을 확인해주세요.'},400);
 if(admin&&path.endsWith('/memos/update')){if(typeof input.reviewed!=='boolean'||typeof input.hidden!=='boolean')return reply({error:'메모 상태를 확인해주세요.'},400);const r=await db('workshop_feedback',{id:'eq.'+id,select:'id'},'PATCH',{hidden:input.hidden,admin_reviewed_at:input.reviewed?new Date().toISOString():null});if(!r.ok)throw Error('memo review');return reply({updated:(await r.json()).length>0});}
 const filter:Record<string,string>={id:'eq.'+id,select:'id'};if(!admin)filter.account_id='eq.'+owner;
 if(path.endsWith('/delete')){const r=await db('workshop_scent_records',filter,'DELETE');if(!r.ok)throw Error('journal delete');if(!(await r.json()).length)return reply({error:'기록을 찾을 수 없어요.'},404);return reply({deleted:true});}
 if(admin){const staffNote=d.cleanText(input.staffNote);if(staffNote.length>1000||!stages.includes(input.stage))return reply({error:'관리 메모와 제작 상태를 확인해주세요.'},400);const r=await db('workshop_scent_records',filter,'PATCH',{staff_note:staffNote,stage:input.stage,updated_at:new Date().toISOString()});if(!r.ok)throw Error('journal staff update');if(!(await r.json()).length)return reply({error:'기록을 찾을 수 없어요.'},404);return reply({updated:true});}
 const title=d.cleanText(input.title),reflection=d.cleanText(input.reflection),nextPlan=d.cleanText(input.nextPlan);if(!title||[...title].length>60||[...reflection].length>600||[...nextPlan].length>600||!stages.includes(input.stage))return reply({error:'제목은 60자, 소감과 다음 계획은 각각 600자 이내로 적어주세요.'},400);
 const row:Record<string,unknown>={title,reflection,next_plan:nextPlan,stage:input.stage,updated_at:new Date().toISOString()};
 if(path.endsWith('/update')){const r=await db('workshop_scent_records',filter,'PATCH',row);if(!r.ok)throw Error('journal update');if(!(await r.json()).length)return reply({error:'기록을 찾을 수 없어요.'},404);return reply({updated:true});}
 if(!/^main-([1-9]|[1-6][0-9]|7[0-2])$/.test(input.mainId||'')||!Array.isArray(input.singleIds)||input.singleIds.length>30||input.singleIds.some((v:unknown)=>typeof v!=='string'||!/^single-(top|middle|base)-(10|[1-9])$/.test(v)))return reply({error:'향 조합을 다시 확인해주세요.'},400);
 const sentence=d.cleanText(input.sentence);if([...sentence].length>400)return reply({error:'향 설명이 너무 길어요.'},400);
 const r=await db('workshop_scent_records',{},'POST',{...row,id,account_id:owner,main_id:input.mainId,single_ids:[...new Set(input.singleIds)],sentence});if(r.status===409)return reply({error:'이미 저장된 기록이에요. 기록 목록을 새로고침해주세요.'},409);if(!r.ok)throw Error('journal save');return reply({saved:true,id},201);
}
