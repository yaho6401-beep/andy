import {createDolphin} from './dolphin-model.js';
import {DolphinEncounter} from './dolphin-encounter.js';
import {createFishingRig} from './fishing-rig.js';
import {createScenicShips} from './scenic-ships.js';
import * as T from 'three';
import {ISLAND,islandHeight,FISH_SPECIES,onIsland} from './sea-adventure-state.js';
import {SEA} from './shore-state.js';
import {marineModel} from './marine-models.js';
export function createSeaAdventureVisual(scene){
 const root=new T.Group();root.name='small-island-and-sailing-sea';scene.add(root);const owned=[],models=[],own=x=>(owned.push(x),x),material=(c,extra={})=>own(new T.MeshStandardMaterial({color:c,roughness:.88,...extra}));
 const sand=material('#c1b38e'),wood=material('#6e6150'),rock=material('#8a9291'),leaf=material('#597969'),amber=material('#ffdda2',{emissive:'#b18347',emissiveIntensity:.55}),dark=material('#324f59');
 const mesh=(parent,g,m,x=0,y=0,z=0,sx=1,sy=sx,sz=sx)=>{const o=new T.Mesh(own(g),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;};
 const island=new T.Group();island.position.set(ISLAND.x,0,ISLAND.z);root.add(island);const points=[],indices=[],segments=48,rings=14;
 for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,r=j/rings*1.22,x=Math.cos(a)*ISLAND.rx*r,z=Math.sin(a)*ISLAND.rz*r;points.push(x,islandHeight(x,z+ISLAND.z)-.025,z);}
 for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,b,a+1,b+1);}const terrain=own(new T.BufferGeometry());terrain.setAttribute('position',new T.Float32BufferAttribute(points,3));terrain.setIndex(indices);terrain.computeVertexNormals();island.add(new T.Mesh(terrain,sand));
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2,x=Math.cos(a)*6.5,z=Math.sin(a)*4.5;const o=mesh(island,new T.IcosahedronGeometry(1,1),rock,x,islandHeight(x,z-80)+.05,z,.22+(i%3)*.12,.15,.33);o.rotation.set(i*.2,i*.8,.12);}
 mesh(island,new T.IcosahedronGeometry(1,2),rock,-3,.82,1,.95,.4,.65);
 for(const[x,z]of [[-2,-1.5],[.4,1.7]]){const h=islandHeight(x,z-80),trunk=mesh(island,new T.CylinderGeometry(.1,.16,2.8,9),wood,x,h+1.35,z);trunk.rotation.z=.13;for(let i=0;i<7;i++){const a=i/7*Math.PI*2,g=new T.BufferGeometry(),v=[0,0,0,Math.cos(a-.27)*.9,-.1,Math.sin(a-.27)*.9,Math.cos(a)*2,-.65,Math.sin(a)*2,Math.cos(a+.27)*.9,-.1,Math.sin(a+.27)*.9];g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();leaf.side=T.DoubleSide;mesh(island,g,leaf,x-.18,h+2.8,z);}}
 mesh(root,new T.BoxGeometry(.9,.4,.65),wood,ISLAND.rod.x,.65,ISLAND.rod.z);const foundRod=mesh(root,new T.CylinderGeometry(.018,.03,2.5,7),wood,ISLAND.rod.x+.45,1.45,ISLAND.rod.z);foundRod.rotation.z=-.22;
 const reel=mesh(root,new T.TorusGeometry(.1,.025,7,16),rock,ISLAND.rod.x+.58,.9,ISLAND.rod.z+.04);reel.rotation.y=.2;
 for(let i=0;i<5;i++)mesh(root,new T.BoxGeometry(1.6,.1,.27),wood,ISLAND.fish.x,.59,ISLAND.fish.z+i*.3);for(const x of [-.65,.65])mesh(root,new T.CylinderGeometry(.06,.06,1,7),wood,ISLAND.fish.x+x,.18,ISLAND.fish.z-.08);
 // A small hand-painted island marker is readable without floating menu cards.
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#344e50';ctx.fillRect(0,0,512,128);ctx.fillStyle='#eee4ca';ctx.font='28px system-ui';ctx.textAlign='center';ctx.fillText('작은 섬 · 파도가 놓고 간 쉼표',256,58);ctx.font='20px system-ui';ctx.fillText('쉼돌 · 나무 상자 옆 낚싯대',256,99);const texture=own(new T.CanvasTexture(canvas)),signMat=own(new T.MeshBasicMaterial({map:texture}));mesh(root,new T.PlaneGeometry(2.7,.675),signMat,0,1.25,-76.4);mesh(root,new T.CylinderGeometry(.04,.04,1,6),wood,0,.7,-76.4);
 const dolphin=createDolphin();models.push(dolphin);root.add(dolphin);dolphin.visible=false;
 const rig=createFishingRig(root),scenic=createScenicShips(root);
 const caught=marineModel('fish');models.push(caught);root.add(caught);caught.visible=false;
 const encounters=new DolphinEncounter();let dolphinSeen=false;return {update(time,{enabled,player,job,hand,wall=Date.now(),reduced=false}){root.visible=enabled;if(!enabled){encounters.update(wall,null);dolphin.visible=false;return {dolphin:false};}const p=player,pose=encounters.update(wall,p),meet=!!pose;dolphin.visible=meet;
  if(pose){dolphin.position.set(pose.x,pose.y,pose.z);dolphin.rotation.set(pose.pitch,pose.yaw,0);dolphin.userData.tail.rotation.x=reduced?0:pose.tail;}
  rig.update(time,{player:p,job,hand,wall});
  caught.visible=!!p&&onIsland(p.x,p.z)&&!!job&&job.stage==='result'&&job.catch?.kind==='fish';if(caught.visible){caught.position.set(p.x+.7,1.25+Math.sin(time*3)*.05,p.z-.7);caught.scale.setScalar(.45);caught.rotation.set(0,time*.4,.25);const info=FISH_SPECIES.find(f=>f.id===job.catch.species);if(info)caught.children[0].material.color.set(info.color);}
  scenic.update(time,wall);
  const first=meet&&!dolphinSeen;dolphinSeen=meet;return {dolphin:meet,dolphinGreeting:first};},get diagnostics(){return {island:true,dolphin:dolphin.visible,dolphinEncounters:encounters.count,dolphinPosition:dolphin.visible?dolphin.position.toArray():null,ship:0,ships:4,lanes:scenic.diagnostics,rod:foundRod.visible,cast:rig.diagnostics.visible,rig:rig.diagnostics};},dispose(){rig.dispose();scenic.dispose();root.removeFromParent();models.forEach(m=>m.userData.dispose());owned.forEach(o=>o.dispose());}};
}
