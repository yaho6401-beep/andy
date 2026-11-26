const fract=v=>v-Math.floor(v),mix=(a,b,t)=>a+(b-a)*t,clamp=v=>Math.max(0,Math.min(1,v)),smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
const hash=(x,y)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453);
function n(x,y){const i=Math.floor(x),j=Math.floor(y);let a=fract(x),b=fract(y);a=a*a*(3-2*a);b=b*b*(3-2*b);return mix(mix(hash(i,j),hash(i+1,j),a),mix(hash(i,j+1),hash(i+1,j+1),a),b);}
const fb=(x,y)=>n(x,y)*.57+n(x*2.03+7.1,y*2.03+7.1)*.28+n(x*4.11-3.3,y*4.11-3.3)*.15;
// Same density field as clouds.js. Moon, ocean reflection and lights share this occlusion.
export function moonTransmissionAt(direction,time,cover=0,rain=0){const {x,y,z}=direction,px=x/(.28+Math.max(0,y))*2.5+time*.006,py=z/(.28+Math.max(0,y))*2.5+time*.002,density=fb(px+fb(px*.65,py*.65)*.55,py+fb(px*.65+9.4,py*.65+9.4)*.55),edge=.86-cover*.43,body=smooth(edge-.09,edge+.14,density),overcast=smooth(.7,.98,cover)*.92,opacity=Math.max(mix(body,1,rain*.7),overcast)*smooth(.025,.2,y)*Math.min(.995,cover*1.8);return (1-clamp(opacity))**2.4;}
