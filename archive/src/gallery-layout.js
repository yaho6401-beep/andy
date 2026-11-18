import {MUSEUM_EXHIBITS} from './museum-layout.js';
// Shared metres for rendering, collision, navigation and authoritative local validation.
export const GALLERY = {
  lobby: {
    width:30, depth:28, height:7.2,
    fountain:{x:0,z:-1,w:4.8,d:4.8},
    benches:[-8.5,8.5].map(x=>({x,z:3,w:2.8,d:1.2})),
    reception:{x:-9,z:-8,w:5,d:1.4},
    board:{x:-9,z:8,w:3.2,d:.45},
    exhibit:{x:8.5,z:-8,w:4,d:1.4},
    doors:[{x:0,z:12.9,label:'햇살 정원',yaw:Math.PI},{x:-13.9,z:0,label:'향기 아카이브',yaw:Math.PI/2},{x:13.9,z:0,label:'책의 정원',yaw:-Math.PI/2},{x:0,z:-12.9,label:'향기카페',yaw:0}]
  },
  salon: {
    width:30,depth:28,height:6,
    counter:{x:0,z:-10,w:10.5,d:1.7},
    barista:{x:-1.3,z:-11.3,reach:{x:0,z:-6.5}},
    cases:[-11,11].map(x=>({x,z:-9,w:2.3,d:1.3})),
    board:{x:-14,z:4,w:.4,d:3},
    doors:[{x:0,z:12.9,label:'아트리움 로비',yaw:Math.PI}]
  },
  scents: {
    width: 28, depth: 24, height: 6.2,
    plinths: [-9,-4.5,0,4.5,9].map((x,i)=>({x,z:i%2?-5:-3.7,w:1.4,d:1.4})),
    organ:{x:0,z:-10.3,w:8.6,d:1.1},
    notes:{x:-7.6,z:5.4,w:3.3,d:1.5},
    desk:{x:0,z:4.5,w:4.8,d:1.8},
    curator:{x:-9.6,z:1.5},
    cabinets:[{x:-7.2,z:-8.9,w:1.9,d:.8},{x:7.2,z:-8.9,w:1.9,d:.8}],
    board:{x:7,z:4.9,w:3.2,d:.4},
    exhibits:MUSEUM_EXHIBITS
  },
  books: {
    width: 30, depth: 26, height: 6.8,
    shelves:[-9,-3,3,9].map(x=>({x,z:-10.9,w:4.5,d:.75})),
    side:{x:-13.2,z:-4.2,w:.8,d:4.5},
    board:{x:-13.2,z:4.5,w:.5,d:3},
    benches:[-10,10].map(x=>({x,z:6,w:2.8,d:1.2})),
    islands:[-8,8].map(x=>({x,z:-3.7,w:1,d:4.3})),
    columns:[-11.7,11.7].flatMap(x=>[-5.4,5.4].map(z=>({x,z,w:.6,d:.6}))),
    readingTable:{x:0,z:8.8,w:5.2,d:1.5},
    readingChairs:[-1,1].flatMap(side=>[-1.6,0,1.6].map(x=>({x,z:8.8+side*1.4,w:.6,d:.6,side}))),
    portal:{x:11.2,z:8.5,w:1.6,d:.5}
  }
};
export const GALLERY_COLLIDERS = {
  lobby:[GALLERY.lobby.fountain,...GALLERY.lobby.benches,GALLERY.lobby.reception,GALLERY.lobby.board,GALLERY.lobby.exhibit],
  salon:[GALLERY.salon.counter,...GALLERY.salon.cases,GALLERY.salon.board,{...GALLERY.salon.barista,w:.6,d:.6}],
  scents:[...GALLERY.scents.plinths,GALLERY.scents.organ,GALLERY.scents.notes,GALLERY.scents.desk,...GALLERY.scents.cabinets,{...GALLERY.scents.curator,w:.6,d:.6},GALLERY.scents.board,...MUSEUM_EXHIBITS.map(({x,z,w,d})=>({x,z,w,d}))],
  books:[...GALLERY.books.shelves,GALLERY.books.side,GALLERY.books.board,...GALLERY.books.benches,GALLERY.books.portal,...GALLERY.books.islands,...GALLERY.books.columns,GALLERY.books.readingTable,...GALLERY.books.readingChairs,
    {x:-4,z:0,w:3,d:1.4},{x:4,z:0,w:3,d:1.4},
    {x:-3.9,z:2.1,w:1.4,d:.9},{x:3.9,z:2.1,w:1.4,d:.9},{x:0,z:3,w:2,d:2},{x:0,z:-5,w:5,d:1.2}]
};
