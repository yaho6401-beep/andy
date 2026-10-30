(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const config=globalThis.FeedbackConfig;
  const categories={improvement:'이렇게 바뀌면 좋겠어요',request:'이런 기능이 있으면',message:'향기로운 한마디'};
  const colors={butter:'버터 노랑',rose:'장밋빛 분홍',lavender:'라벤더 보라',sage:'세이지 초록',sky:'하늘 파랑',peach:'복숭아 살구'};
  const animals=FeedbackAnimals.labels;
  const visitor=globalThis.FeedbackVisitor||crypto.randomUUID();
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let color='butter',animal='bear',page=1,pages=1,total=0,loading=false,sending=false,notes=[],intent=null;
  let loadVersion=0,settings={posting_open:true,comments_open:true,likes_open:true};
  let thread=null,threadPage=1,threadPages=1,threadTotal=0,comments=[],commentIntent=null,commentBusy=false,threadVersion=0,confirmComment=null;
  const heartBusy=new Set();
  let adminToken=null,confirmDelete=null,deleting=false;
  let editingId=null,editBusy=false,ownerDeleteId=null,ownerDeleteBusy=false;
  const deletedIds=new Set();
  const illustration=FeedbackAnimals.illustration;
  function card(note,preview=false){
    const safeColor=note.color in colors?note.color:'butter';
    const angle=[-2,1.5,-1,2,-1.5,.7][(note.id||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0)%6];
    const social=!preview?`<div class="note-social"><button type="button" data-heart="${note.id}" aria-pressed="${Boolean(note.liked)}" aria-label="공감 ${Number(note.hearts||0)}개${note.liked?', 취소하기':''}" ${heartBusy.has(note.id)||!settings.likes_open?'disabled':''}><span aria-hidden="true">${note.liked?'♥':'♡'}</span> ${Number(note.hearts||0)}</button><button type="button" data-thread="${note.id}">댓글 ${Number(note.comments||0)}</button>${note.editable||adminToken?`<button type="button" class="feedback-edit-link" data-edit-memo="${note.id}">글 수정</button><button type="button" data-delete-memo="${note.id}">글 삭제</button>`:''}</div>`:'';
    const date=preview?'미리보기':`<time datetime="${escape(note.created_at)}"><span>${new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(note.created_at))}</span> <span>${new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(note.created_at))}</span></time>`;
    return `<article class="feedback-note note-${safeColor}${preview?' note-preview':''}" style="--note-angle:${angle}deg"><span class="note-tape" aria-hidden="true"></span><span class="note-category">${categories[note.category]||categories.message}</span><p class="note-body">${escape(note.body)}</p><div class="note-bottom"><span>${escape(note.nickname||'향기를 남긴 손님')}<small>${date}${note.edited_at?' · 수정됨':''}</small></span>${illustration(note.animal)}</div>${social}${!preview&&adminToken?`<div class="note-moderation">${confirmDelete===note.id?`<span>이 메모를 삭제할까요?</span><button type="button" data-feedback-confirm-delete="${note.id}" ${deleting?'disabled':''}>삭제</button><button type="button" data-feedback-cancel-delete ${deleting?'disabled':''}>취소</button>`:`<button type="button" data-feedback-delete="${note.id}" aria-label="${escape(note.nickname||'손님')}님의 메모 삭제">메모 삭제 ×</button><button type="button" data-reset-hearts="${note.id}">하트 초기화</button>`}</div>`:''}</article>`;
  }
  function preview(){
    const body=$('feedback-text').value.trim()||'당신의 한 줄이 이곳에 예쁘게 붙어요.';
    $('feedback-preview').innerHTML=card({body,nickname:$('feedback-nickname').value.trim(),category:$('feedback-category').value,color,animal},true);
    $('feedback-count').textContent=[...$('feedback-text').value].length+' / 100';
  }
  function render(){
    $('feedback-notes').innerHTML=notes.length?notes.map(n=>card(n)).join(''):'<div class="feedback-empty"><span aria-hidden="true">✧</span><h4>첫 번째 향기 메모를 기다려요</h4><p>작은 아이디어도, 다정한 한마디도 좋아요.</p></div>';
    $('feedback-page-label').textContent=page+' / '+pages+' 페이지 · 메모 '+total+'개';
    $('feedback-prev').disabled=page<=1||loading;$('feedback-next').disabled=page>=pages||loading;
    $('feedback-submit').disabled=sending||!settings.posting_open;
    $('feedback-writing-state').textContent=settings.posting_open?'':'지금은 새 메모 작성을 쉬고 있어요.';
  }
  async function api(path='',options={}){
    const response=await fetch(config.endpoint+path,{...options,headers:{apikey:config.key,'Content-Type':'application/json',...(adminToken?{Authorization:'Bearer '+adminToken}:{}),...options.headers},signal:AbortSignal.timeout(15000)});
    let result;try{result=await response.json();}catch{throw Error('보드와 연결하지 못했어요. 잠시 후 다시 시도해주세요.');}
    if(!response.ok){const error=Error(result.error||'메모를 불러오지 못했어요.');error.status=response.status;throw error;}
    return result;
  }
  async function load(targetPage=page){
    const version=++loadVersion;loading=true;$('feedback-prev').disabled=true;$('feedback-next').disabled=true;$('feedback-retry').hidden=true;
    $('feedback-load-status').textContent='메모를 가져오고 있어요…';
    try{const result=await api('?page='+targetPage+'&visitor='+encodeURIComponent(visitor));if(version!==loadVersion)return;
      notes=result.items;page=result.page||1;pages=result.pages||1;total=result.total??notes.length;settings=result.settings||settings;
      loading=false;render();$('feedback-load-status').textContent='';syncSettings();
    }catch(error){if(version===loadVersion){$('feedback-load-status').textContent=error.message;$('feedback-retry').hidden=false;}}
    finally{if(version===loadVersion){loading=false;$('feedback-prev').disabled=page<=1;$('feedback-next').disabled=page>=pages;}}
  }
  $('feedback-colors').innerHTML=Object.entries(colors).map(([id,name])=>`<button type="button" data-note-color="${id}" class="note-swatch note-${id}" aria-label="${name}" aria-pressed="${id===color}"><span aria-hidden="true">${id===color?'✓':''}</span></button>`).join('');
  $('feedback-animals').innerHTML=Object.entries(animals).map(([id,name])=>`<button type="button" data-note-animal="${id}" aria-label="${name}" aria-pressed="${id===animal}">${illustration(id)}<span>${name}</span></button>`).join('');
  $('feedback-colors').addEventListener('click',e=>{const b=e.target.closest('[data-note-color]');if(!b)return;color=b.dataset.noteColor;for(const button of $('feedback-colors').querySelectorAll('button')){button.setAttribute('aria-pressed',String(button.dataset.noteColor===color));button.querySelector('span').textContent=button.dataset.noteColor===color?'✓':'';}preview();});
  $('feedback-animals').addEventListener('click',e=>{const b=e.target.closest('[data-note-animal]');if(!b)return;animal=b.dataset.noteAnimal;for(const button of $('feedback-animals').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.noteAnimal===animal));preview();});
  $('feedback-text').addEventListener('input',()=>{const chars=[...$('feedback-text').value];if(chars.length>100)$('feedback-text').value=chars.slice(0,100).join('');preview();});
  $('feedback-category').addEventListener('change',preview);
  $('feedback-form').addEventListener('submit',async e=>{
    e.preventDefault();if(sending)return;
    const body=$('feedback-text').value.normalize('NFC').trim().replace(/\s+/g,' ');
    if(!body||[...body].length>100){$('feedback-submit-status').textContent='100자 이내로 한 줄을 남겨주세요.';$('feedback-text').focus();return;}
    const nickname=$('feedback-nickname').value.normalize('NFC').trim().replace(/\s+/g,' ');
    if([...nickname].length>20){$('feedback-submit-status').textContent='닉네임은 20자 이내로 적어주세요.';return;}
    const password=$('feedback-edit-password').value;
    if(password.length<4||password.length>64){$('feedback-submit-status').textContent='글 수정용 비밀번호를 4~64자로 설정해주세요.';$('feedback-edit-password').focus();return;}
    const payload={body,nickname,password,category:$('feedback-category').value,color,animal,website:$('feedback-website').value};
    const signature=JSON.stringify(payload);if(!intent||intent.signature!==signature)intent={id:crypto.randomUUID(),signature};
    sending=true;$('feedback-submit').disabled=true;$('feedback-submit').textContent='메모를 붙이고 있어요…';$('feedback-submit-status').textContent='';
    try{
      const result=await api('',{method:'POST',body:JSON.stringify({id:intent.id,...payload})});
      await load(1);intent=null;$('feedback-text').value='';$('feedback-edit-password').value='';preview();
      $('feedback-submit-status').textContent='메모를 붙였어요. 소중한 의견 고맙습니다!';
      $('feedback-board').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    }catch(error){$('feedback-submit-status').textContent=error.message;}
    finally{sending=false;$('feedback-submit').disabled=!settings.posting_open;$('feedback-submit').textContent='보드에 메모 붙이기 ↗';}
  });
  $('feedback-nickname').addEventListener('input',()=>{const chars=[...$('feedback-nickname').value];if(chars.length>20)$('feedback-nickname').value=chars.slice(0,20).join('');preview();});
  function adminState(){
    globalThis.PerfumeGallery?.setAdminToken(adminToken);
    $('feedback-admin-login').hidden=Boolean(adminToken);$('feedback-admin-logout').hidden=!adminToken;
    $('feedback-admin-open').textContent=adminToken?'관리자 모드 · 켜짐':'관리자';$('feedback-admin-controls').hidden=!adminToken;render();if(thread)renderComments();syncSettings();
  }
  $('feedback-admin-open').addEventListener('click',()=>{$('feedback-admin-panel').hidden=!$('feedback-admin-panel').hidden;if(!$('feedback-admin-panel').hidden&&!adminToken)$('feedback-admin-password').focus();});
  $('feedback-admin-login').addEventListener('submit',async e=>{
    e.preventDefault();const password=$('feedback-admin-password').value;$('feedback-admin-password').value='';
    $('feedback-admin-login-button').disabled=true;$('feedback-admin-status').textContent='확인하고 있어요…';
    try{const result=await api('/admin/login',{method:'POST',body:JSON.stringify({password})});adminToken=result.token;confirmDelete=null;adminState();loadAdminStats();$('feedback-admin-status').textContent='관리자 모드예요. 삭제할 메모의 버튼을 눌러주세요.';}
    catch(error){$('feedback-admin-status').textContent=error.message;}
    finally{$('feedback-admin-login-button').disabled=false;}
  });
  $('feedback-admin-logout').addEventListener('click',async()=>{
    try{await api('/admin/logout',{method:'POST'});adminToken=null;confirmDelete=null;adminState();$('feedback-admin-status').textContent='관리자 모드를 종료했어요.';}
    catch(error){$('feedback-admin-status').textContent=error.message;}
  });
  $('feedback-notes').addEventListener('click',async e=>{
    const ownerDelete=e.target.closest('[data-delete-memo]');if(ownerDelete){openOwnerDelete(ownerDelete.dataset.deleteMemo);return;}
    const edit=e.target.closest('[data-edit-memo]');if(edit){openEdit(edit.dataset.editMemo);return;}
    const heart=e.target.closest('[data-heart]');if(heart){await toggleHeart(heart.dataset.heart);return;}
    const threadButton=e.target.closest('[data-thread]');if(threadButton){await openThread(threadButton.dataset.thread);return;}
    if(!adminToken||deleting)return;
    const reset=e.target.closest('[data-reset-hearts]');if(reset){const id=reset.dataset.resetHearts;$('feedback-admin-confirm').hidden=false;$('feedback-admin-confirm-text').textContent='이 메모의 하트를 모두 초기화할까요?';$('feedback-admin-confirm-yes').dataset.resetId=id;$('feedback-admin-panel').hidden=false;$('feedback-admin-confirm').scrollIntoView({block:'center',behavior:'smooth'});return;}
    const ask=e.target.closest('[data-feedback-delete]');if(ask){confirmDelete=ask.dataset.feedbackDelete;render();return;}
    if(e.target.closest('[data-feedback-cancel-delete]')){confirmDelete=null;render();return;}
    const button=e.target.closest('[data-feedback-confirm-delete]');if(!button)return;
    const id=button.dataset.feedbackConfirmDelete;if(id!==confirmDelete)return;
    deleting=true;render();
    try{await api('?id='+encodeURIComponent(id),{method:'DELETE'});deletedIds.add(id);notes=notes.filter(n=>n.id!==id);confirmDelete=null;if(thread?.id===id){$('feedback-thread').close();thread=null;}await load(page);$('feedback-admin-status').textContent='메모를 삭제했어요.';}
    catch(error){$('feedback-admin-status').textContent=error.message;if(error.status===401){adminToken=null;confirmDelete=null;adminState();$('feedback-admin-panel').hidden=false;}}
    finally{deleting=false;render();}
  });
  function openEdit(id){
    const note=notes.find(n=>n.id===id);if(!note)return;editingId=id;
    $('memo-edit-nickname').value=note.nickname||'';$('memo-edit-body').value=note.body;$('memo-edit-password').value='';$('memo-edit-status').textContent='';
    $('memo-edit-password-wrap').hidden=Boolean(adminToken);$('memo-edit-admin-hint').hidden=!adminToken;$('memo-edit-password').required=!adminToken;
    $('memo-edit-dialog').showModal();
  }
  $('memo-edit-close').addEventListener('click',()=>$('memo-edit-dialog').close());
  $('memo-edit-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!editingId||editBusy)return;
    const body=$('memo-edit-body').value.normalize('NFC').trim().replace(/\s+/g,' '),nickname=$('memo-edit-nickname').value.normalize('NFC').trim().replace(/\s+/g,' '),password=$('memo-edit-password').value;
    if(!body||[...body].length>100||[...nickname].length>20){$('memo-edit-status').textContent='닉네임은 20자, 메모는 100자 이내로 적어주세요.';return;}
    editBusy=true;$('memo-edit-save').disabled=true;$('memo-edit-password').value='';
    try{await api('/edit',{method:'POST',body:JSON.stringify({id:editingId,body,nickname,password})});$('memo-edit-dialog').close();await load(page);$('feedback-load-status').textContent='메모를 수정했어요.';}
    catch(error){$('memo-edit-status').textContent=error.message;if(adminToken&&error.status===401){handleAdminError(error);$('memo-edit-password-wrap').hidden=false;$('memo-edit-admin-hint').hidden=true;$('memo-edit-password').required=true;}}
    finally{editBusy=false;$('memo-edit-save').disabled=false;}
  });
  function openOwnerDelete(id){
    if(!notes.some(n=>n.id===id))return;ownerDeleteId=id;
    $('memo-delete-password').value='';$('memo-delete-status').textContent='';
    $('memo-delete-password-wrap').hidden=Boolean(adminToken);$('memo-delete-password').required=!adminToken;
    $('memo-delete-dialog').showModal();
  }
  $('memo-delete-close').addEventListener('click',()=>$('memo-delete-dialog').close());
  $('memo-delete-dialog').addEventListener('close',()=>{$('memo-delete-password').value='';ownerDeleteId=null;});
  $('memo-delete-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!ownerDeleteId||ownerDeleteBusy)return;
    const id=ownerDeleteId,password=$('memo-delete-password').value;$('memo-delete-password').value='';
    ownerDeleteBusy=true;$('memo-delete-confirm').disabled=true;
    try{await api('/delete',{method:'POST',body:JSON.stringify({id,password})});if(thread?.id===id){$('feedback-thread').close();thread=null;}$('memo-delete-dialog').close();ownerDeleteId=null;await load(page);$('feedback-load-status').textContent='메모를 삭제했어요.';}
    catch(error){$('memo-delete-status').textContent=error.message;if(adminToken&&error.status===401){handleAdminError(error);$('memo-delete-password-wrap').hidden=false;$('memo-delete-password').required=true;}}
    finally{ownerDeleteBusy=false;$('memo-delete-confirm').disabled=false;}
  });
  function handleAdminError(error){
    $('feedback-admin-status').textContent=error.message;if(error.status===401){adminToken=null;confirmDelete=null;adminState();$('feedback-admin-panel').hidden=false;}
  }
  async function toggleHeart(id){
    const note=notes.find(n=>n.id===id);if(!note||heartBusy.has(id)||!settings.likes_open)return;
    heartBusy.add(id);render();
    try{const result=await api('/heart',{method:'POST',body:JSON.stringify({id,visitor,liked:!note.liked})});Object.assign(note,result);$('feedback-load-status').textContent='';}
    catch(error){$('feedback-load-status').textContent=error.message;}
    finally{heartBusy.delete(id);render();}
  }
  async function openThread(id){
    thread=notes.find(n=>n.id===id);if(!thread)return;threadPage=1;comments=[];threadTotal=0;confirmComment=null;commentIntent=null;
    $('feedback-thread-note').textContent=thread.body;$('comment-nickname').value=$('feedback-nickname').value;$('comment-body').value='';$('comment-status').textContent='';
    $('feedback-thread').showModal();await loadComments(1);
  }
  function renderComments(){
    $('comment-list').innerHTML=comments.length?comments.map(c=>`<article class="feedback-comment"><div><strong>${escape(c.nickname)}</strong><time>${new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(c.created_at))}</time></div><p>${escape(c.body)}</p>${adminToken?`<div class="comment-admin">${confirmComment===c.id?`<span>댓글을 삭제할까요?</span><button type="button" data-comment-confirm="${c.id}">삭제</button><button type="button" data-comment-cancel>취소</button>`:`<button type="button" data-comment-delete="${c.id}">댓글 삭제</button>`}</div>`:''}</article>`).join(''):'<p class="comment-empty">첫 댓글로 이야기를 이어주세요.</p>';
    $('comment-page-label').textContent=threadPage+' / '+threadPages;$('comment-prev').disabled=threadPage<=1;$('comment-next').disabled=threadPage>=threadPages;
    $('comment-submit').disabled=commentBusy||!settings.comments_open;$('comment-writing-state').textContent=settings.comments_open?'':'지금은 댓글 작성을 쉬고 있어요.';
  }
  async function loadComments(targetPage=1){
    if(!thread)return;const id=thread.id,version=++threadVersion;$('comment-status').textContent='댓글을 가져오고 있어요…';
    try{const result=await api('/comments?id='+id+'&page='+targetPage);if(version!==threadVersion||thread?.id!==id)return;
      if(result.page>result.pages){await loadComments(result.pages);return;}
      comments=result.items;threadPage=result.page;threadPages=result.pages;threadTotal=result.total;
      const note=notes.find(n=>n.id===id);if(note)note.comments=threadTotal;render();renderComments();$('comment-status').textContent='';
    }catch(error){if(version===threadVersion)$('comment-status').textContent=error.message;}
  }
  $('comment-form').addEventListener('submit',async e=>{
    e.preventDefault();if(!thread||commentBusy||!settings.comments_open)return;
    const feedback_id=thread.id,body=$('comment-body').value.normalize('NFC').trim().replace(/\s+/g,' '),nickname=$('comment-nickname').value.normalize('NFC').trim().replace(/\s+/g,' ');
    if(!body||[...body].length>200||[...nickname].length>20){$('comment-status').textContent='닉네임은 20자, 댓글은 200자 이내로 적어주세요.';return;}
    const payload={feedback_id,body,nickname},signature=JSON.stringify(payload);if(!commentIntent||commentIntent.signature!==signature)commentIntent={id:crypto.randomUUID(),signature};
    commentBusy=true;$('comment-submit').disabled=true;
    try{await api('/comments',{method:'POST',body:JSON.stringify({id:commentIntent.id,...payload})});if(thread?.id===feedback_id){commentIntent=null;$('comment-body').value='';await loadComments(Math.ceil((threadTotal+1)/9));$('comment-status').textContent='댓글을 남겼어요.';}}
    catch(error){$('comment-status').textContent=error.message;}
    finally{commentBusy=false;$('comment-submit').disabled=!settings.comments_open;}
  });
  $('comment-list').addEventListener('click',async e=>{
    if(!adminToken)return;
    const ask=e.target.closest('[data-comment-delete]');if(ask){confirmComment=ask.dataset.commentDelete;renderComments();return;}
    if(e.target.closest('[data-comment-cancel]')){confirmComment=null;renderComments();return;}
    const button=e.target.closest('[data-comment-confirm]');if(!button||button.dataset.commentConfirm!==confirmComment)return;
    try{await api('?target=comment&id='+confirmComment,{method:'DELETE'});confirmComment=null;await loadComments(threadPage);}
    catch(error){$('comment-status').textContent=error.message;if(error.status===401)handleAdminError(error);}
  });
  $('comment-prev').addEventListener('click',()=>loadComments(threadPage-1));$('comment-next').addEventListener('click',()=>loadComments(threadPage+1));
  $('feedback-thread-close').addEventListener('click',()=>$('feedback-thread').close());
  $('feedback-thread').addEventListener('close',()=>{thread=null;threadVersion++;});
  function syncSettings(){
    for(const key of ['posting_open','comments_open','likes_open'])$('admin-'+key).checked=settings[key];if(thread)renderComments();
  }
  async function loadAdminStats(){try{const stats=await api('/admin/stats');$('feedback-admin-metrics').textContent='오늘 방문 '+stats.visitors+' · 조회 '+stats.views+' · 방문 예약 링크 클릭 '+stats.bookingClicks+'회';}catch(error){handleAdminError(error);}}
  $('feedback-settings').addEventListener('submit',async e=>{
    e.preventDefault();if(!adminToken)return;
    const payload=Object.fromEntries(['posting_open','comments_open','likes_open'].map(key=>[key,$('admin-'+key).checked]));
    try{const result=await api('/admin/settings',{method:'POST',body:JSON.stringify(payload)});settings=result.settings;render();syncSettings();$('feedback-admin-status').textContent='참여 설정을 저장했어요.';}
    catch(error){handleAdminError(error);}
  });
  $('feedback-admin-confirm-no').addEventListener('click',()=>{$('feedback-admin-confirm').hidden=true;});
  $('feedback-admin-confirm-yes').addEventListener('click',async()=>{
    if(!adminToken)return;const id=$('feedback-admin-confirm-yes').dataset.resetId;
    try{await api('/admin/hearts',{method:'POST',body:JSON.stringify({id})});const note=notes.find(n=>n.id===id);if(note){note.hearts=0;note.liked=false;}render();$('feedback-admin-confirm').hidden=true;$('feedback-admin-status').textContent='하트를 초기화했어요.';}
    catch(error){handleAdminError(error);}
  });
  adminState();
  $('feedback-prev').addEventListener('click',()=>load(Math.max(1,page-1)));
  $('feedback-next').addEventListener('click',()=>load(Math.min(pages,page+1)));
  $('feedback-retry').addEventListener('click',()=>load(page));
  preview();load();
})();
