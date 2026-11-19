import {createSoftRain} from './rain-visual.js';
import * as T from 'three';
import {createLeafGeometry} from './leaf.js';
export function createCampWeather(parent){
 const root=new T.Group();root.name='quiet-camp-weather';parent.add(root);const rain=createSoftRain(root);
 const leafGeo=createLeafGeometry(),leafMat=new T.MeshLambertMaterial({color:'#c1b77c',vertexColors:true,side:T.DoubleSide,transparent:true,opacity:.86}),leaves=new T.InstancedMesh(leafGeo,leafMat,18),matrix=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),scale=new T.Vector3(.17,.17,.17);root.add(leaves);for(let i=0;i<18;i++)leaves.setColorAt(i,new T.Color().setHSL(.08+(i%6)*.02,.35,.58));let state={kind:'clear'},wind=0;
 return {setState(value){state=value||{kind:'clear'};},update(time,viewer,reduced=false){wind=state.kind==='wind'?.6+Math.sin(time*1.7)*.22:state.kind==='rain'?.22:0;rain.update(time,viewer,state.kind==='rain'&&!reduced,state.intensity??.5);leaves.visible=state.kind==='wind'&&!reduced;const x=viewer?.x||0,z=viewer?.z||0;if(leaves.visible){for(let i=0;i<18;i++){p.set(x+((time*(1.4+i%3*.2)+i*1.9)%22)-11,1+(i%6)*.42+Math.sin(time*2+i)*.3,z+Math.sin(i*2.4)*7);q.setFromEuler(new T.Euler(time+i,time*.7+i,time*1.2));matrix.compose(p,q,scale);leaves.setMatrixAt(i,matrix);}leaves.instanceMatrix.needsUpdate=true;}},get wind(){return wind;},get diagnostics(){return {kind:state.kind,intensity:state.intensity||0,...rain.diagnostics,leaves:leaves.visible,wind};},dispose(){root.removeFromParent();rain.dispose();leafGeo.dispose();leafMat.dispose();leaves.dispose();}};
}
