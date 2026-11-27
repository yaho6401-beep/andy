import * as T from 'three';
import {GARDEN} from './garden-layout.js';
const box=new T.BoxGeometry(1,1,1),compass=new T.CylinderGeometry(.13,.13,.018,20),materials=new Map();
function material(color,metalness=0){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.65,metalness}));return materials.get(color);}

// A quiet physical discovery, baked with the garden's other static furnishings.
export function createCruiseGift(parent){
 const group=new T.Group();group.position.set(GARDEN.cruiseGift.x,0,GARDEN.cruiseGift.z);group.rotation.y=-.23;parent.add(group);
 function part(color,x,y,z,w,h,d,metalness=0){const mesh=new T.Mesh(box,material(color,metalness));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);group.add(mesh);return mesh;}
 part('#a99c84',0,.08,0,1.2,.16,1);part('#ded3b9',0,.45,0,1.05,.64,.84);part('#f2e7cf',0,.8,0,1.12,.12,.91);
 part('#899b94',0,.82,0,.16,.14,.94);part('#899b94',0,.82,0,1.14,.14,.13);part('#899b94',0,.45,.427,.16,.65,.025);
 for(const side of [-1,1]){const bow=part('#899b94',side*.17,.96,0,.37,.1,.19);bow.rotation.z=side*.36;}
 const ticket=part('#fff5dc',.29,.94,.28,.48,.025,.25);ticket.rotation.y=-.28;
 for(let i=0;i<3;i++)part('#bd985b',.18+i*.075,.957,.28,.025,.005,.13);
 const rim=new T.Mesh(compass,material('#b89958',.5));rim.rotation.x=Math.PI/2;rim.position.set(.29,.49,.435);group.add(rim);
 const needle=part('#f8edcf',.29,.49,.45,.035,.17,.018);needle.rotation.z=-.35;
 return group;
}
