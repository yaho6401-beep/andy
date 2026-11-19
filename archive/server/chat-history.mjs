export const CHAT_RETENTION={days:7,max:500};
// This archive is never included in visitor snapshots. Only Store.admin may return it.
export function pruneChatHistory(store){
 const since=store.clock()-CHAT_RETENTION.days*86400000,unique=new Map();
 for(const m of [...(store.chatHistory||[]),...(store.messages||[])])if(m&&typeof m.id==='string'&&Number.isFinite(m.at)&&m.at>=since)unique.set(m.id,m);
 store.chatHistory=[...unique.values()].sort((a,b)=>a.at-b.at).slice(-CHAT_RETENTION.max);return store.chatHistory;
}
export function recordChat(store,message){
 store.messages.push(message);store.messages=store.messages.slice(-200);pruneChatHistory(store);
}
