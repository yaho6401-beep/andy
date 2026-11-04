import {CAFE_TABLES,SEATS} from './seats.js';
export const MAX_PEOPLE=20,POSITION_HZ=2,SPEED=3.2;
export const ROOMS=['garden','lobby','scents','books','salon'];
export const COLORS=['#b7c6a1','#d5a5b8','#a9becb','#c2aed4','#d7bf8c'];
export const HAIR=['#554239','#97704e','#302d32','#a78069','#8b697e'];
export const PORTALS={garden:[{to:'lobby',x:0,z:-7.2,label:'향기박물관 로비',spawn:{x:0,z:6.4}}],lobby:[{to:'garden',x:0,z:7.2,label:'햇살 정원',spawn:{x:0,z:-6.4}},{to:'scents',x:-7.2,z:0,label:'향기 아카이브',spawn:{x:6.4,z:0}},{to:'books',x:7.2,z:0,label:'책의 정원',spawn:{x:-6.4,z:0}},{to:'salon',x:0,z:-7.2,label:'향기카페',spawn:{x:0,z:6.4}}],scents:[{to:'lobby',x:7.2,z:0,label:'로비로',spawn:{x:-6.4,z:0}}],books:[{to:'lobby',x:-7.2,z:0,label:'로비로',spawn:{x:6.4,z:0}}],salon:[{to:'lobby',x:0,z:7.2,label:'로비로',spawn:{x:0,z:-6.4}}]};
export const LAYOUT={garden:[{x:-4.8,z:-3,w:2.6,d:3},{x:4.8,z:-3,w:2.6,d:3},{x:-4.8,z:3,w:2.4,d:1.3},{x:4.8,z:3,w:2.4,d:1.3}],
 lobby:[{x:4.7,z:4.4,w:2.4,d:.3},{x:0,z:0,w:3.4,d:3.4},{x:-5,z:2,w:2.4,d:1.1},{x:5,z:2,w:2.4,d:1.1},{x:3.2,z:-6,w:3,d:1.5},{x:-4,z:-5.8,w:3.1,d:1.2}],
 scents:[{x:0,z:-6.8,w:6.8,d:.65},{x:-3.7,z:-5.1,w:.6,d:.6},{x:-6,z:-6.5,w:1.35,d:.7},{x:6,z:-6.5,w:1.35,d:.7},{x:-4,z:2.7,w:2.5,d:1.4},...[-5,-2.5,0,2.5,5].map(x=>({x,z:-3,w:1.3,d:1.3})),{x:0,z:2,w:3,d:1.8}],
 books:[{x:-7.3,z:-3.2,w:.6,d:3.6},{x:-3.9,z:2.1,w:1.4,d:.9},{x:3.9,z:2.1,w:1.4,d:.9},{x:5.6,z:4.7,w:1.5,d:.65},{x:-7.1,z:3.8,w:.65,d:2.5},...[-5,0,5].map(x=>({x,z:-6.5,w:3.7,d:1.1})),{x:-4,z:0,w:3,d:1.4},{x:4,z:0,w:3,d:1.4},{x:0,z:3,w:2,d:2}],
 salon:[...CAFE_TABLES.map(t=>({x:t.x,z:t.z,w:t.w,d:t.d})),...SEATS.filter(s=>s.room==='salon').map(s=>({x:s.x,z:s.z,w:.55,d:.55})),{x:0,z:-5.8,w:6.8,d:1.6},{x:6.8,z:-5.5,w:.8,d:1.8},{x:-7.1,z:3.8,w:.65,d:2.5},{x:0,z:-6.5,w:3,d:1}]
};
export function validPosition(room,x,z){return ROOMS.includes(room)&&Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<7.8&&Math.abs(z)<7.8&&!LAYOUT[room].some(o=>Math.abs(x-o.x)<o.w/2+.28&&Math.abs(z-o.z)<o.d/2+.28);}
// Swept validation stops a fast or lagged packet passing through a cabinet.
export function validMove(room,x0,z0,x1,z1){if(!validPosition(room,x1,z1))return false;const steps=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/.12));for(let i=1;i<=steps;i++)if(!validPosition(room,x0+(x1-x0)*i/steps,z0+(z1-z0)*i/steps))return false;return true;}
export function appearance(input={}){return {kind:Math.max(0,Math.min(7,Number.isInteger(input.kind)?input.kind:0)),hairStyle:Math.max(0,Math.min(2,Number.isInteger(input.hairStyle)?input.hairStyle:0)),hair:HAIR.includes(input.hair)?input.hair:HAIR[0],color:COLORS.includes(input.color)?input.color:COLORS[0]};}
export function clean(v,max=200){if(typeof v!=='string')throw Error('문장을 확인해 주세요.');v=v.normalize('NFC').trim();if(!v||[...v].length>max||/[\u0000-\u0008\u000b-\u001f\u007f]/.test(v))throw Error('입력 길이나 내용을 확인해 주세요.');return v;}
export function estimateUsage(n=20,hz=2,minutes=50){return {snapshotMessagesPerSecond:hz*(n+1),snapshotMessages:hz*(n+1)*minutes*60,worstPositionWrites:n*hz*minutes*60,monthlyFreeMessages:2000000};}
