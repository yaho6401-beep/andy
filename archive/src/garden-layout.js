// One layout for rendering, navigation and authoritative collision checks.
export const GARDEN={
 bounds:{x:13.8,z:12.8},
 campGate:{x:10,z:-9.4,yaw:0},campReturn:{x:10,z:-6.7,yaw:0},
 beyondGate:{x:-10,z:-9.4,yaw:0},beyondReturn:{x:-10,z:-6.7,yaw:0},
 trees:[{x:-3.8,z:-3},{x:3.8,z:-3},...[-12,12].flatMap(x=>[-8,-1,7,11].map(z=>({x,z}))),{x:-6.7,z:10.5},{x:6.7,z:10.5}],
 benches:[{x:-4.8,z:3},{x:4.8,z:3}],
 beds:[...[-5.2,.3].flatMap(z=>[-3.2,3.2].map(x=>({x,z}))),...[-7.6,7.6].flatMap(x=>[-3,3,8.8].map(z=>({x,z}))),{x:-4.8,z:7.3},{x:4.8,z:7.3}],
 wayfinder:{x:6.9,z:4.8,w:3,d:.35},beyondWayfinder:{x:-6.9,z:4.8,w:3,d:.35},trail:{x:10,junctionZ:1.5}
};
export const GARDEN_COLLIDERS=[GARDEN.wayfinder,GARDEN.beyondWayfinder,{x:0,z:-10.5,w:9,d:4.2},...GARDEN.trees.map(t=>({...t,w:2.1,d:2.1})),...GARDEN.benches.map(b=>({...b,w:2.4,d:1.3}))];
