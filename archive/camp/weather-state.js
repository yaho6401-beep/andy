// Shared clock, shared weather. Rain now occupies 50 seconds of each four-minute cycle.
export function weatherAt(now){const cycle=Math.floor(now/240000),phase=((now%240000)+240000)%240000,kind=phase>=120000&&phase<170000?'rain':phase>=50000&&phase<66000?'wind':'clear';return {kind,cycle,eventId:cycle+':'+kind,at:now,intensity:kind==='rain'?.4+.6*Math.sin(Math.PI*(phase-120000)/50000)**.7:0,endsAt:cycle*240000+(kind==='rain'?170000:kind==='wind'?66000:240000)};}
export function rainHeat(heat){return Math.max(.16,heat>2.5?2.5:heat>1.35?1.18:heat>.73?.65:heat-.22);}
export function weatherHeat(heat,weather){return weather?.kind==='rain'?rainHeat(heat):heat;}
