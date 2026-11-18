// The same northbound entry / southbound return used by the village's other gates.
export const BEYOND_ROUTE={portal:{x:0,z:9.5},arrival:{x:0,z:6.8,yaw:Math.PI},entryUrl:'/beyond/?from=garden',returnUrl:'/archive/?start=garden-beyond'};
// Older saved/default spawns may already be inside the automatic return gate.
export function safeArrival(position,blocked=()=>false){return !position||!Number.isFinite(position.x)||!Number.isFinite(position.z)||blocked(position.x,position.z)||Math.hypot(position.x-BEYOND_ROUTE.portal.x,position.z-BEYOND_ROUTE.portal.z)<1.95?{...BEYOND_ROUTE.arrival}:{...position};}
