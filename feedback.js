(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const config=globalThis.FeedbackConfig;
  const categories={improvement:'이렇게 바뀌면 좋겠어요',request:'이런 기능이 있으면',message:'향기로운 한마디'};
  const colors={butter:'버터 노랑',rose:'장밋빛 분홍',lavender:'라벤더 보라',sage:'세이지 초록',sky:'하늘 파랑',peach:'복숭아 살구'};
  const animals={bear:'곰돌이',bunny:'토끼',cat:'고양이',fox:'여우'};
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let color='butter',animal='bear',next=null,loading=false,sending=false,notes=[],intent=null;
  let adminToken=null,confirmDelete=null,deleting=false;
  const deletedIds=new Set();
  function illustration(kind){
    const faces={
      bear:'<circle cx="18" cy="17" r="9" fill="#ba9171"/><circle cx="46" cy="17" r="9" fill="#ba9171"/><circle cx="18" cy="17" r="4" fill="#e2bfa5"/><circle cx="46" cy="17" r="4" fill="#e2bfa5"/><ellipse cx="32" cy="34" rx="23" ry="22" fill="#cba483"/><ellipse cx="32" cy="41" rx="11" ry="8" fill="#f0dcc4"/>',
      bunny:'<ellipse cx="22" cy="17" rx="7" ry="16" transform="rotate(-10 22 17)" fill="#fff6e9"/><ellipse cx="43" cy="17" rx="7" ry="16" transform="rotate(10 43 17)" fill="#fff6e9"/><ellipse cx="22" cy="16" rx="3" ry="11" fill="#e9b8c1"/><ellipse cx="43" cy="16" rx="3" ry="11" fill="#e9b8c1"/><ellipse cx="32" cy="39" rx="23" ry="19" fill="#fff6e9"/>',
      cat:'<path d="m11 30 1-22 18 13h5L53 8l1 23q12 28-22 28Q-1 58 11 30" fill="#d6c4af"/><path d="m17 24 0-9 9 9m13 0 9-9v10" fill="#e8b8ad"/><path d="m17 43-11-2m11 6-11 1m41-5 11-2m-11 6 11 1" stroke="#9d8772"/>',
      fox:'<path d="m9 30 1-24 21 15h2L54 6l1 24q2 18-23 30Q7 49 9 30" fill="#d79b70"/><path d="m14 32 18 13 18-13q-1 17-18 23-17-6-18-23" fill="#fff0d7"/><path d="m16 23-1-8 10 9m14 0 10-9-1 8" fill="#ecc7a2"/>'
    };
    return `<svg class="feedback-animal" viewBox="0 0 64 68" aria-hidden="true">${faces[kind]||faces.bear}<circle cx="24" cy="35" r="2" fill="#594d43"/><circle cx="41" cy="35" r="2" fill="#594d43"/><ellipse cx="32" cy="41" rx="3" ry="2" fill="#735648"/><path d="M32 43v3m0-1q-4 4-6 0m6 0q4 4 6 0" stroke="#735648" stroke-width="1.2" fill="none" stroke-linecap="round"/><ellipse cx="17" cy="42" rx="4" ry="2" fill="#df9b9d" opacity=".6"/><ellipse cx="47" cy="42" rx="4" ry="2" fill="#df9b9d" opacity=".6"/><path d="m51 57 2-3 2 3 4 1-3 3v4l-3-2-3 2v-4l-3-3Z" fill="#cfaf6b"/></svg>`;
  }
  function card(note,preview=false){
    const safeColor=note.color in colors?note.color:'butter';
    const angle=[-2,1.5,-1,2,-1.5,.7][(note.id||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0)%6];
    const date=preview?'미리보기':new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(note.created_at));
    return `<article class="feedback-note note-${safeColor}${preview?' note-preview':''}" style="--note-angle:${angle}deg"><span class="note-tape" aria-hidden="true"></span><span class="note-category">${categories[note.category]||categories.message}</span><p class="note-body">${escape(note.body)}</p><div class="note-bottom"><span>${escape(note.nickname||'향기를 남긴 손님')}<small>${date}</small></span>${illustration(note.animal)}</div>${!preview&&adminToken?`<div class="note-moderation">${confirmDelete===note.id?`<span>이 메모를 삭제할까요?</span><button type="button" data-feedback-confirm-delete="${note.id}" ${deleting?'disabled':''}>삭제</button><button type="button" data-feedback-cancel-delete ${deleting?'disabled':''}>취소</button>`:`<button type="button" data-feedback-delete="${note.id}" aria-label="${escape(note.nickname||'손님')}님의 메모 삭제">메모 삭제 ×</button>`}</div>`:''}</article>`;
  }
  function preview(){
    const body=$('feedback-text').value.trim()||'당신의 한 줄이 이곳에 예쁘게 붙어요.';
    $('feedback-preview').innerHTML=card({body,nickname:$('feedback-nickname').value.trim(),category:$('feedback-category').value,color,animal},true);
    $('feedback-count').textContent=[...$('feedback-text').value].length+' / 100';
  }
  function render(){
    $('feedback-notes').innerHTML=notes.length?notes.map(n=>card(n)).join(''):'<div class="feedback-empty"><span aria-hidden="true">✧</span><h4>첫 번째 향기 메모를 기다려요</h4><p>작은 아이디어도, 다정한 한마디도 좋아요.</p></div>';
    $('feedback-more').hidden=!next;
  }
  async function api(path='',options={}){
    const response=await fetch(config.endpoint+path,{...options,headers:{apikey:config.key,'Content-Type':'application/json',...(adminToken?{Authorization:'Bearer '+adminToken}:{}),...options.headers},signal:AbortSignal.timeout(15000)});
    let result;try{result=await response.json();}catch{throw Error('보드와 연결하지 못했어요. 잠시 후 다시 시도해주세요.');}
    if(!response.ok){const error=Error(result.error||'메모를 불러오지 못했어요.');error.status=response.status;throw error;}
    return result;
  }
  async function load(more=false){
    if(loading)return;loading=true;$('feedback-more').disabled=true;$('feedback-retry').hidden=true;
    $('feedback-load-status').textContent='메모를 가져오고 있어요…';
    try{
      const result=await api(more&&next?'?before='+encodeURIComponent(next):'');
      const combined=[...notes,...result.items].filter(n=>!deletedIds.has(n.id));
      notes=[...new Map(combined.map(n=>[n.id,n])).values()];next=result.next;render();$('feedback-load-status').textContent='';
    }catch(error){$('feedback-load-status').textContent=error.message;$('feedback-retry').hidden=false;}
    finally{loading=false;$('feedback-more').disabled=false;}
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
    const payload={body,nickname,category:$('feedback-category').value,color,animal,website:$('feedback-website').value};
    const signature=JSON.stringify(payload);if(!intent||intent.signature!==signature)intent={id:crypto.randomUUID(),signature};
    sending=true;$('feedback-submit').disabled=true;$('feedback-submit').textContent='메모를 붙이고 있어요…';$('feedback-submit-status').textContent='';
    try{
      const result=await api('',{method:'POST',body:JSON.stringify({id:intent.id,...payload})});
      notes=[result.item,...notes.filter(n=>n.id!==result.item.id)];render();intent=null;$('feedback-text').value='';preview();
      $('feedback-submit-status').textContent='메모를 붙였어요. 소중한 의견 고맙습니다!';
      $('feedback-board').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    }catch(error){$('feedback-submit-status').textContent=error.message;}
    finally{sending=false;$('feedback-submit').disabled=false;$('feedback-submit').textContent='보드에 메모 붙이기 ↗';}
  });
  $('feedback-nickname').addEventListener('input',()=>{const chars=[...$('feedback-nickname').value];if(chars.length>20)$('feedback-nickname').value=chars.slice(0,20).join('');preview();});
  function adminState(){
    $('feedback-admin-login').hidden=Boolean(adminToken);$('feedback-admin-logout').hidden=!adminToken;
    $('feedback-admin-open').textContent=adminToken?'관리자 모드 · 켜짐':'관리자';render();
  }
  $('feedback-admin-open').addEventListener('click',()=>{$('feedback-admin-panel').hidden=!$('feedback-admin-panel').hidden;if(!$('feedback-admin-panel').hidden&&!adminToken)$('feedback-admin-password').focus();});
  $('feedback-admin-login').addEventListener('submit',async e=>{
    e.preventDefault();const password=$('feedback-admin-password').value;$('feedback-admin-password').value='';
    $('feedback-admin-login-button').disabled=true;$('feedback-admin-status').textContent='확인하고 있어요…';
    try{const result=await api('/admin/login',{method:'POST',body:JSON.stringify({password})});adminToken=result.token;confirmDelete=null;adminState();$('feedback-admin-status').textContent='관리자 모드예요. 삭제할 메모의 버튼을 눌러주세요.';}
    catch(error){$('feedback-admin-status').textContent=error.message;}
    finally{$('feedback-admin-login-button').disabled=false;}
  });
  $('feedback-admin-logout').addEventListener('click',async()=>{
    try{await api('/admin/logout',{method:'POST'});adminToken=null;confirmDelete=null;adminState();$('feedback-admin-status').textContent='관리자 모드를 종료했어요.';}
    catch(error){$('feedback-admin-status').textContent=error.message;}
  });
  $('feedback-notes').addEventListener('click',async e=>{
    if(!adminToken||deleting)return;
    const ask=e.target.closest('[data-feedback-delete]');if(ask){confirmDelete=ask.dataset.feedbackDelete;render();return;}
    if(e.target.closest('[data-feedback-cancel-delete]')){confirmDelete=null;render();return;}
    const button=e.target.closest('[data-feedback-confirm-delete]');if(!button)return;
    const id=button.dataset.feedbackConfirmDelete;if(id!==confirmDelete)return;
    deleting=true;render();
    try{await api('?id='+encodeURIComponent(id),{method:'DELETE'});deletedIds.add(id);notes=notes.filter(n=>n.id!==id);confirmDelete=null;$('feedback-admin-status').textContent='메모를 삭제했어요.';}
    catch(error){$('feedback-admin-status').textContent=error.message;if(error.status===401){adminToken=null;confirmDelete=null;adminState();$('feedback-admin-panel').hidden=false;}}
    finally{deleting=false;render();}
  });
  adminState();
  $('feedback-more').addEventListener('click',()=>load(true));
  $('feedback-retry').addEventListener('click',()=>load(Boolean(notes.length&&next)));
  preview();load();
})();
