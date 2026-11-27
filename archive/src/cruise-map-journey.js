import {nearbyPort,voyageDestination,voyagePose} from '../camp/sea-travel-state.js';

// Navigation intent only. Boarding and voyage completion remain server validated.
export class CruiseMapJourney{
 constructor(api){this.api=api;this.stage=null;this.since=0;}
 get active(){return this.stage!==null;}
 start(now){const s=this.api.state();if(!s.joined||s.room!=='garden'||s.player?.voyage)return false;this.api.walk.start('cruise-boat');if(this.api.walk.destination!=='cruise-boat')return false;this.stage='walking';this.since=now;return true;}
 cancel(){if(this.api.walk.destination==='cruise-boat')this.api.walk.cancel(false);this.stage=null;}
 error(){if(this.active)this.cancel();}
 receipt(data){if(this.stage==='boarding'&&data.cruiseBoarded)this.stage=null;}
 frame(now){
  if(!this.active)return;const s=this.api.state(),p=s.player;
  if(!s.joined||!p||p.seaRescue){this.cancel();return;}
  if(this.stage==='walking'){
   if(this.api.walk.active){if(this.api.walk.destination!=='cruise-boat')this.cancel();return;}
   // A cancelled shortcut must never become a departure just because it stopped near water.
   if(this.api.walk.arrival?.destination!=='cruise-boat'||this.api.walk.arrival.at<this.since||s.room!=='camp'||nearbyPort(s.position,.65)!=='shore'||s.manual||s.blocked){this.cancel();return;}
   this.stage='launching';this.since=now;this.api.action({type:'sea-boat',destination:'cruise'});return;
  }
  if(s.room!=='camp'){this.cancel();return;}
  if(this.stage==='launching'){
   if(p.voyage&&voyageDestination(p.voyage)==='cruise'){this.stage='sailing';this.since=now;}
   else if(now-this.since>12000)this.cancel();
  }
  if(this.stage==='sailing'){
   if(!p.voyage||voyageDestination(p.voyage)!=='cruise'){this.cancel();return;}
   if(voyagePose(p.voyage,s.wall).done&&!s.blocked){this.stage='boarding';this.since=now;this.api.action({type:'sea-cruise-board'});}
  }
  if(this.stage==='boarding'&&now-this.since>12000){this.cancel();this.api.toast('크루즈 옆에 도착했어요. 승선 버튼으로 이어갈 수 있어요.');}
 }
}
