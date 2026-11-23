import * as T from 'three';
// Analytic wave normals and a broken silver path: no reflection pass or large texture.
export function createMoonlitOceanMaterial(){return new T.ShaderMaterial({
 uniforms:{uTime:{value:0},uTide:{value:-14.45},uMoonX:{value:0}},side:T.DoubleSide,
 vertexShader:/* glsl */`
 uniform float uTime;varying vec3 vWater;
 void main(){vec3 p=position;p.y+=sin(p.x*.32+p.z*.25+uTime*.78)*.065+sin(p.x*.71-p.z*.43-uTime*1.07)*.027+sin(p.z*.91+uTime*.61)*.013;vWater=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}
 `,
 fragmentShader:/* glsl */`
 uniform float uTime;uniform float uTide;uniform float uMoonX;varying vec3 vWater;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){
  vec3 p=vWater;float a=p.x*.32+p.z*.25+uTime*.78,b=p.x*.71-p.z*.43-uTime*1.07,c=p.z*.91+uTime*.61;
  vec3 normal=normalize(vec3(-(.0208*cos(a)+.01917*cos(b)),1.,-(.01625*cos(a)-.01161*cos(b)+.01183*cos(c))));
  vec3 view=normalize(cameraPosition-p);float fresnel=pow(1.-max(0.,dot(normal,view)),3.);
  float detail=noise(vec2(p.x*1.6+uTime*.12,p.z*2.5-uTime*.22)),swell=.5+.5*sin(a+sin(b)*.45);
  vec3 color=mix(vec3(.011,.035,.055),vec3(.026,.077,.088),swell*.48+detail*.16);color+=vec3(.027,.046,.053)*fresnel;
  // Perspective broadens the moon path toward the viewer. Fine crests break it into glints.
  float distance=length(cameraPosition.xz-p.xz),width=mix(3.3,12.,smoothstep(8.,85.,distance));
  float path=exp(-pow((p.x-uMoonX+sin(p.z*.21+uTime*.12)*.75)/width,2.)*2.4);
  float crest=sin(p.z*7.8+sin(p.x*2.6+uTime*.42)*1.15+uTime*.75);
  float edge=max(fwidth(crest)*1.4,.04),shine=smoothstep(.70-edge,.94+edge,crest);
  float fragments=smoothstep(.24,.76,detail)*(.42+.58*pow(max(0.,sin(p.x*5.1-p.z*.63+uTime*.16)),2.));
  color+=vec3(.36,.41,.37)*path*shine*fragments*(.36+.45*fresnel);
  color+=vec3(.025,.034,.031)*path*(.4+.6*detail);
  float foam=exp(-pow((p.z-uTide)*4.,2.))*(.45+.55*detail);color+=vec3(.17,.23,.22)*foam;
  float haze=smoothstep(30.,100.,distance);color=mix(color,vec3(.035,.066,.086),haze*.73);
  gl_FragColor=vec4(color,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }
 `
});}
