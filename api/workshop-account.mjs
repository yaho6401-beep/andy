import '../feedback-config.js';
const endpoint='https://jqlrwwheiwjdrobluifx.supabase.co/functions/v1/workshop-account?forceFunctionRegion=eu-west-1',cookieName='books_scents_member';
export function memberCookie(headers){const value=String(headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);return /^[a-f0-9]{64}$/.test(value||'')?value:'';}
export function sameOrigin(req){const origin=req.headers.origin,host=req.headers.host;if(req.headers['sec-fetch-site']==='cross-site')return false;if(!origin)return true;try{const u=new URL(origin);return u.host===host&&(u.protocol==='https:'||['localhost','127.0.0.1'].includes(u.hostname));}catch{return false;}}
export async function accountProxy(req,{fetchImpl=fetch}={}){
 if(req.method!=='POST')return {status:405,body:{error:'POST 요청만 지원해요.'}};
 if(!sameOrigin(req)||!String(req.headers['content-type']).includes('application/json'))return {status:403,body:{error:'같은 사이트에서 다시 시도해 주세요.'}};
 const input=typeof req.body==='string'?JSON.parse(req.body):req.body;if(!input||typeof input!=='object'||Array.isArray(input)||JSON.stringify(input).length>28000)return {status:400,body:{error:'요청 내용을 확인해 주세요.'}};
 if(!['register','login','me','logout','delete-account','records','save-record','delete-record','clear-records'].includes(input.op))return {status:400,body:{error:'지원하지 않는 요청이에요.'}};
 const token=memberCookie(req.headers);if(input.op==='me'&&!token)return {status:200,body:{profile:null}};
 const r=await fetchImpl(endpoint,{method:'POST',headers:{apikey:globalThis.FeedbackConfig.key,'Content-Type':'application/json','x-region':'eu-west-1',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(input),signal:AbortSignal.timeout(18000)}),data=await r.json();
 const session=data.sessionToken;delete data.sessionToken;
 const secure=!/^(localhost|127\.0\.0\.1)(:|$)/.test(req.headers.host||'');
 let cookie;if(r.ok&&/^[a-f0-9]{64}$/.test(session||''))cookie=`${cookieName}=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure?'; Secure':''}`;
 if(['logout','delete-account'].includes(input.op)&&r.ok||r.status===401&&token)cookie=`${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure?'; Secure':''}`;
 return {status:r.status,body:data,cookie};
}
export default async function handler(req,res){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');try{const result=await accountProxy(req);if(result.cookie)res.setHeader('Set-Cookie',result.cookie);return res.status(result.status).json(result.body);}catch{return res.status(502).json({error:'회원 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'});}}
