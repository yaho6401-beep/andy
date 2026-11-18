// A quiet reading stop, not a carousel that flashes while walking past exhibits.
export class MuseumFocus{
 constructor(){this.room=null;this.current=null;this.pending='';this.since=0;}
 update(near,{enabled,modal,moving=false,position,room,now=performance.now()}){
  if(this.room!==room){this.current=null;this.pending='';this.room=room;}
  if(!enabled||modal||moving){this.pending='';if(!enabled)this.current=null;return null;}
  let wanted=near&&['ingredient','board'].includes(near.type)?near:null;
  if(!wanted&&this.current?.type==='ingredient'&&position&&Math.hypot(position.x-this.current.x,position.z-this.current.z)<2.1)wanted=this.current;
  if(!wanted){this.current=null;this.pending='';return null;}
  if(this.pending!==wanted.id){this.pending=wanted.id;this.since=now;}
  if(now-this.since<450)return null;
  this.current=wanted;return wanted;
 }
}
