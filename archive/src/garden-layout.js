// Shared by the garden rendering, route planning and authoritative collision checks.
export const GARDEN={
 campGate:{x:5.6,z:-5.4,yaw:0},
 campReturn:{x:5.6,z:-2.7,yaw:0},
 trees:[{x:-4.8,z:-3},{x:3.8,z:-3}],
 benches:[{x:-4.8,z:3},{x:4.8,z:3}],
 beds:[...[-5.2,.3,5.7].map(z=>({x:-4.8,z})),...[-5.2,.3].map(z=>({x:3.2,z})),{x:4.8,z:5.7}],
 trail:{x:5.6,junctionZ:1.5}
};
export const GARDEN_COLLIDERS=[
 ...GARDEN.trees.map(t=>({...t,w:2.6,d:3})),
 ...GARDEN.benches.map(b=>({...b,w:2.4,d:1.3}))
];
