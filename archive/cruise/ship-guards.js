// Rendered rails and pedestrian collision share these metre-scale segments.
export function createShipGuards({DECK_Y,UPPER_Y,LOWER_Y,ROOF_Y,stairs,hullHalfBeam,stairLanding}){
 const rails=[],add=(id,x1,z1,x2,z2,y1,y2=y1,kind='deck')=>rails.push({id,a:{x:x1,z:z1,y:y1},b:{x:x2,z:z2,y:y2},kind});
 for(const side of[-1,1])for(let z=-66;z<66;z+=3){if(z>=-51&&z<51)continue;add(`hull-${side}-${z}`,side*(hullHalfBeam(z)-.1),z,side*(hullHalfBeam(z+3)-.1),z+3,LOWER_Y);}
 add('bow-end',-6.5,-66.5,6.5,-66.5,LOWER_Y);add('stern-end',-8.8,66.7,8.8,66.7,LOWER_Y);
 for(const side of[-1,1])for(const[a,b]of[[-51,-41],[-31,-18.8],[-16.9,-2.5],[2.5,16.9],[18.8,31],[41,51]])add(`promenade-${side}-${a}`,side*13.9,a,side*13.9,b,Math.abs((a+b)/2)<=31?DECK_Y:LOWER_Y);
 for(const side of[-1,1])for(const[a,b]of[[-13.5,-9],[-6,6],[9,13.5]])add(`end-deck-${side}-${a}`,a,side*31,b,side*31,DECK_Y);
 // Real openings at the bridge wings and at the exterior stair landings.
 for(const side of[-1,1])for(const[a,b]of[[-51,-46],[-39,side<0?-19.5:-17]])add(`upper-bridge-${side}-${a}`,side*13.55,a,side*13.55,b,UPPER_Y);
 for(const side of[-1,1])add(`upper-dining-${side}`,side*13.55,side>0?19.5:17,side*13.55,51,UPPER_Y);
 for(const z of[-49.6,-23.4])add('roof-end-'+z,-11.8,z,11.8,z,ROOF_Y,ROOF_Y,'steel');
 add('roof-port',-11.8,-49.6,-11.8,-23.4,ROOF_Y,ROOF_Y,'steel');add('roof-starboard',13,-49.6,13,-34,ROOF_Y,ROOF_Y,'steel');
 for(const side of[-1,1]){add('wing-outer-'+side,side*16.8,-46,side*16.8,-39,UPPER_Y,UPPER_Y,'steel');for(const z of[-46,-39])add(`wing-end-${side}-${z}`,side*10.8,z,side*16.8,z,UPPER_Y,UPPER_Y,'steel');}
 for(const s of stairs)for(const side of[-1,1]){const x=s.x+side*s.w/2;add(`stair-${s.id}-${side}`,x,s.fromZ,x,s.toZ,s.fromY,s.toY,'stair');}
 return rails;
}
export function guardDistance(p,rail){const dx=rail.b.x-rail.a.x,dz=rail.b.z-rail.a.z,t=Math.max(0,Math.min(1,((p.x-rail.a.x)*dx+(p.z-rail.a.z)*dz)/(dx*dx+dz*dz)));return{distance:Math.hypot(p.x-rail.a.x-dx*t,p.z-rail.a.z-dz*t),floor:rail.a.y+(rail.b.y-rail.a.y)*t};}
export function guardBlocks(p,rail,radius=.32){const d=guardDistance(p,rail);return d.distance<radius&&Math.abs(p.y-d.floor)<.38;}
