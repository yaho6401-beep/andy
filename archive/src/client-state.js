// Storage is optional: private browsing, quota errors and old values must not block entry.
export function readStored(area,key,fallback=null){try{return globalThis[area]?.getItem(key)??fallback;}catch{return fallback;}}
export function writeStored(area,key,value){try{globalThis[area]?.setItem(key,value);return true;}catch{return false;}}
export function readRecord(area,key){try{const v=JSON.parse(readStored(area,key,'{}'));return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}}
export function thoughtSettings(value){return {enabled:value?.enabled!==false,lines:Array.isArray(value?.lines)?value.lines.filter(s=>typeof s==='string').map(s=>s.trim().slice(0,100)).filter(Boolean).slice(0,10):[]};}
export function orderSeconds(readyAt,clockOffset=0,now=Date.now()){return Math.max(0,Math.ceil((readyAt-now-clockOffset)/1000));}
