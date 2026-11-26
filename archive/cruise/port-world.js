import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createHarborTraffic} from './harbor-traffic.js';
// Photographic-style regional scenery is combined with real 3D quays and moving traffic.
// Only the currently visible harbor is allocated; images are original generated fiction.
const PORT_LOOKS={bergen:{line:.31,sea:'#294957',haze:'#b8c4c9'},copenhagen:{line:.34,sea:'#3d606d',haze:'#c2cbd0'},madeira:{line:.29,sea:'#234c65',haze:'#bac6cf'},seychelles:{line:.37,sea:'#237d84',haze:'#c2d5d5'},singapore:{line:.34,sea:'#375967',haze:'#c4ccd0'}};
export function createPortWorld(parent,id){
 const look=PORT_LOOKS[id]||PORT_LOOKS.bergen,root=new T.Group();root.name='voyage-port-'+id;parent.add(root);const batches=new Map(),owned=[],cube=new T.BoxGeometry(),cyl=new T.CylinderGeometry(1,1,1,12),matrix=new T.Matrix4(),quat=new T.Quaternion();let count=0,disposed=false,photoLoaded=false;
 const put=(g,color,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{quat.setFromEuler(new T.Euler(rx,ry,rz));matrix.compose(new T.Vector3(x,y,z),quat,new T.Vector3(sx,sy,sz));const copy=(g.index?g.toNonIndexed():g.clone()).applyMatrix4(matrix);copy.deleteAttribute('uv');if(!batches.has(color))batches.set(color,[]);batches.get(color).push(copy);count++;};
 const box=(c,...v)=>put(cube,c,...v),pole=(c,x,y,z,r,h)=>put(cyl,c,x,y,z,r,h,r);
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
 const uniforms={image:{value:null},waterline:{value:look.line},time:{value:0},night:{value:0},alpha:{value:1}};
 let panorama=null,reflection=null;
 if(typeof document!=='undefined'){
  const image=new T.TextureLoader().load(new URL('./scenery/ports/'+id+'-v1.jpg',import.meta.url).href,()=>{if(disposed){image.dispose();return;}photoLoaded=true;});image.colorSpace=T.SRGBColorSpace;image.anisotropy=2;uniforms.image.value=image;owned.push(image);
  const height=420,width=1260,g=new T.PlaneGeometry(width,height),m=new T.ShaderMaterial({transparent:true,depthWrite:true,uniforms,vertexShader:'varying vec2 v;varying float h;void main(){v=uv;h=position.y+420.*(.5-waterline);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D image;uniform float night,alpha;varying vec2 v;varying float h;void main(){vec3 c=texture2D(image,v).rgb;c=mix(c,c*vec3(.24,.34,.47),night);float edge=smoothstep(0.,.055,v.x)*smoothstep(0.,.055,1.-v.x);float sky=1.-smoothstep(.88,1.,v.y);float shore=smoothstep(-.6,1.8,h);gl_FragColor=vec4(c,alpha*edge*sky*shore);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`});m.uniforms.waterline=uniforms.waterline; // same shoreline reference in both shader stages
  m.vertexShader='uniform float waterline;'+m.vertexShader;panorama=new T.Mesh(g,m);panorama.position.set(0,height*(.5-look.line),-25);root.add(panorama);owned.push(g,m);
  const rg=new T.PlaneGeometry(width,230),rm=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D image;uniform float time,waterline,night,alpha;varying vec2 v;void main(){float ripple=sin(v.y*92.+time*1.3+sin(v.x*81.+time*.7))* .0025;vec2 uv=vec2(clamp(v.x+ripple,0.,1.),waterline+(1.-v.y)*.2);vec3 c=texture2D(image,uv).rgb;c=mix(c,c*vec3(.24,.34,.47),night);float a=pow(v.y,2.)*.19*alpha*smoothstep(0.,.05,v.x)*smoothstep(0.,.05,1.-v.x);gl_FragColor=vec4(c,a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`});reflection=new T.Mesh(rg,rm);reflection.rotation.x=-Math.PI/2;reflection.position.set(0,.035,90);root.add(reflection);owned.push(rg,rm);
 }
 const traffic=createHarborTraffic(root,id);
 const state={id,batchedMaterials:batches.size,objects:count,triangles:[...root.children].reduce((n,o)=>n+(o.geometry?(o.geometry.index?.count||o.geometry.attributes.position.count)/3:0),0),sea:look.sea,style:'photographic-harbor-with-3d-foreground',image:'/archive/cruise/scenery/ports/'+id+'-v1.jpg',trafficTypes:[...new Set(traffic.state.map(v=>v.kind))]};
 return {root,get state(){return {...state,photoLoaded,traffic:traffic.state};},update(time,{night=0,opacity=1}={}){uniforms.time.value=time;uniforms.night.value=night;uniforms.alpha.value=opacity;traffic.update(time);},dispose(){disposed=true;root.removeFromParent();traffic.dispose();owned.forEach(o=>o.dispose());}};
}
