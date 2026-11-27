// Metres. One source for rendered footprints, collision bounds and visitor seating.
export const DECK_FIXTURES=[
 {id:'main-scope',kind:'binocular',zone:0,x:13.2,z:-6,w:.55,d:.55},
 ...[-1,1].flatMap(s=>[
  {id:`bow-winch-${s}`,kind:'mooring-winch',zone:1,x:s*8.4,z:-55.7,w:2.6,d:2.8},
  {id:`bow-bitts-${s}`,kind:'bitts',zone:1,x:s*8.7,z:-60,w:1.8,d:1.1},
  {id:`bow-fairlead-${s}`,kind:'fairlead',zone:1,x:s*11.2,z:-55.9,w:.7,d:2.1},
  {id:`bow-rope-${s}`,kind:'rope',zone:1,x:s*8,z:-52.2,w:1.5,d:1.5},
  {id:`chain-stopper-${s}`,kind:'chain-stopper',zone:1,x:s*4.5,z:-63,w:1.25,d:3.1},
 ]),
 {id:'roof-radar-base',kind:'radar-base',zone:7,x:0,z:-42,w:3.7,d:3.7},
 {id:'roof-x-band',kind:'x-radar',zone:7,x:5,z:-40.5,w:1.2,d:1.2},
 {id:'roof-hatch',kind:'hatch',zone:7,x:-7,z:-35.5,w:2.2,d:2.8},
 ...[-1,1].map(s=>({id:`roof-vent-${s}`,kind:'vent',zone:7,x:s*4,z:-28.5,w:2.1,d:2.1})),
 {id:'roof-vhf',kind:'antenna',zone:7,x:-8.5,z:-42.6,w:.7,d:.7},
 {id:'roof-ais',kind:'antenna',zone:7,x:8,z:-36.2,w:.7,d:.7},
 {id:'roof-lights',kind:'signal-mast',zone:7,x:-9.4,z:-46.2,w:.9,d:.9},
 {id:'roof-compass',kind:'compass',zone:7,x:0,z:-32,w:1.1,d:1.1},
];
export const DECK_SEATS=[
 ...[-3,3].map(x=>({id:`main-original-${x}`,zone:0,x:Math.sign(x)*11.5,z:3,yaw:Math.sign(x)*Math.PI/2,w:1.7,existing:true})),
 ...[-5,5].map(x=>({id:`stern-original-${x}`,zone:2,x,z:56.2,yaw:0,w:1.7,existing:true})),
 ...[-1,1].flatMap(s=>[
  {id:`promenade-${s}`,zone:0,x:s*11.5,z:18.5,yaw:s*Math.PI/2,w:2.25},
  {id:`forward-${s}`,zone:1,x:s*10.5,z:-49.8,yaw:s*Math.PI/2,w:2.25},
  {id:`aft-${s}`,zone:2,x:s*10.5,z:53,yaw:s*Math.PI/2,w:2.25},
  {id:`roof-${s}`,zone:7,x:s*7.5,z:-25.3,yaw:0,w:2.25},
 ])
];
export function seatApproach(seat){return{x:seat.x+Math.sin(seat.yaw)*.96*(seat.venue==='dining'?-1:1),z:seat.z+Math.cos(seat.yaw)*.96*(seat.venue==='dining'?-1:1),y:seat.y};}
export function seatFootprint(seat){const sideways=Math.abs(Math.sin(seat.yaw))>.5;return{...seat,w:sideways?.75:seat.w,d:sideways?seat.w:.75};}
