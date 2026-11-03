import {ArchiveStore} from '../server/room-store.mjs';
// Isolated, single-visitor simulation. Never claims remote participants or staff authorization.
export class PublicDemoTransport{
 constructor(onSnapshot,onStatus){this.onSnapshot=onSnapshot;this.onStatus=onStatus;this.publicDemo=true;}
 async connect({nickname,adult,appearance}){
 if(!adult)throw Error('이용 동의를 확인해 주세요.');
 this.store=new ArchiveStore();this.id='visitor';this.store.seed(this.id,nickname.slice(0,16));this.store.join(this.id,appearance);this.onStatus('혼자 체험 중');this.onWelcome?.({id:this.id});this.emit();this.timer=setInterval(()=>this.emit(),500);return {id:this.id,mode:'public-demo'};
 }
 emit(){if(this.store)this.onSnapshot(this.store.snapshot(this.id));}
 send(data){try{const result=this.store.action(this.id,data);this.emit();if(['order','pickup','place-order','clear-order','sit','stand','note','delete-note'].includes(data.type))this.onReceipt?.({action:data.type,...result});}catch(e){this.onError?.(e.message);}}
 async admin(){throw Error('공개 체험 모드에서는 진행자 기능을 사용할 수 없어요.');}
 close(){clearInterval(this.timer);this.store=null;}
}
