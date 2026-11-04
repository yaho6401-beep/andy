import {SCENT_TAGS,seedQuotes,seoulDay} from './reading-data.js';
const fail=(text,status=400)=>Object.assign(Error(text),{status});
function text(value,max,optional=false){if(typeof value!=='string')throw fail('입력 내용을 확인해 주세요.');const result=value.normalize('NFC').trim();if((!optional&&!result)||[...result].length>max||/[\u0000-\u0008\u000b-\u001f\u007f]/.test(result))throw fail('입력 길이와 내용을 확인해 주세요.');return result;}
function tag(value){if(!SCENT_TAGS.some(t=>t.id===value))throw fail('향기 태그를 하나 골라주세요.');return value;}
function publicText(value,max){const v=text(value,max);if(/씨발|시발|병신|개새끼|좆/.test(v.normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu,'')))throw fail('서로를 존중하는 표현으로 적어주세요.');return v;}
function quotePublic(q,day){return {id:q.id,text:q.text,author:q.author,source:q.source,day};}
function today(data,now){const day=seoulDay(now),scheduled=data.quotes.find(q=>q.published&&q.scheduledDay===day),seeds=data.quotes.filter(q=>q.seed&&q.published);const q=scheduled||seeds[Math.floor(Date.parse(day+'T00:00:00Z')/86400000)%Math.max(1,seeds.length)];if(!q)throw fail('오늘의 문장을 준비하고 있어요.',503);return quotePublic(q,day);}
function initial(){return {version:1,quotes:seedQuotes(),readers:[],bookmarks:[],reflections:[],books:[],limits:[]};}
function own(list,id,reader){const row=list.find(r=>r.id===id);if(!row||row.reader!==reader.id)throw fail('본인 기록만 수정할 수 있어요.',403);return row;}
function safe(row){const {reader,...record}=row;return record;}
export function readingRequest(stored,input,auth){
 const data=stored?.version===1&&Array.isArray(stored.quotes)?structuredClone(stored):initial(),now=auth.now,action=input.action;
 data.limits=(data.limits||[]).filter(x=>now-x.at<60000);let limit=data.limits.find(x=>x.ip===auth.ipHash);if(!limit){limit={ip:auth.ipHash,at:now,count:0,registrations:0};data.limits.push(limit);}if(++limit.count>120)throw fail('잠시 쉬었다가 다시 시도해 주세요.',429);
 let reader=data.readers.find(r=>r.hash===auth.readerHash),out;
 if(action==='register'){
  if(!auth.readerHash)throw fail('책장 연결 정보를 확인해 주세요.',401);
  if(!reader){if(++limit.registrations>10)throw fail('새 책장을 너무 자주 만들고 있어요.',429);reader={id:crypto.randomUUID(),hash:auth.readerHash,createdAt:now};data.readers.push(reader);}out={ok:true};
 }else if(action==='today'){
  const q=today(data,now);out={quote:q,tags:SCENT_TAGS,reflections:data.reflections.filter(r=>r.quoteId===q.id&&r.visibility==='public'&&!r.hidden).slice(-40).map(r=>({...safe(r),mine:r.reader===reader?.id}))};
 }else if(action==='public-books')out={books:data.books.filter(b=>b.visibility==='public').slice(-50).map(safe),bookmarks:data.bookmarks.filter(b=>b.visibility==='public').slice(-50).map(safe)};
 else if(action?.startsWith('admin-')){
  if(!auth.adminVerified)throw fail('관리자 권한이 필요합니다.',403);
  if(action==='admin-list')out={quotes:data.quotes.filter(q=>!q.seed).sort((a,b)=>a.scheduledDay.localeCompare(b.scheduledDay)),reflections:data.reflections.filter(r=>r.visibility==='public').slice(-100).map(safe)};
  else if(action==='admin-hide-reflection'){const row=data.reflections.find(r=>r.id===input.id);if(!row)throw fail('감상을 찾지 못했어요.');row.hidden=input.hidden!==false;out={ok:true};}
  else if(action==='admin-save-quote'){
   const form=input.quote||{},day=text(form.scheduledDay,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day+'T00:00:00Z'))||new Date(day+'T00:00:00Z').toISOString().slice(0,10)!==day)throw fail('예약 날짜를 확인해 주세요.');
   if(!['original','public-domain','permission'].includes(form.rights))throw fail('문장 이용 근거를 선택해 주세요.');
   let row=form.id?data.quotes.find(q=>q.id===form.id&&!q.seed):null;if(form.id&&!row)throw fail('수정할 문장을 찾지 못했어요.');
   if(form.published!==false&&data.quotes.some(q=>q.id!==row?.id&&q.scheduledDay===day&&q.published))throw fail('그 날짜에 등록된 문장이 있어요. 기존 문장을 수정해 주세요.');
   const fields={text:text(form.text,280),author:text(form.author,80),source:text(form.source,240),rights:form.rights,rightsNote:text(form.rightsNote,500),scheduledDay:day,published:form.published!==false,updatedAt:now};
   if(row)Object.assign(row,fields);else{row={id:crypto.randomUUID(),...fields};data.quotes.push(row);}out={ok:true,id:row.id};
  }else throw fail('관리 기능을 확인해 주세요.');
 }else{
  if(!reader)throw fail('내 책장을 먼저 열어주세요.',401);
  if(action==='shelf')out={bookmarks:data.bookmarks.filter(r=>r.reader===reader.id).map(safe),reflections:data.reflections.filter(r=>r.reader===reader.id).map(safe),books:data.books.filter(r=>r.reader===reader.id).map(safe)};
  else if(action==='bookmark'){
   const q=data.quotes.find(q=>q.id===input.quoteId&&q.published);if(!q)throw fail('문장을 찾지 못했어요.');const scent=tag(input.tag);let row=data.bookmarks.find(r=>r.reader===reader.id&&r.quoteId===q.id);
   if(!row){if(data.bookmarks.filter(r=>r.reader===reader.id).length>=200)throw fail('책갈피 200개가 가득 찼어요.');row={id:crypto.randomUUID(),reader:reader.id,quoteId:q.id,quote:quotePublic(q,seoulDay(now)),createdAt:now};data.bookmarks.push(row);}Object.assign(row,{tag:scent,visibility:input.visibility==='public'?'public':'private'});out={ok:true,id:row.id};
  }else if(action==='reflection'){
   const q=data.quotes.find(q=>q.id===input.quoteId&&q.published);if(!q)throw fail('문장을 찾지 못했어요.');const visibility=input.visibility==='public'?'public':'private';const fields={quoteId:q.id,quote:quotePublic(q,seoulDay(now)),text:visibility==='public'?publicText(input.text,180):text(input.text,500),tag:tag(input.tag),visibility,nickname:text(input.nickname||'숲속 독자',16),updatedAt:now};
   let row=data.reflections.find(r=>r.reader===reader.id&&r.quoteId===q.id);if(row){if(now-row.updatedAt<1500)throw fail('잠시 후 다시 저장해 주세요.',429);Object.assign(row,fields);}else{if(data.reflections.filter(r=>r.reader===reader.id).length>=200)throw fail('감상 기록이 가득 찼어요.');row={id:crypto.randomUUID(),reader:reader.id,createdAt:now,...fields};data.reflections.push(row);}out={ok:true,id:row.id};
  }else if(action==='book-save'){
   const visibility=input.visibility==='public'?'public':'private';const fields={title:visibility==='public'?publicText(input.title,120):text(input.title,120),author:text(input.author||'',80,true),note:visibility==='public'?publicText(input.note||'읽은 책으로 기록했어요.',180):text(input.note||'',600,true),tag:tag(input.tag),visibility,updatedAt:now};
   let row=input.id?own(data.books,input.id,reader):null;if(row)Object.assign(row,fields);else{if(data.books.filter(r=>r.reader===reader.id).length>=200)throw fail('읽은 책 기록 200개가 가득 찼어요.');row={id:crypto.randomUUID(),reader:reader.id,createdAt:now,...fields};data.books.push(row);}out={ok:true,id:row.id};
  }else if(action==='visibility'){
   const list={bookmark:data.bookmarks,reflection:data.reflections,book:data.books}[input.kind];if(!list)throw fail('기록 종류를 확인해 주세요.');const row=own(list,input.id,reader);const next=input.visibility==='public'?'public':'private';if(next==='public'){if(row.text)publicText(row.text,180);if(row.note)publicText(row.note,180);}row.visibility=next;out={ok:true};
  }else if(action==='delete'){
   const key={bookmark:'bookmarks',reflection:'reflections',book:'books'}[input.kind];if(!key)throw fail('기록 종류를 확인해 주세요.');own(data[key],input.id,reader);data[key]=data[key].filter(r=>r.id!==input.id);out={ok:true};
  }else throw fail('책장 기능을 확인해 주세요.');
 }
 return {data,out:{...out,serverNow:now}};
}
