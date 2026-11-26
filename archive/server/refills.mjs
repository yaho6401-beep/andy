export function settleRefills(pack,now){if(!pack?.refillAt)return;for(const [kind,at]of Object.entries(pack.refillAt))if(at<=now){
 if(['fuel','water'].includes(kind))for(const key of Object.keys(pack.canClaims||{}))if(key.endsWith('-'+kind))delete pack.canClaims[key];
 pack.refillReady??={};pack.refillReady[kind]=at;delete pack.refillAt[kind];if(kind==='umbrella')pack.umbrellaClaims={};
}}
