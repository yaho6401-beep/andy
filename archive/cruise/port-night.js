// Derive tiny warm window clusters from neutral, textured building facades only.
// Source is top-down canvas RGBA; output is bottom-up for a Three DataTexture.
export function portWindowMask(rgba,width,height,waterline){
 const data=new Uint8Array(width*height*4);let count=0;
 for(let y=2;y<height-2;y++)for(let x=2;x<width-2;x++){
  const v=1-y/height;if(v<waterline+.025||v>Math.min(.65,waterline+.27))continue;
  const k=(y*width+x)*4,r=rgba[k],g=rgba[k+1],b=rgba[k+2],l=(r+g+b)/3;
  if(l<40||l>205||g>r*1.10||b>r*1.22||Math.max(r,g,b)-Math.min(r,g,b)>45)continue;
  const edge=Math.abs(rgba[k-8]-r)+Math.abs(rgba[k+width*8]-r);if(edge<15||edge>150)continue;
  const seed=((x*73856093)^(y*19349663))>>>0;if(x%3||y%3||seed%7>2)continue;
  const q=((height-1-y)*width+x)*4;data[q]=255;data[q+1]=166+seed%50;data[q+2]=87;data[q+3]=255;count++;
 }
 return{data,count};
}
