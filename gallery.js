(function(g){
  'use strict';
  const $=id=>document.getElementById(id),config=g.FeedbackConfig;
  if(!config||!$('gallery'))return;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let page=1,pages=1,items=[],adminToken=null,blob=null,previewUrl=null,preparing=false,uploading=false,deleteId=null,deleting=false,loadVersion=0;
  async function api(path='',options={}){
    const headers={apikey:config.key,...(adminToken?{Authorization:'Bearer '+adminToken}:{})};
    if(typeof options.body==='string')headers['Content-Type']='application/json';
    const r=await fetch(config.endpoint+'/gallery'+path,{...options,headers,signal:AbortSignal.timeout(options.body instanceof FormData?60000:15000)});
    const result=await r.json();if(!r.ok){const error=Error(result.error||'갤러리와 연결하지 못했어요. 잠시 후 다시 시도해주세요.');error.status=r.status;throw error;}return result;
  }
  function render(){
    $('gallery-grid').innerHTML=items.length?items.map(item=>`<article class="gallery-card"><button type="button" class="gallery-photo" data-gallery-view="${item.id}" aria-label="사진 크게 보기"><img src="${escape(item.image_url)}" alt="${escape(item.caption)}" loading="lazy" width="600" height="600"></button><div class="gallery-card-text"><p data-no-i18n>${escape(item.caption)}</p><small><span data-no-i18n>${escape(item.nickname)}</span><time datetime="${escape(item.created_at)}">${new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(item.created_at))}</time></small><button type="button" class="text-button" data-gallery-delete="${item.id}">${adminToken?'관리자 삭제':'내 사진 삭제'}</button></div></article>`).join(''):'<p class="gallery-empty">공방에서 만든 첫 향수 사진을 남겨주세요.</p>';
    $('gallery-page').textContent=page+' / '+pages;$('gallery-prev').disabled=page<=1;$('gallery-next').disabled=page>=pages;
  }
  async function load(target=1){
    const version=++loadVersion;
    try{const data=await api('?page='+target);if(version!==loadVersion)return;items=data.items;page=data.page;pages=data.pages;render();$('gallery-load-status').textContent='';}
    catch(error){if(version===loadVersion)$('gallery-load-status').textContent=error.message;}
  }
  function clearPreview(){blob=null;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;$('gallery-preview').removeAttribute('src');$('gallery-preview').hidden=true;}
  $('gallery-open-form').addEventListener('click',()=>{const opening=$('gallery-form').hidden;$('gallery-form').hidden=!opening;$('gallery-open-form').setAttribute('aria-expanded',String(opening));if(opening)$('gallery-file').focus();});
  $('gallery-file').addEventListener('change',async()=>{
    clearPreview();$('gallery-status').textContent='';const file=$('gallery-file').files[0];if(!file)return;
    if(!file.type.startsWith('image/')||file.size>20*1024*1024){$('gallery-status').textContent='20MB 이하의 사진을 선택해주세요.';return;}
    preparing=true;$('gallery-submit').disabled=true;$('gallery-file').disabled=true;let objectUrl;
    try{
      objectUrl=URL.createObjectURL(file);const image=new Image();image.src=objectUrl;await image.decode();
      if(image.naturalWidth*image.naturalHeight>50000000)throw Error('size');
      const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
      blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.85));if(!blob||blob.size>3145728)throw Error('size');
      previewUrl=URL.createObjectURL(blob);$('gallery-preview').src=previewUrl;$('gallery-preview').hidden=false;
    }catch{clearPreview();$('gallery-status').textContent='사진을 읽지 못했어요. JPG·PNG·WEBP 사진을 선택해주세요.';}
    finally{if(objectUrl)URL.revokeObjectURL(objectUrl);preparing=false;$('gallery-submit').disabled=false;$('gallery-file').disabled=false;}
  });
  $('gallery-form').addEventListener('submit',async e=>{
    e.preventDefault();if(uploading||preparing)return;
    const nickname=$('gallery-nickname').value.trim(),caption=$('gallery-caption').value.trim(),password=$('gallery-password').value;
    if(!blob){$('gallery-status').textContent='사진 파일을 선택해주세요.';return;}
    if([...nickname].length>20||!caption||[...caption].length>100){$('gallery-status').textContent='닉네임은 20자, 설명은 100자 이내로 적어주세요.';return;}
    if(password.length<4||password.length>64){$('gallery-status').textContent='삭제용 비밀번호를 4~64자로 설정해주세요.';return;}
    if(!$('gallery-consent').checked){$('gallery-status').textContent='공개 갤러리 등록에 동의해주세요.';return;}
    const form=new FormData();form.append('image',blob,'perfume.jpg');form.append('nickname',nickname);form.append('caption',caption);form.append('password',password);form.append('consent','true');
    uploading=true;$('gallery-submit').disabled=true;$('gallery-file').disabled=true;$('gallery-password').value='';$('gallery-status').textContent='사진을 올리고 있어요…';
    try{await api('',{method:'POST',body:form});$('gallery-form').reset();clearPreview();$('gallery-form').hidden=true;$('gallery-open-form').setAttribute('aria-expanded','false');await load(1);$('gallery-load-status').textContent='향수 사진을 갤러리에 남겼어요.';}
    catch(error){$('gallery-status').textContent=error.message;}
    finally{uploading=false;$('gallery-submit').disabled=false;$('gallery-file').disabled=false;}
  });
  $('gallery-grid').addEventListener('click',e=>{
    const view=e.target.closest('[data-gallery-view]');
    if(view){const item=items.find(i=>i.id===view.dataset.galleryView);if(!item)return;$('gallery-view-image').src=item.image_url;$('gallery-view-image').alt=item.caption;$('gallery-view-caption').textContent=item.caption;$('gallery-view-dialog').showModal();return;}
    const remove=e.target.closest('[data-gallery-delete]');if(remove){deleteId=remove.dataset.galleryDelete;$('gallery-delete-password').value='';$('gallery-delete-status').textContent='';$('gallery-delete-password-wrap').hidden=Boolean(adminToken);$('gallery-delete-password').required=!adminToken;$('gallery-delete-dialog').showModal();}
  });
  $('gallery-view-close').addEventListener('click',()=>$('gallery-view-dialog').close());
  $('gallery-delete-close').addEventListener('click',()=>$('gallery-delete-dialog').close());
  $('gallery-delete-dialog').addEventListener('close',()=>{$('gallery-delete-password').value='';deleteId=null;});
  $('gallery-delete-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!deleteId||deleting)return;const id=deleteId,password=$('gallery-delete-password').value;$('gallery-delete-password').value='';
    deleting=true;$('gallery-delete-confirm').disabled=true;
    try{await api('/delete',{method:'POST',body:JSON.stringify({id,password})});$('gallery-delete-dialog').close();deleteId=null;await load(page);$('gallery-load-status').textContent='사진을 삭제했어요.';}
    catch(error){$('gallery-delete-status').textContent=error.message;if(error.status===401&&adminToken){adminToken=null;$('gallery-delete-password-wrap').hidden=false;$('gallery-delete-password').required=true;render();}}
    finally{deleting=false;$('gallery-delete-confirm').disabled=false;}
  });
  $('gallery-prev').addEventListener('click',()=>load(Math.max(1,page-1)));
  $('gallery-next').addEventListener('click',()=>load(Math.min(pages,page+1)));
  g.PerfumeGallery={setAdminToken(token){adminToken=token;render();}};
  load();
})(globalThis);
