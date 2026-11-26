// WGS84 illustrative sea waypoints. Routes use straits/canals, not straight lines through continents.
// This is a compressed game itinerary, never GPS/AIS or an official ENC passage plan.
export const HOME_PORT={name:'부산 앞바다 · 가상 모항',lat:35.06,lon:129.2};
const p=(lon,lat,name)=>({lon,lat,name});
const singapore=[p(129.2,35.06,HOME_PORT.name),p(129.2,34.3,'대한해협'),p(128.1,32.5,'동중국해'),p(125,29,'동중국해'),p(123.5,26,'타이완 북동쪽'),p(122.6,23,'타이완 동쪽'),p(120.7,20.5,'루손 해협'),p(115,16,'남중국해'),p(109,8,'남중국해'),p(105,3,'싱가포르 해협 접근'),p(104.35,1.25,'싱가포르 해협'),p(104.08,1.23,'싱가포르 해협'),p(103.85,1.2,'싱가포르 앞바다')];
const indian=[...singapore,p(103.45,1.12,'말라카 해협'),p(102.7,1.7,'말라카 해협'),p(101.8,2.25,'말라카 해협'),p(101.4,2.6,'말라카 해협'),p(100.3,3.6,'말라카 해협'),p(98.7,5.5,'말라카 해협 북단'),p(95,6.5,'안다만 해'),p(82,4.5,'스리랑카 남쪽'),p(74,8,'인도양')];
// Northern and Atlantic itineraries round the Cape of Good Hope; narrow canal charts are not simulated.
const atlantic=[...indian,p(65,-15,'인도양'),p(52,-26,'마다가스카르 동남쪽'),p(42,-34,'인도양 남서쪽'),p(22,-37,'희망봉 남쪽'),p(14,-33,'남대서양'),p(5,-15,'남대서양'),p(-18,0,'대서양 · 적도'),p(-20,15,'북대서양'),p(-20,28,'북대서양')];
const europe=[...atlantic,p(-13,35,'이베리아 서쪽'),p(-10,37,'포르투갈 서쪽'),p(-10.3,43.6,'비스케이 만 서쪽'),p(-6,48.7,'영국 해협 서쪽'),p(-4,49.5,'영국 해협'),p(0,50.3,'도버 해협 접근'),p(1.5,50.9,'도버 해협'),p(3,53,'북해'),p(3,56.5,'북해')];
export const GEOGRAPHIC_ROUTES={
 busan:[singapore[0],p(129.23,35.025,'부산항 접근'),p(129.15,35.065,'부산 북항 앞바다')],
 southampton:[...europe.slice(0,-5),p(-2,50.3,'영국 해협 · 와이트섬 남쪽'),p(-.95,50.55,'와이트섬 동쪽'),p(-.85,50.72,'솔런트 해협 동쪽'),p(-1.03,50.77,'솔런트 해협'),p(-1.23,50.81,'사우샘턴 워터 접근'),p(-1.38,50.87,'사우샘턴 앞바다')],
 ningbo:[...singapore.slice(0,4),p(123,29.3,'저우산 동쪽'),p(122.5,29.65,'저우산 외항'),p(122.15,29.75,'닝보·저우산 앞바다')],
 hongkong:[...singapore.slice(0,8),p(114.5,21.7,'홍콩 남쪽'),p(114.3,22.1,'홍콩 동남쪽'),p(114.3,22.25,'홍콩 동쪽 항로'),p(114.22,22.29,'빅토리아 하버 동쪽')],
 shenzhen:[...singapore.slice(0,8),p(114.5,21.7,'홍콩 남쪽'),p(114.55,22.2,'다펑만 접근'),p(114.4,22.5,'선전 옌톈 앞바다')],
 dubai:[...indian,p(65,15,'아라비아해'),p(62,22,'오만 외해'),p(60.5,24,'오만 동쪽'),p(58.3,25.4,'오만만'),p(56.65,25.6,'무산담 동쪽'),p(56.45,26.55,'호르무즈 해협 동쪽'),p(55.9,26.6,'호르무즈 해협'),p(55.2,26.1,'걸프 접근'),p(54.9,25.4,'두바이 외항'),p(55.23,25.3,'두바이 라시드 앞바다')],
 abudhabi:[...indian,p(65,15,'아라비아해'),p(62,22,'오만 외해'),p(60.5,24,'오만 동쪽'),p(58.3,25.4,'오만만'),p(56.65,25.6,'무산담 동쪽'),p(56.45,26.55,'호르무즈 해협 동쪽'),p(55.9,26.6,'호르무즈 해협'),p(55.2,26.1,'걸프 접근'),p(54.9,25.4,'두바이 외항'),p(54.2,25,'아부다비 외항'),p(54.32,24.62,'자이드항 접근')],
 singapore,
 seychelles:[...indian,p(65,1,'인도양'),p(57,-3,'인도양'),p(55.55,-4.6,'세이셸 · 빅토리아 앞바다')],
 madeira:[...atlantic,p(-16.9,32.58,'마데이라 · 푼샬 앞바다')],
 bergen:[...europe,p(4,59,'노르웨이 해안'),p(4.8,60.2,'피오르 접근'),p(4.95,60.4,'베르겐 앞바다')],
 copenhagen:[...europe,p(7,58,'스카게라크 해협'),p(10.8,57.8,'스카겐 북쪽'),p(11.8,56.7,'카테가트 해협'),p(12.66,56.08,'외레순 해협'),p(12.66,56,'외레순 해협'),p(12.6,55.9,'외레순 해협'),p(12.68,55.72,'코펜하겐 앞바다')]
};
const rad=Math.PI/180;
export function nauticalMiles(a,b){const dLat=(b.lat-a.lat)*rad,dLon=(b.lon-a.lon)*rad,h=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;return 3440.065*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));}
export function bearing(a,b){const dl=(b.lon-a.lon)*rad,dpsi=Math.log(Math.tan(Math.PI/4+b.lat*rad/2)/Math.tan(Math.PI/4+a.lat*rad/2));return (Math.atan2(dl,dpsi)/rad+360)%360;}
const tracks=new Map();
export function geographicTrack(id){if(!GEOGRAPHIC_ROUTES[id])return null;if(!tracks.has(id)){const points=GEOGRAPHIC_ROUTES[id],distances=[0];for(let i=1;i<points.length;i++)distances.push(distances.at(-1)+nauticalMiles(points[i-1],points[i]));tracks.set(id,{points,distances,total:distances.at(-1)});}return tracks.get(id);}
export function geographicPose(voyage){let track=voyage.originId?geographicLegTrack(voyage.originId,voyage.routeId):geographicTrack(voyage.routeId),progress=voyage.progress;const reverse=voyage.phase==='returning'&&!voyage.originId;
 if(voyage.phase==='returning'&&voyage.originId){track=geographicReturnTrack(voyage.originId,voyage.routeId,voyage.returnFromProgress);progress=voyage.homeProgress;}
 if(!track)return {...HOME_PORT,course:0,next:HOME_PORT.name,total:0,remaining:0,track:null};const u=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0)),distance=u*track.total,{a,b,t,i}=pointOnTrack(track,distance);return {lat:a.lat+(b.lat-a.lat)*t,lon:a.lon+(b.lon-a.lon)*t,course:reverse?bearing(b,a):bearing(a,b),next:(reverse?a:b).name,total:track.total,remaining:reverse?distance:track.total-distance,track,segment:i,reverse};}
