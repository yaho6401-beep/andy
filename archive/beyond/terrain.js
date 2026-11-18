// Adapted from the user-supplied bookscents_metaverse_3_0/src/World.jsx.
export function terrainHeight(x,z){const rolling=.5*Math.sin(x*.12)*Math.cos(z*.1)+.22*Math.sin(z*.2),mountain=12.5*Math.exp(-(((x+27)/13)**2+((z+24)/13)**2)),coast=x>17?3.5*((x-17)/20)**2:0;const edge=Math.max(0,(Math.max(Math.abs(x),Math.abs(z))-37)/10);return rolling+mountain-coast-edge*edge*7;}
export const zoneAt=(x,z)=>x>14?'바람의 해안':x<-15&&z<-12?'하늘 언덕':'사유의 숲';
export const seaVertex=/* glsl */`uniform float uTime;varying vec3 vSea;
void main(){vec3 p=position;float w=sin(p.x*.24+uTime*.46)*.065+cos(p.y*.19+uTime*.32)*.055+sin((p.x+p.y)*.48-uTime*.4)*.025;p.z+=w;vec4 world=modelMatrix*vec4(p,1.);vSea=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;
export const seaFragment=/* glsl */`uniform float uTime;varying vec3 vSea;
void main(){
 float x=vSea.x,z=vSea.z,rolling=.5*sin(x*.12)*cos(z*.1)+.22*sin(z*.2);
 float edge=max(0.,(max(abs(x),abs(z))-37.)/10.);
 float bed=rolling-3.5*pow(max(0.,x-17.)/20.,2.)-edge*edge*7.,depth=max(0.,-1.25-bed);
 vec3 color=mix(vec3(.25,.59,.56),vec3(.045,.24,.36),smoothstep(.15,12.,depth));
 float ripple=sin(x*1.4+z*.9-uTime*.55)*sin(z*1.9-x*.4+uTime*.38);
 color+=vec3(.08,.10,.09)*pow(max(0.,ripple),7.)*.34;
 float foam=(1.-smoothstep(.05,.7,depth))*smoothstep(-.2,.65,sin(z*2.4+x*1.3-uTime*.65));
 color=mix(color,vec3(.82,.87,.76),foam*.4);
 vec3 n=normalize(vec3(cos(x*.24+uTime*.46)*.075,1.,sin(z*.19+uTime*.32)*.06));
 vec3 view=normalize(cameraPosition-vSea),light=normalize(vec3(.8,.34,-.3));
 color+=vec3(.76,.58,.31)*pow(max(0.,dot(reflect(-light,n),view)),85.)*.7;
 float haze=smoothstep(55.,160.,distance(cameraPosition.xz,vSea.xz));color=mix(color,vec3(.64,.76,.73),haze*.82);
 gl_FragColor=vec4(color,1.);
 #include <colorspace_fragment>
}`;
