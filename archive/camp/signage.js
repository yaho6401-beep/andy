import * as T from 'three';

function flame(c,x,y,size){c.save();c.translate(x,y);c.scale(size,size);c.fillStyle='#be7449';c.beginPath();c.moveTo(0,-1);c.bezierCurveTo(.2,-.42,.9,-.15,.7,.45);c.bezierCurveTo(.55,1,-.6,1,-.7,.4);c.bezierCurveTo(-.83,-.15,-.2,-.45,0,-1);c.fill();c.fillStyle='#f1c778';c.beginPath();c.moveTo(.05,-.25);c.bezierCurveTo(.55,.2,.35,.7,0,.73);c.bezierCurveTo(-.42,.65,-.32,.12,.05,-.25);c.fill();c.restore();}
export function campSign(parent,{title='별빛 캠핑장',subtitle='모닥불 · 불멍 · 작은 쉼',width=3.8,height=1.15,x=0,y=3.35,z=.13,back=false,direction=false,kind='camp'}={}){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=352;const c=canvas.getContext('2d');
 c.fillStyle='#f8efd9';c.fillRect(0,0,1024,352);c.strokeStyle='#c5ab79';c.lineWidth=4;c.strokeRect(18,18,988,316);c.fillStyle='#e9ddbd';c.beginPath();c.arc(135,160,83,0,Math.PI*2);c.fill();if(kind==='book'){c.strokeStyle='#687864';c.lineWidth=7;c.beginPath();c.moveTo(135,115);c.quadraticCurveTo(90,88,76,114);c.lineTo(76,200);c.quadraticCurveTo(110,176,135,202);c.quadraticCurveTo(162,176,194,200);c.lineTo(194,114);c.quadraticCurveTo(163,90,135,115);c.lineTo(135,202);c.stroke();}else flame(c,135,160,54);
 c.textAlign='center';c.textBaseline='middle';c.fillStyle='#687864';c.font='500 28px Georgia, serif';c.fillText(kind==='book'?'BOOKS & SCENTS · BEYOND':'BOOKS & SCENTS · STARLIGHT',610,65);
 c.fillStyle='#344e3e';c.font='600 112px "Malgun Gothic", sans-serif';c.fillText(title,607,164,740);
 c.fillStyle='#8b7758';c.font='500 38px "Malgun Gothic", sans-serif';c.fillText(subtitle+(direction?'  ↗':''),607,264,730);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const plane=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map:texture}));plane.name=direction?'camp-wayfinder-sign':'camp-entrance-sign';plane.position.set(x,y,z);if(back)plane.rotation.y=Math.PI;parent.add(plane);return plane;
}
