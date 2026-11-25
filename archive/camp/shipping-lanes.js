// Fixed world-space offshore routes. All hulls stay beyond the playable island
// and rowing corridor, so neither swimmers nor rowboats can pass through them.
export const SHIPPING_LANES=[
 {kind:'cruise',z:-128,sway:2.5,reach:32,period:480,phase:0,scale:.82,length:19,width:3.4},
 {kind:'cargo',z:-150,sway:3,reach:48,period:620,phase:1.35,scale:.94,length:16,width:3.2},
 {kind:'fisher',z:-112,sway:2,reach:42,period:540,phase:2.6,scale:.72,length:6.5,width:1.9},
 {kind:'fisher',z:-142,sway:2,reach:56,period:680,phase:4.1,scale:.8,length:6.5,width:1.9}
];
export function shippingPose(index,wall){const lane=SHIPPING_LANES[index],a=(wall/1000%lane.period)/lane.period*Math.PI*2+lane.phase;return {x:Math.sin(a)*lane.reach,z:lane.z+Math.cos(a)*lane.sway,yaw:Math.atan2(Math.sin(a)*lane.sway,Math.cos(a)*lane.reach),scale:lane.scale};}
