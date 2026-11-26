// Same vessel proportions outside and aboard. Dock position remains authoritative.
export const SHIP_LENGTH=140,SHIP_BEAM=28;
export function mooredCruisePose(dock){return {x:dock.x,z:dock.z-SHIP_BEAM/2-4.3};}
