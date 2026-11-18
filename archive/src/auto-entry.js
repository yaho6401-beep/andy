export class AutoEntry{
 constructor(retry){this.retry=retry;document.body.insertAdjacentHTML('beforeend','<aside id="world-entry-status" class="world-entry-status" role="status"><p id="world-entry-message">향기마을에 들어가고 있어요…</p><button id="world-entry-retry" hidden>다시 입장하기</button><small>랜덤 닉네임으로 먼저 입장해요.<br>우측 프로필 설정에서 언제든 바꿀 수 있어요.</small></aside>');document.getElementById('world-entry-retry').onclick=()=>retry();}
 busy(){clearTimeout(this.timer);document.getElementById('world-entry-status').hidden=false;document.getElementById('world-entry-message').textContent='향기마을에 들어가고 있어요…';document.getElementById('world-entry-retry').hidden=true;this.timer=setTimeout(()=>this.error('연결이 지연되고 있어요. 잠시 뒤 다시 입장해 주세요.'),20000);}
 welcome(){clearTimeout(this.timer);document.getElementById('world-entry-status').hidden=true;}
 error(message){clearTimeout(this.timer);document.getElementById('world-entry-status').hidden=false;document.getElementById('world-entry-message').textContent=message;document.getElementById('world-entry-retry').hidden=false;}
 dispose(){clearTimeout(this.timer);document.getElementById('world-entry-status')?.remove();}
}
