import * as T from 'three';
import {createObservingSky} from '../camp/sky-visual.js';
import {scenicEye} from './deck-exploration.js';

export function skyAngles(azimuth,altitude){return{azimuth:((azimuth%(Math.PI*2))+Math.PI*2)%(Math.PI*2),altitude:T.MathUtils.clamp(altitude,.025,1.48)};}
// The same catalog, observation times and constellation recognition as the campsite.
// Explicitly labelled Daejeon: this is a shared star map, not the vessel's GPS sky.
export class CruiseSky{
 constructor(scene,camera,canvas,api){
  this.camera=camera;this.api=api;this.observatory=createObservingSky(scene);this.active=false;this.kind='sky';this.azimuth=-.40;this.altitude=.30;this.abort=new AbortController();const signal=this.abort.signal;
  document.body.insertAdjacentHTML('beforeend',`<section id="cruise-sky" hidden aria-label="항해 중 하늘과 별 보기"><div class="sky-top"><small>BLUE HORIZON · SKY</small><p id="sky-bearing"></p><span id="sky-note">손가락으로 하늘을 천천히 둘러보세요</span></div><span class="sky-reticle" aria-hidden="true">＋</span><p id="sky-caption" role="status"></p><div class="sky-bottom"><div class="sky-modes"><button id="sky-world" aria-pressed="true">하늘 보기</button><button id="sky-stars" aria-pressed="false">별 보기</button><button id="sky-close">갑판으로</button></div><label id="sky-time-label" hidden><span>관측 시각</span><select id="sky-time"><option value="auto">밤하늘 자동</option><option value="now">지금 시각</option><option value="tonight">오늘 밤 9시</option><option value="dawn">오늘 새벽 5시</option></select></label><small id="sky-location" hidden>캠핑장과 같은 대전 기준 별 지도 · 한국시간</small></div></section>`);
  this.el=document.getElementById('cruise-sky');this.caption=document.getElementById('sky-caption');
  document.getElementById('sky-world').onclick=()=>this.mode('sky');document.getElementById('sky-stars').onclick=()=>this.mode('stars');document.getElementById('sky-close').onclick=()=>this.close();document.getElementById('sky-time').onchange=e=>{this.observatory.setMode(e.target.value);this.lastAim=null;};
  canvas.addEventListener('pointerdown',e=>{if(!this.active||!e.isPrimary||e.button!==0)return;this.drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);},{signal});
  canvas.addEventListener('pointermove',e=>{if(!this.active||this.drag?.id!==e.pointerId)return;this.rotate(-(e.clientX-this.drag.x)*.005,(e.clientY-this.drag.y)*.004);this.drag.x=e.clientX;this.drag.y=e.clientY;},{signal});
  for(const n of['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(n,()=>this.drag=null,{signal});
  addEventListener('keydown',e=>{if(!this.active||e.target.matches('select,input,textarea'))return;const d={ArrowLeft:[-.09,0],ArrowRight:[.09,0],ArrowUp:[0,.07],ArrowDown:[0,-.07]}[e.key];if(d){e.preventDefault();this.rotate(...d);}if(e.key==='Escape')this.close();},{signal});
 }
 open(kind='sky'){this.api.stop();const p=this.api.viewer();this.eye=scenicEye(p,'landscape',-Math.PI/2);this.eye.x=-22;this.active=true;this.el.hidden=false;document.body.classList.add('cruise-sky-view');this.mode(kind);}
 mode(kind){this.kind=kind;const stars=kind==='stars';this.observatory.set(stars);document.getElementById('sky-world').setAttribute('aria-pressed',String(!stars));document.getElementById('sky-stars').setAttribute('aria-pressed',String(stars));document.getElementById('sky-time-label').hidden=!stars;document.getElementById('sky-location').hidden=!stars;document.getElementById('sky-note').textContent=stars?'별을 가운데 두면 이름과 이야기가 나타나요':'손가락으로 하늘을 천천히 둘러보세요';if(stars){this.azimuth=0;this.altitude=.63;}else{this.azimuth=-.40;this.altitude=.30;}this.rotate(0,0);this.caption.textContent='';this.lastAim=null;this.api.background(!stars);}
 rotate(a,b){Object.assign(this,skyAngles(this.azimuth+a,this.altitude+b));}
 close(){if(!this.active)return;this.active=false;this.drag=null;this.el.hidden=true;this.observatory.set(false);this.api.background(true);document.body.classList.remove('cruise-sky-view');this.api.stop();}
 applyCamera(dt){const c=this.camera;c.position.lerp(this.eye,1-Math.exp(-dt*9));c.fov=T.MathUtils.damp(c.fov,64,8,dt);c.updateProjectionMatrix();const a=this.azimuth,h=this.altitude;c.lookAt(c.position.x+Math.sin(a)*Math.cos(h)*100,c.position.y+Math.sin(h)*100,c.position.z-Math.cos(a)*Math.cos(h)*100);}
 frame(time){if(!this.active)return;this.observatory.update(time,this.camera);const d=this.observatory.diagnostics,deg=Math.round(this.azimuth*180/Math.PI),bearing=['북','동','남','서'][Math.round(deg/90)%4];document.getElementById('sky-bearing').textContent=bearing+' '+deg+'° · '+Math.round(this.altitude*180/Math.PI)+'°'+(this.kind==='stars'?' · '+new Date(d.date).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'}):'');const aim=this.kind==='stars'?this.observatory.target:null;if(aim?.id!==this.lastAim){this.lastAim=aim?.id;this.aimAt=time;this.caption.textContent='';}if(aim&&time-this.aimAt>.7&&time-this.aimAt<6)this.caption.textContent=aim.line;else this.caption.textContent='';}
 get state(){return{active:this.active,kind:this.kind,azimuth:this.azimuth,altitude:this.altitude,sharedWithCamp:true,observatory:this.observatory.diagnostics};}
 dispose(){this.close();this.abort.abort();this.el.remove();this.observatory.dispose();}
}
