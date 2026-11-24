import {SPEAKERS,SPEAKER_DURATION,speakerAvailable} from '../camp/speaker-state.js';
import {weatherAt} from '../camp/weather-state.js';
import {packFor} from './snacks.mjs';
export function speakerAction(s,id,input){if(input.type!=='camp-speaker')return null;const p=s.clients.get(id),spot=SPEAKERS.find(x=>x.id===input.spot),now=s.clock();if(!spot||p.room!=='camp'||Math.hypot(p.x-spot.x,p.z-spot.z)>2.3)throw Error('텐트 안 스피커 가까이에서 전원을 눌러주세요.');if(s.publicLounge&&weatherAt(now).kind==='rain')throw Error('비 올 땐 무리겠어… 스피커는 비가 그친 뒤 켜자.');const pack=packFor(s,id);if(!speakerAvailable(pack,now))pack.speakerUntil=now+SPEAKER_DURATION;pack.updatedAt=now;return {ok:true,speakerUntil:pack.speakerUntil};}
