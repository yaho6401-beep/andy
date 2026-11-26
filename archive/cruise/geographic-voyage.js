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
export function geographicPose(voyage){const track=geographicTrack(voyage.routeId);if(!track)return {...HOME_PORT,course:0,next:HOME_PORT.name,total:0,remaining:0,track:null};const u=Math.max(0,Math.min(1,voyage.progress)),distance=u*track.total;let i=1;while(i<track.points.length-1&&track.distances[i]<distance)i++;const a=track.points[i-1],b=track.points[i],t=(distance-track.distances[i-1])/(track.distances[i]-track.distances[i-1]),returning=voyage.phase==='returning';return {lat:a.lat+(b.lat-a.lat)*t,lon:a.lon+(b.lon-a.lon)*t,course:returning?bearing(b,a):bearing(a,b),next:(returning?a:b).name,total:track.total,remaining:returning?distance:track.total-distance,track,segment:i};}
export function coordinateLabel(value,lat=true){const v=Math.abs(value),degrees=Math.floor(v),minutes=(v-degrees)*60;return `${degrees}° ${minutes.toFixed(2).padStart(5,'0')}′ ${lat?(value<0?'S':'N'):(value<0?'W':'E')}`;}
