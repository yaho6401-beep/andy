// Allow the missing ingredients during an oil burn; latch once the requested overlap is reached.
export const DANGER_BRANCHES=5,DANGER_LOGS=2,DANGER_COOLDOWN=120000;
export const oilActive=(f,now)=>now<(f?.oilUntil||0)&&f?.heat>.73;
export const branchLocked=(f,now)=>!!f?.dangerAt||oilActive(f,now)&&Math.ceil(f.branchLoad??f.branches??0)>=DANGER_BRANCHES;
export const logLocked=(f,now)=>!!f?.dangerAt||oilActive(f,now)&&now<(f.logCycleUntil||0)&&(f.logs||0)>=DANGER_LOGS;
export function checkFuelDanger(f,now){if(f.dangerAt||f.rescuedAt&&now-f.rescuedAt<DANGER_COOLDOWN)return false;const branches=Math.ceil(f.branchLoad??f.branches??0),logs=now<(f.logCycleUntil||0)?f.logs||0:0;if(oilActive(f,now)&&(branches>=DANGER_BRANCHES||now<(f.branchPeakUntil||0))&&(logs>=DANGER_LOGS||now<(f.logPeakUntil||0))){f.dangerAt=now;f.heat=4.45;return true;}return false;}
