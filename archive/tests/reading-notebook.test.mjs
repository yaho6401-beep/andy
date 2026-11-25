import test from 'node:test';import assert from 'node:assert/strict';
import {cleanNotebook,excerptUnits,selectedExcerpt,sentences} from '../../reading-notebook-model.js';
import {cleanRecord,digest} from '../../server/member-core.mjs';
import {memberService} from '../../server/member-service.mjs';
test('verses and individual sentences retain the exact text and original reading order',()=>{
 const verses=excerptUnits({verses:[{verse:1,text:'첫 구절입니다.'},{verse:2,text:'둘째 구절입니다.'},{verse:3,text:'셋째 구절입니다.'}]},true);
 assert.equal(selectedExcerpt(verses,new Set(['v3','v1'])),'첫 구절입니다.\n\n셋째 구절입니다.');assert.equal(verses[2].label,'3절');
 const original='첫 문장입니다. 다음은 “인용문”입니다! 마지막 문장?';assert.equal(sentences(original).join(''),original);
 const units=excerptUnits({paragraphs:[original,'Second paragraph. And another sentence.']},false);assert.equal(units.filter(u=>u.paragraph===0).map(u=>u.text).join(''),original);assert.ok(units.length>=5);
});
test('notebook rejects empty and oversized excerpts rather than silently truncating; strips executable URLs and forged ownership',()=>{
 const row={id:crypto.randomUUID(),date:new Date().toISOString(),quote:'마음에 남은 글\n그 다음 줄',sourceTitle:'성경전서',location:'요한복음 3장 · 16절',note:'내 생각',member_id:'other',phone:'secret',sourceUrl:'javascript:alert(1)',licenseUrl:'https://example.org/license'};
 const saved=cleanRecord('notebook',row);assert.equal(saved.quote,row.quote);assert.equal(saved.location,row.location);assert.equal(saved.sourceUrl,'');assert.equal(saved.licenseUrl,'https://example.org/license');assert.equal(saved.member_id,undefined);assert.equal(saved.phone,undefined);
 for(const quote of ['', '   ', 'x'.repeat(4001),'\u0001'])assert.throws(()=>cleanNotebook({quote}));assert.equal(cleanNotebook({quote:'가'.repeat(4000)}).quote.length,4000);assert.throws(()=>cleanRecord('notebook',{...row,date:'invalid'}));
});
test('notebook uses authenticated ownership for save/read/delete and never touches reading or blending records',async()=>{
 const tokenA='a'.repeat(64),tokenB='b'.repeat(64),hashA=await digest(tokenA),hashB=await digest(tokenB),rows=new Map(),calls=[];
 const sql={begin:async fn=>fn(sql),unsafe:async(q,p=[])=>{calls.push([q,p]);if(q.includes('join workshop_private.member_sessions'))return p[0]===hashA?[{id:'member-a'}]:p[0]===hashB?[{id:'member-b'}]:[];if(q.includes('member_limits'))return [{count:1}];if(q.includes('select count(*)'))return [{n:rows.size}];if(q.includes('select id from workshop_private.members'))return [{id:p[0]}];if(q.startsWith('insert into workshop_private.member_records')){rows.set(p.slice(0,3).join('|'),JSON.parse(p[3]));return [];}if(q.startsWith('select payload'))return [...rows].filter(([k])=>k.startsWith(p[0]+'|'+p[1]+'|')).map(([,payload])=>({payload}));if(q.startsWith('delete from workshop_private.member_records')){rows.delete(p.join('|'));return [];}throw Error(q);}};
 const run=(input,token=tokenA)=>memberService({input,token,sql}),record={id:crypto.randomUUID(),date:new Date().toISOString(),quote:'나만의 한 줄',sourceTitle:'책'};
 await assert.rejects(()=>run({op:'save-record',kind:'notebook',record},''),e=>e.status===401);
 await run({op:'save-record',kind:'notebook',record,member_id:'member-b'});assert.equal((await run({op:'records',kind:'notebook'})).body.items[0].quote,record.quote);assert.equal((await run({op:'records',kind:'notebook'},tokenB)).body.items.length,0);
 await run({op:'delete-record',kind:'notebook',id:record.id},tokenB);assert.equal(rows.size,1);await run({op:'delete-record',kind:'notebook',id:record.id});assert.equal(rows.size,0);
 assert.ok(calls.filter(([q])=>q.includes('member_records')).every(([,p])=>p[1]==='notebook'));
});
