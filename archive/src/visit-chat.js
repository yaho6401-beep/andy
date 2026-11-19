// Visible conversation belongs to this visit, not browser storage or server history.
export class VisitChat{
 constructor(){this.reset();}
 reset(){this.room=null;this.cutAt=0;this.offset=0;this.messages=[];}
 clear(at=Date.now()+this.offset){this.cutAt=Math.max(this.cutAt,at,...this.messages.map(m=>m.at));this.messages=[];}
 accept(snapshot,room){
  this.offset=snapshot.at-Date.now();if(this.room!==room){this.room=room;this.cutAt=snapshot.at;this.messages=[];return [];}
  this.messages=(snapshot.messages||[]).filter(m=>m.room===room&&m.at>this.cutAt).slice(-4);return this.messages;
 }
}
