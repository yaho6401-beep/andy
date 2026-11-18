// Wake Lock is optional, scoped to an activity and never silently enabled.
export class ScreenAwake{
 constructor(button,{notify=()=>{},doc=globalThis.document,nav=globalThis.navigator,win=globalThis.window}={}){
  this.button=button;this.notify=notify;this.doc=doc;this.nav=nav;this.win=win;this.enabled=false;this.lock=null;this.pending=false;this.generation=0;this.disposed=false;
  this.click=()=>this.enabled&&!this.lock?this.acquire():this.setEnabled(!this.enabled);this.visibility=()=>{if(doc.visibilityState==='visible'&&this.enabled)this.acquire();};this.hide=()=>this.setEnabled(false);
  button.addEventListener('click',this.click);doc.addEventListener('visibilitychange',this.visibility);win.addEventListener('pagehide',this.hide);this.paint();
 }
 paint(){this.button.setAttribute('aria-pressed',String(!!this.lock&&!this.lock.released));this.button.textContent=!this.nav?.wakeLock?'화면 켜두기 · 미지원':this.lock&&!this.lock.released?'화면 켜두는 중 · 끄기':this.enabled?'화면 켜두기 · 다시 시도':'화면 켜두기';this.button.title='이 활동 중 화면 자동 꺼짐을 막습니다. 다른 앱으로 전환하거나 절전 상태이면 해제될 수 있어요.';}
 async setEnabled(value){this.enabled=!!value;this.generation++;if(!value){const lock=this.lock;this.lock=null;this.paint();try{await lock?.release();}catch{}return;}if(!this.nav?.wakeLock){this.enabled=false;this.notify('이 브라우저에서는 화면 켜두기를 지원하지 않아요.');this.paint();return;}await this.acquire();}
 async acquire(){if(this.disposed||!this.enabled||this.pending||this.lock&&!this.lock.released||this.doc.visibilityState!=='visible')return;this.pending=true;const generation=this.generation;try{const lock=await this.nav.wakeLock.request('screen');if(this.disposed||!this.enabled||generation!==this.generation){await lock.release();return;}this.lock=lock;lock.addEventListener('release',()=>{if(this.lock===lock){this.lock=null;this.paint();}},{once:true});}catch{this.enabled=false;this.notify('화면 켜두기가 허용되지 않았어요. 브라우저나 절전 설정을 확인해 주세요.');}finally{this.pending=false;this.paint();}}
 dispose(){this.disposed=true;this.setEnabled(false);this.button.removeEventListener('click',this.click);this.doc.removeEventListener('visibilitychange',this.visibility);this.win.removeEventListener('pagehide',this.hide);}
}
