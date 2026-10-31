import './runner-engine.js';
type Deps={url:string;dbHeaders:Record<string,string>;reply:(body:unknown,status?:number)=>Response;rpc:(name:string,body:unknown)=>Promise<Response>;limited:(req:Request,kind:string,max:number)=>Promise<boolean>;sessionHash:(req:Request)=>Promise<string|null>;visitorHash:(id:string)=>Promise<string>};
const Engine=(globalThis as any).PerfumeRunnerEngine;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const prizeRoll=()=>{const a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=4294967200);return a[0]%100;};
const couponCode=()=>{const a=crypto.getRandomValues(new Uint8Array(6));const s=Array.from(a,x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();return `SC-${s.slice(0,4)}-${s.slice(4,8)}-${s.slice(8)}`;};
export async function handleGame(req:Request,d:Deps){
 const {url,dbHeaders,reply,rpc}=d,path=new URL(req.url).pathname;
 if(req.method!=='POST')return reply({error:'지원하지 않는 요청입니다.'},405);
 if(!req.headers.get('content-type')?.includes('application/json'))return reply({error:'올바른 형식으로 보내주세요.'},415);
 const reader=req.body?.getReader();if(!reader)return reply({error:'게임 정보를 확인해주세요.'},400);
 const chunks:Uint8Array[]=[];let size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>24576){await reader.cancel();return reply({error:'게임 입력이 너무 많아요.'},413);}chunks.push(value);}
 let input;try{input=JSON.parse(await new Blob(chunks).text());}catch{return reply({error:'게임 정보를 확인해주세요.'},400);}
 if(path.endsWith('/check-coupon')||path.endsWith('/redeem')){
  if(!await d.sessionHash(req))return reply({error:'관리자 로그인이 필요해요.'},401);
  const code=typeof input.code==='string'?input.code.trim().toUpperCase():'';
  if(!/^SC-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/.test(code))return reply({error:'쿠폰 번호를 확인해주세요.'},400);
  if(path.endsWith('/redeem')){
   const r=await rpc('workshop_game_redeem',{p_code:code,p_action:input.action==='void'?'void':'redeemed'});
   if(!r.ok){const e=await r.text();return reply({error:e.includes('coupon_expired')?'만료된 쿠폰이에요.':e.includes('coupon_already_used')?'이미 사용되었거나 취소된 쿠폰이에요.':'쿠폰을 찾지 못했어요.'},409);}return reply({coupon:await r.json()});
  }
  const r=await fetch(`${url}/rest/v1/workshop_game_draws?code=eq.${code}&select=code,prize,status,issued_at,expires_at,redeemed_at`,{headers:dbHeaders});if(!r.ok)throw Error('coupon read');const [coupon]=await r.json();if(!coupon)return reply({error:'쿠폰을 찾지 못했어요.'},404);return reply({coupon});
 }
 if(!uuid.test(input?.visitor||''))return reply({error:'게임 정보를 확인해주세요.'},400);
 if(!await d.limited(req,'runner',90))return reply({error:'잠시 후 다시 시도해주세요.'},429);
 const visitor=await d.visitorHash(input.visitor),parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const day=['year','month','day'].map(k=>parts.find(p=>p.type===k)!.value).join('-');
 async function findSession(){const r=await fetch(`${url}/rest/v1/workshop_game_sessions?visitor_hash=eq.${visitor}&day=eq.${day}&select=*&limit=1`,{headers:dbHeaders});if(!r.ok)throw Error('runner read');return (await r.json())[0];}
 async function drawFor(id:string){const r=await fetch(`${url}/rest/v1/workshop_game_draws?session_id=eq.${id}&select=code,prize,status,issued_at,expires_at,redeemed_at`,{headers:dbHeaders});if(!r.ok)throw Error('draw read');return (await r.json())[0]||null;}
 async function board(){const r=await rpc('workshop_game_leaderboard',{p_visitor_hash:visitor});if(!r.ok)throw Error('leaderboard');return r.json();}
 if(path.endsWith('/leaderboard'))return reply(await board());
 if(path.endsWith('/start')){
  const nickname=typeof input.nickname==='string'?input.nickname.normalize('NFC').trim().replace(/\s+/g,' '):'';
  if(!nickname||[...nickname].length>12||/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/.test(nickname))return reply({error:'게임을 시작하기 전에 닉네임을 1~12자로 적어주세요.'},400);
  const registered=await rpc('workshop_game_register',{p_visitor_hash:visitor,p_nickname:nickname});if(!registered.ok)throw Error('player register');const profile=await registered.json();
  let session=await findSession();if(!session){const state=Engine.create(crypto.getRandomValues(new Uint32Array(1))[0]);const saved=await fetch(`${url}/rest/v1/workshop_game_sessions`,{method:'POST',headers:dbHeaders,body:JSON.stringify({id:crypto.randomUUID(),visitor_hash:visitor,state})});if(!saved.ok&&saved.status!==409)throw Error('runner create');session=await findSession();}
  const wallet=await fetch(`${url}/rest/v1/workshop_game_draws?visitor_hash=eq.${visitor}&prize=neq.none&order=issued_at.desc&limit=30&select=code,prize,status,issued_at,expires_at,redeemed_at`,{headers:dbHeaders});if(!wallet.ok)throw Error('wallet');
  return reply({id:session.id,state:session.state,version:session.version,draw:await drawFor(session.id),coupons:await wallet.json(),profile,leaderboard:await board()});
 }
 if(!uuid.test(input.id||''))return reply({error:'게임 정보를 확인해주세요.'},400);
 const r=await fetch(`${url}/rest/v1/workshop_game_sessions?id=eq.${input.id}&visitor_hash=eq.${visitor}&day=eq.${day}&select=*&limit=1`,{headers:dbHeaders});if(!r.ok)throw Error('session read');const [session]=await r.json();if(!session)return reply({error:'오늘의 게임을 다시 열어주세요.'},409);
 if(path.endsWith('/checkpoint')){
  if(input.engineVersion!==Engine.VERSION)return reply({error:'게임이 새로 업데이트됐어요. 화면을 새로고침한 뒤 다시 시작해주세요.'},409);
  if(input.version!==session.version)return reply({error:'다른 창에서 진행 중이거나 연결이 바뀌었어요. 게임을 다시 이어주세요.'},409);
  let state;try{state=Engine.replay(session.state,input.toTick,input.events);}catch{return reply({error:'게임 입력을 확인해주세요. 다시 이어주세요.'},400);}
  const saved=await rpc('workshop_game_checkpoint',{p_id:session.id,p_visitor_hash:visitor,p_version:session.version,p_state:state});
  if(!saved.ok)throw Error('checkpoint');if(!await saved.json())return reply({error:'게임 시간을 확인하지 못했어요. 잠시 후 이어주세요.'},409);
  return reply({version:session.version+1,verifiedActive:state.active,score:state.score,leaderboard:await board()});
 }
 if(path.endsWith('/claim')){
  if(!Engine.eligible(session.state))return reply({error:'한 판에서 2분을 완주하고 500점을 채워주세요.'},409);
  const claimed=await rpc('workshop_game_claim',{p_id:session.id,p_visitor_hash:visitor,p_roll:prizeRoll(),p_code:couponCode()});
  if(!claimed.ok){const e=await claimed.text();if(e.includes('game_not_ready'))return reply({error:'한 판에서 2분을 완주하고 500점을 채워주세요.'},409);throw Error('claim');}
  return reply({draw:await claimed.json()});
 }
 return reply({error:'지원하지 않는 요청입니다.'},404);
}
