// Prefer 3D; distinguish an unavailable WebGL context from a scene/code failure.
export function initializeGraphics(T,createWorld,scene,createCanvas=()=>document.createElement('canvas')){
 let renderer=null;
 for(const powerPreference of ['low-power','default']){
  const canvas=createCanvas();
  try{const context=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference});if(!context)continue;renderer=new T.WebGLRenderer({canvas,context,antialias:false,powerPreference});break;}
  catch{canvas.remove?.();}
 }
 if(!renderer)return {mode:'2d',reason:'webgl-unavailable'};
 const original=new Set(scene.children);
 try{renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;const world=createWorld(scene);return {mode:'3d',renderer,world};}
 catch{for(const child of [...scene.children])if(!original.has(child)){child.traverse?.(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.map?.dispose();m.dispose();}}});scene.remove(child);}renderer.dispose();renderer.forceContextLoss?.();return {mode:'2d',reason:'scene-error'};}
}
export function graphicsDescription(mode,reason){return mode==='3d'?'3D 공간으로 실행 중입니다.':reason==='scene-error'?'3D 공간 준비 중 오류가 발생해 2D로 전환했어요.':reason==='context-lost'?'3D 연결이 끊겨 2D로 전환했어요.':'이 브라우저에서 WebGL 2를 사용할 수 없어 2D로 실행 중입니다.';}
