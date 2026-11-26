import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createHarborTraffic} from './harbor-traffic.js';
import {coastalGeometry,harborAtmosphere} from './coastal-scenery.js';
// Photographic-style regional scenery is combined with real 3D quays and moving traffic.
// Only the currently visible harbor is allocated; images are original generated fiction.
const PORT_LOOKS={bergen:{line:.31,sea:'#294957'},copenhagen:{line:.34,sea:'#3d606d'},madeira:{line:.29,sea:'#234c65'},seychelles:{line:.37,sea:'#237d84'},singapore:{line:.34,sea:'#375967'},southampton:{line:.24,sea:'#495f65'},busan:{line:.31,sea:'#365e76'},hongkong:{line:.27,sea:'#3c7180'},ningbo:{line:.26,sea:'#4e6b7a'},shenzhen:{line:.30,sea:'#3c6c79'},dubai:{line:.28,sea:'#537e85'},abudhabi:{line:.32,sea:'#44818a'}};
export function createPortWorld(parent,id){
 const look=PORT_LOOKS[id]||PORT_LOOKS.bergen,root=new T.Group();root.name='voyage-port-'+id;parent.add(root);const batches=new Map(),owned=[],cube=new T.BoxGeometry(),cyl=new T.CylinderGeometry(1,1,1,12),matrix=new T.Matrix4(),quat=new T.Quaternion();let count=0,disposed=false,photoLoaded=false;
 const uniforms={image:{value:null},waterline:{value:look.line},time:{value:0},night:{value:0},alpha:{value:1},extra:{value:0},hazeColor:{value:new T.Color('#b8c5cc')}};
 const put=(g,color,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{quat.setFromEuler(new T.Euler(rx,ry,rz));matrix.compose(new T.Vector3(x,y,z),quat,new T.Vector3(sx,sy,sz));const copy=(g.index?g.toNonIndexed():g.clone()).applyMatrix4(matrix);copy.deleteAttribute('uv');if(!batches.has(color))batches.set(color,[]);batches.get(color).push(copy);count++;};
 const box=(c,...v)=>put(cube,c,...v),pole=(c,x,y,z,r,h)=>put(cyl,c,x,y,z,r,h,r);
 // Long, uneven headlands continue the photographed shoreline into the surrounding sea.
 const desert=['dubai','abudhabi'].includes(id),flat=desert||['copenhagen','southampton','singapore'].includes(id);
 for(const side of[-1,1]){const g=new T.PlaneGeometry(1100,430,32,8);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const u=(p.getX(i)+550)/1100,v=(p.getZ(i)+215)/430,outline=35*Math.sin(u*13+side)+22*Math.sin(u*29),x=side*(590+u*1100),z=-145-v*430-outline,bank=Math.sin(Math.PI*u)**.7,rise=Math.sin(Math.min(1,v*2)*Math.PI/2);p.setXYZ(i,x,-2.2+bank*rise*(flat?17:72)*(1+.14*Math.sin(u*37+v*8)),z);}if(side>0)for(let i=0;i<g.index.count;i+=3){const b=g.index.getX(i+1);g.index.setX(i+1,g.index.getX(i+2));g.index.setX(i+2,b);}g.computeVertexNormals();const m=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{...uniforms,landColor:{value:new T.Color(desert?'#b1a58a':flat?'#667a70':'#536e63')}},vertexShader:'varying vec3 world,n;varying float dist;void main(){world=position;n=normal;vec4 mv=modelViewMatrix*vec4(position,1.);dist=length(mv.xyz);gl_Position=projectionMatrix*mv;}',fragmentShader:`uniform vec3 landColor,hazeColor;uniform float extra,night;varying vec3 world,n;varying float dist;void main(){float d=dist+extra;vec3 c=landColor*(.82+.18*max(0.,n.y)+.025*sin(world.x*.08)*cos(world.z*.09));c=mix(c,c*vec3(.24,.34,.47),night);c=mix(c,hazeColor,smoothstep(350.,1200.,d)*.78);float a=(1.-smoothstep(650.,1200.,d))*smoothstep(-1.,3.,world.y);gl_FragColor=vec4(c,a);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});root.add(new T.Mesh(g,m));owned.push(g,m);count++;}
 // Asymmetric harbor-side structures leave the center fairway open.
 for(const side of[-1,1]){const x=side*(id==='seychelles'?270:290);box('#8e9691',x,1.2,92,110,3.8,14);box('#b4b2a4',x,3.15,92,111,.35,14.5);box('#5f716f',x,.1,100,111,.55,.15);
  for(let i=0;i<33;i++){const xx=x-53+i*3.3;box(i%3?'#727e79':'#929b91',xx,1,99.2,3.15,2.5,.8);if(i%3===0){pole('#526268',xx,3.7,94,.2,1.1);box('#526268',xx,4.22,94,.75,.12,.4);}if(i%7===0){pole('#5a696d',xx,6.4,88,.065,6.5);const head=box('#e0cfab',xx,9.7,88,.5,.15,.75);}}
  for(let i=0;i<9;i++){const ring=new T.TorusGeometry(.56,.16,7,16);put(ring,'#263b40',x-44+i*11,1.5,99.8);ring.dispose();}
  // Slatted timber finger piers, with pilings and mooring cleats.
  for(let i=0;i<2;i++){const px=x-25+i*45;box('#7d7764',px,1.6,122,4,.45,46);for(let z=101;z<145;z+=1.2)box('#9d9279',px,1.85,z,3.9,.09,1.05);for(const s of[-1,1])for(let z=102;z<=144;z+=8){pole('#746b58',px+s*1.85,.1,z,.22,4);box('#34494c',px+s*1.5,2.08,z,.6,.12,.14);}}
 }
 // Breakwater rocks are irregular closed polyhedra, not repeated toy boulders.
 const rock=new T.IcosahedronGeometry(1,1);for(let i=0;i<54;i++){const side=i<27?-1:1,j=i%27,x=side*(335+j*2.2);put(rock,i%3?'#6f7b79':'#8b9590',x,-.1+(i%4)*.23,86+Math.sin(i*2.1)*5,2.4+(i%3)*.5,1.8,2.7,0,i*.7,.2);}rock.dispose();
 for(const side of[-1,1]){const x=side*245;pole('#b9c4bd',x,4.8,105,.32,9);pole(side<0?'#a16559':'#688e7c',x,7.8,105,.43,1.2);box('#d2d7ca',x,9.7,105,1.8,.18,1.5);}
 for(const[color,geos]of batches){const g=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());const m=new T.MeshStandardMaterial({color,roughness:.87,metalness:color==='#526268'?.35:0});root.add(new T.Mesh(g,m));owned.push(g,m);}cube.dispose();cyl.dispose();
 let panorama=null,reflection=null;
 if(typeof document!=='undefined'){
  const image=new T.TextureLoader().load(new URL('./scenery/ports/'+id+'-v1.jpg',import.meta.url).href,()=>{if(disposed){image.dispose();return;}photoLoaded=true;});image.colorSpace=T.SRGBColorSpace;image.anisotropy=2;uniforms.image.value=image;owned.push(image);
  const width=1860,g=coastalGeometry(look.line),m=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms,vertexShader:'varying vec2 v;varying float h;varying float distanceToEye;void main(){v=uv;h=position.y;vec4 mv=modelViewMatrix*vec4(position,1.);distanceToEye=length(mv.xyz);gl_Position=projectionMatrix*mv;}',fragmentShader:`uniform sampler2D image;uniform float night,alpha,extra;uniform vec3 hazeColor;varying vec2 v;varying float h;varying float distanceToEye;void main(){vec3 c=texture2D(image,vec2(1.-abs(mod(v.x,2.)-1.),v.y)).rgb;c=mix(c,c*vec3(.24,.34,.47),night);float d=distanceToEye+extra;float edge=smoothstep(-.36,-.1,v.x)*smoothstep(-.36,-.1,1.-v.x);float sky=1.-smoothstep(.75,1.,v.y);float shore=smoothstep(-.2,9.,h);float distanceFade=1.-smoothstep(700.,1320.,d);c=mix(c,hazeColor,smoothstep(350.,1200.,d)*.78);gl_FragColor=vec4(c,alpha*edge*sky*shore*distanceFade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`});panorama=new T.Mesh(g,m);root.add(panorama);owned.push(g,m);
  const rg=new T.PlaneGeometry(width,230),rm=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D image;uniform float time,waterline,night,alpha,extra;varying vec2 v;void main(){float ripple=sin(v.y*92.+time*1.3+sin(v.x*81.+time*.7))* .0025;vec2 uv=vec2(clamp(v.x+ripple,0.,1.),waterline+(1.-v.y)*.2);vec3 c=texture2D(image,uv).rgb;c=mix(c,c*vec3(.24,.34,.47),night);float a=pow(v.y,2.)*.12*alpha*(1.-smoothstep(500.,1400.,extra))*smoothstep(0.,.22,v.x)*smoothstep(0.,.22,1.-v.x);gl_FragColor=vec4(c,a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`});reflection=new T.Mesh(rg,rm);reflection.rotation.x=-Math.PI/2;reflection.position.set(0,.035,90);root.add(reflection);owned.push(rg,rm);
 }
 const traffic=createHarborTraffic(root,id);
 const nativeMaterials=new Map(),center=new T.Vector3(0,0,-25),worldCenter=new T.Vector3();let visibility=0;root.traverse(o=>{if(o.isMesh&&o!==panorama&&o!==reflection)for(const m of[o.material].flat())if(!nativeMaterials.has(m))nativeMaterials.set(m,{opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite});});
 const state={id,batchedMaterials:batches.size,objects:count,triangles:[...root.children].reduce((n,o)=>n+(o.geometry?(o.geometry.index?.count||o.geometry.attributes.position.count)/3:0),0),sea:look.sea,curvedCoast:true,headlands:2,style:'photographic-harbor-with-3d-foreground',image:'/archive/cruise/scenery/ports/'+id+'-v1.jpg',trafficTypes:[...new Set(traffic.state.map(v=>v.kind))]};
 return {root,get state(){return {...state,photoLoaded,visibility,atmosphericDistance:uniforms.extra.value,traffic:traffic.state};},update(time,{night=0,opacity=1,extra=0,haze,eye}={}){uniforms.time.value=time;uniforms.night.value=night;uniforms.alpha.value=opacity;uniforms.extra.value=extra;if(haze)uniforms.hazeColor.value.copy(haze);if(eye){root.updateWorldMatrix(true,false);worldCenter.copy(center).applyMatrix4(root.matrixWorld);visibility=harborAtmosphere(worldCenter.distanceTo(eye.position),extra).visibility;}const nativeOpacity=1-T.MathUtils.smoothstep(extra,500,1400);for(const[m,original]of nativeMaterials){const transparent=original.transparent||nativeOpacity<.999;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}m.opacity=original.opacity*nativeOpacity;m.depthWrite=original.depthWrite&&nativeOpacity>.98;}traffic.update(time,nativeOpacity);},dispose(){disposed=true;root.removeFromParent();traffic.dispose();owned.forEach(o=>o.dispose());}};
}
