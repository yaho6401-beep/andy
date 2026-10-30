(function(g){
  'use strict';
  const config=g.FeedbackConfig;if(!config)return;
  const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const roles={owner:'사장님',manager:'매니저'},views=new Set();
  const visitor=g.FeedbackVisitor||crypto.randomUUID();let adminToken=g.FeedbackAdmin?.token||null,serial=0,pendingDelete=null,deleteBusy=false;
  const date=value=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(value));
  async function api(path,options={}){
    const r=await fetch(config.endpoint+'/scent'+path,{...options,headers:{apikey:config.key,...(options.body?{'Content-Type':'application/json'}:{}),...(adminToken?{Authorization:'Bearer '+adminToken}:{})},signal:AbortSignal.timeout(15000)});
    const result=await r.json();if(!r.ok){const error=Error(result.error||'향 소감과 연결하지 못했어요. 잠시 후 다시 시도해주세요.');error.status=r.status;throw error;}return result;
  }
  function prune(){for(const view of views)if(!view.root.isConnected)views.delete(view);}
  function status(view,message){if(views.has(view)&&view.root.isConnected)view.root.querySelector('.sc-status').textContent=message;}
  function invalidate(error){if(error.status===401&&adminToken){adminToken=null;g.FeedbackAdmin?.invalidate();for(const view of views)render(view);}}
  function likeButton(view,target,count,liked){return `<button type="button" class="sc-like" data-sc-like="${target}" aria-pressed="${Boolean(liked)}" ${!view.data||view.busy.has(target)||!view.data.settings.likes_open?'disabled':''}><span aria-hidden="true">${liked?'♥':'♡'}</span> <span>${target==='scent'?'이 향 좋아요':'좋아요'}</span> <b>${Number(count||0)}</b></button>`;}
  function render(view){
    const root=view.root,data=view.data;if(!views.has(view)||!root.isConnected)return;
    root.querySelector('.sc-scent-like').innerHTML=likeButton(view,'scent',data?.likes,data?.liked);
    root.querySelector('.sc-admin-login').hidden=Boolean(adminToken);
    root.querySelector('.sc-admin-editor').hidden=!adminToken;
    if(!data)return;
    root.querySelector('.sc-staff').innerHTML=data.staff.length?data.staff.map(post=>`<article class="sc-staff-card"><div class="sc-post-heading"><strong>${roles[post.role]}</strong><span class="sc-badge">공식 코멘트</span><time>${date(post.updated_at)}</time></div><p data-no-i18n>${esc(post.body)}</p><div class="sc-post-actions">${likeButton(view,post.role,post.likes,post.liked)}${adminToken?`<button type="button" class="text-button" data-sc-edit="${post.role}">수정</button><button type="button" class="text-button" data-sc-staff-delete="${post.role}">삭제</button>`:''}</div></article>`).join(''):'<p class="sc-empty">사장님과 매니저의 코멘트를 기다리고 있어요.</p>';
    root.querySelector('.sc-reviews').innerHTML=data.reviews.length?data.reviews.map(post=>`<article class="sc-review"><div class="sc-post-heading"><strong data-no-i18n>${esc(post.nickname)}</strong><time>${date(post.created_at)}</time></div><p data-no-i18n>${esc(post.body)}</p><button type="button" class="text-button" data-sc-delete="${post.id}">${adminToken?'관리자 삭제':'내 소감 삭제'}</button></article>`).join(''):'<p class="sc-empty">이 향에 대한 첫 소감을 남겨주세요.</p>';
    root.querySelector('.sc-page').textContent=data.page+' / '+data.pages;
    root.querySelector('[data-sc-prev]').disabled=data.page<=1;root.querySelector('[data-sc-next]').disabled=data.page>=data.pages;
    root.querySelector('.sc-review-count').textContent=String(data.total);
    root.querySelector('.sc-review-submit').disabled=view.reviewBusy||!data.settings.comments_open;
    root.querySelector('.sc-writing-state').textContent=data.settings.comments_open?'':'지금은 댓글 작성을 쉬고 있어요.';
    if(!view.editorTouched){const role=root.querySelector('[name=staff-role]').value;root.querySelector('[name=staff-body]').value=data.staff.find(p=>p.role===role)?.body||'';}
  }
  async function load(view,page=view.data?.page||1){
    if(!views.has(view)||!view.root.isConnected)return;const version=++view.version;
    try{const data=await api('?scent='+encodeURIComponent(view.id)+'&page='+page+'&visitor='+encodeURIComponent(visitor));if(version!==view.version||!view.root.isConnected||!views.has(view))return;view.data=data;render(view);status(view,'');}
    catch(error){if(version===view.version)status(view,error.message);}
  }
  async function refresh(id){prune();await Promise.all([...views].filter(v=>v.id===id).map(v=>load(v)));}
  function mount(root,id){
    if(!root)return;prune();const existing=[...views].find(v=>v.root===root&&v.id===id);if(existing)return;
    for(const view of views)if(view.root===root)views.delete(view);
    const key='sc-'+(++serial),view={root,id,data:null,version:0,busy:new Set(),reviewBusy:false,staffBusy:false,editorTouched:false,intent:null};views.add(view);
    root.innerHTML=`<div class="sc-heading"><h3>이 향의 이야기</h3><div class="sc-scent-like"></div></div><div class="sc-staff"></div><button type="button" class="text-button sc-admin-login" data-sc-login>사장·매니저 코멘트 작성</button><details class="sc-admin-editor" hidden><summary>공식 코멘트 작성 · 수정</summary><form class="sc-staff-form"><label for="${key}-role">작성자<select id="${key}-role" name="staff-role"><option value="owner">사장님</option><option value="manager">매니저</option></select></label><label for="${key}-staff-body">공식 코멘트<textarea id="${key}-staff-body" name="staff-body" rows="3" maxlength="1000" required placeholder="이 향의 매력이나 추천 포인트를 남겨주세요."></textarea></label><small>공식 코멘트는 역할별로 하나씩 상단에 고정돼요. 최대 500자.</small><button type="submit" class="secondary sc-staff-submit">코멘트 저장</button></form></details><details class="sc-customer-details"><summary>고객 시향 소감 <span class="sc-review-count">0</span></summary><div class="sc-reviews"></div><div class="sc-pagination"><button type="button" class="text-button" data-sc-prev disabled>이전</button><span class="sc-page">1 / 1</span><button type="button" class="text-button" data-sc-next disabled>다음</button></div><form class="sc-review-form"><label for="${key}-nickname">닉네임<input id="${key}-nickname" name="nickname" maxlength="40" autocomplete="nickname" placeholder="어떤 이름으로 남길까요?"></label><label for="${key}-body">나의 시향 소감<textarea id="${key}-body" name="body" rows="3" maxlength="600" required placeholder="직접 맡아본 느낌이나 떠오르는 장면을 남겨주세요."></textarea></label><label for="${key}-password">내 소감 삭제용 비밀번호<input id="${key}-password" type="password" name="password" minlength="4" maxlength="64" autocomplete="new-password" required></label><small>소감은 300자 이내로, 비밀번호는 4~64자로 설정해주세요.</small><button type="submit" class="secondary sc-review-submit" disabled>소감 남기기</button><p class="sc-writing-state"></p></form></details><p class="sc-status" role="status">소감을 불러오고 있어요.</p>`;
    root.onclick=async e=>{
      const button=e.target.closest('button');if(!button)return;
      if(button.matches('[data-sc-login]')){$('scent-admin-password').value='';$('scent-admin-status').textContent='';$('scent-admin-dialog').showModal();return;}
      if(button.matches('[data-sc-like]')){
        const target=button.dataset.scLike;if(!view.data||view.busy.has(target))return;const post=target==='scent'?view.data:view.data.staff.find(p=>p.role===target);if(!post)return;
        view.busy.add(target);render(view);
        try{await api('/like',{method:'POST',body:JSON.stringify({scentId:id,target,visitor,liked:!post.liked})});await refresh(id);}catch(error){status(view,error.message);}finally{view.busy.delete(target);render(view);}return;
      }
      if(button.matches('[data-sc-prev],[data-sc-next]')){await load(view,view.data.page+(button.matches('[data-sc-prev]')?-1:1));return;}
      if(button.matches('[data-sc-edit]')){const editor=root.querySelector('.sc-admin-editor');editor.open=true;root.querySelector('[name=staff-role]').value=button.dataset.scEdit;root.querySelector('[name=staff-body]').value=view.data.staff.find(p=>p.role===button.dataset.scEdit)?.body||'';view.editorTouched=false;root.querySelector('[name=staff-body]').focus();return;}
      if(button.matches('[data-sc-delete],[data-sc-staff-delete]')){
        pendingDelete={view,scentId:id,id:button.dataset.scDelete,role:button.dataset.scStaffDelete};$('scent-review-delete-password').value='';$('scent-review-delete-status').textContent='';$('scent-review-delete-password-wrap').hidden=Boolean(adminToken);$('scent-review-delete-password').required=!adminToken;$('scent-review-delete-dialog').showModal();
      }
    };
    root.querySelector('[name=staff-role]').addEventListener('change',()=>{view.editorTouched=false;render(view);});
    root.querySelector('[name=staff-body]').addEventListener('input',()=>{view.editorTouched=true;});
    root.querySelector('.sc-staff-form').addEventListener('submit',async e=>{
      e.preventDefault();if(view.staffBusy)return;const body=root.querySelector('[name=staff-body]').value.trim(),role=root.querySelector('[name=staff-role]').value;
      if(!body||[...body].length>500){status(view,'공식 코멘트는 500자 이내로 적어주세요.');return;}
      view.staffBusy=true;root.querySelector('.sc-staff-submit').disabled=true;
      try{await api('/staff',{method:'POST',body:JSON.stringify({scentId:id,role,body})});view.editorTouched=false;await refresh(id);status(view,'공식 코멘트를 저장했어요.');}catch(error){status(view,error.message);invalidate(error);}finally{view.staffBusy=false;if(views.has(view))root.querySelector('.sc-staff-submit').disabled=false;}
    });
    root.querySelector('.sc-review-form').addEventListener('submit',async e=>{
      e.preventDefault();if(view.reviewBusy)return;const form=e.currentTarget,nickname=form.elements.nickname.value.trim(),body=form.elements.body.value.trim(),password=form.elements.password.value;
      if(!body||[...body].length>300||[...nickname].length>20){status(view,'닉네임은 20자, 소감은 300자 이내로 적어주세요.');return;}
      if(password.length<4||password.length>64){status(view,'삭제용 비밀번호를 4~64자로 설정해주세요.');return;}
      const key=JSON.stringify({nickname,body});if(view.intent?.key!==key)view.intent={key,id:crypto.randomUUID()};
      form.elements.password.value='';view.reviewBusy=true;render(view);
      try{await api('/review',{method:'POST',body:JSON.stringify({scentId:id,id:view.intent.id,nickname,body,password})});form.reset();view.intent=null;await load(view,1);await Promise.all([...views].filter(v=>v!==view&&v.id===id).map(v=>load(v)));status(view,'시향 소감을 남겼어요.');}catch(error){status(view,error.message);}finally{view.reviewBusy=false;render(view);}
    });
    render(view);load(view);
  }
  $('scent-admin-close').addEventListener('click',()=>$('scent-admin-dialog').close());
  $('scent-admin-dialog').addEventListener('close',()=>{$('scent-admin-password').value='';});
  $('scent-admin-form').addEventListener('submit',async e=>{
    e.preventDefault();const password=$('scent-admin-password').value;$('scent-admin-password').value='';$('scent-admin-submit').disabled=true;
    try{await g.FeedbackAdmin.login(password);$('scent-admin-dialog').close();for(const v of views){const editor=v.root.querySelector('.sc-admin-editor');if(editor)editor.open=true;}}
    catch(error){$('scent-admin-status').textContent=error.message;}finally{$('scent-admin-submit').disabled=false;}
  });
  $('scent-review-delete-close').addEventListener('click',()=>$('scent-review-delete-dialog').close());
  $('scent-review-delete-dialog').addEventListener('close',()=>{pendingDelete=null;$('scent-review-delete-password').value='';});
  $('scent-review-delete-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!pendingDelete||deleteBusy)return;const target=pendingDelete,password=$('scent-review-delete-password').value;$('scent-review-delete-password').value='';deleteBusy=true;$('scent-review-delete-confirm').disabled=true;
    try{await api(target.role?'/staff/delete':'/delete',{method:'POST',body:JSON.stringify({scentId:target.scentId,id:target.id,role:target.role,password})});$('scent-review-delete-dialog').close();await refresh(target.scentId);}
    catch(error){$('scent-review-delete-status').textContent=error.message;invalidate(error);if(!adminToken){$('scent-review-delete-password-wrap').hidden=false;$('scent-review-delete-password').required=true;}}finally{deleteBusy=false;$('scent-review-delete-confirm').disabled=false;}
  });
  g.ScentCommunity={mount,showSelected(id){const root=$('selected-scent-community');if(!root)return;root.hidden=!id;if(id)mount(root,id);else{for(const v of views)if(v.root===root)views.delete(v);root.innerHTML='';}},setAdminToken(token){adminToken=token;prune();for(const view of views)render(view);}};
  if(typeof selectedMain!=='undefined'&&selectedMain)g.ScentCommunity.showSelected(selectedMain);
})(globalThis);
