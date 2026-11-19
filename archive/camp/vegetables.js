import * as T from 'three';
// Small reusable procedural skin maps; subtly irregular tubers, never exaggerated bumps.
export function createVegetableKit(){
 const textures=[],geometries=[];
 function texture(sweet){const size=128,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/size,v=y/size,n=Math.sin(x*127.1+y*311.7)*43758.5453,f=n-Math.floor(n),stripe=Math.sin(u*74+Math.sin(v*11)*.8)*.024,eye=Math.pow(Math.max(0,Math.sin(u*39+v*11)*Math.sin(v*43-u*17)),28),value=.86+(f-.5)*.10+stripe-eye*.15,i=(y*size+x)*4;data[i]=Math.max(0,255*value);data[i+1]=255*(value-(sweet?.07:.025));data[i+2]=255*(value-(sweet?.015:.06));data[i+3]=255;}const t=new T.DataTexture(data,size,size);t.colorSpace=T.SRGBColorSpace;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.needsUpdate=true;textures.push(t);return t;}
 const result={};for(const sweet of [false,true]){const g=new T.SphereGeometry(1,24,16),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=1+.018*Math.sin(x*11+y*7)*Math.sin(z*9-y*4);p.setXYZ(i,x*d*(sweet?.88+.12*Math.cos(z*2):1+.04*z)+(sweet?.075*(z*z-.25):0),y*d*(sweet?.86-.06*z:1-.035*z),z*(sweet?1.35:1));}g.computeVertexNormals();geometries.push(g);result[sweet?'sweetpotato':'potato']={geometry:g,map:texture(sweet)};}
 return {...result,dispose(){geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());}};
}
