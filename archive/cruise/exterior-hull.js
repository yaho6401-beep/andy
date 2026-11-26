import * as T from 'three';
import {DECK_Y,LOWER_Y,hullHalfBeam} from './ship-layout.js';
export const hullDeckLevel=z=>Math.abs(z)<=31?DECK_Y:Math.abs(z)>=41?LOWER_Y:DECK_Y+(LOWER_Y-DECK_Y)*(Math.abs(z)-31)/10;
// Lofted lower hull. The sheer meets the existing walkable decks; the keel is below sea level.
// No new surface is placed over the stairs or the lowered fore/aft decks.
export function cruiseHullGeometry(){
 const p=[],colors=[],ix=[],sections=140;
 const cross=[[1,1],[1,.72],[.985,.4],[.96,.08],[.93,0],[.86,-.35],[.64,-.77],[.26,-1],[0,-1.04],[-.26,-1],[-.64,-.77],[-.86,-.35],[-.93,0],[-.96,.08],[-.985,.4],[-1,.72],[-1,1]];
 const n=cross.length,white=new T.Color('#e4e7e3'),boot=new T.Color('#263d4c'),under=new T.Color('#6b4e49');
 for(let i=0;i<=sections;i++){const z=i-70,w=Math.max(.006,hullHalfBeam(z)),top=hullDeckLevel(z)-.15;for(const[x,level]of cross){const y=level>=0?level*top:level*4.8,rake=(3.2*Math.max(0,(-z-48)/22)**2-1.5*Math.max(0,(z-56)/14)**2)*Math.max(0,-level);p.push(x*w,y,z+rake);const c=(y<-.25?under:y<.6?boot:white).clone().multiplyScalar(.96+.04*Math.max(0,level));colors.push(c.r,c.g,c.b);}}
 // Leave the top open: existing decks are the only upper surface and navigation authority.
 for(let i=0;i<sections;i++)for(let j=0;j<n-1;j++){const a=i*n+j,b=a+n;ix.push(a,b,b+1,a,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(ix);g.computeVertexNormals();g.computeBoundingBox();return g;
}
