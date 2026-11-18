import * as T from 'three';
export const PAPER={butter:'#eee0ac',rose:'#e6c4cc',lavender:'#d7c9df',sage:'#d0ddc0',sky:'#c6dce3',peach:'#ead0b6'};
let canvas,texture,material;
function wrap(c,value,x,y,width,lines,lineHeight){let line='',row=0;for(const char of [...String(value)]){if(c.measureText(line+char).width>width){c.fillText(line,x,y+row*lineHeight);line='';if(++row>=lines)return;}line+=char;}if(line&&row<lines)c.fillText(line,x,y+row*lineHeight);}
export function paintPublicPosts(items=[],status='loading'){
 if(!canvas){canvas=document.createElement('canvas');canvas.width=1024;canvas.height=768;texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;material=new T.MeshBasicMaterial({map:texture});material.userData.galleryShared=true;}
 const c=canvas.getContext('2d');c.fillStyle='#9caa91';c.fillRect(0,0,1024,768);
 c.fillStyle='#f7f0df';c.font='500 32px Malgun Gothic,sans-serif';c.textAlign='center';c.fillText('책과향기 · 함께 남긴 이야기',512,50);
 if(!items.length){c.font='27px Malgun Gothic,sans-serif';c.fillText(status==='loading'?'공개 게시글을 불러오는 중…':status==='error'?'게시판 가까이에서 다시 읽어주세요.':'아직 공개된 메모가 없어요.',512,375);}
 c.textAlign='left';
 items.slice(0,9).forEach((n,i)=>{const x=26+(i%3)*332,y=90+Math.floor(i/3)*217;c.fillStyle=PAPER[n.color]||PAPER.butter;c.fillRect(x,y,308,193);c.fillStyle='#fff7df99';c.fillRect(x+108,y-5,78,15);c.fillStyle='#635b50';c.font='23px Malgun Gothic,sans-serif';wrap(c,n.body,x+16,y+41,276,4,29);c.font='500 19px Malgun Gothic,sans-serif';c.fillText(n.nickname,x+16,y+170,225);});
 texture.needsUpdate=true;return material;
}
export function publicBoardSurface(parent,x,y,z,w,h){if(!material)paintPublicPosts();const plane=new T.Mesh(new T.PlaneGeometry(w,h),material);plane.position.set(x,y,z);parent.add(plane);return plane;}
