import {GARDEN} from './garden-layout.js';
// All decorations sit on existing furniture, walls or planting beds.
// They are baked with the room, so no additional per-frame object work is needed.
export function furnishDetails(g,room,{mesh,round,label,box,cylinder,sphere,tableData}){
 const wood='#96775c',brass='#b69a66',paper='#f4e9d6',ink='#5f6657';
 if(room==='garden'){
  // An airy pergola, stone edging and alternating leaves around the sunny path.
  for(const x of [-2.85,2.85]){round(g,wood,x,3.5,-7.6,.13,.2,1.55,.03);for(let j=0;j<5;j++)round(g,'#c4ad85',x-1.25+j*.62,3.65,-7.5,.1,.15,1.3,.02);}
  for(const x of [-1.45,1.45])for(let z=-6.5;z<7;z+=.64)mesh(g,box,'#cfbf9d',x,.06,z,.11,.08,.5);
  for(const {x,z} of GARDEN.trees){
   // Trunk rings, tiny pebbles and flowering shrubs within the tree beds.
   for(let j=0;j<9;j++){const a=j*2.4,r=.82;mesh(g,sphere,j%2?'#b1b99c':'#d6ccad',x+Math.sin(a)*r,.16,z+Math.cos(a)*r,.14,.08,.1);}
  }
  for(const {x,z} of GARDEN.beds)for(const dx of [-.9,.95])mesh(g,sphere,'#8da976',x+dx,.34,z,.3,.23,.26);
  for(const {x,z} of GARDEN.benches)for(const dx of [-.65,.65])round(g,'#b69571',x+dx,.61,z,.07,.02,.72,.01);
  label(g,'A MOMENT IN THE SUN',0,.13,4.9,2.3,ink,32).rotation.x=-Math.PI/2;
  return;
 }
 // Skirting, picture rails and narrow wall panels add depth without enclosing the view.
 const backGap=room==='lobby';for(const [x,w]of backGap?[[-4.85,6.2],[4.85,6.2]]:[[0,15.5]]){
  round(g,wood,x,.16,-7.8,w,.22,.09,.02);round(g,brass,x,3.55,-7.75,w,.035,.04,.01);
 }
 for(const x of [-5,5]){
  round(g,paper,x,.7,-7.61,2.25,.13,.38,.03);
  for(const y of [1.45,2.85])round(g,paper,x,y,-7.52,1.8,.035,.04,.01);
 }
 if(room==='lobby'){
  // Inlaid fountain rim and reception details.
  for(let j=0;j<32;j++){const a=j*Math.PI/16;const tile=mesh(g,box,brass,Math.sin(a)*1.56,.608,Math.cos(a)*1.56,.1,.022,.05);tile.rotation.y=a;}
  for(const x of [-5,5])for(let j=0;j<5;j++)round(g,'#a38668',x-1+j*.5,.61,2,.018,.018,.7,.005);
  round(g,paper,-4,1.82,-5.7,1.12,.07,.6,.02);round(g,'#c8b4c9',-4.23,1.88,-5.7,.42,.035,.53,.01);
  label(g,'오늘의 이야기를 시작하세요',-4,2.65,-7.6,3.6,ink,40);
  round(g,wood,3.2,.58,-5.76,2.5,.035,.05,.01);
 }else if(room==='scents'){
  for(let i=0;i<5;i++){
   const x=-5+i*2.5;
   mesh(g,cylinder,'#d6c4a8',x,.09,-3,.71,.09,.71);
   label(g,String(i+1).padStart(2,'0'),x,.47,-2.32,.52,ink,88);
   round(g,brass,x,3.39,-4.05,1.6,.035,.04,.01);
  }
  // Blotters and a notebook at the mixing desk; tactile, not glass-heavy.
  for(let i=0;i<4;i++){const strip=round(g,paper,-.75+i*.19,1.19,2.25,.09,.014,.48,.01);strip.rotation.y=-.2+i*.13;}
  round(g,'#9d839f',.7,1.18,2.15,.5,.06,.7,.02);
  round(g,paper,.7,1.22,2.15,.44,.014,.62,.01);
  for(const x of [-3.2,3.2])round(g,brass,x,1.73,-6.43,.035,2.9,.03,.01);
 }else if(room==='books'){
  // Fine book spines are shared-material geometry, merged into the existing shelves.
  for(const x of [-5,0,5])for(let row=0;row<3;row++)for(let j=0;j<11;j++){
   const xx=x-1.45+j*.27,yy=.4+row*.72;
   round(g,paper,xx,yy+.24,-5.999,.105,.014,.012,.004);
   round(g,brass,xx,yy+.31,-5.999,.105,.009,.012,.003);
  }
  for(const x of [-4,4]){round(g,'#eee3cf',x+.65,1.03,-.26,.45,.4,.19,.08);round(g,'#c2aa85',x,1.02,-.45,.025,.37,.025,.005);}
  round(g,paper,0,.85,3,.58,.04,.4,.01);round(g,brass,0,.88,3,.018,.012,.4,.003);
  label(g,'SLOW PAGES · QUIET MOMENTS',0,3.65,-7.6,4.8,ink,32);
 }else if(room==='salon'){
  // Slatted counter front and a framed house menu.
  for(let i=0;i<27;i++)round(g,wood,-3.22+i*.247,.79,-4.98,.035,1.27,.04,.007);
  round(g,brass,0,1.48,-4.95,6.6,.035,.05,.01);
  round(g,wood,-7.75,2.22,-3.5,2.3,1.8,.12,.06).rotation.y=Math.PI/2;
  round(g,'#596856',-7.66,2.22,-3.5,2.1,1.6,.035,.03).rotation.y=Math.PI/2;
  label(g,'HOUSE MENU\nCOFFEE · TEA · ADE',-7.62,2.32,-3.5,2,'#f4e9d6',44).rotation.y=Math.PI/2;
  for(const t of tableData){
   if(t.shape==='bar')continue;
   // Place flowers above the tabletop, with a small ceramic vase.
   mesh(g,cylinder,paper,t.x,t.top+.08,t.z,.095,.16,.095);
   mesh(g,cylinder,'#7f976d',t.x,t.top+.23,t.z,.013,.22,.013);
   for(let j=0;j<5;j++){const a=j*Math.PI*2/5;mesh(g,sphere,'#d8a6b5',t.x+Math.sin(a)*.055,t.top+.35,t.z+Math.cos(a)*.055,.06,.035,.06);}
   mesh(g,sphere,brass,t.x,t.top+.37,t.z,.025);
  }
 }
}
