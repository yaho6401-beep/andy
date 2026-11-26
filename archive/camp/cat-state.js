import {GARDEN} from '../src/garden-layout.js';
import {CAMP,campPosition} from './layout.js';
export const MILK_SPOTS=CAMP.tents.map(t=>({id:t.id,x:t.x-2.05,z:t.z+1.05}));
export const CAT_COATS=['#d6aa73','#aaa6a0','#e9dfcd'];
const homes=[{x:-9.6,z:-2.5},{x:9.6,z:-2.5},{x:-9.4,z:-3.8}];
// Local ambient companions: no player identity or shared-room state is stored.
export class CampCatsState{
 constructor({route=(a,b)=>[b],random=Math.random}={}){this.route=route;this.random=random;this.milk=0;this.claimed=new Set();this.bowl=null;this.nextWalk=0;this.followId=null;this.followUntil=0;this.events=[];this.cats=homes.map((home,i)=>({id:i,room:'camp',home,...home,yaw:0,mode:'rest',path:[],nextAt:i*13000,petAt:-Infinity}));}
 collect(id,p){const spot=MILK_SPOTS.find(s=>s.id===id);if(!spot||!p||Math.hypot(p.x-spot.x,p.z-spot.z)>1.7||this.claimed.has(id)||this.milk>=2)return false;this.claimed.add(id);this.milk++;return true;}
 place(p,now){if(!this.milk||this.bowl||!p||!campPosition(p.x,p.z)||Math.hypot(p.x,p.z)<1.8)return false;this.milk--;this.bowl={x:p.x,z:p.z,placedAt:now,catId:null,drinkingAt:null,empty:false};return true;}
 go(cat,target,mode){cat.path=this.route(cat,target,cat.room)||[];cat.mode=mode;if(mode==='milk'){let p=cat,total=0;for(const q of cat.path){total+=Math.hypot(q.x-p.x,q.z-p.z);p=q;}cat.milkSpeed=Math.max(1.45,total/23);}}
 pet(id,now,p){const cat=this.cats[id];if(!cat||!p||Math.hypot(cat.x-p.x,cat.z-p.z)>2.8||now-cat.petAt<800)return false;cat.petAt=now;this.events.push({type:'meow',id});return true;}
 tick(now,dt,{player,focused=false,rain=false,heat=1,emergency=false,room='camp'}={}){
  dt=Math.max(0,Math.min(.1,dt));const unsafe=rain||heat>3.35||emergency;
  if(this.followId!==null&&now>=this.followUntil){const c=this.cats[this.followId];this.go(c,c.room==='garden'?{x:8,z:4}:c.home,'home');this.followId=null;}
  for(const cat of this.cats){
   const here=cat.room===room,catUnsafe=cat.room==='camp'&&unsafe;
   if(catUnsafe){if(cat.mode!=='shelter'){const safeHome=emergency?{x:-9.4,z:-3.8}:cat.home;this.go(cat,safeHome,'shelter');if(emergency)this.events.push({type:'meow',id:cat.id});}if(this.bowl?.catId===cat.id&&this.bowl.drinkingAt!==null&&!this.bowl.empty)this.bowl.drinkingAt=null;}
   else if(cat.mode==='shelter'){cat.mode='rest';cat.nextAt=now+5000;}
   if(!catUnsafe&&cat.id===this.followId&&player&&!here&&cat.mode!=='portal')this.go(cat,cat.room==='camp'?{x:0,z:10}:GARDEN.campGate,'portal');
   if(!catUnsafe&&cat.id===this.followId&&player&&here){const distance=Math.hypot(cat.x-player.x,cat.z-player.z),r=Math.hypot(player.x,player.z)||1;const target=focused?{x:player.x*.72+player.z/r*.9,z:player.z*.72-player.x/r*.9}:{x:player.x+.85,z:player.z+.3},atSeat=Math.hypot(cat.x-target.x,cat.z-target.z)<.25;if(focused&&atSeat){cat.path=[];cat.mode='sit';cat.yaw=Math.atan2(-cat.x,-cat.z);}else if((focused&&!atSeat||!focused&&distance>1.7)&&now>(cat.repathAt||0)){cat.repathAt=now+1100;this.go(cat,target,'follow');}}
   if(!catUnsafe&&cat.room==='camp'&&this.bowl&&!this.bowl.empty){const bowl=this.bowl;
    if(bowl.catId===null){bowl.catId=this.cats.filter(c=>c.room==='camp').reduce((a,b)=>Math.hypot(a.x-bowl.x,a.z-bowl.z)<Math.hypot(b.x-bowl.x,b.z-bowl.z)?a:b).id;}
    if(cat.id===bowl.catId){const distance=Math.hypot(cat.x-bowl.x,cat.z-bowl.z);if(bowl.drinkingAt===null){if(distance<.48){cat.path=[];cat.mode='drink';bowl.drinkingAt=now;this.events.push({type:'meow',id:cat.id});}else if((cat.mode!=='milk'||!cat.path.length)&&now>(cat.repathAt||0)){cat.repathAt=now+2000;this.go(cat,bowl,'milk');}}
     else if(now-bowl.drinkingAt>=10000){bowl.empty=true;bowl.emptyAt=now;this.followId=cat.id;this.followUntil=now+60000;cat.mode='follow';this.events.push({type:'friend',id:cat.id});}
    }
   }
   if(!catUnsafe&&!this.bowl?.empty&&cat.mode==='drink')cat.path=[];
   if(!catUnsafe&&['rest','home','sit'].includes(cat.mode)&&cat.id!==this.followId&&!cat.path.length&&now>=cat.nextAt&&now>=this.nextWalk&&(!this.bowl||this.bowl.empty)){
    const travel=this.random()<.18&&(cat.room!=='camp'||this.cats.filter(c=>c.room==='camp').length>1),points=cat.room==='garden'?[{x:-8,z:4},{x:8,z:4},{x:0,z:3},{x:6,z:9}]:[{x:-12,z:7},{x:12,z:7},{x:-12,z:-12.8},{x:12,z:-12.8},{x:18,z:24},{x:-25,z:15},{x:0,z:4}];const target=travel?(cat.room==='camp'?{x:0,z:10}:GARDEN.campGate):points[Math.floor(this.random()*points.length)];this.go(cat,target,travel?'portal':'walk');cat.nextAt=now+24000+this.random()*15000;this.nextWalk=now+18000;
   }
   if(cat.path.length){const next=cat.path[0],dx=next.x-cat.x,dz=next.z-cat.z,d=Math.hypot(dx,dz),step=(cat.mode==='shelter'?(emergency?2.8:1.7):cat.mode==='milk'?cat.milkSpeed:1.1)*dt;cat.yaw=Math.atan2(dx,dz);if(d<=step+.015){cat.x=next.x;cat.z=next.z;cat.path.shift();if(!cat.path.length&&cat.mode==='walk')cat.mode='sit';if(!cat.path.length&&cat.mode==='portal'){cat.room=cat.room==='camp'?'garden':'camp';Object.assign(cat,cat.room==='garden'?GARDEN.campReturn:{x:0,z:9});cat.mode='rest';cat.nextAt=now+8000;}}else{cat.x+=dx/d*step;cat.z+=dz/d*step;}}
  }
  if(this.bowl?.empty&&now-this.bowl.emptyAt>7000)this.bowl=null;
 }
 drain(){return this.events.splice(0);}
}
