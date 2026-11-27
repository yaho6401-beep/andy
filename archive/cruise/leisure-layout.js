// Shared by architecture, interaction ranges, seats and pedestrian collision.
export const ENTERTAINMENT_Y=3.6;
export const GUEST_ROOMS=[
 {id:'201',name:'201 · 조용한 독서가의 방',minZ:-20.8,maxZ:-12.2,doorZ:-16.5,open:true,mood:'private',host:'독서 중인 승객',color:0x8f766f},
 {id:'203',name:'203 · 다정한 여행자의 방',minZ:-11.8,maxZ:-3.2,doorZ:-7.5,open:true,mood:'welcome',host:'차를 좋아하는 승객',color:0x738e89},
 {id:'205',name:'205 · 잠시 비운 객실',minZ:-2.8,maxZ:6.2,doorZ:1.5,open:true,mood:'empty',color:0x8786a0},
 {id:'207',name:'207 · 문이 닫힌 객실',minZ:6.6,maxZ:16.1,doorZ:11.6,open:false,mood:'closed',color:0x9b896e},
];
export const guestRoomAt=p=>p.y<7.6&&p.y>6.5&&p.x< -3.9?GUEST_ROOMS.find(r=>r.open&&p.z>r.minZ&&p.z<r.maxZ)||null:null;
export const ENTERTAINMENT_STAIR={id:'entertainment',label:'시네마 · 공연 라운지',x:0,fromZ:-9,toZ:-21,w:2.6,fromY:7,toY:ENTERTAINMENT_Y};
export const ENTERTAINMENT_WALLS=[{x:-12.55,z:0,w:.22,d:48},{x:12.55,z:0,w:.22,d:48},{x:0,z:-24,w:25.1,d:.22},{x:0,z:24,w:25.1,d:.22},...[-1,1].flatMap(side=>[{x:side*1.8,z:-4.2,w:.18,d:39.6},{x:side*1.8,z:22,w:.18,d:4}])];
export const VENUE_SEATS=[...['cinema','theater'].flatMap((venue,k)=>[-10,-5,0,5,10,15].flatMap((z,row)=>(k?[5.2,8.5,11.2]:[-10.2,-7]).map((x,col)=>({id:venue+'-'+row+'-'+col,venue,zone:venue==='cinema'?9:10,x,z,y:ENTERTAINMENT_Y,yaw:Math.PI,w:1.05,label:venue==='cinema'?'시네마 좌석':'공연장 좌석'}))))];
export const LEISURE_OBSTACLES=[...ENTERTAINMENT_WALLS.map(p=>({...p,y:ENTERTAINMENT_Y})),{x:7,z:-20.8,w:10,d:4.8,y:ENTERTAINMENT_Y},...GUEST_ROOMS.flatMap(r=>[{x:-9.7,z:r.minZ+1.65,w:2.1,d:2.6,y:7},{x:-11.8,z:r.maxZ-1.3,w:.75,d:2.0,y:7},{x:-5.1,z:r.minZ+.8,w:1.5,d:1.2,y:7}])];
export const RESTAURANT_SEATS=[-9,0,9].flatMap((x,col)=>[-11,-3,5].flatMap((z,row)=>[-1,1].map(side=>({id:`dining-${col}-${row}-${side}`,venue:'dining',zone:4,table:`${col}-${row}`,tableX:x,tableZ:z+34,x:x+side*1.32,z:z+34,y:14.4,yaw:-side*Math.PI/2,w:.68,label:'식당 의자'}))));
export const NPCS=[
 {id:'concierge',name:'안내원 소라',role:'guide',x:-4,z:14,y:10.2,kind:5,color:'#819d9d',hair:'#514039'},
 {id:'safety',name:'안전 담당 민준',role:'safety',x:-7,z:24,y:10.2,kind:2,color:'#c39163',hair:'#373a3c'},
 {id:'engineer',name:'기관사 도윤',role:'engineer',x:5,z:58,y:8.1,kind:1,color:'#607c8a',hair:'#786b60'},
 {id:'navigator',name:'항해사 유진',role:'navigation',x:7.2,z:-34,y:14.4,kind:4,color:'#354c65',hair:'#413933'},
 {id:'captain',name:'선장',role:'solas',x:4.5,z:-43,y:14.4,external:true},
 {id:'chef',name:'다이닝 호스트 리나',role:'dining',x:3.6,z:47,y:14.4,kind:6,color:'#e0d9cb',hair:'#644c38'},
 {id:'stage-host',name:'공연 안내원 하린',role:'entertainment',x:.8,z:21.8,y:ENTERTAINMENT_Y,kind:7,color:'#946f80',hair:'#45363c'},
 ...GUEST_ROOMS.filter(r=>r.open&&r.host).map((r,i)=>({id:'guest-'+r.id,name:r.host,role:r.mood,x:-7.5,z:(r.minZ+r.maxZ)/2+1.4,y:7,kind:i?5:1,color:i?'#a39883':'#818b9b',hair:i?'#726254':'#b0aaa2',room:r.id})),
];
export const DINING_COUNTER={x:3.6,z:45.45,y:14.4};
export const POOL_LADDER={x:3,z:1.5,y:10.2};
export const CINEMA={screen:{x:-7.1,y:5.15,z:-22.6},seat:'cinema-0-1',title:'파도를 건너온 편지',duration:120};
export const THEATER={stage:{x:7.2,y:4.3,z:-20.5},seat:'theater-1-1',title:'별빛 바다의 작은 연주회'};
