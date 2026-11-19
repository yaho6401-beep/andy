// Shared clock-based weather; one calm, short event per interval, never a gameplay deadline.
export function weatherAt(now){const cycle=Math.floor(now/240000),phase=((now%240000)+240000)%240000,kind=phase>=130000&&phase<160000?'rain':phase>=50000&&phase<66000?'wind':'clear';return {kind,cycle,eventId:cycle+':'+kind,at:now,endsAt:cycle*240000+(kind==='rain'?160000:kind==='wind'?66000:240000)};}
export function rainHeat(heat){return Math.max(.16,heat>2.5?2.5:heat>1.35?1.18:heat>.73?.65:heat-.22);}
export function weatherHeat(heat,weather){return weather?.kind==='rain'?rainHeat(heat):heat;}
