import {CAFE_TABLES,SEATS} from './seats.js';
import {GALLERY,GALLERY_COLLIDERS} from './gallery-layout.js';
import {GARDEN,GARDEN_COLLIDERS} from './garden-layout.js';
import {CAMP,CAMP_OBSTACLES,campPosition} from '../camp/layout.js';
export const MAX_PEOPLE=30,POSITION_HZ=2,SPEED=3.2;
export const ROOMS=['garden','lobby','scents','books','salon','camp'];
export const COLORS=['#b7c6a1','#d5a5b8','#a9becb','#c2aed4','#d7bf8c'];
export const HAIR=['#554239','#97704e','#302d32','#a78069','#8b697e'];
export const PORTALS={
 garden:[{to:'lobby',x:0,z:-7.2,label:'아트리움 로비',spawn:{x:0,z:11}},
 {to:'camp',...GARDEN.campGate,label:'별빛 캠핑장',spawn:{...CAMP.spawn,yaw:Math.PI}}],
 lobby:[{to:'garden',x:0,z:12.9,label:'햇살 정원',spawn:{x:0,z:-6.4}},
 {to:'scents',x:-13.9,z:0,label:'향기 아카이브',spawn:{...GALLERY.scents.entrance.spawn}},
 {to:'books',x:13.9,z:0,label:'책의 정원',spawn:{x:-13,z:0}},
 {to:'salon',x:0,z:-12.9,label:'향기카페',spawn:{x:0,z:11}}],
 scents:[{to:'lobby',x:GALLERY.scents.entrance.x,z:0,label:'아트리움 로비',spawn:{x:-12,z:0}}],
 books:[{to:'lobby',x:-14.2,z:0,label:'아트리움 로비',spawn:{x:12,z:0}}],
 salon:[{to:'lobby',x:0,z:12.9,label:'아트리움 로비',spawn:{x:0,z:-11}}],
 camp:[{to:'garden',...CAMP.gate,yaw:Math.PI,label:'햇살 정원',spawn:{...GARDEN.campReturn}}]
};
export const LAYOUT={
 garden:GARDEN_COLLIDERS,
 ...GALLERY_COLLIDERS,
 salon:[...GALLERY_COLLIDERS.salon,...CAFE_TABLES.map(t=>({x:t.x,z:t.z,w:t.w,d:t.d})),...SEATS.filter(s=>s.room==='salon').map(s=>({x:s.x,z:s.z,w:.6,d:.6}))],
 camp:CAMP_OBSTACLES.map(o=>({...o,w:o.w||o.r*2,d:o.d||o.r*2}))
};
export const ROOM_BOUNDS=Object.fromEntries(ROOMS.map(room=>[room,GALLERY[room]?{x:GALLERY[room].width/2-.2,z:GALLERY[room].depth/2-.2}:{x:7.8,z:7.8}]));
ROOM_BOUNDS.garden={...GARDEN.bounds};
ROOM_BOUNDS.camp={...CAMP.bounds};
export function validPosition(room,x,z){if(room==='camp')return campPosition(x,z);const bounds=ROOM_BOUNDS[room];return !!bounds&&Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<bounds.x&&Math.abs(z)<bounds.z&&!LAYOUT[room].some(o=>Math.abs(x-o.x)<o.w/2+.28&&Math.abs(z-o.z)<o.d/2+.28);}
// Swept validation stops a fast or lagged packet passing through a cabinet.
export function validMove(room,x0,z0,x1,z1){if(!validPosition(room,x1,z1))return false;const steps=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/.12));for(let i=1;i<=steps;i++)if(!validPosition(room,x0+(x1-x0)*i/steps,z0+(z1-z0)*i/steps))return false;return true;}
export function appearance(input={}){return {kind:Math.max(0,Math.min(7,Number.isInteger(input.kind)?input.kind:0)),hairStyle:Math.max(0,Math.min(2,Number.isInteger(input.hairStyle)?input.hairStyle:0)),hair:HAIR.includes(input.hair)?input.hair:HAIR[0],color:COLORS.includes(input.color)?input.color:COLORS[0]};}
export function clean(v,max=200){if(typeof v!=='string')throw Error('문장을 확인해 주세요.');v=v.normalize('NFC').trim();if(!v||[...v].length>max||/[\u0000-\u0008\u000b-\u001f\u007f]/.test(v))throw Error('입력 길이나 내용을 확인해 주세요.');return v;}
export function estimateUsage(n=30,hz=2,minutes=50){return {snapshotMessagesPerSecond:hz*(n+1),snapshotMessages:hz*(n+1)*minutes*60,worstPositionWrites:n*hz*minutes*60,monthlyFreeMessages:2000000};}
