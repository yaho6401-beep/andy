import {directEntry} from './room-entry.js';
import {ArchiveStore} from '../server/room-store.mjs';
import {validPosition} from './protocol.js';
// Isolated, single-visitor simulation. Never claims remote participants or staff authorization.
export class PublicDemoTransport{
 constructor(onSnapshot,onStatus,{startRoom}={}){this.onSnapshot=onSnapshot;this.onStatus=onStatus;this.publicDemo=true;this.startRoom=['scents','books','lobby','salon','camp','garden-beyond'].includes(startRoom)?startRoom:null;}
 async connect({nickname,adult,appearance,publicEntry}){
 if(!adult&&!publicEntry)throw Error('공개 체험 입장을 확인해 주세요.');
 this.store=new ArchiveStore({publicLounge:true});this.id='visitor';this.store.seed(this.id,nickname.slice(0,16),'guest',{adultConfirmed:adult===true,publicVisitor:true});this.store.join(this.id,appearance);
 const entry=directEntry(this.startRoom);if(entry){const p=this.store.clients.get(this.id);Object.assign(p,entry,{epoch:p.epoch+1});}
 this.onStatus('혼자 체험 중');this.onWelcome?.({id:this.id});this.emit();this.timer=setInterval(()=>this.emit(),500);return {id:this.id,mode:'public-demo'};
 }
 emit(){if(this.store)this.onSnapshot(this.store.snapshot(this.id));}
 send(data){try{const result=this.store.action(this.id,data);this.emit();if(['order','pickup','place-order','clear-order','sit','stand','camp-can-pickup','camp-can-pour','campfire-branch','campfire-log','camp-snack-fuel','harvest','camp-snack','camp-snack-adjust','camp-snack-take','camp-snack-share-take','camp-snack-give','museum-oil','use-oil','warm-hands','sip','travel','identity','note','delete-note'].includes(data.type))this.onReceipt?.({action:data.type,...result});}catch(e){this.onError?.(e.message);}}
 async admin(){throw Error('공개 체험 모드에서는 진행자 기능을 사용할 수 없어요.');}
 close(){clearInterval(this.timer);this.store=null;}
}
