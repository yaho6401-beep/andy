// Original texture-free fire. A small quad, not a volume ray marcher.
// Three noise octaves keep the close-up light enough for mobile WebGL.
const noiseGLSL=/* glsl */`
float hash21(vec2 p){
 p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);
 return fract(p.x*p.y);
}
float noise21(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(hash21(i),hash21(i+vec2(1.0,0.0)),f.x),mix(hash21(i+vec2(0.0,1.0)),hash21(i+vec2(1.0)),f.x),f.y);
}
float flowNoise(vec2 p){
 float n=noise21(p)*0.57;
 p=mat2(1.6,1.2,-1.2,1.6)*p+7.3;n+=noise21(p)*0.28;
 p=mat2(1.6,1.2,-1.2,1.6)*p+4.1;
 return n+noise21(p)*0.15;
}`;

export const billboardVertex=/* glsl */`
uniform float uWidth;
uniform float uHeight;
varying vec2 vUv;
void main(){
 vUv=uv;
 vec3 right=normalize(vec3(viewMatrix[0][0],0.0,viewMatrix[2][0]));
 vec4 world=modelMatrix*vec4(0.0,0.0,0.0,1.0);
 world.xyz+=right*position.x*uWidth+vec3(0.0,(position.y+0.5)*uHeight,0.0);
 gl_Position=projectionMatrix*viewMatrix*world;
}`;

export const flameFragment=/* glsl */`
uniform float uTime;
uniform float uHeat;
uniform float uBurst;
varying vec2 vUv;
${noiseGLSL}
void main(){
 float y=vUv.y,x=vUv.x*2.0-1.0,t=uTime;
 float n=flowNoise(vec2(x*4.8+sin(y*5.0-t)*0.4,y*3.8-t*1.65));
 float detail=noise21(vec2(x*16.0+0.25*t,y*8.2-t*3.4));
 float curl=sin(y*8.0-t*2.1)*0.15*y+(n-0.5)*0.6*y;
 float center=0.42*pow(max(0.0,1.0-y),1.15)-abs(x+curl)+(n-0.5)*(0.17+y*0.38)*pow(1.0-y,0.65);
 float leftHeight=0.65+sin(t*2.3+0.8)*0.12+sin(t*4.1)*0.035;
 float rightHeight=0.73+sin(t*1.9+2.4)*0.11+sin(t*5.3)*0.025;
 float left=0.255*pow(max(0.0,1.0-y/leftHeight),0.9)-abs(x+0.33-y*0.16+curl)+(n-0.5)*0.13*sqrt(max(0.0,1.0-y/leftHeight));
 float right=0.26*pow(max(0.0,1.0-y/rightHeight),0.85)-abs(x-0.32+y*0.09+curl)+(detail-0.5)*0.10*sqrt(max(0.0,1.0-y/rightHeight));
 if(y>leftHeight)left=-1.0;
 if(y>rightHeight)right=-1.0;
 float field=max(center,max(left,right));
 float alpha=smoothstep(-0.018,0.055,field);
 alpha*=smoothstep(0.0,0.055,y)*(1.0-smoothstep(0.86,1.0,y));
 // Moving translucent folds break up the solid, candle-like silhouette.
 float fold=flowNoise(vec2(x*7.5+curl*3.0,y*6.0-t*2.2));
 alpha*=mix(0.32,1.0,smoothstep(0.24,0.65,fold))*(0.82+detail*0.18);
 float temperature=clamp(field*1.6+(1.0-y)*0.48+(fold-0.5)*0.65,0.0,1.2);
 vec3 color=mix(vec3(0.73,0.035,0.002),vec3(1.0,0.25,0.008),smoothstep(0.0,0.40,temperature));
 color=mix(color,vec3(1.0,0.68,0.10),smoothstep(0.35,0.78,temperature));
 color=mix(color,vec3(1.0,0.86,0.46),smoothstep(0.73,1.05,temperature));
 alpha*=0.80+uHeat*0.15+uBurst*0.04;
 float core=smoothstep(0.52,0.96,temperature)*(1.0-smoothstep(0.36,0.68,y));
 alpha=mix(alpha,1.0,core*0.92);
 if(alpha<0.008)discard;
 gl_FragColor=vec4(color,alpha);
 #include <colorspace_fragment>
}`;

export const smokeFragment=/* glsl */`
uniform float uTime;
uniform float uHeat;
varying vec2 vUv;
${noiseGLSL}
void main(){
 float y=vUv.y,x=vUv.x*2.0-1.0;
 float n=flowNoise(vec2(x*2.7+2.1,y*3.2-uTime*0.35));
 float drift=sin(y*4.0-uTime*0.42)*0.18+(n-0.5)*0.4;
 float spread=0.18+y*0.65;
 float a=(1.0-smoothstep(0.0,spread,abs(x+drift)))*sin(y*3.14159265);
 a*=smoothstep(0.0,0.16,y)*(0.4+n*0.6)*(0.04+max(0.0,1.0-uHeat)*0.025);
 // Warm wood smoke, never a blue/grey luminous sheet over the flames.
 gl_FragColor=vec4(vec3(0.24,0.15,0.085),a);
 #include <colorspace_fragment>
}`;

export const haloFragment=/* glsl */`
uniform float uHeat;
uniform float uBurst;
varying vec2 vUv;
void main(){
 vec2 p=(vUv-vec2(0.5,0.34))*vec2(2.0,2.2);
 float glow=exp(-dot(p,p)*4.8)*(0.045+uHeat*0.07+uBurst*0.025);
 gl_FragColor=vec4(vec3(1.0,0.17,0.012),glow);
 #include <colorspace_fragment>
}`;

export const sparkVertex=/* glsl */`
attribute float aFade;
attribute float aSize;
varying float vFade;
void main(){
 vFade=aFade;vec4 mv=modelViewMatrix*vec4(position,1.0);
 gl_PointSize=clamp(aSize*160.0/max(1.0,-mv.z),1.0,3.2);
 gl_Position=projectionMatrix*mv;
}`;
export const sparkFragment=/* glsl */`
varying float vFade;
void main(){
 float r=length(gl_PointCoord-0.5);
 float a=(1.0-smoothstep(0.12,0.5,r))*vFade;
 if(a<0.01)discard;
 gl_FragColor=vec4(mix(vec3(1.0,0.14,0.01),vec3(1.0,0.76,0.23),vFade),a*0.8);
 #include <colorspace_fragment>
}`;

export const coalVertex=/* glsl */`
varying vec3 vCoal;
void main(){
 vec4 p=vec4(position,1.0);
 #ifdef USE_INSTANCING
 p=instanceMatrix*p;
 #endif
 vCoal=p.xyz;gl_Position=projectionMatrix*modelViewMatrix*p;
}`;
export const coalFragment=/* glsl */`
uniform float uHeat;
uniform float uTime;
${noiseGLSL}
varying vec3 vCoal;
void main(){
 float n=noise21(vCoal.xz*23.0+vCoal.y*11.0);
 float cracks=1.0-smoothstep(0.015,0.095,abs(n-0.5));
 float warmth=(0.3+uHeat*0.7)*(0.87+0.13*sin(uTime*1.5+vCoal.x*16.0));
 float glow=cracks*cracks*warmth;
 vec3 c=vec3(0.012,0.008,0.006)*(0.8+n*0.4)+vec3(0.95,0.075,0.001)*glow;
 c=mix(c,vec3(1.0,0.45,0.025),glow*glow*0.5);
 gl_FragColor=vec4(c,1.0);
 #include <colorspace_fragment>
}`;
