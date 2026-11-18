import {HARVESTS,SNACKS,HARVEST_PAUSE} from '../camp/snack-data.js';
const $=id=>document.getElementById(id);
export class GardenHarvest{
 constructor(api){this.api=api;this.seen=new Set();this.near=null;this.since=0;this.pending=false;document.body.insertAdjacentHTML('beforeend','<dialog id="harvest-dialog" class="detail-dialog"><p class="tiny">A LITTLE GARDEN FIND</p><h2 id="harvest-title"></h2><p>모닥불의 잔불에 넣어 천천히 구워 먹을 수 있어요.<br>작은 꾸러미에 챙겨둘까요?</p><div class="harvest-actions"><button class="primary" id="harvest-yes">네, 챙길래요</button><button class="secondary" id="harvest-no">아니요, 두고 갈래요</button></div><p class="muted">가상 체험용 간식 · 같은 종류는 3개까지 · 이 밭에서는 5분 뒤 다시 발견해요.</p></dialog>');
  $('harvest-no').onclick=()=>$('harvest-dialog').close();$('harvest-yes').onclick=()=>{if(this.pending||!this.near)return;this.pending=true;$('harvest-yes').disabled=true;api.send({type:'harvest',spot:this.near.id});this.timer=setTimeout(()=>this.reset(),15000);};
 }
 reset(){this.pending=false;clearTimeout(this.timer);$('harvest-yes').disabled=false;}
 open(spot){if(!spot)return;this.near=spot;this.seen.add(spot.id);$('harvest-title').textContent=SNACKS[spot.kind].emoji+' '+SNACKS[spot.kind].name+'를 발견했어요!';this.reset();this.api.stopInputs();if(!$('harvest-dialog').open)$('harvest-dialog').showModal();}
 receipt(d){this.reset();$('harvest-dialog').close();this.api.toast(SNACKS[d.packed]?.name+'를 꾸러미에 챙겼어요. 캠핑장에 가져가세요.');}
 frame(now){const {room,me,moving,joined,pack,at}=this.api.state();if(!joined||room!=='garden'){if($('harvest-dialog').open)$('harvest-dialog').close();this.seen.clear();this.near=null;return;}const p=me?.mesh.position;if(!p)return;for(const h of HARVESTS)if(Math.hypot(p.x-h.x,p.z-h.z)>2.6)this.seen.delete(h.id);const spot=HARVESTS.map(h=>({...h,d:Math.hypot(p.x-h.x,p.z-h.z)})).filter(h=>h.d<1.4).sort((a,b)=>a.d-b.d)[0];if(moving||!spot){this.since=0;return;}if(this.near?.id!==spot.id){this.near=spot;this.since=now;}if(!this.since)this.since=now;const harvested=pack?.harvested?.[spot.id],ready=harvested===undefined||(at||Date.now())-harvested>=HARVEST_PAUSE;if(now-this.since>650&&!this.seen.has(spot.id)&&ready&&!document.querySelector('dialog[open]')&&$('chat-panel').hidden)this.open(spot);}
 dispose(){clearTimeout(this.timer);$('harvest-dialog').remove();}
}
