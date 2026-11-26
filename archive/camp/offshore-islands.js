// Keep the visible headlands and navigation footprints in the same coordinates.
// rx/rz are the unrotated mesh radii; the rowboat's oars also need clearance.
export const OFFSHORE_ISLANDS=[0,1,3,4].map(i=>({
 id:`headland-${i}`,x:-58+i*29,y:.05,z:-80-(i%2)*6,
 rx:10+(i%3)*3,ry:1.8+(i%2)*1.3,rz:5,yaw:i*.72
}));
export const ROWBOAT_CLEARANCE=2.6;
export function headlandClearance(point,island,padding=ROWBOAT_CLEARANCE){
 const dx=point.x-island.x,dz=point.z-island.z,c=Math.cos(island.yaw),s=Math.sin(island.yaw);
 return Math.hypot((dx*c-dz*s)/(island.rx+padding),(dx*s+dz*c)/(island.rz+padding));
}
