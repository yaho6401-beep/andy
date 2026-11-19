// Local, bounded interaction. Never changes the shared fuel or five-branch count.
export class EmberTouch{
 constructor(random=Math.random){this.random=random;this.count=0;this.readyAt=0;this.total=0;this.hearts=0;}
 touch(now,heat){
  if(now<this.readyAt)return null;
  this.count++;this.total++;
  const heart=this.random()<.1,big=this.random()<.2,strength=Math.max(.12,Math.min(1,(heat-.1)/1.5));
  if(heart)this.hearts++;
  const pause=this.count===5;this.readyAt=now+(pause?5000:800+this.random()*400);if(pause)this.count=0;
  return {heart,big,flip:big,flipIndex:this.total%6,motion:big?1.3:1,strength,pause,height:.9+Math.pow(Math.max(0,heat-.16),.92)*1.65,count:10+Math.floor(this.random()*16),heartCount:heart?20+Math.floor(this.random()*16):0};
 }
}

// Fixed slots and typed arrays: even repeated heart events never allocate more particles.
export class EmberPool{
 constructor(random=Math.random,capacity=168){
  this.random=random;this.capacity=capacity;this.cursor=0;this.active=0;
  for(const key of ['born','life','x','z','vx','vz','vy','size','heart','hx','hy','height','rightX','rightZ'])this[key]=new Float32Array(capacity);
  this.born.fill(-100);this.positions=new Float32Array(capacity*3);this.fades=new Float32Array(capacity);this.sizes=new Float32Array(capacity);
 }
 emit(event,time,right){
  const n=event.count+event.heartCount,r=this.random,s=event.strength;
  for(let j=0;j<n;j++){
   const i=this.cursor++%this.capacity,a=r()*Math.PI*2,v=.12+r()*.55,isHeart=j>=event.count;
   this.born[i]=time;this.life[i]=isHeart?2.75:1.1+r()*1.25;this.x[i]=(r()-.5)*.58;this.z[i]=(r()-.5)*.58;
   this.vx[i]=Math.cos(a)*v;this.vz[i]=Math.sin(a)*v;this.vy[i]=(.85+r()*1.2)*(.55+s*.65);this.size[i]=(.055+r()*.045)*(.65+s*.35)*1.15;
   this.heart[i]=isHeart?1:0;this.height[i]=event.height||1.65;this.rightX[i]=right.x;this.rightZ[i]=right.z;
   const t=(j-event.count)/Math.max(1,event.heartCount)*Math.PI*2+(r()-.5)*.065;
   this.hx[i]=Math.pow(Math.sin(t),3)*(.47+s*.12)+(r()-.5)*.025;
   this.hy[i]=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*.033+(r()-.5)*.025;
  }
 }
 update(time,reduced=false){
  let active=0;
  for(let i=0;i<this.capacity;i++){
   const age=time-this.born[i],life=this.life[i];this.fades[i]=0;if(age<0||age>=life)continue;active++;
   let x=this.x[i]+this.vx[i]*age*.48+Math.sin(age*3+i)*age*.035,z=this.z[i]+this.vz[i]*age*.48,y=.3+this.vy[i]*age-.42*age*age;
   if(this.heart[i]){
    const gather=Math.min(1,Math.max(0,(age-.35)/.65)),scatter=Math.max(0,age-1.65),ease=gather*gather*(3-2*gather);
    x+=(this.hx[i]*this.rightX[i]-x)*ease+this.vx[i]*scatter*scatter;
    z+=(this.hx[i]*this.rightZ[i]-z)*ease+this.vz[i]*scatter*scatter;
    y+=(this.height[i]+this.hy[i]-y)*ease+scatter*.4;
   }
   this.positions[i*3]=x;this.positions[i*3+1]=Math.max(.22,y);this.positions[i*3+2]=z;
   this.fades[i]=reduced?0:Math.min(1,age/.09)*Math.min(1,(life-age)/.8)*(.4+this.vy[i]*.17)*1.15;
   this.sizes[i]=this.size[i];
  }
  this.active=active;
 }
}
