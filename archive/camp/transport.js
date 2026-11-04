const endpoint='https://jqlrwwheiwjdrobluifx.supabase.co/functions/v1/archive-camp-preview?forceFunctionRegion=eu-west-1';
const apiKey='sb_publishable_jQ8AERL_i5ecVFbM0NgX_g_rAxIBPTb';
export class CampTransport{
 constructor(onSnapshot,onStatus){this.onSnapshot=onSnapshot;this.onStatus=onStatus;this.shared=true;this.queue=[];this.batch=0;this.seenReceipt=0;this.closed=true;this.failures=0;this.cache={};}
 async request(op,data={},token=this.token){const r=await fetch(endpoint,{method:'POST',headers:{apikey:apiKey,'Content-Type':'application/json','x-region':'eu-west-1',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({op,connectionId:this.connectionId,...data}),signal:AbortSignal.timeout(12000)});const d=await r.json();if(!r.ok)throw Object.assign(Error(d.error||'라운지 연결을 확인해 주세요.'),{status:r.status});return d;}
 async connect(profile){
 if(navigator.locks)await new Promise((resolve,reject)=>{navigator.locks.request('books-scents-camp-preview-session',{ifAvailable:true},async lock=>{if(!lock){reject(Error('이미 다른 화면에서 라운지에 접속 중이에요.'));return;}resolve();await new Promise(r=>this.releaseLock=r);}).catch(reject);});
 try{
 this.profile={nickname:profile.nickname,adult:profile.adult,appearance:profile.appearance};this.connectionId=sessionStorage.getItem('camp-preview-connection-id')||crypto.randomUUID();sessionStorage.setItem('camp-preview-connection-id',this.connectionId);
 this.token=profile.hostKey?null:localStorage.getItem('camp-preview-guest-session');
 let adminToken;
 if(profile.hostKey){const r=await fetch('https://jqlrwwheiwjdrobluifx.supabase.co/functions/v1/feedback-wall/admin/login',{method:'POST',headers:{apikey:apiKey,'Content-Type':'application/json'},body:JSON.stringify({password:profile.hostKey})});const d=await r.json();if(!r.ok)throw Error(d.error||'관리자 로그인을 확인해 주세요.');adminToken=d.token;}
 this.adminToken=adminToken;
 const d=await this.request('join',{nickname:profile.nickname,adult:profile.adult,appearance:profile.appearance,adminToken});this.token=d.token||this.token;this.id=d.id;
 if(d.snapshot.players.find(p=>p.id===d.id)?.role==='guest')localStorage.setItem('camp-preview-guest-session',this.token);
 this.closed=false;this.batch=0;this.seenReceipt=0;this.pending=null;this.queue=[];this.onWelcome?.({id:this.id});this.deliver(d);this.onStatus('함께 연결됨 · 미리보기');this.lastStart=performance.now();this.schedule(500);
 this.pageHide=()=>this.close();window.addEventListener('pagehide',this.pageHide,{once:true});return d;
 }catch(e){this.releaseLock?.();throw e;}
 }
 deliver(d){if(this.closed)return;const s=d.snapshot;if(s){const self=s.players.find(p=>p.id===this.id);if(self&&this.correction!==undefined&&self.correction!==this.correction)this.queue=this.queue.filter(a=>!['move','room'].includes(a.type)).map(({position,...a})=>a);if(self)this.correction=self.correction;this.cache.notes=s.notes||this.cache.notes||[];this.cache.content=s.content||this.cache.content;this.notesVersion=d.notesVersion;this.contentVersion=d.contentVersion;this.onSnapshot({...s,notes:this.cache.notes,content:this.cache.content});}
 if(d.batch>this.seenReceipt){this.seenReceipt=d.batch;for(const receipt of d.receipts||[])if(receipt.error)this.onError?.(receipt.error);else this.onReceipt?.(receipt);}
 }
 send(data){if(this.closed)return;if(data.type==='move'){const index=this.queue.findIndex(a=>a.type==='move'&&a.room===data.room&&a.epoch===data.epoch);if(index>=0)this.queue.splice(index,1);}if(this.queue.length<24)this.queue.push(data);if(data.type!=='move'&&!this.busy)this.schedule(Math.max(0,260-(performance.now()-this.lastStart)));}
 schedule(ms){clearTimeout(this.timer);if(!this.closed)this.timer=setTimeout(()=>this.tick(),ms);}
 async tick(){if(this.closed||this.busy)return;this.busy=true;this.lastStart=performance.now();
 this.pending??={batch:++this.batch,actions:this.queue.splice(0,12)};
 try{const d=await this.request('tick',{...this.pending,notesVersion:this.notesVersion,contentVersion:this.contentVersion});if(this.closed)return;this.pending=null;this.deliver(d);this.failures=0;this.onStatus('함께 연결됨 · 미리보기');}
 catch(e){this.failures++;this.onStatus('연결 복구 중…');if([401,403,410].includes(e.status)){this.close();this.onKicked?.(e.message);return;}if(e.status===409){this.close();this.onKicked?.(e.message);return;}}
 finally{this.busy=false;if(!this.closed){const interval=this.failures?Math.min(10000,700*2**Math.min(4,this.failures)):document.hidden?3000:500;this.schedule(Math.max(80,interval-(performance.now()-this.lastStart)));}}
 }
 async admin(){return this.request('admin');}
 close(){this.adminToken=null;if(this.closed){this.releaseLock?.();return;}this.closed=true;clearTimeout(this.timer);window.removeEventListener('pagehide',this.pageHide);fetch(endpoint,{method:'POST',headers:{apikey:apiKey,'Content-Type':'application/json','x-region':'eu-west-1',Authorization:'Bearer '+this.token},body:JSON.stringify({op:'leave',connectionId:this.connectionId}),keepalive:true}).catch(()=>{});this.releaseLock?.();}
}