function pointOnTrack(track,distance){let i=1;while(i<track.points.length-1&&track.distances[i]<distance)i++;const a=track.points[i-1],b=track.points[i],length=track.distances[i]-track.distances[i-1];return {a,b,i,t:length?(distance-track.distances[i-1])/length:0};}
function makeTrack(points){const distances=[0];for(let i=1;i<points.length;i++)distances.push(distances.at(-1)+nauticalMiles(points[i-1],points[i]));return {points,distances,total:distances.at(-1)};}
const graph=new Map(),key=p=>p.lon.toFixed(6)+','+p.lat.toFixed(6),legCache=new Map(),returnCache=new Map();
for(const points of [...Object.values(GEOGRAPHIC_ROUTES),[GEOGRAPHIC_ROUTES.busan.at(-1),singapore[1]]])for(let i=0;i<points.length;i++){const p=points[i],k=key(p);if(!graph.has(k))graph.set(k,{p,edges:new Map()});if(i){const a=key(points[i-1]),d=nauticalMiles(points[i-1],p);graph.get(a).edges.set(k,d);graph.get(k).edges.set(a,d);}}
function seaPath(from,to){const start=key(from),end=key(to),open=new Set(graph.keys()),dist=new Map([[start,0]]),prev=new Map();if(start!==key(HOME_PORT)&&end!==key(HOME_PORT))open.delete(key(HOME_PORT));while(open.size){let at=null,best=Infinity;for(const k of open)if((dist.get(k)??Infinity)<best){at=k;best=dist.get(k);}if(at===null)break;open.delete(at);if(at===end)break;for(const[k,w]of graph.get(at).edges)if(open.has(k)&&best+w<(dist.get(k)??Infinity)){dist.set(k,best+w);prev.set(k,at);}}if(!dist.has(end))return [];const out=[];for(let at=end;at;at=prev.get(at)){out.unshift(graph.get(at).p);if(at===start)break;}return out;}
export function geographicLegTrack(originId,destinationId){if(!GEOGRAPHIC_ROUTES[originId]||!GEOGRAPHIC_ROUTES[destinationId]||originId===destinationId)return null;const id=originId+'>'+destinationId;if(!legCache.has(id))legCache.set(id,makeTrack(seaPath(GEOGRAPHIC_ROUTES[originId].at(-1),GEOGRAPHIC_ROUTES[destinationId].at(-1))));return legCache.get(id);}
export function geographicReturnTrack(originId,destinationId,fromProgress){const leg=geographicLegTrack(originId,destinationId);if(!leg||!Number.isFinite(fromProgress))return null;const u=Math.max(0,Math.min(1,fromProgress)),id=originId+'>'+destinationId+'@'+u;if(returnCache.has(id))return returnCache.get(id);const {a,b,t}=pointOnTrack(leg,u*leg.total),start={lat:a.lat+(b.lat-a.lat)*t,lon:a.lon+(b.lon-a.lon)*t,name:'귀항 출발 위치'},options=[a,b].map(p=>makeTrack([start,...seaPath(p,HOME_PORT)]));const result=options.sort((a,b)=>a.total-b.total)[0];if(returnCache.size>8)returnCache.clear();returnCache.set(id,result);return result;}
export function coordinateLabel(value,lat=true){const v=Math.abs(value),degrees=Math.floor(v),minutes=(v-degrees)*60;return `${degrees}° ${minutes.toFixed(2).padStart(5,'0')}′ ${lat?(value<0?'S':'N'):(value<0?'W':'E')}`;}
