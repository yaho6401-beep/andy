// Shared metres for rendering, collision, navigation and authoritative local validation.
export const GALLERY = {
  scents: {
    width: 28, depth: 24, height: 6.2,
    plinths: [-9,-4.5,0,4.5,9].map((x,i)=>({x,z:i%2?-5:-3.7,w:1.4,d:1.4})),
    organ:{x:0,z:-10.3,w:8.6,d:1.1},
    notes:{x:-7.6,z:5.4,w:3.3,d:1.5},
    desk:{x:0,z:4.5,w:4.8,d:1.8},
    curator:{x:-9.6,z:1.5},
    cabinets:[{x:-11,z:-8.9,w:1.9,d:.8},{x:11,z:-8.9,w:1.9,d:.8}]
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
  scents:[...GALLERY.scents.plinths,GALLERY.scents.organ,GALLERY.scents.notes,GALLERY.scents.desk,...GALLERY.scents.cabinets,{...GALLERY.scents.curator,w:.6,d:.6}],
  books:[...GALLERY.books.shelves,GALLERY.books.side,GALLERY.books.board,...GALLERY.books.benches,GALLERY.books.portal,...GALLERY.books.islands,...GALLERY.books.columns,GALLERY.books.readingTable,...GALLERY.books.readingChairs,
    {x:-4,z:0,w:3,d:1.4},{x:4,z:0,w:3,d:1.4},
    {x:-3.9,z:2.1,w:1.4,d:.9},{x:3.9,z:2.1,w:1.4,d:.9},{x:0,z:3,w:2,d:2},{x:0,z:-5,w:5,d:1.2}]
};
