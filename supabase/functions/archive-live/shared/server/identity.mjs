import {appearance,clean} from '../src/protocol.js';
export function updateIdentity(store,id,input){
 const player=store.clients.get(id),member=store.member(id),now=store.clock();if(!player)throw Error('먼저 입장해 주세요.');
 if(now-(player.lastIdentityAt??-Infinity)<1000)throw Error('프로필을 적용한 뒤 잠시 기다려 주세요.');
 const nickname=clean(input.nickname,16);if(!input.appearance||typeof input.appearance!=='object'||Array.isArray(input.appearance))throw Error('캐릭터를 확인해 주세요.');
 player.nickname=nickname;member.nickname=nickname;player.appearance=appearance(input.appearance);player.lastIdentityAt=now;
 return {ok:true,identity:{nickname,appearance:player.appearance}};
}
