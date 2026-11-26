import * as T from 'three';
import {startBlueHorizon} from './blue-horizon.js';
import {loadIdentity} from '../src/identity.js';

// Same-origin navigation only. Never pass guest/session tokens through URLs.
const params=new URLSearchParams(location.search),returnURL=new URL('/archive/?start=camp-shore',location.origin);
if(params.get('soloPreview')==='1')returnURL.searchParams.set('soloPreview','1');
document.getElementById('return-camp').href=returnURL.pathname+returnURL.search;
let app;
try{
 app=startBlueHorizon(T,loadIdentity());
 globalThis.BlueHorizonDiagnostics={get state(){return app.state;}};
 document.getElementById('loading').hidden=true;
}catch(e){
 console.error(e);document.getElementById('loading').hidden=true;
 const error=document.getElementById('error');error.hidden=false;
 error.textContent='이 브라우저에서 크루즈를 열지 못했어요. 최신 브라우저로 다시 시도하거나 캠핑장으로 돌아가 주세요.';
}
window.addEventListener('pagehide',()=>app?.dispose(),{once:true});
// Both worlds release WebGL when leaving. A BFCache restore needs a fresh scene.
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
