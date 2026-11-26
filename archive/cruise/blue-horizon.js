import {DeckExplorer} from './deck-exploration.js';
import {buildDeckEquipment} from './ship-equipment.js';
import {SHIP_ZONES,DECK_Y,UPPER_Y,CABIN_Y,ROOF_Y,SHIP_LENGTH,SHIP_BEAM,CAPTAIN_CONTACT,findShipPath,shipStep,shipZone} from './ship-layout.js';
import {buildShipConnections} from './ship-architecture.js';
import {createAvatar,animateAvatar,disposeAvatar} from '../src/avatar.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {cruiseFurnishings} from './promenade.js';
import {buildCruiseDetails} from './ship-details.js';
import {CruiseVoyage} from './voyage-session.js';
import {createBridgeCrew} from './bridge-crew.js';
import {createCoastline} from './coastline.js';
import {buildMaritimeInteriors} from './maritime-interiors.js';
import {CruiseChart} from './navigation-chart.js';
// Adapted from the owner-provided BLUE HORIZON prototype. Original source SHA-256: c4af2aaa9d7afd2dbee26bfbd9bd096c2002631c8530213dd9f9dd48e119a7a6
const $=id=>document.getElementById(id);
export function startBlueHorizon(T, identity={}, ui={}) {
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(52,1,.15,1200);
  const renderer = new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;document.body.prepend(renderer.domElement);
  function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
  addEventListener('resize',resize);resize();
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('error').hidden=false;document.getElementById('error').textContent='그래픽 연결이 끊겼어요. 새로고침하거나 캠핑장으로 돌아가 주세요.';});
  const sunLight = new T.DirectionalLight(0xffd2a1,2.1);
  sunLight.position.set(-25,15,-30);
  const fill=new T.HemisphereLight(0xd4e4ee,0x655c54,1.45);const bounce=new T.DirectionalLight('#fff0d5',1.05);bounce.position.set(4,8,12);scene.add(sunLight,fill,bounce);
  const cube=new T.BoxGeometry(), ball=new T.SphereGeometry(1,12,8), cylinder=new T.CylinderGeometry(1,1,1,12);
  // A tiny original grain texture, reused on every teak surface.
  const grainCanvas=document.createElement('canvas');grainCanvas.width=128;grainCanvas.height=512;const gc=grainCanvas.getContext('2d');gc.fillStyle='#ada28c';gc.fillRect(0,0,128,512);for(let i=0;i<90;i++){gc.strokeStyle=i%3?'#ece3cb20':'#574f4430';gc.lineWidth=.5+i%2;gc.beginPath();const x=(i*47)%128;gc.moveTo(x,0);gc.bezierCurveTo(x+7,150,x-9,350,x+3,512);gc.stroke();}gc.strokeStyle='#5f594740';gc.lineWidth=.8;for(let x=0;x<128;x+=16){gc.beginPath();gc.moveTo(x,0);gc.lineTo(x,512);gc.stroke();for(let y=(x%32?64:0);y<512;y+=128){gc.beginPath();gc.moveTo(x,y);gc.lineTo(x+16,y);gc.stroke();}}const grain=new T.CanvasTexture(grainCanvas);grain.colorSpace=T.SRGBColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;
  const envCanvas=document.createElement('canvas');envCanvas.width=128;envCanvas.height=64;const envCtx=envCanvas.getContext('2d'),envGradient=envCtx.createLinearGradient(0,0,0,64);envGradient.addColorStop(0,'#b2c5d2');envGradient.addColorStop(.48,'#e8e4d4');envGradient.addColorStop(.6,'#728591');envGradient.addColorStop(1,'#4e585d');envCtx.fillStyle=envGradient;envCtx.fillRect(0,0,128,64);const environment=new T.CanvasTexture(envCanvas);environment.mapping=T.EquirectangularReflectionMapping;environment.colorSpace=T.SRGBColorSpace;scene.environment=environment;scene.environmentIntensity=.45;
  const materials=new Map();
  function mesh(parent,geometry,color,x,y,z,w,h,d,glow=false){
    const key=color+':'+glow;
    if(!materials.has(key))materials.set(key,glow?new T.MeshBasicMaterial({color}):new T.MeshStandardMaterial({color,roughness:.76,metalness:color===0xe4ba70?.35:0}));
    const material=materials.get(key);if([0xb77e56,0xbb8965,0xae7955,0xb1836e].includes(color)){material.map=grain;material.color.setHex(0xffffff);material.roughness=.85;}
    if(geometry===cube&&w>20&&d>20&&h<.3&&material.map===grain){geometry=geometry.clone();const p=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i))>.4)uv.setXY(i,(p.getX(i)+.5)*w,(p.getZ(i)+.5)*d);}
    const m=new T.Mesh(geometry,material);
    m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
  }
  const box=(p,c,...v)=>mesh(p,cube,c,...v);
  const orb=(p,c,...v)=>mesh(p,ball,c,...v);
  const ivory=0xe7dfcd, navy=0x162d40, teak=0xb77e56, brass=0xe4ba70;
  const uniforms={time:{value:0},sky:{value:new T.Color()},deep:{value:new T.Color()},shine:{value:new T.Color()},wake:{value:0},seaOffset:{value:new T.Vector2()},course:{value:0},moon:{value:new T.Vector2(-.42,-1)}};
  const water=new T.Mesh(new T.PlaneGeometry(2000,2000),new T.ShaderMaterial({uniforms,
    vertexShader:'varying vec3 world; void main(){world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}',
    fragmentShader:`varying vec3 world;uniform float time,wake,course;uniform vec2 seaOffset;uniform vec3 sky,deep,shine;uniform vec2 moon;
    float hash21(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
    float seaNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+vec2(1.)),f.x),f.y);}
    void main(){vec2 p=mat2(cos(course),-sin(course),sin(course),cos(course))*world.xz+seaOffset; float t=time;
      float a=(seaNoise(p*.56+vec2(t*.11,t*.19))*.7+seaNoise(p*1.37+vec2(-t*.16,t*.09))*.3)*2.-1.;
      float b=seaNoise(p*.29+vec2(t*.08,-t*.12))*2.-1.;
      float dist=length(world.xz-cameraPosition.xz);
      float detail=1.-smoothstep(35.,250.,dist);float rip=.5+(.25*a+.25*b)*(.34+.66*detail);
      vec3 c=deep*(.88+.2*rip);c+=vec3(.11,.15,.17)*pow(.5+.5*b,12.)*(.08+.15*detail);
      float reflected=exp(-abs(p.x-moon.x*(-p.y))* .085)*smoothstep(0.,20.,-p.y);
      c+=shine*reflected*pow(.5+.5*a,7.)*(.16+.28*detail);
      float z=max(0.,world.z-70.), x=abs(world.x+.4*sin(z*.18));
      float wakeWidth=9.+z*.13;
      float center=exp(-x*x/(wakeWidth*wakeWidth*.35));
      float arms=exp(-abs(x-wakeWidth)*1.4);
      float cells=seaNoise(vec2(p.x*.8,p.y*.7-t*.8));
      float grain=seaNoise(vec2(p.x*2.3,p.y*2.-t*1.2));
      float foam=wake*smoothstep(0.,2.,z)*exp(-z*.018)*(center*.85+arms*.4)*smoothstep(.26,.83,cells*.65+grain*.35);
      c=mix(c,vec3(.65,.81,.8),clamp(foam,0.,.72));
      gl_FragColor=vec4(mix(c,sky,smoothstep(260.,1000.,dist)),1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`}));
  water.rotation.x=-Math.PI/2;scene.add(water);
  const horizon=new T.Color(), top=new T.Color(), harborSea=new T.Color();
  const dome=new T.Mesh(new T.SphereGeometry(390,24,14),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,depthTest:false,uniforms:{horizon:{value:horizon},top:{value:top}},vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 v;uniform vec3 horizon,top;void main(){gl_FragColor=vec4(mix(horizon,top,pow(clamp(normalize(v).y*2.,0.,1.),.45)),1.);
  #include <tonemapping_fragment>
      #include <colorspace_fragment>
  }`}));
  dome.renderOrder=-1000;scene.add(dome);
  const moonMap=new T.TextureLoader().load('/assets/camp/nasa-lro-moon-1k.jpg');moonMap.colorSpace=T.SRGBColorSpace;const sun=mesh(scene,new T.SphereGeometry(1,40,24),0xffe0a5,-83,17,-198,6,6,6,true);sun.material=sun.material.clone();sun.material.map=moonMap;sun.material.color.set('#dce8ed');
  const starPositions=[];
  let seed=397;
  function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
  for(let i=0;i<240;i++){const angle=random()*Math.PI*2,y=12+random()*115;starPositions.push(Math.sin(angle)*220,y,Math.cos(angle)*220);}
  const starGeo=new T.BufferGeometry();
  starGeo.setAttribute('position',new T.Float32BufferAttribute(starPositions,3));
  const stars=new T.Points(starGeo,new T.PointsMaterial({color:0xffefd8,size:.48}));scene.add(stars);
  const environmentRoot=new T.Group();scene.add(environmentRoot);const coast=createCoastline(environmentRoot),furnishings=cruiseFurnishings();
  function rail(p,x1,z1,x2,z2,base=DECK_Y){
    const length=Math.hypot(x2-x1,z2-z1),angle=-Math.atan2(z2-z1,x2-x1);
    for(const [y,h,c] of [[1.05,.12,teak],[.69,.05,ivory],[.38,.05,ivory]]){
      const m=box(p,c,(x1+x2)/2,base+y,(z1+z2)/2,length,h,.09);m.rotation.y=angle;
    }
    const count=Math.ceil(length/1.7);
    for(let i=0;i<=count;i++)box(p,ivory,x1+(x2-x1)*i/count,base+.5,z1+(z2-z1)*i/count,.08,1,.08);
  }
  function seat(p,x,z,c=teak,w=1.7,yaw=0){
    const g=new T.Group();g.position.set(x,0,z);g.rotation.y=yaw;p.add(g);p=g;x=0;z=0;
    box(p,c,x,3.46,z,w,.14,.52);box(p,c,x,3.79,z-.23,w,.48,.12);
    for(const s of [-1,1])box(p,navy,x+s*w*.34,3.22,z,.1,.45,.36);
  }
  function deck(p,color){
    if(p.userData.upper){box(p,color,0,2.99,0,26.8,.02,34);}
    // Fine teak seams are a shared UV texture, not hundreds of separate meshes.
  }
  function lamp(p,x,z){
    box(p,navy,x,4,z,.07,2,.07);
    orb(p,0xffce86,x,5,z,.16,.18,.16,true);
  }
  function label(p,text,x,y,z,width=2.5){
    const c=document.createElement('canvas');c.width=256;c.height=64;
    const ctx=c.getContext('2d');ctx.fillStyle='#182c40';ctx.fillRect(0,0,256,64);ctx.fillStyle='#ddede4';ctx.font='600 24px system-ui';ctx.textAlign='center';ctx.fillText(text,128,41);
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
    const sprite=new T.Sprite(new T.SpriteMaterial({map:texture}));sprite.position.set(x,y,z);sprite.scale.set(width,width/4,1);p.add(sprite);
  }
  // Merge static opaque furniture by material; preserve wheel joints and alpha glass.
  function bake(root){const groups=new Map();root.updateMatrixWorld(true);root.traverse(o=>{let dynamic=false;for(let a=o;a&&a!==root;a=a.parent)if(a.userData.dynamic)dynamic=true;if(dynamic||!o.isMesh||(o.material.transparent&&!o.userData.bakeGlass)||o===wheel||wheel.getObjectById(o.id))return;const m=o.matrixWorld.clone().premultiply(root.matrixWorld.clone().invert());const parts=groups.get(o.material)||[];parts.push({o,g:(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(m)});groups.set(o.material,parts);});for(const [mat,parts]of groups){if(parts.length<2){parts.forEach(p=>p.g.dispose());continue;}const merged=mergeGeometries(parts.map(p=>p.g),false);parts.forEach(p=>{p.g.dispose();p.o.removeFromParent();});root.add(new T.Mesh(merged,mat));}}
  const wheel=new T.Group();
  const rooms=[
    {name:'메인 갑판',build(p){
      deck(p,teak);seat(p,-11.5,3,teak,1.7,-Math.PI/2);seat(p,11.5,3,teak,1.7,Math.PI/2);lamp(p,-7,-5);lamp(p,7,-5);
      box(p,ivory,9,3.75,9,1.4,1.5,7.4);
      box(p,navy,9,4.55,9,1.35,.1,7.3);
      label(p,'OCEAN BAR',9,5.2,5.2);
      mesh(p,cylinder,brass,-13.2,3.55,-6,.1,1.1,.1);
      const scope=mesh(p,cylinder,navy,-13.5,4.22,-6,.19,1.1,.19);scope.rotation.z=1.35;
      mesh(p,cylinder,brass,-14.04,4.34,-6,.22,.12,.22).rotation.z=1.35;
    },actions:['난간 기대기','망원경','먼 풍경 보기']},
    {name:'선수',build(p){
      deck(p,0xbb8965);
      // The forward observation deck follows the shaped hull.
      for(const x of [-6,6])lamp(p,x,-7);
      label(p,'THE HORIZON · OBSERVATION',0,4.5,-16,4.5);
    },actions:['난간 기대기','먼 풍경 보기']},
    {name:'선미',build(p){
      deck(p,0xae7955);seat(p,-5,8.2);seat(p,5,8.2);lamp(p,-7,-6);lamp(p,7,-6);
      for(const x of [-7,7])box(p,ivory,x,3.33,-7.8,1.2,.64,.8);
    },actions:['난간 기대기','먼 풍경 보기']},
    {name:'선교',build(p){
      deck(p,0x526574);
      // Panoramic roof and windows are supplied by the shared architecture.
      for(let x=-12;x<=12;x+=3)box(p,ivory,x,5.25,-16.5,.12,4.4,.16);
      box(p,ivory,0,3.45,-16.5,26,.5,.22);
      for(const x of [-5.1,-2.55,0,2.55,5.1]){
        box(p,navy,x*1.8,3.54,-13,3.9,1.08,1.25);
        box(p,0x19475d,x*1.8,4.22,-13.37,2.4,.72,.10);
        for(let k=0;k<5;k++)box(p,k%2?0x83e1ab:0x4591a8,x*1.8-.53+k*.24,4.15+k*.035,-13.31,.13,.032,.012,true);
      }
      label(p,'RADAR',-9.18,4.83,-13.35);label(p,'ECDIS',0,4.83,-13.35);label(p,'VHF',9.18,4.83,-13.35);
      seat(p,-4,-10.8,navy,.65);seat(p,4,-10.8,navy,.65);
      box(p,navy,0,3.5,-11.3,.56,1,.56);
      wheel.position.set(0,4.23,-11.09);p.add(wheel);
      mesh(wheel,new T.TorusGeometry(.52,.066,8,28),brass,0,0,0,1,1,1);
      for(let i=0;i<6;i++)box(wheel,brass,0,0,0,1.02,.034,.034).rotation.z=i*Math.PI/6;
      orb(wheel,navy,0,0,0,.16,.16,.11);
    },actions:['조타 체험','기적 듣기']},
    {name:'식당',build(p){
      deck(p,0xb1836e);// Light, glazed dining pavilion.
      for(const x of [-12.8,12.8])for(let z=-15;z<=15;z+=5)box(p,ivory,x,5.2,z,.12,4.4,.12);
      for(const x of [-9,0,9])for(const tz of [-11,-3,5]){
        const tableParent=new T.Group();tableParent.position.z=tz+5.8;p.add(tableParent);const tableRoot=p;p=tableParent;
        mesh(p,cylinder,ivory,x,3.82,-5.8,.88,.14,.88);box(p,navy,x,3.36,-5.8,.2,.73,.2);
        seat(p,x-1.32,-5.8,0x9e5a52,.68);seat(p,x+1.32,-5.8,0x9e5a52,.68);
        box(p,brass,x,6.12,-5.8,.035,1.4,.035);
        orb(p,0xffcc80,x,5.42,-5.8,.29,.16,.29,true);
        orb(p,0xffad71,x,3.96,-5.8,.09,.12,.09,true);p=tableRoot;
      }
    },actions:['창가 앉기']},
    {name:'좌현 윙',build(){},actions:['바다 바라보기']},
    {name:'우현 윙',build(){},actions:['바다 바라보기']},
    {name:'레이더 데크',build(){},actions:['바다 바라보기']},
    {name:'나의 객실',build(){},actions:['침대에 쉬기','독서하기']}
  ];
  const avatar=createAvatar(identity.appearance);scene.add(avatar);
  const wildlife=[0,1,2].map(i=>{
    const g=new T.Group();scene.add(g);
    const scale=i===2?2.1:1;
    orb(g,0x476783,0,0,0,scale*.39,scale*.3,scale);
    const fin=orb(g,0x3d5870,0,.28,.09,.09,scale*.36,scale*.24);fin.rotation.x=-.5;
    orb(g,0x3d5870,0,.04,-scale*.98,scale*.54,.073,.27);
    return g;
  });
  const themes=[[0xeaa394,0x324374,0x105372,0xffad6b],[0x415674,0x111936,0x102743,0xb3d2ff],[0xbad0db,0x3f739e,0x126a83,0xe9d4a1]];
  function theme(){
    const mode=Number($('light').value), [h,t,d,s]=themes[mode];
    horizon.setHex(h);top.setHex(t);uniforms.sky.value.copy(horizon);uniforms.deep.value.setHex(d);uniforms.shine.value.setHex(s);
    scene.fog=new T.Fog(h,140,480);fill.intensity=mode===1?1.35:1.8;bounce.intensity=mode===1?.95:1.2;stars.visible=mode===1;sun.material.map=mode===1?moonMap:null;sun.material.needsUpdate=true;sun.material.color.setHex(mode===1?0xe3efff:0xffdfaa);sun.position.y=mode===1?86:mode===2?145:17;sunLight.intensity=mode===1?.9:2.1;
  }
  try{const saved=localStorage.getItem('bookscents-cruise-light-v1');if(['0','1','2'].includes(saved))$('light').value=saved;}catch{}$('light').onchange=()=>{try{localStorage.setItem('bookscents-cruise-light-v1',$('light').value);}catch{}theme();};theme();
  let sailing=null,crew=null,exploration=null;
  let room=0,pose='',zoom=false,helm=false,velocity=0,angle=0,drag=null,audio=null,muted=true,floorY=DECK_Y,cameraTurn=0,orbit=0,overview=false,harborView=false,autoPath=[],arrival=null,destination=null;
  function tone(kind){
    if(muted)return;
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    audio??=new Audio();audio.resume().catch(()=>{});
    const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;
    const horn=kind==='horn';o.type=horn?'triangle':'sine';o.frequency.setValueAtTime(horn?83:115,t);
    g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(horn?.075:.021,t+.025);g.gain.exponentialRampToValueAtTime(.001,t+(horn?1.05:.14));
    o.connect(g).connect(audio.destination);o.start(t);o.stop(t+(horn?1.1:.15));
  }
  $('sound').onclick=()=>{muted=!muted;$('sound').textContent=muted?'소리 끔':'소리 켬';$('sound').setAttribute('aria-pressed',String(!muted));if(!muted)tone('wheel');};
  function button(parent,text,handler){const b=document.createElement('button');b.textContent=text;b.onclick=handler;parent.append(b);return b;}
  const tabs=rooms.map((r,i)=>button($('rooms'),r.name,()=>enter(i)));
  function pauseInputs(){if(destination)$('hint').textContent='산책을 잠시 멈췄어요.';keys.clear();stick.set(0,0);$('knob').style.transform='';autoPath=[];arrival=null;destination=null;}
  function local(x,z){return {x,z:z+SHIP_ZONES[room].z,y:SHIP_ZONES[room].y};}
  function routeTo(target,after=null,label='목적지'){
    exploration?.stand();exploration?.close();
    const path=findShipPath({x:avatar.position.x,z:avatar.position.z,y:floorY},target);
    if(!path.length){$('hint').textContent='난간 안쪽의 통로에서 다시 선택해 주세요.';return;}
    pose='';zoom=false;helm=false;overview=false;harborView=false;document.body.classList.remove('cruise-overview');$('ship-overview').textContent='크루즈 전경';$('ship-overview').setAttribute('aria-pressed','false');$('helm').hidden=true;pauseInputs();autoPath=path;arrival=after;destination={...target,label};$('hint').textContent=label+'로 걸어가는 중 · 방향키나 조이스틱을 움직이면 직접 조작해요';
  }
  function action(text){
    if(text==='항해 지도'){chart.open();return;}
    if(text==='독서하기'){const book=document.getElementById('camp-borrowed-book');if(book&&!book.hidden)book.click();else $('hint').textContent='도서관이나 텐트에서 책을 빌려오면 객실에서도 펼칠 수 있어요.';return;}
    if(text==='침대에 쉬기'){routeTo({x:6.25,z:3.6,y:CABIN_Y},{pose:'침대 옆에 앉기'},'침대');return;}
    if(text==='바다 바라보기'||text==='먼 풍경 보기'){exploration.viewing?exploration.close():exploration.open('landscape');return;}
    if(text==='선장 만나기'){routeTo(CAPTAIN_CONTACT,{captain:true},'선장');return;}
    if(text==='기적 듣기'){tone('horn');$('hint').textContent=muted?'소리를 켜면 개인용 뱃고동을 들을 수 있어요.':'개인용 뱃고동 체험';return;}
    if(text==='조타 체험'){if(helm){helm=false;$('helm').hidden=true;return;}routeTo(local(0,-9.85),{helm:true},'조타륜');return;}
    if(text==='망원경'){if(zoom){exploration.close();zoom=false;return;}routeTo(local(-12.35,-6),{zoom:true},'망원경');return;}
    if(text==='벤치 앉기'){document.getElementById('deck-sit').click();return;}
    if(pose===text){pose='';avatar.position.y=floorY;return;}
    const target=text==='창가 앉기'?local(-10.32,-11):text==='벤치 앉기'?local(room===2?-5:-3,room===2?-5.5:7):room===0?local(-13.3,4):local(0,room===2?17.7:-17.7);
    routeTo(target,{pose:text},text);
  }
  function showZone(i){
    room=i;document.body.classList.toggle('cruise-bridge',i===3);tabs.forEach((t,j)=>t.setAttribute('aria-pressed',String(i===j)));$('actions').replaceChildren();rooms[i].actions.forEach(t=>button($('actions'),t,()=>action(t)));if(i===3){button($('actions'),'선장 만나기',()=>action('선장 만나기'));}button($('actions'),'👋 인사',()=>{greeting=1.3;});
  }
  function enter(i){if(!SHIP_ZONES[i])return;routeTo(SHIP_ZONES[i].target,null,SHIP_ZONES[i].name);}
  function pointer(el,move,end){
    let active=null;
    el.onpointerdown=e=>{if(active!==null)return;active=e.pointerId;el.setPointerCapture(active);move(e,true);};
    el.onpointermove=e=>{if(active===e.pointerId)move(e,false);};
    el.onlostpointercapture=e=>{if(active===e.pointerId){active=null;end();}};
  }
  const stick=new T.Vector2(),keys=new Set();
  pointer($('pad'),e=>{
    const r=$('pad').getBoundingClientRect();
    stick.set((e.clientX-r.left-r.width/2)/29,(e.clientY-r.top-r.height/2)/29).clampLength(0,1);
    $('knob').style.transform='translate('+stick.x*26+'px,'+stick.y*26+'px)';
  },()=>{stick.set(0,0);$('knob').style.transform='';});
  let lastTick=0;
  pointer($('helm'),(e,first)=>{
    const r=$('helm').getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
    if(Math.hypot(x,y)<12){drag=null;return;}
    const next=Math.atan2(y,x);
    if(first||drag===null){drag=next;return;}
    const delta=Math.atan2(Math.sin(next-drag),Math.cos(next-drag));drag=next;angle+=delta;velocity=T.MathUtils.clamp(delta*15,-4,4);
    if(Math.abs(delta)>.05&&performance.now()-lastTick>100){tone('wheel');lastTick=performance.now();}
  },()=>{drag=null;});
  $('ship-overview').onclick=()=>{exploration.close();overview=harborView?false:!overview;harborView=false;document.body.classList.toggle('cruise-overview',overview);pauseInputs();$('ship-overview').textContent=overview?'갑판으로 돌아가기':'크루즈 전경';$('ship-overview').setAttribute('aria-pressed',String(overview));};
  const movement=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s']);
  addEventListener('keydown',e=>{if(movement.has(e.key)&&!document.querySelector('dialog[open]')&&!['SELECT','INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();keys.add(e.key);}});
  addEventListener('keyup',e=>keys.delete(e.key));addEventListener('blur',()=>keys.clear());
  let greeting=0,previous=performance.now(),elapsed=0,frameStart=performance.now(),frameCount=0,fps=0;
  const wish=new T.Vector2(),target=new T.Vector3();
  const ship=new T.Group();scene.add(ship);rooms.forEach((r,i)=>{const zone=SHIP_ZONES[i];r.group=new T.Group();r.group.userData={zone:i,upper:i>=3};r.group.position.set(0,zone.y-3,zone.z);r.build(r.group);if(i<5)furnishings.build(r.group,i);ship.add(r.group);});const connections=buildShipConnections(ship,{box,mesh,cylinder,rail,label});const details=buildCruiseDetails(ship,{box,mesh,cylinder,label});const maritime=buildMaritimeInteriors(ship,{box,mesh,cylinder,label}),equipment=buildDeckEquipment(ship,{box,mesh,cylinder,label});bake(ship);avatar.position.set(0,DECK_Y,4);avatar.rotation.y=Math.PI;showZone(0);camera.position.set(0,DECK_Y+5,13.3);camera.lookAt(0,DECK_Y+1,-8);
  exploration=new DeckExplorer({ship,canvas:renderer.domElement,camera,viewer:()=>({x:avatar.position.x,y:floorY,z:avatar.position.z}),routeTo,stop:pauseInputs,orbit:delta=>orbit+=delta,locked:()=>helm,setSeat:s=>{avatar.position.set(s.x,s.y+.36,s.z);avatar.rotation.y=s.yaw;pose='벤치 앉기';floorY=s.y;},stand:p=>{avatar.position.set(p.x,p.y,p.z);floorY=p.y;pose='';}});
  crew=createBridgeCrew(scene);
  sailing=new CruiseVoyage(environmentRoot,{pause:pauseInputs,player:()=>({room,position:avatar.position}),meetCaptain:()=>action('선장 만나기'),watchHarbor:()=>{pauseInputs();harborView=true;overview=false;document.body.classList.add('cruise-overview');$('ship-overview').textContent='갑판으로 돌아가기';$('ship-overview').setAttribute('aria-pressed','true');},eye:()=>camera,horizon:()=>horizon,night:()=>Number($('light').value)===1,harborWater:(color,dt=.016)=>{harborSea.set(color);if(Number($('light').value)===1)harborSea.multiplyScalar(.3);uniforms.deep.value.lerp(harborSea,1-Math.exp(-dt*.7));},depart:route=>{harborView=false;overview=false;document.body.classList.remove('cruise-overview');$('ship-overview').textContent='크루즈 전경';$('light').value='2';try{localStorage.setItem('bookscents-cruise-light-v1','2');}catch{}theme();uniforms.deep.value.set(route.id==='seychelles'?'#187c85':route.id==='madeira'?'#17445e':'#1b5c74');tone('horn');}});
  const chart=new CruiseChart(scene,{pause:pauseInputs,state:()=>sailing.state,canvas:renderer.domElement,camera,viewer:()=>({x:avatar.position.x,y:floorY,z:avatar.position.z})});
  renderer.setAnimationLoop(now=>{
    const dt=Math.min(.04,(now-previous)/1000);previous=now;elapsed+=dt;
    const has=(a,b)=>Number(keys.has(a)||keys.has(b));ui.onFrame?.();const blocked=!!document.querySelector('dialog[open]');
    zoom=exploration.view?.kind==='binocular';
    wish.set(stick.x+has('ArrowRight','d')-has('ArrowLeft','a'),stick.y+has('ArrowDown','s')-has('ArrowUp','w')).clampLength(0,1);
    let dx=0,dz=0,walking=false;
    if(!blocked&&!helm&&!overview&&!harborView&&!exploration.viewing){
      if(wish.lengthSq()>.015){exploration.stand(true);if(destination)$('hint').textContent='조이스틱 또는 방향키로 산책';autoPath=[];arrival=null;destination=null;dx=wish.x*Math.cos(cameraTurn)+wish.y*Math.sin(cameraTurn);dz=-wish.x*Math.sin(cameraTurn)+wish.y*Math.cos(cameraTurn);}
      else if(autoPath.length){let point=autoPath[0];if(Math.hypot(point.x-avatar.position.x,point.z-avatar.position.z)<.012){autoPath.shift();point=autoPath[0];}if(point){const length=Math.hypot(point.x-avatar.position.x,point.z-avatar.position.z),step=Math.min(1,length/Math.max(.001,4.1*dt));dx=(point.x-avatar.position.x)/Math.max(.001,length)*step;dz=(point.z-avatar.position.z)/Math.max(.001,length)*step;}else{const result=arrival;arrival=null;destination=null;if(result?.pose)pose=result.pose;if(result?.seatId)exploration.sit(result.seatId);if(result?.zoom){zoom=true;exploration.open('binocular');}if(result?.helm){helm=true;$('helm').hidden=false;}if(result?.captain)sailing?.open();$('hint').textContent=pose?pose:helm?'조타륜을 천천히 돌려보세요.':zoom?'망원경으로 바다 보기':'도착했어요. 바다를 바라보며 쉬어가세요.';}}
      if(dx||dz){const speed=autoPath.length?4.1:3.3,next=shipStep({x:avatar.position.x,z:avatar.position.z,y:floorY},{x:avatar.position.x+dx*dt*speed,z:avatar.position.z+dz*dt*speed});if(next){pose='';zoom=false;avatar.position.set(next.x,next.y,next.z);floorY=next.y;avatar.rotation.y=Math.atan2(dx,dz);walking=true;}}
    }
    const zone=shipZone({x:avatar.position.x,z:avatar.position.z,y:floorY});if(zone!==room)showZone(zone);
    const heading=rooms[room].name+' · '+(Math.abs(avatar.position.x)>13.6&&floorY>DECK_Y&&floorY<UPPER_Y?'계단':floorY>(DECK_Y+UPPER_Y)/2?'상층':'메인층')+' · '+(identity.nickname||'여행자')+(destination?' → '+destination.label:'');if($('place').textContent!==heading)$('place').textContent=heading;
    const travel=sailing.frame(dt,elapsed);crew.update(elapsed,avatar.position,travel);uniforms.seaOffset.value.set(travel.x,travel.z);uniforms.course.value=travel.heading;uniforms.wake.value=T.MathUtils.damp(uniforms.wake.value,Math.min(1,travel.speed/8),2,dt);connections.guide(destination,elapsed);
    avatar.position.y=floorY+(pose.includes('앉기')?.36:0);avatar.rotation.x=pose.includes('기대기')?.12:0;greeting=Math.max(0,greeting-dt);animateAvatar(avatar,{motion:walking?'walk':pose.includes('앉기')?'sit':'idle',emote:greeting?'wave':null,emoteAt:greeting?elapsed*1000:0},elapsed);avatar.visible=!zoom&&!harborView&&!exploration.viewing;
    if(drag===null){angle+=velocity*dt;velocity*=Math.exp(-5*dt);}
    wheel.rotation.z=-angle;$('helm').style.transform=helm?'rotate('+angle+'rad)':'';
    uniforms.time.value=elapsed;
    coast.set(room,Number($('light').value)===1);
    wildlife.forEach((g,i)=>{
      const t=(elapsed+i*19)%160;
      g.visible=(room===1||room===2)&&t>4&&t<12;
      g.position.set(-18+(t-4)*3.8,-.48+Math.max(0,Math.sin((t-4)*(i===2?1:2.8)))*1.35,-23-i*5);
      g.rotation.y=1.3;g.rotation.x=Math.cos(t*2.8)*.25;
    });
    details.update(elapsed);equipment.update(elapsed);maritime.update(elapsed,avatar.position);chart.frame();exploration.frame(dt,{blocked,hidden:overview||harborView||helm,moving:!!destination});if(!exploration.viewing){const bridgeInside=floorY<ROOF_Y-.5&&floorY>UPPER_Y-.1&&Math.abs(avatar.position.x)<10.6&&avatar.position.z< -28.1&&avatar.position.z> -50.2,cabinInside=floorY<CABIN_Y+.5,interior=bridgeInside||cabinInside||room===4;const turn=(room===2||room===4?Math.PI:0)+orbit;cameraTurn=T.MathUtils.damp(cameraTurn,turn,2,dt);const forward=new T.Vector3(-Math.sin(cameraTurn),0,-Math.cos(cameraTurn));target.copy(avatar.position).addScaledVector(forward,zoom?.5:bridgeInside?-12.4:interior?-7.2:-9.3);if(interior&&!zoom){target.x+=Math.cos(cameraTurn)*1.35;target.z-=Math.sin(cameraTurn)*1.35;}target.y=floorY+(zoom?1.45:cabinInside?2.1:interior?2.8:5.0);if(bridgeInside&&!zoom){target.x=T.MathUtils.clamp(target.x*.4,-10,10);target.z=T.MathUtils.clamp(target.z,-49.7,-28.6);}if(cabinInside&&!zoom){target.y=CABIN_Y+2.1;if(avatar.position.x>4&&avatar.position.z>0&&avatar.position.z<11){target.x=T.MathUtils.clamp(target.x,4.35,11.75);target.z=T.MathUtils.clamp(target.z,.7,10.3);}else{target.x=T.MathUtils.clamp(target.x,-12,3.1);target.z=T.MathUtils.clamp(target.z,-20,20);}}if(room===1&&avatar.position.z< -51.5){target.z=Math.min(target.z,-52.5);target.x+=3.5;target.y=floorY+3.6;}if(room===2&&avatar.position.z>51.5){target.z=Math.max(target.z,52.5);target.x+=3.5;target.y=floorY+3.6;}if(harborView)target.set(112,DECK_Y+24,-35);if(overview){const fit=innerWidth<innerHeight?1.48:1;target.set(100*fit,88*fit,135*fit);}camera.position.lerp(target,1-Math.exp(-dt*(overview?3:7)));camera.fov=T.MathUtils.lerp(camera.fov,zoom?24:bridgeInside?(innerWidth<600?82:60):harborView?(innerWidth<600?86:58):innerWidth<600?65:52,1-Math.exp(-dt*7));camera.updateProjectionMatrix();const look=avatar.position.clone().addScaledVector(forward,zoom?70:12);look.y=floorY+(zoom?.9:1);if(bridgeInside&&!zoom)look.x*=.35;if((room===1&&avatar.position.z< -51.5)||(room===2&&avatar.position.z>51.5)){look.copy(avatar.position);look.y=floorY+1;}if(overview)look.set(0,8,0);if(harborView)look.set(0,35,-390);camera.lookAt(look);}else exploration.applyCamera(dt);
    scene.fog.near=overview?260:travel.route?180:140;scene.fog.far=travel.route?(overview?1100:850):(overview?680:480);renderer.render(scene,camera);frameCount++;if(now-frameStart>=1000){fps=frameCount*1000/(now-frameStart);frameCount=0;frameStart=now;}
  });
  return {enter,pauseInputs,get state(){const avatarNDC=avatar.position.clone().add(new T.Vector3(0,1,0)).project(camera);return {camera:{crew:crew.state.map(p=>{const n=new T.Vector3(p.x,p.y+1,p.z).project(camera);return{id:p.id,inView:p.visible&&Math.abs(n.x)<.95&&Math.abs(n.y)<.95&&Math.abs(n.z)<1,ndc:n.toArray()};}),avatarNDC:avatarNDC.toArray(),avatarInView:Math.abs(avatarNDC.x)<1&&Math.abs(avatarNDC.y)<1&&Math.abs(avatarNDC.z)<1},room:rooms[room].name,position:avatar.position.toArray(),pose,helm,zoom,route:{destination:destination?.label||null,points:autoPath.length},deckY:floorY,shipLength:SHIP_LENGTH,fps,shipBeam:SHIP_BEAM,overview,harborView,orbit,exploration:exploration.state,equipment:equipment.state,pool:true,triangles:renderer.info.render.triangles,stairs:Math.abs(avatar.position.x)>13.6&&floorY>DECK_Y&&floorY<UPPER_Y,avatar:{kind:identity.appearance?.kind||0,originalGLB:!!avatar.userData.originalGLB,system:'archive-shared'},coast:coast.state,voyage:sailing.state,crew:crew.state,maritime:maritime.state,chart:chart.state,drawCalls:renderer.info.render.calls,geometries:renderer.info.memory.geometries};},dispose(){renderer.setAnimationLoop(null);sailing?.dispose();crew?.dispose();chart?.dispose();maritime.dispose();exploration.dispose();disposeAvatar(avatar);removeEventListener('resize',resize);const geometries=new Set(),mats=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [o.material].flat().filter(Boolean)){mats.add(m);if(m.map)textures.add(m.map);}});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());mats.forEach(m=>m.dispose());audio?.close().catch(()=>{});environment.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
