import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BIBLE_BOOKS} from '../camp/bible-catalog.js';
import {CLASSIC_BOOKS} from '../camp/classics-catalog.js';
import {LOAN_INTERVAL,borrowBook,validLoan,loanRemaining} from '../camp/library-loan.js';
const read=id=>JSON.parse(fs.readFileSync(new URL('../camp/reading/'+id+'.json',import.meta.url),'utf8'));
test('KRV complete Bible has 66 books and 1189 sequential chapters with no missing verses',()=>{
 assert.equal(BIBLE_BOOKS.length,66);assert.equal(new Set(BIBLE_BOOKS.map(b=>b[0])).size,66);
 assert.equal(BIBLE_BOOKS[0][1],'창세기');assert.equal(BIBLE_BOOKS[39][1],'마태복음');assert.equal(BIBLE_BOOKS.at(-1)[1],'요한계시록');let chapters=0,verses=0;
 for(const [id,title,count]of BIBLE_BOOKS){const b=read(id);assert.equal(b.book,title);assert.equal(b.chapters.length,count);chapters+=count;b.chapters.forEach((c,i)=>{assert.equal(c.chapter,i+1);assert(c.verses.length>0);c.verses.forEach((v,j)=>{assert.equal(v.verse,j+1);assert(v.text.trim());verses++;});});}
 assert.equal(chapters,1189);assert.equal(verses,31102);
});
test('thirty distinct classics include actual Korean text and versioned attribution',()=>{
 assert.equal(CLASSIC_BOOKS.length,30);assert.equal(new Set(CLASSIC_BOOKS.map(b=>b.id)).size,30);
 for(const meta of CLASSIC_BOOKS){const b=read(meta.id);assert.equal(b.book,meta.title);assert.equal(b.author,meta.author);assert.match(b.source,/^https:\/\/ko\.wikisource\.org\/w\/index.php\?title=.*&oldid=\d+$/);assert.equal(b.license,'https://creativecommons.org/licenses/by-sa/4.0/');assert(b.changes);assert(b.chapters.flatMap(c=>c.paragraphs).join('').length>400);assert(!b.chapters.flatMap(c=>c.paragraphs).some(p=>/이 저작물이 미국에서도|Public domain|^라이선스$/.test(p)));}
});
test('a borrowed book stays readable; switching waits ten minutes, same book does not restart clock',()=>{
 const ids=['bible','carnegie','classic-01'],at=1000000,first=borrowBook(null,'bible',ids,at);assert(first.ok);assert.equal(first.loan.borrowedAt,at);
 assert.equal(loanRemaining(first.loan,at),LOAN_INTERVAL);assert.equal(borrowBook(first.loan,'carnegie',ids,at+599999).ok,false);
 const again=borrowBook(first.loan,'bible',ids,at+60000);assert(again.ok);assert.deepEqual(again.loan,first.loan);
 const next=borrowBook(first.loan,'carnegie',ids,at+600000);assert(next.ok);assert.equal(next.loan.borrowedAt,at+600000);
 assert.equal(validLoan(first.loan,ids,at+90000000).id,'bible');assert.equal(loanRemaining(first.loan,at+90000000),0);assert.equal(borrowBook(null,'unknown',ids,at).ok,false);
});
test('malformed loan timestamps and unknown books do not create permanent cooldowns',()=>{
 const ids=['bible'];for(const value of [null,{},[],{id:'bad',borrowedAt:1},{id:'bible',borrowedAt:'1'},{id:'bible',borrowedAt:Infinity},{id:'bible',borrowedAt:-1},{id:'bible',borrowedAt:700000}])assert.equal(validLoan(value,ids,10000),null);
 assert.deepEqual(validLoan({id:'bible',borrowedAt:9000,extra:'discard'},ids,10000),{id:'bible',borrowedAt:9000});
});
