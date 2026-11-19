import * as T from 'three';

// One brief sky visitor at a time: fixed buffers, no textures, timers or per-frame allocations.
export function createMeteors(parent,random=Math.random){
 const count=24,positions=new Float32Array(count*6),colors=new Float32Array(count*6),geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));
 geo.setAttribute('color',new T.BufferAttribute(colors,3));
 const color=new T.Color('#f5e3c4');
 for(let i=0;i<count;i++)for(let j=0;j<2;j++){const fade=Math.pow(1-(i+j)/count,1.6);colors.set([color.r*fade,color.g*fade,color.b*fade],i*6+j*3);}
 const material=new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
 const trail=new T.LineSegments(geo,material);trail.frustumCulled=false;trail.name='occasional-night-meteor';trail.visible=false;parent.add(trail);
 const headGeo=new T.BufferGeometry();headGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(3),3));
 const headMat=new T.PointsMaterial({color:'#fff2d8',size:2.4,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false,toneMapped:false});
 const head=new T.Points(headGeo,headMat);head.frustumCulled=false;head.visible=false;parent.add(head);
 const point=new T.Vector3();let next=0,start=-100,fromX=0,fromY=0,dx=0,dy=0,total=0;
 return {
  update(time,camera,reduced=false){
   if(!camera||reduced){trail.visible=head.visible=false;return;}
   if(!next)next=time+9+random()*7;
   if(time>=next){start=time;next=time+22+random()*24;fromX=.35+random()*.4;fromY=.64+random()*.2;dx=-.5-random()*.2;dy=-.2-random()*.13;total++;}
   const age=time-start,duration=1.35,active=age>=0&&age<duration;
   trail.visible=head.visible=active;if(!active)return;
   const fade=Math.min(1,age/.15)*Math.min(1,(duration-age)/.35);material.opacity=fade*.85;headMat.opacity=fade;
   for(let i=0;i<count;i++)for(let j=0;j<2;j++){
    const t=age/duration-(i+j)/count*.24;
    point.set(fromX+dx*t,fromY+dy*t,.995).unproject(camera);const k=i*6+j*3;positions[k]=point.x;positions[k+1]=point.y;positions[k+2]=point.z;
   }
   geo.attributes.position.needsUpdate=true;const h=headGeo.attributes.position.array;h[0]=positions[0];h[1]=positions[1];h[2]=positions[2];headGeo.attributes.position.needsUpdate=true;
  },
  get diagnostics(){return {visible:trail.visible,total,capacity:count};},
  dispose(){trail.removeFromParent();head.removeFromParent();geo.dispose();headGeo.dispose();material.dispose();headMat.dispose();}
 };
}
