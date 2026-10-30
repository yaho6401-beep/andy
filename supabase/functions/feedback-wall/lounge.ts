type LoungeDeps={url:string;dbHeaders:Record<string,string>;reply:(b:unknown,s?:number)=>Response;limited:(r:Request,k:string,n:number)=>Promise<boolean>;sessionHash:(r:Request)=>Promise<string|null>;visitorHash:(s:string)=>Promise<string>;cleanText:(s:unknown)=>string};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statuses=['pending','contacted','invited','closed'];
export async function handleLounge(req:Request,d:LoungeDeps){
 const {url,dbHeaders,reply}=d,path=new URL(req.url).pathname,isSubmit=path.endsWith('/apply');
 if(!isSubmit&&!await d.sessionHash(req))return reply({error:'관리자 로그인이 필요해요.'},401);
 if(req.method==='GET'&&!isSubmit){
  const params=new URL(req.url).searchParams,page=Number(params.get('page')||1),status=params.get('status')||'all';
  if(!Number.isInteger(page)||page<1||page>10000||status!=='all'&&!statuses.includes(status))return reply({error:'신청 목록을 확인해주세요.'},400);
  const query=new URLSearchParams({select:'id,receipt,nickname,contact_type,contact_value,message,status,created_at,expires_at',expires_at:'gt.'+new Date().toISOString(),order:'created_at.desc,id.desc',limit:'20',offset:String((page-1)*20)});if(status!=='all')query.set('status','eq.'+status);
  const r=await fetch(url+'/rest/v1/workshop_lounge_applications?'+query,{headers:{...dbHeaders,Prefer:'count=exact'}});if(!r.ok)throw Error('lounge list');
  const total=Number(r.headers.get('content-range')?.split('/')[1]||0);return reply({items:await r.json(),page,pages:Math.max(1,Math.ceil(total/20)),total});
 }
 if(req.method!=='POST')return reply({error:'지원하지 않는 요청입니다.'},405);
 if(!req.headers.get('content-type')?.includes('application/json'))return reply({error:'올바른 형식으로 보내주세요.'},415);
 if(!await d.limited(req,isSubmit?'lounge-apply':'lounge-admin',isSubmit?3:60))return reply({error:'잠시 후 다시 시도해주세요.'},429);
 const reader=req.body?.getReader();if(!reader)return reply({error:'신청 내용을 확인해주세요.'},400);
 let size=0;const parts:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192){await reader.cancel();return reply({error:'신청 내용이 너무 길어요.'},413);}parts.push(value);}
 let input;try{input=JSON.parse(await new Blob(parts).text());}catch{return reply({error:'신청 내용을 확인해주세요.'},400);}
 if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'신청 내용을 확인해주세요.'},400);
 if(!isSubmit){
  if(!uuid.test(input.id||''))return reply({error:'신청서를 확인해주세요.'},400);
  if(path.endsWith('/delete')){const r=await fetch(url+'/rest/v1/workshop_lounge_applications?id=eq.'+input.id,{method:'DELETE',headers:dbHeaders});if(!r.ok)throw Error('lounge delete');return reply({deleted:true});}
  if(!statuses.includes(input.status))return reply({error:'신청 상태를 확인해주세요.'},400);
  const r=await fetch(url+'/rest/v1/workshop_lounge_applications?id=eq.'+input.id+'&expires_at=gt.'+new Date().toISOString(),{method:'PATCH',headers:{...dbHeaders,Prefer:'return=representation'},body:JSON.stringify({status:input.status})});if(!r.ok)throw Error('lounge update');const rows=await r.json();if(!rows.length)return reply({error:'신청서를 확인해주세요.'},404);return reply({updated:true});
 }
 const nickname=d.cleanText(input.nickname),message=d.cleanText(input.message),kind=input.contactType;
 if(!nickname||[...nickname].length>20||[...message].length>300||/[\u0000-\u001f\u007f]/.test(nickname+message))return reply({error:'닉네임은 20자, 이야기는 300자 이내로 적어주세요.'},400);
 if(input.singleConsent!==true||input.privacyConsent!==true)return reply({error:'참가 확인과 개인정보 수집·이용 동의를 체크해주세요.'},400);
 let contact=typeof input.contact==='string'?input.contact.trim():'';
 if(kind==='phone'){contact=contact.replace(/[-\s]/g,'');if(!/^01[0-9]{8,9}$/.test(contact))return reply({error:'휴대폰 번호를 확인해주세요.'},400);}
 else if(kind==='instagram'){contact=contact.replace(/^@/,'').toLowerCase();if(!/^[a-z0-9_](?:[a-z0-9_.]{0,28}[a-z0-9_])?$/.test(contact)||contact.includes('..'))return reply({error:'인스타 아이디를 확인해주세요. 링크 대신 아이디만 적어주세요.'},400);}
 else return reply({error:'연락 방법을 선택해주세요.'},400);
 const hash=await d.visitorHash('solo:'+kind+':'+contact);
 // Expired contacts are inaccessible immediately; hourly Cron also removes them physically.
 const cleaned=await fetch(url+'/rest/v1/workshop_lounge_applications?expires_at=lte.'+new Date().toISOString(),{method:'DELETE',headers:dbHeaders});if(!cleaned.ok)throw Error('lounge expiry');
 const receipt='SOLO-'+Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();
 const row={receipt,nickname,contact_type:kind,contact_value:contact,contact_hash:hash,message};
 const saved=await fetch(url+'/rest/v1/workshop_lounge_applications?on_conflict=contact_hash',{method:'POST',headers:{...dbHeaders,Prefer:'resolution=ignore-duplicates'},body:JSON.stringify(row)});if(!saved.ok)throw Error('lounge apply');
 const found=await fetch(url+'/rest/v1/workshop_lounge_applications?contact_hash=eq.'+hash+'&select=receipt&limit=1',{headers:dbHeaders});if(!found.ok)throw Error('lounge receipt');const [record]=await found.json();if(!record)throw Error('lounge receipt missing');
 return reply({received:true,receipt:record.receipt},201);
}
