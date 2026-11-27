export const CRUISE_MENU=[
 {id:'pasta',name:'토마토 파스타',kind:'meal',seconds:20,bites:4,color:'#ca7654'},
 {id:'soup',name:'따뜻한 단호박 수프',kind:'meal',seconds:15,bites:3,color:'#d5a24e'},
 {id:'salad',name:'가든 샐러드',kind:'meal',seconds:12,bites:3,color:'#87a461'},
 {id:'salmon',name:'연어 구이 플레이트',kind:'meal',seconds:20,bites:4,color:'#da997f'},
 {id:'cake',name:'작은 초콜릿 케이크',kind:'dessert',seconds:10,bites:3,color:'#795748'},
 {id:'coffee',name:'아메리카노',kind:'drink',seconds:20,bites:5,color:'#644c36'},
 {id:'tea',name:'따뜻한 허브차',kind:'drink',seconds:12,bites:4,color:'#b4ac75'},
 {id:'ade',name:'레몬 에이드',kind:'drink',seconds:12,bites:4,color:'#d7c76f'},
];
export class CruiseDining{
 constructor(clock=Date.now){this.clock=clock;this.order=null;this.held=null;this.plate=null;}
 orderItem(id){const item=CRUISE_MENU.find(m=>m.id===id);if(!item||this.order||this.held)return false;this.order={...item,readyAt:this.clock()+item.seconds*1000};return true;}
 get ready(){return !!this.order&&this.clock()>=this.order.readyAt;}
 pickup(){if(!this.ready||this.held)return false;this.held={...this.order,left:this.order.bites};this.order=null;this.plate=null;return true;}
 place(seat){if(!this.held||seat?.venue!=='dining')return false;this.plate={table:seat.table,x:seat.tableX,z:seat.tableZ};return true;}
 take(){if(!this.held)return false;this.plate=null;return true;}
 eat(seat){if(!this.held||this.plate&&seat?.table!==this.plate.table)return null;const item={...this.held};this.held.left--;if(this.held.left<=0){this.held=null;this.plate=null;}return item;}
 get state(){return {order:this.order?{name:this.order.name,remaining:Math.max(0,Math.ceil((this.order.readyAt-this.clock())/1000)),ready:this.ready}:null,held:this.held?{name:this.held.name,left:this.held.left,kind:this.held.kind}:null,plate:this.plate};}
}
