// Original texture-free fire. A small quad, not a volume ray marcher.
// Three noise octaves keep the close-up light enough for mobile WebGL.
const noiseGLSL=/* glsl */`
float hash21(vec2 p){
 p=mod(p,289.0);
 p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);
 return fract(p.x*p.y);
}
float noise21(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.0-15.0)+10.0);
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
uniform float uPhase;
uniform float uHeat;
uniform float uBurst;
varying vec2 vUv;
${noiseGLSL}
void main(){
 float y=vUv.y,x=vUv.x*2.0-1.0,t=uTime+uPhase;
 float n=flowNoise(vec2(x*3.8+sin(y*4.0-t*.8)*0.32,y*3.4-t*1.28));
 float detail=noise21(vec2(x*10.0+0.2*t,y*6.2-t*1.9));
 float curl=sin(y*7.0-t*1.65)*0.15*y+(n-0.5)*0.62*y;
 float center=0.42*pow(max(0.0,1.0-y),1.15)-abs(x+curl)+(n-0.5)*(0.17+y*0.38)*pow(1.0-y,0.65);
 float leftHeight=0.65+sin(t*2.3+0.8)*0.12+sin(t*4.1)*0.035;
 float rightHeight=0.73+sin(t*1.9+2.4)*0.11+sin(t*5.3)*0.025;
 float left=0.255*pow(max(0.0,1.0-y/leftHeight),0.9)-abs(x+0.33-y*0.16+curl)+(n-0.5)*0.13*sqrt(max(0.0,1.0-y/leftHeight));
 float right=0.26*pow(max(0.0,1.0-y/rightHeight),0.85)-abs(x-0.32+y*0.09+curl)+(detail-0.5)*0.10*sqrt(max(0.0,1.0-y/rightHeight));
 if(y>leftHeight)left=-1.0;
 if(y>rightHeight)right=-1.0;
 float wispL=0.13*pow(max(0.0,1.0-y/0.48),1.1)-abs(x+0.58+curl*.8)+(detail-0.5)*.085;
 float wispR=0.15*pow(max(0.0,1.0-y/0.56),1.2)-abs(x-0.57+curl*.7)+(n-0.5)*.12;
 float field=max(max(center,max(left,right)),max(wispL,wispR));
 // Screen-space coverage keeps moving tips smooth at low mobile resolutions.
 // MSAA alone does not anti-alias a procedural alpha silhouette.
 float edge=max(fwidth(field)*1.35,0.009);
 float alpha=smoothstep(-edge,0.035+edge,field);
 alpha*=smoothstep(0.0,0.055,y)*(1.0-smoothstep(0.86,1.0,y));
 // Moving translucent folds break up the solid, candle-like silhouette.
 float fold=flowNoise(vec2(x*5.8+curl*2.3,y*4.8-t*1.55));
 alpha*=mix(0.36,1.0,smoothstep(0.20,0.73,fold))*(0.84+detail*0.16);
 float temperature=clamp(field*1.6+(1.0-y)*0.48+(fold-0.5)*0.65,0.0,1.2);
 vec3 color=mix(vec3(0.73,0.035,0.002),vec3(1.0,0.25,0.008),smoothstep(0.0,0.40,temperature));
 color=mix(color,vec3(1.0,0.68,0.10),smoothstep(0.35,0.78,temperature));
 color=mix(color,vec3(1.0,0.86,0.46),smoothstep(0.73,1.05,temperature));
 alpha*=0.72+min(uHeat,2.0)*0.11+uBurst*0.04;
 float core=smoothstep(0.52,0.96,temperature)*(1.0-smoothstep(0.36,0.68,y));
 alpha=mix(alpha,0.98,core*0.80);
 alpha*=smoothstep(0.14,0.44,uHeat);
 // Fade wisps continuously instead of snapping fragments on/off at an alpha cut.
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
 a*=smoothstep(0.0,0.16,y)*(0.25+n*0.75)*(0.06+uHeat*uHeat*0.027);
 // Warm wood smoke, never a blue/grey luminous sheet over the flames.
 gl_FragColor=vec4(vec3(0.24,0.21,0.18),a);
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
 gl_PointSize=clamp(aSize*160.0/max(1.0,-mv.z),1.0,3.68);
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
 float warmth=(0.35+min(uHeat,2.0)*0.5)*(0.87+0.13*sin(uTime*1.5+vCoal.x*16.0));
 float glow=(cracks*cracks*.5+smoothstep(.58,.84,n)*.28)*warmth;
 float ash=noise21(vCoal.xz*73.0+vCoal.y*18.0);
 vec3 c=vec3(0.018,0.015,0.012)*(0.6+ash)+vec3(0.8,0.035,0.002)*glow;
 c=mix(c,vec3(1.0,0.24,0.008),min(.4,glow*glow*.3));
 gl_FragColor=vec4(c,1.0);
 #include <colorspace_fragment>
}`;
