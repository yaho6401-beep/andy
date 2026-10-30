type GalleryDeps={
  url:string;dbHeaders:Record<string,string>;
  reply:(body:unknown,status?:number)=>Response;
  limited:(req:Request,kind:string,max:number)=>Promise<boolean>;
  sessionHash:(req:Request)=>Promise<string|null>;
  passwordHash:(password:string,salt:string,iterations?:number)=>Promise<string>;
  equalHash:(a:string,b:string)=>boolean;
  cleanText:(value:unknown)=>string;
};
const bucket='perfume-gallery',maxBytes=3145728;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function boundedBody(req:Request,max:number){
  const reader=req.body?.getReader();if(!reader)return null;
  let size=0;const chunks:Uint8Array[]=[];
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();return null;}chunks.push(value);}
  return new Blob(chunks);
}
export async function handleGallery(req:Request,d:GalleryDeps){
  const {url,dbHeaders,reply}=d,path=new URL(req.url).pathname;
  const storageHeaders={...dbHeaders};
  async function removeFile(storagePath:string){
    return fetch(`${url}/storage/v1/object/${bucket}`,{method:'DELETE',headers:dbHeaders,body:JSON.stringify({prefixes:[storagePath]})});
  }
  if(req.method==='GET'){
    const requested=Number(new URL(req.url).searchParams.get('page')||1);
    if(!Number.isInteger(requested)||requested<1||requested>10000)return reply({error:'잘못된 페이지입니다.'},400);
    const query=new URLSearchParams({select:'id,nickname,caption,storage_path,created_at',order:'created_at.desc,id.desc',limit:'9',offset:String((requested-1)*9)});
    let r=await fetch(`${url}/rest/v1/workshop_gallery?${query}`,{headers:{...dbHeaders,Prefer:'count=exact'}}),page=requested;
    if(r.status===416){const total=Number(r.headers.get('content-range')?.split('/')[1]||0);page=Math.max(1,Math.ceil(total/9));query.set('offset',String((page-1)*9));r=await fetch(`${url}/rest/v1/workshop_gallery?${query}`,{headers:{...dbHeaders,Prefer:'count=exact'}});}
    if(!r.ok)throw Error('gallery list');
    const total=Number(r.headers.get('content-range')?.split('/')[1]||0);
    const items=(await r.json()).map((row:{storage_path:string})=>({...row,image_url:`${url}/storage/v1/object/public/${bucket}/${row.storage_path}`}));
    return reply({items,page,pages:Math.max(1,Math.ceil(total/9)),total});
  }
  if(req.method!=='POST')return reply({error:'지원하지 않는 요청입니다.'},405);
  if(path.endsWith('/delete')){
    const blob=await boundedBody(req,2048);if(!blob)return reply({error:'잘못된 요청입니다.'},400);
    let input;try{input=JSON.parse(await blob.text());}catch{return reply({error:'잘못된 요청입니다.'},400);}
    if(!uuid.test(input?.id||''))return reply({error:'사진을 확인해주세요.'},400);
    const isAdmin=Boolean(await d.sessionHash(req));
    if(!isAdmin&&!await d.limited(req,'gallery-password',10))return reply({error:'시도가 많아요. 잠시 후 다시 시도해주세요.'},429);
    const r=await fetch(`${url}/rest/v1/workshop_gallery?id=eq.${input.id}&select=id,storage_path,password_hash,salt,iterations&limit=1`,{headers:dbHeaders});
    if(!r.ok)throw Error('gallery password');const [row]=await r.json();
    if(!isAdmin&&(!row||typeof input.password!=='string'||input.password.length<4||input.password.length>64||!d.equalHash(await d.passwordHash(input.password,row.salt,row.iterations),row.password_hash)))return reply({error:'비밀번호가 맞지 않아요.'},401);
    if(!row)return reply({error:'삭제된 사진이에요.'},404);
    // Remove the public object before its metadata, so a successful deletion leaves no public photo.
    const removed=await removeFile(row.storage_path);if(!removed.ok)throw Error('gallery storage delete');
    const deleted=await fetch(`${url}/rest/v1/workshop_gallery?id=eq.${row.id}`,{method:'DELETE',headers:dbHeaders});if(!deleted.ok)throw Error('gallery delete');
    return reply({deleted:true});
  }
  if(!req.headers.get('content-type')?.startsWith('multipart/form-data'))return reply({error:'사진 파일을 선택해주세요.'},415);
  if(!await d.limited(req,'gallery-upload',3))return reply({error:'사진을 많이 올렸어요. 잠시 후 다시 올려주세요.'},429);
  const body=await boundedBody(req,maxBytes+16384);if(!body)return reply({error:'사진 용량은 3MB 이하여야 해요.'},413);
  let form;try{form=await new Response(body,{headers:{'Content-Type':req.headers.get('content-type')!}}).formData();}catch{return reply({error:'사진 파일을 확인해주세요.'},400);}
  const image=form.get('image'),nickname=d.cleanText(form.get('nickname'))||'향기를 남긴 손님',caption=d.cleanText(form.get('caption')),password=form.get('password');
  if(!(image instanceof File)||image.type!=='image/jpeg'||image.size<128||image.size>maxBytes)return reply({error:'JPG 사진 파일을 확인해주세요.'},400);
  if(!caption||[...caption].length>100||[...nickname].length>20||/[\u0000-\u001f\u007f]/.test(nickname+caption))return reply({error:'닉네임은 20자, 설명은 100자 이내로 적어주세요.'},400);
  if(typeof password!=='string'||password.length<4||password.length>64)return reply({error:'삭제용 비밀번호를 4~64자로 설정해주세요.'},400);
  if(form.get('consent')!=='true')return reply({error:'공개 갤러리 등록에 동의해주세요.'},400);
  const bytes=new Uint8Array(await image.arrayBuffer());
  if(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255||bytes[bytes.length-2]!==255||bytes[bytes.length-1]!==217)return reply({error:'JPG 사진 파일을 확인해주세요.'},400);
  const id=crypto.randomUUID(),storagePath=`${id}.jpg`,salt=Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>x.toString(16).padStart(2,'0')).join('');
  const hash=await d.passwordHash(password,salt);
  const upload=await fetch(`${url}/storage/v1/object/${bucket}/${storagePath}`,{method:'POST',headers:{...storageHeaders,'Content-Type':'image/jpeg','Cache-Control':'60','x-upsert':'false'},body:bytes});
  if(!upload.ok)throw Error('gallery upload');
  const row={id,nickname,caption,storage_path:storagePath,password_hash:hash,salt};
  try{
    const saved=await fetch(`${url}/rest/v1/workshop_gallery`,{method:'POST',headers:dbHeaders,body:JSON.stringify(row)});
    if(!saved.ok)throw Error('gallery save');
  }catch(error){await removeFile(storagePath);throw error;}
  return reply({uploaded:true,id},201);
}
