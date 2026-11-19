import * as T from 'three';

// Original small procedural maps; no downloads, canvas, extra libraries or large textures.
export function createWoodKit(charred=false){
 const size=128,make=kind=>{
  const data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const u=x/size,v=y/size,noise=Math.sin(x*127.1+y*311.7)*43758.5453,grain=noise-Math.floor(noise);
   let value;
   if(kind==='bark'){
    const bend=Math.sin(v*7+u*19)*.0025+Math.sin(v*19+u*8)*.0015;
    const ridge=Math.sin((u+bend)*Math.PI*54),fine=Math.sin((u+bend)*Math.PI*116);
    const crack=Math.pow(Math.max(0,-ridge),20)*(.35+.65*Math.sin(v*8+u*16)**2);
    value=.63+ridge*.028+fine*.025+(grain-.5)*.13-crack*.14;
   }else if(kind==='embers'){
    const a=Math.abs(Math.sin(u*57+Math.sin(v*35)*.6)),b=Math.abs(Math.sin(v*64+Math.sin(u*28)*.7));
    value=(a<.065||b<.055)?Math.max(0,Math.sin(u*29+v*11))*.8:0;
   }else{
    const dx=(u-.47)*2,dy=(v-.53)*2,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
    const rings=Math.sin((r+Math.sin(a*3)*.012+Math.sin(a*7+r*3)*.008)*91);
    const split=Math.pow(Math.max(0,Math.cos(a*7+r*.5)),60)*Math.max(0,r-.4);
    value=.75+rings*.10+(grain-.5)*.09-split*.65;
   }
   const base=kind==='embers'?[255,150,45]:charred?(kind==='bark'?[44,35,28]:[72,47,31]):kind==='bark'?[114,91,73]:[202,166,121];
   const i=(y*size+x)*4;for(let c=0;c<3;c++)data[i+c]=Math.min(255,Math.max(0,base[c]*(value+(kind==='embers'?0:.3))));data[i+3]=255;
  }
  const tex=new T.DataTexture(data,size,size);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.generateMipmaps=true;tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.needsUpdate=true;return tex;
 };
 const bark=make('bark'),end=make('end'),barkMat=new T.MeshStandardMaterial({map:bark,bumpMap:bark,bumpScale:charred?.018:.028,roughness:.98}),endMat=new T.MeshStandardMaterial({map:end,roughness:.92});
 const embers=charred?make('embers'):null;if(embers){barkMat.emissive.set('#ff6a25');barkMat.emissiveMap=embers;barkMat.emissiveIntensity=.8;}
 const geometry=new T.CylinderGeometry(1,1,1,18,5,false),p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i),y=p.getY(i),a=Math.atan2(z,x),w=1+Math.sin(a*5+.3)*.028+Math.sin(a*9+y*3)*.016;
  p.setXYZ(i,x*w,y,z*w);
 }
 // The two end caps share one draw call.
 const groups=geometry.groups;geometry.clearGroups();geometry.addGroup(groups[0].start,groups[0].count,0);geometry.addGroup(groups[1].start,groups[1].count+groups[2].count,1);geometry.computeVertexNormals();
 return {geometry,materials:[barkMat,endMat],log(radius,length){const mesh=new T.Mesh(geometry,[barkMat,endMat]);mesh.scale.set(radius,length,radius);return mesh;},dispose(){geometry.dispose();barkMat.dispose();endMat.dispose();bark.dispose();end.dispose();embers?.dispose();}};
}
