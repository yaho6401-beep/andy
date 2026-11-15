import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
let environment,avatar,ready;
export const artStatus={loaded:false,source:'original-glb',error:null};
async function model(file){const response=await fetch('/assets/metaverse3/'+file,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('3D 모델을 불러오지 못했어요.');return new GLTFLoader().parseAsync(await response.arrayBuffer(),'/assets/metaverse3/');}
export function loadArt(){return ready??=Promise.all([model('environment.glb'),model('avatar.glb')]).then(([e,a])=>{environment=e.scene;avatar=a.scene;artStatus.loaded=true;}).catch(e=>{artStatus.error=e.message;console.warn('3D 모델 대신 기본 모델로 열어요.',e.message);});}
export function artObject(name){return environment?.getObjectByName(name)?.clone(true)||null;}
export function artAvatar(look={}){
 if(!avatar)return null;
 const root=avatar.clone(true),female=(look.kind||0)>=4,variant=(look.kind||0)%4,copies=new Map();
 root.traverse(o=>{if(!o.isMesh)return;o.userData.sharedArtGeometry=true;const original=o.material;if(!copies.has(original)){const m=original.clone();m.userData.avatarOwned=true;if(m.name==='hair')m.color.set(look.hair||'#554239');if(m.name==='shirt')m.color.set(look.color||'#b7c6a1');if(m.name==='skin')m.color.set(['#edc5aa','#bf8b6d','#e5bfa7','#d3a58a'][variant]);copies.set(original,m);}o.material=copies.get(original);o.castShadow=true;});
 root.getObjectByName('skirt').visible=female;root.getObjectByName('longHair').visible=look.hairStyle>0||(female&&variant!==2);root.getObjectByName('glasses').visible=variant===1;
 if(variant===2){const pin=new T.Mesh(new T.TorusGeometry(.06,.015,5,12),new T.MeshStandardMaterial({color:'#d3b47d'}));pin.material.userData.avatarOwned=true;pin.position.set(.25,1.65,.12);root.getObjectByName('hips').add(pin);}
 root.userData={body:root.getObjectByName('body'),hips:root.getObjectByName('hips'),arms:[root.getObjectByName('armL'),root.getObjectByName('armR')],legs:[root.getObjectByName('legL'),root.getObjectByName('legR')],originalGLB:true};root.scale.setScalar(1.08);return root;
}
