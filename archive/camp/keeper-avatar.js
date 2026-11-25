import * as T from 'three';
import {createAvatar} from '../src/avatar.js';
export function createKeeperAvatar(){
 const npc=createAvatar({kind:1,hairStyle:0,hair:'#c4c2b6',color:'#7d8b77'}),hips=npc.userData.hips;
 const grey=new T.MeshStandardMaterial({color:'#b8b7ab',roughness:.95}),cream=new T.MeshStandardMaterial({color:'#dfd8c4',roughness:.9}),knit=new T.MeshStandardMaterial({color:'#657564',roughness:1});for(const m of [grey,cream,knit])m.userData.avatarOwned=true;
 const add=(geo,mat,x,y,z,sx=1,sy=sx,sz=sx)=>{const mesh=new T.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);hips.add(mesh);};
 // Restrained silver eyebrows, soft moustache and a cardigan keep the original
 // SD proportions while giving Onyu a relaxed, middle-aged silhouette.
 for(const side of [-1,1]){add(new T.SphereGeometry(1,10,6),grey,side*.14,1.38,.34,.075,.018,.02);add(new T.SphereGeometry(1,10,6),grey,side*.055,1.16,.355,.06,.018,.017);add(new T.BoxGeometry(.035,.34,.035),cream,side*.1,.75,.25);}
 add(new T.BoxGeometry(.16,.11,.03),knit,.22,.69,.25);for(let i=0;i<3;i++)add(new T.SphereGeometry(.014,7,5),cream,0,.67+i*.09,.274);
 npc.name='keeper-onyu-silver-cardigan';npc.userData.keeperStyle='silver-hair-glasses-cardigan';return npc;
}
