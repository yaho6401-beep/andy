export const SESSION_REPLACED='다른 화면으로 접속을 옮겼어요. 이 화면에서 다시 이용하려면 재접속해 주세요.';
const conflict=(message,reason)=>Object.assign(Error(message),{status:409,reason});
// `id` must come from the authenticated session, never from a request player ID.
export function claimConnection(s,id,connectionId,takeover=false){const p=s.clients.get(id);if(!p)throw Error('입장이 필요합니다.');const replaced=!!p.connectionId&&p.connectionId!==connectionId;if(replaced&&takeover!==true)throw conflict('이미 다른 화면에서 접속 중이에요.','SESSION_ACTIVE');if(replaced){p.epoch=(p.epoch||0)+1;p.seq=0;p.correction=(p.correction||0)+1;p.lastMove=s.clock();p.moveCredit=2.1;p.lastBatch=0;p.lastReceipts=[];}p.connectionId=connectionId;return replaced;}
export function requireConnection(s,id,connectionId){const p=s.clients.get(id);if(!p||p.connectionId!==connectionId)throw conflict(SESSION_REPLACED,'SESSION_REPLACED');return p;}
