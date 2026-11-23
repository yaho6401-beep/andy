import * as T from 'three';
import {GATHERING_TENT as tent} from './layout.js';
// One cached canvas; repaint only when the ranking changes, never every frame.
export function createGatheringScreen(parent){
 const root=new T.Group();root.name='monthly-fire-projector';parent.add(root);
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;const ctx=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const geometry=new T.PlaneGeometry(6.6,4.4),material=new T.MeshBasicMaterial({map:texture}),screen=new T.Mesh(geometry,material);screen.position.set(tent.x,2.4,tent.z-tent.d/2+.3);root.add(screen);
 const housing=new T.Mesh(new T.BoxGeometry(.65,.23,.5),new T.MeshLambertMaterial({color:'#bdb8ad'}));housing.position.set(tent.x,2.65,tent.z+2);root.add(housing);
 const lens=new T.Mesh(new T.CircleGeometry(.075,16),new T.MeshBasicMaterial({color:'#e5e6d5'}));lens.position.set(tent.x,2.65,tent.z+1.74);lens.rotation.y=Math.PI;root.add(lens);
 const beam=new T.Mesh(new T.ConeGeometry(2.5,6.4,16,1,true),new T.MeshBasicMaterial({color:'#e9e3ca',transparent:true,opacity:.025,depthWrite:false,side:T.DoubleSide}));beam.rotation.x=Math.PI/2;beam.position.set(tent.x,2.55,tent.z-1.2);root.add(beam);
 let key='';function set(value={month:'',rows:[]}){const next=JSON.stringify(value);if(next===key)return;key=next;ctx.fillStyle='#263e40';ctx.fillRect(0,0,768,512);ctx.textAlign='center';ctx.fillStyle='#ddcfab';ctx.font='17px sans-serif';ctx.fillText('BOOKS & SCENTS · STARLIGHT CAMP',384,42);ctx.font='500 34px sans-serif';ctx.fillStyle='#f4eddf';ctx.fillText('이 달의 불을 밝힌 사람들',384,96);ctx.font='18px sans-serif';ctx.fillStyle='#c4c9b8';ctx.fillText((value.month||'이번 달')+' · 한국시간 매월 새 순위',384,134);
  const rows=(value.rows||[]).slice(0,6);ctx.textAlign='left';rows.forEach((r,i)=>{const y=191+i*43;ctx.fillStyle=i===0?'#f1d69d':'#e1e4d7';ctx.font='23px sans-serif';ctx.fillText(String(i+1).padStart(2,'0')+'  '+[...r.nickname].slice(0,16).join(''),48,y);ctx.textAlign='right';ctx.fillText(r.total+' 회',714,y);ctx.textAlign='left';});if(!rows.length){ctx.textAlign='center';ctx.font='23px sans-serif';ctx.fillText('오늘의 작은 온기를 보태주세요.',384,255);}ctx.textAlign='center';ctx.fillStyle='#b7c3ba';ctx.font='17px sans-serif';ctx.fillText('가지 · 장작 · 기름을 실제로 보탠 횟수',384,466);ctx.fillText('가까이에서 살펴보면 날짜와 상세 순위를 볼 수 있어요',384,493);texture.needsUpdate=true;
 }
 set();return {set,dispose(){root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});texture.dispose();root.removeFromParent();}};
}
