import {asksCampVisitors,statCode,STAT_TALK_MS,SECRET_VISIT_REPLIES} from '../camp/keeper-stat-gate.js';
import {emergencyKeeperPose} from '../camp/tent-fire-state.js';
// First-party browser identifiers are one-way hashes. No fingerprinting or IP log.
const DAY=86400000;
export const koreaDay=at=>new Date(at+9*3600000).toISOString().slice(0,10);
export function countCampView(s,p){const now=s.clock(),a=s.campActivity,key=koreaDay(now);a.days??=[];let d=a.days.find(d=>d.day===key);if(!d){d={day:key,views:0,entries:0,browsers:[],sessions:[],unidentified:0};a.days.push(d);}d.views++;const browser=p.visitorKey||'session:'+p.id;if(!d.browsers.includes(browser))d.browsers.push(browser);if(!d.sessions.includes(p.id))d.sessions.push(p.id);if(!p.visitorKey)d.unidentified++;a.days=a.days.filter(d=>d.day>=koreaDay(now-90*DAY)).slice(-91);return d;}
export function campStatistics(s){const now=s.clock(),day=koreaDay(now),local=new Date(now+9*3600000),week=new Date(Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()-(local.getUTCDay()+6)%7)).toISOString().slice(0,10),month=day.slice(0,7)+'-01',days=s.campActivity.days||[];
 const periods={};for(const [key,start]of Object.entries({today:day,week,month})){const rows=days.filter(d=>d.day>=start&&d.day<=day),browsers=new Set(rows.flatMap(d=>d.browsers)),sessions=new Set(rows.flatMap(d=>d.sessions)),views=rows.reduce((n,d)=>n+d.views,0);periods[key]={from:start,to:day,views,entries:rows.reduce((n,d)=>n+d.entries,0),uniqueBrowsers:browsers.size,sessions:sessions.size,repeatViews:Math.max(0,views-browsers.size),unidentifiedViews:rows.reduce((n,d)=>n+d.unidentified,0)};}
 return {at:now,timezone:'Asia/Seoul',since:s.campActivity.statisticsSince||null,online:[...s.clients.values()].filter(p=>p.room==='camp').length,periods,definition:'조회: 캠핑장 입장·새로고침 횟수. 방문: 캠핑장에 들어와 머문 횟수. 중복 제외: 같은 브라우저의 익명 식별자를 기간 전체에서 한 번만 계산합니다. 저장소 삭제·시크릿 모드·다른 브라우저는 별도로 집계되며 사람 수와 정확히 같지는 않습니다. 기능 적용 이전 기록은 새 지표에 소급 합산하지 않습니다.'};
}
export function keeperStatisticsAction(s,id,input){
 if(!['camp-keeper-inquiry','camp-keeper-stats'].includes(input.type))return null;
 const p=s.clients.get(id),now=s.clock(),npc=emergencyKeeperPose(s.campfire,now);
 if(!p||p.room!=='camp')throw Error('온유 가까이에서 조용히 이야기해 주세요.');
 if(input.type==='camp-keeper-inquiry'){
  if(p.seat||Math.hypot(p.x-npc.x,p.z-npc.z)>3)throw Error('온유 가까이에서 조용히 이야기해 주세요.');
  if(!asksCampVisitors(String(input.question||'').slice(0,200)))throw Error('캠핑장 방문객에 대해 먼저 물어보세요.');
  p.keeperStatUntil=now+STAT_TALK_MS;return {ok:true,questioned:true,line:SECRET_VISIT_REPLIES[Math.floor(s.random()*SECRET_VISIT_REPLIES.length)]};
 }
 if(!statCode(input.code)||!(p.keeperStatUntil>now))throw Error('먼저 방문객에 대해 물어본 뒤 비밀 인사를 건네주세요.');
 p.keeperStatUntil=0;
 // The owner's code opens aggregate counts only. It never changes staff roles,
 // grants admin access, or exposes names, visit rows, member IDs or browser hashes.
 return {ok:true,stats:campStatistics(s)};
}
