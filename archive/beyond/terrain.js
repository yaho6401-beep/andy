// Adapted from the user-supplied bookscents_metaverse_3_0/src/World.jsx.
export function terrainHeight(x,z){const rolling=.5*Math.sin(x*.12)*Math.cos(z*.1)+.22*Math.sin(z*.2),mountain=12.5*Math.exp(-(((x+27)/13)**2+((z+24)/13)**2)),coast=x>17?3.5*((x-17)/20)**2:0;const edge=Math.max(0,(Math.max(Math.abs(x),Math.abs(z))-37)/10);return rolling+mountain-coast-edge*edge*7;}
export const zoneAt=(x,z)=>x>14?'바람의 해안':x<-15&&z<-12?'하늘 언덕':'사유의 숲';
export const seaVertex=`uniform float uTime;varying float wave;void main(){vec3 p=position;float w=sin(p.x*.27+uTime*.65)*.10+cos(p.y*.20+uTime*.45)*.09;p.z+=w;wave=w;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
export const seaFragment=`varying float wave;void main(){vec3 a=vec3(.22,.58,.69);vec3 b=vec3(.36,.70,.74);gl_FragColor=vec4(mix(a,b,smoothstep(-.20,.22,wave)),1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
