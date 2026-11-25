import {memberError,normalizePhone,memberNickname,checkPassword,passwordHash,equalHash,randomToken,digest,cleanRecord} from './member-core.mjs';
export async function memberService({input,token='',ip='unknown',sql,clock=Date.now}){
 const q=(s,p=[])=>sql.unsafe(s,p),now=clock(),op=input.op;
 const limit=async(key,max,windowMs=600000)=>{const hash=await digest(key+':'+Math.floor(now/windowMs));const r=await q("insert into workshop_private.member_limits(key,expires_at) values($1,$2) on conflict(key) do update set count=workshop_private.member_limits.count+1 returning count",[hash,new Date(now+windowMs)]);if(r[0].count>max)throw memberError('요청이 많아요. 잠시 후 다시 시도해 주세요.',429);};
 if(['register','login'].includes(op)){
  const phone=normalizePhone(input.phone),password=checkPassword(input.password);await limit('phone:'+phone,10);await limit('ip:'+ip,100);
  let member=(await q('select * from workshop_private.members where phone=$1',[phone]))[0];
  if(op==='register'){
   const nickname=memberNickname(input.nickname);if(input.consent!==true)throw memberError('회원정보와 기록 저장 안내에 동의해 주세요.');
   if(member)throw memberError('이미 가입된 번호예요. 로그인해 주세요.',409);
   const salt=randomToken(),hash=await passwordHash(password,salt),id=crypto.randomUUID();
   member=await sql.begin(async tx=>{const query=(s,p=[])=>tx.unsafe(s,p);const journal=(await query("insert into public.workshop_scent_accounts(nickname,login_key,password_hash,salt) values($1,$2,$3,$4) returning id",[nickname,'member_'+id,randomToken(),randomToken()]))[0];return (await query('insert into workshop_private.members(id,phone,nickname,password_hash,salt,journal_id) values($1,$2,$3,$4,$5,$6) returning *',[id,phone,nickname,hash,salt,journal.id]))[0];});
  }else{
   const candidate=await passwordHash(password,member?.salt||'books-scents-unregistered-number');if(!member||!equalHash(candidate,member.password_hash))throw memberError('휴대폰 번호나 비밀번호를 확인해 주세요.',401);
  }
  token=randomToken();await q('insert into workshop_private.member_sessions(token_hash,member_id,expires_at) values($1,$2,$3)',[await digest(token),member.id,new Date(now+30*86400000)]);
  return {status:op==='register'?201:200,body:{ok:true,sessionToken:token,...await issueTicket(q,member,token,now)}};
 }
 const sessionHash=/^[a-f0-9]{64}$/.test(token)?await digest(token):'';
 const member=sessionHash?(await q('select m.* from workshop_private.members m join workshop_private.member_sessions s on s.member_id=m.id where s.token_hash=$1 and s.expires_at>$2',[sessionHash,new Date(now)]))[0]:null;
 if(op==='me'&&!member)return {body:{profile:null}};
 if(!member)throw memberError('간편 로그인 후 이용해 주세요.',401);
 await limit('member:'+member.id,180);
 if(op==='me')return {body:await issueTicket(q,member,token,now)};
 if(op==='logout'){
  await q('delete from public.workshop_scent_sessions where token_hash in (select token_hash from workshop_private.member_tickets where session_hash=$1)',[sessionHash]);await q('delete from workshop_private.member_sessions where token_hash=$1',[sessionHash]);return {body:{ok:true}};
 }
 if(op==='delete-account'){
  if(!equalHash(await passwordHash(checkPassword(input.password),member.salt),member.password_hash))throw memberError('현재 비밀번호를 확인해 주세요.',401);
  await sql.begin(async tx=>{await tx.unsafe('delete from workshop_private.members where id=$1',[member.id]);await tx.unsafe('delete from public.workshop_scent_accounts where id=$1',[member.journal_id]);});return {body:{ok:true}};
 }
 if(!['reading','blending','notebook'].includes(input.kind))throw memberError('기록 종류를 확인해 주세요.');
 if(op==='clear-records'){await q('delete from workshop_private.member_records where member_id=$1 and kind=$2',[member.id,input.kind]);return {body:{deleted:true}};}
 if(op==='records'){
  const items=await q('select payload from workshop_private.member_records where member_id=$1 and kind=$2 order by created_at desc,id desc limit 500',[member.id,input.kind]);return {body:{items:items.map(r=>r.payload)}};
 }
 if(op==='save-record'){
  const row=cleanRecord(input.kind,input.record);
  await sql.begin(async tx=>{await tx.unsafe('select id from workshop_private.members where id=$1 for update',[member.id]);const count=(await tx.unsafe('select count(*)::int as n from workshop_private.member_records where member_id=$1 and kind=$2',[member.id,input.kind]))[0].n;if(count>=500&&!(await tx.unsafe('select id from workshop_private.member_records where member_id=$1 and kind=$2 and id=$3',[member.id,input.kind,row.id])).length)throw memberError('기록은 종류별로 500개까지 보관할 수 있어요.');await tx.unsafe('insert into workshop_private.member_records(member_id,kind,id,payload) values($1,$2,$3,$4::text::jsonb) on conflict(member_id,kind,id) do update set payload=excluded.payload,updated_at=now()',[member.id,input.kind,row.id,JSON.stringify(row)]);});return {body:{saved:true,record:row}};
 }
 if(op==='delete-record'){
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.id||''))throw memberError('기록 번호를 확인해 주세요.');await q('delete from workshop_private.member_records where member_id=$1 and kind=$2 and id=$3',[member.id,input.kind,input.id]);return {body:{deleted:true}};
 }
 throw memberError('지원하지 않는 요청이에요.');
}
async function issueTicket(q,member,token,now){
 const ticket=randomToken(),hash=await digest(ticket),sessionHash=await digest(token),expiresAt=new Date(now+600000);
 await q('insert into workshop_private.member_tickets(token_hash,session_hash,expires_at) values($1,$2,$3)',[hash,sessionHash,expiresAt]);
 await q('insert into public.workshop_scent_sessions(token_hash,account_id,expires_at) values($1,$2,$3)',[hash,member.journal_id,expiresAt]);
 await q('delete from workshop_private.member_tickets where expires_at<now()');await q('delete from workshop_private.member_sessions where expires_at<now()');await q('delete from workshop_private.member_limits where expires_at<now()');
 return {profile:{id:member.id,nickname:member.nickname,phoneMasked:'•••• '+member.phone.slice(-4)},ticket,expiresAt:expiresAt.toISOString()};
}
