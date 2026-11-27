// Shared plan coordinates: architecture, pedestrian collision and interior camera.
// Heights are resolved by ship-layout.js to avoid a circular import.
const wall=(id,x,z,w,d,windows=[])=>({id,x,z,w,d,windows});
export const CABIN_ENVELOPE={minX:-12.55,maxX:12.55,minZ:-21,maxZ:21,height:3.05};
export const CABIN_INTERIOR_WALLS=[
 wall('cabin-port-shell',-12.55,0,.22,42),
 wall('cabin-starboard-shell',12.55,0,.22,42,[{center:3,width:2.4,sill:1.35,height:1.2},{center:8,width:2.4,sill:1.35,height:1.2}]),
 wall('cabin-forward-bulkhead',0,-21,25.1,.24),wall('cabin-aft-bulkhead',0,21,25.1,.24),
 wall('corridor-port',-3.8,-2.35,.22,37.3),
 wall('corridor-starboard-forward',3.8,-8.15,.22,25.7),
 wall('corridor-starboard-aft',3.8,14,.22,14),
 wall('port-lobby-bulkhead',-7.2,16.3,6.8,.22),
 wall('starboard-lobby-bulkhead',8.15,16.3,8.7,.22),
 wall('suite-forward',8.15,0,8.7,.22),wall('suite-aft',8.15,11,8.7,.22),
];
export const DINING_INTERIOR_WALLS=[
 wall('dining-port',-12.8,34,.22,34,[23,29,35,41,47].map(center=>({center,width:4.7,sill:.9,height:2.45}))),
 wall('dining-starboard',12.8,35.9,.22,30.2,[24,30,36,42,48].map(center=>({center,width:4.7,sill:.9,height:2.45}))),
 wall('dining-forward',0,17,25.6,.22,[-8,-2,4,9].map(center=>({center,width:3.7,sill:.9,height:2.45}))),
 wall('dining-aft',0,51,25.6,.22,[-9,-3,3,9].map(center=>({center,width:4.7,sill:.9,height:2.45}))),
];
export const INTERIOR_FURNITURE=[
 {id:'suite-bed',deck:'cabin',x:9,z:2.7,w:2.25,d:2.5},
 {id:'suite-wardrobe',deck:'cabin',x:5.55,z:1,w:2.5,d:1.25},
 {id:'suite-desk',deck:'cabin',x:11.85,z:7.1,w:.85,d:2.9},
 {id:'suite-sofa',deck:'cabin',x:9,z:9.6,w:3.0,d:1.0},
 {id:'dining-buffet',deck:'dining',x:0,z:48.8,w:6.2,d:1.3},
];
export function accommodationFloor(x,z){
 // Closed neighboring cabins are scenery, not open walk-through halls.
 return (Math.abs(x)<=3.68&&Math.abs(z)<20.85)||
  (x>=-12.4&&x<=12.4&&z>=16.5&&z<20.85)||
  (x>=3.68&&x<=12.4&&z>.12&&z<10.88);
}
export function passengerRegion(p){
 if(p.y<10.25&&p.x> -13.35&&p.x< -10.6&&p.z>=5.7&&p.z<17.3)return 'cabin-stair';
 if(p.y<7.6){if(p.x>3.68&&p.z>0&&p.z<11)return 'suite';return p.z>16.4?'cabin-lobby':'cabin-corridor';}
 if(p.y>13.8&&p.y<15&&p.z>17.3&&p.z<50.9&&Math.abs(p.x)<12.65)return 'dining';
 if(p.y>13.8&&p.y<15&&p.z< -28.1&&p.z> -50.3&&Math.abs(p.x)<10.6)return 'bridge';
 return null;
}
export const CAMERA_COMPARTMENTS={
 'cabin-stair':{minX:-12.3,maxX:-10.9,minZ:6.1,maxZ:20.3},
 'cabin-corridor':{minX:-3.35,maxX:3.35,minZ:-20.35,maxZ:20.35,ceiling:9.72},
 'cabin-lobby':{minX:-12.1,maxX:12.1,minZ:16.7,maxZ:20.35,ceiling:9.72},
 suite:{minX:4.12,maxX:12.10,minZ:.4,maxZ:10.6,ceiling:9.72},
 dining:{minX:-12.35,maxX:12.35,minZ:17.45,maxZ:50.55,ceiling:18.05},
 bridge:{minX:-10.35,maxX:10.35,minZ:-50.05,maxZ:-28.35,ceiling:18.35},
};
export function clampInteriorEye(eye,region){const b=CAMERA_COMPARTMENTS[region];if(!b)return eye;return{x:Math.max(b.minX,Math.min(b.maxX,eye.x)),y:Math.min(b.ceiling??Infinity,eye.y),z:Math.max(b.minZ,Math.min(b.maxZ,eye.z))};}
