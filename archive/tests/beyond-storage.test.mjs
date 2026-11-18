import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeRecords, loadRecords, persistRecords, parseImport, recordsToJson, normalizeRecord } from '../beyond/storage.js';
const memory = () => {
  const m = new Map();
  return { getItem: k => m.get(k) ?? null, setItem: (k,v) => m.set(k,v), removeItem: k => m.delete(k) };
};
const r = (id, title = '한 줄') => ({ id, date: '2026-11-09T10:00:00.000Z', category: '한 줄', place:'사유의 숲', title, thought:'생각', durationMinutes:2 });
test('records are saved, loaded, and ordered', () => {
  const s = memory();
  assert.equal(persistRecords([r('a')],s),true);
  assert.deepEqual(loadRecords(s),[r('a')]);
});
test('merge de-duplicates by id', () => {
  assert.equal(mergeRecords([r('a')], [r('a','다른 제목'), r('b')]).length, 2);
});
test('export and import are compatible', () => {
  assert.deepEqual(parseImport(recordsToJson([r('a')])),[r('a')]);
});
test('invalid import is rejected', () => {
  assert.throws(() => parseImport('{"records":[]}'));
});
test('invalid record is filtered and long notes are limited', () => {
  assert.equal(normalizeRecord({date:'bad'}),null);
  assert.equal(normalizeRecord({...r('b'),thought:'a'.repeat(2000)}).thought.length,1000);
});
