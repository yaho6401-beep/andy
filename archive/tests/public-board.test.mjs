import test from 'node:test';import assert from 'node:assert/strict';
import handler,{cleanPublicPage,createPublicBoardReader,publicPage} from '../../api/archive-public-board.mjs';
import {publicPostHTML} from '../src/museum-guide.js';
const id='00000000-0000-4000-8000-000000000001',item={id,body:'실제 공개 메모',nickname:'향기 산책',category:'message',color:'rose',hearts:2,comments:1,created_at:'2026-11-18T01:02:00Z'};
test('public read strips private/admin fields, hidden rows and invalid input',()=>{
 const data=cleanPublicPage({page:1,pages:1,total:1,items:[{...item,phone:'secret',admin_reviewed_at:'private',password_hash:'private'},{...item,hidden:true}]});
 assert.equal(data.items.length,1);assert.deepEqual(Object.keys(data.items[0]).sort(),['id','body','nickname','category','color','animal','created_at','hearts','comments'].sort());
 for(const input of ['https://bad.test',-1,1.2,10001])assert.throws(()=>publicPage(input));
 assert.throws(()=>cleanPublicPage({}));
});
test('reader uses only fixed public GET, coalesces duplicate reads and expires bounded cache',async()=>{
 let now=100,calls=0;const read=createPublicBoardReader({clock:()=>now,fetchImpl:async(url,options)=>{calls++;assert.match(url,/^https:\/\/jqlrwwheiwjdrobluifx\.supabase\.co\/functions\/v1\/feedback-wall\?page=1$/);assert.equal(options.method,'GET');assert.deepEqual(Object.keys(options.headers),['apikey']);return {ok:true,json:async()=>({page:1,pages:1,total:1,items:[item]})};}});
 const [a,b]=await Promise.all([read(1),read(1)]);assert.deepEqual(a,b);assert.equal(calls,1);await read(1);assert.equal(calls,1);now+=20001;await read(1);assert.equal(calls,2);
});
test('read failures retry and non-GET API requests never reach upstream',async()=>{
 let calls=0;const read=createPublicBoardReader({fetchImpl:async()=>{calls++;return {ok:false};}});await assert.rejects(read(1));await assert.rejects(read(1));assert.equal(calls,2);
 const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(data){this.data=data;}};
 await handler({method:'POST',url:'/?page=1',headers:{authorization:'ignored'}},res);assert.equal(res.code,405);assert.equal(res.headers.Allow,'GET');
 await handler({method:'GET',url:'/?page=bad'},res);assert.equal(res.code,400);
});
test('published user content is rendered as text, never executable HTML',()=>{
 const html=publicPostHTML({...item,body:'<img src=x onerror=alert(1)>',nickname:'<script>alert(2)</script>',color:'red;position:fixed'});
 assert.ok(!html.includes('<img'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('position:fixed'));
});
