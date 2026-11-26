import test from'node:test';import assert from'node:assert/strict';
import{GEOGRAPHIC_ROUTES,geographicTrack,geographicPose,nauticalMiles,coordinateLabel,HOME_PORT}from'../cruise/geographic-voyage.js';
import{SHIP_ZONES,SHIP_STAIRS,CABIN_Y,ROOF_Y,UPPER_Y,LOWER_Y,shipStep,shipSurfaces,BRIDGE_WALLS,CABIN_WALLS}from'../cruise/ship-layout.js';
import land from'../cruise/world-land.json'with{type:'json'};
test('twelve real-geography itineraries begin off Busan and follow sea/strait waypoints to their regions',()=>{
 assert.equal(Object.keys(GEOGRAPHIC_ROUTES).length,12);for(const[id,points]of Object.entries(GEOGRAPHIC_ROUTES)){const t=geographicTrack(id);assert.ok(t.total>1&&t.total<20000);assert.equal(points[0].lat,HOME_PORT.lat);assert.equal(points[0].lon,HOME_PORT.lon);for(const p of points)assert.ok(Number.isFinite(p.lat)&&Math.abs(p.lat)<85&&Math.abs(p.lon)<=180);let prev=geographicPose({routeId:id,progress:0,phase:'outbound'});for(let i=1;i<=1000;i++){const p=geographicPose({routeId:id,progress:i/1000,phase:'outbound'});assert.ok(nauticalMiles(prev,p)<t.total/900);assert.ok(p.remaining<=prev.remaining);assert.ok(p.course>=0&&p.course<360);prev=p;}assert.equal(prev.lat,points.at(-1).lat);assert.equal(prev.lon,points.at(-1).lon);}
 for(const id of['bergen','copenhagen','madeira']){const names=GEOGRAPHIC_ROUTES[id].map(p=>p.name).join(' ');assert.match(names,/말라카/);assert.match(names,/희망봉/);}
 assert.ok(GEOGRAPHIC_ROUTES.bergen.at(-1).lat>60);assert.ok(GEOGRAPHIC_ROUTES.seychelles.at(-1).lat<0);
});
test('plotted sea itineraries avoid every land polygon in the shipped basemap',()=>{
 const ring=(x,y,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};const polygons=land.flatMap(g=>g.type==='Polygon'?[g.coordinates]:g.coordinates).map(p=>({p,minX:Math.min(...p[0].map(q=>q[0])),maxX:Math.max(...p[0].map(q=>q[0])),minY:Math.min(...p[0].map(q=>q[1])),maxY:Math.max(...p[0].map(q=>q[1]))}));
 for(const[id,points]of Object.entries(GEOGRAPHIC_ROUTES))for(let i=1;i<points.length;i++)for(let j=0;j<=50;j++){const a=points[i-1],b=points[i],x=a.lon+(b.lon-a.lon)*j/50,y=a.lat+(b.lat-a.lat)*j/50;assert.ok(!polygons.some(o=>x>=o.minX&&x<=o.maxX&&y>=o.minY&&y<=o.maxY&&ring(x,y,o.p[0])&&!o.p.slice(1).some(r=>ring(x,y,r))),id+' route crosses displayed land at '+x+','+y);}
});
test('chart reports geographic position, reverse course and real nautical distances without claiming GPS',()=>{
 const a=geographicPose({routeId:'singapore',phase:'outbound',progress:.45}),b=geographicPose({routeId:'singapore',phase:'returning',progress:.45});assert.equal(a.lat,b.lat);assert.equal(a.lon,b.lon);assert.ok(Math.abs(((a.course-b.course+360)%360)-180)<1.5);assert.ok(Math.abs(a.remaining+b.remaining-a.total)<.001);assert.ok(Math.abs(nauticalMiles({lat:0,lon:0},{lat:1,lon:0})-60.04)<.1);assert.match(coordinateLabel(-4.6),/4° 36.00′ S/);assert.equal(geographicPose({phase:'home'}).lat,HOME_PORT.lat);
});
test('real ship decks, doorway openings and raised/lowered floors agree with movement',()=>{
 assert.equal(SHIP_ZONES.length,9);assert.equal(SHIP_ZONES[1].y,LOWER_Y);assert.equal(SHIP_ZONES[2].y,LOWER_Y);assert.equal(SHIP_ZONES[7].y,ROOF_Y);assert.equal(SHIP_ZONES[8].y,CABIN_Y);assert.equal(SHIP_STAIRS.length,8);
 assert.ok(shipSurfaces(0,-28).includes(UPPER_Y));assert.ok(!shipSurfaces(6,-28).includes(UPPER_Y),'solid aft bulkhead');assert.ok(!shipSurfaces(10.8,-34).includes(UPPER_Y),'wheelhouse side wall');assert.ok(shipSurfaces(10.8,-42).includes(UPPER_Y),'wing door');assert.ok(shipSurfaces(3.8,6).includes(CABIN_Y),'cabin door');assert.ok(!shipSurfaces(3.8,3).includes(CABIN_Y));
 assert.equal(shipStep({x:0,z:4,y:10.2},{x:0,z:4,y:CABIN_Y}),null,'overlapping deck nodes cannot turn into a floor teleport');assert.ok(BRIDGE_WALLS.length>=5&&CABIN_WALLS.length>=4);
});
