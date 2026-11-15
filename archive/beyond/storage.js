/**
 * 로컬 우선 저장소. 서버 전송 없음. 민감한 메모는 공용 기기에 남기지 마세요.
 * 이 모듈은 브라우저가 아닌 Node에서도 단위 테스트할 수 있도록 작성했습니다.
 */
export const RECORD_KEY = 'bookscents.beyond.records.v1';
export const SESSION_KEY = 'bookscents.beyond.readingSession.v1';
export const POSITION_KEY = 'bookscents.beyond.position.v1';

function storageOrNull(storage) {
  if (storage) return storage;
  try { return typeof localStorage === 'undefined' ? null : localStorage; }
  catch { return null; }
}
function safeParse(source, fallback) {
  try { return JSON.parse(source); } catch { return fallback; }
}
export function normalizeRecord(record) {
  if (!record || typeof record !== 'object') return null;
  const id = String(record.id || '').slice(0, 100);
  const date = String(record.date || '').slice(0, 40);
  const category = ['한 줄', '두세 줄', '몇 페이지', '조금 더'].includes(record.category)
    ? record.category : '한 줄';
  if (!id || !date || Number.isNaN(Date.parse(date))) return null;
  return {
    id, date, category,
    place: String(record.place || '문장 너머').slice(0, 70),
    title: String(record.title || '').slice(0, 120),
    thought: String(record.thought || '').slice(0, 1000),
    durationMinutes: Math.max(0, Math.min(24 * 60, Number(record.durationMinutes) || 0)),
  };
}
export function loadRecords(storage) {
  const s = storageOrNull(storage);
  if (!s) return [];
  let raw;
  try { raw = s.getItem(RECORD_KEY); } catch { return []; }
  const data = safeParse(raw, []);
  if (!Array.isArray(data)) return [];
  return data.slice(0, 5000).map(normalizeRecord).filter(Boolean);
}
export function persistRecords(records, storage) {
  const s = storageOrNull(storage);
  if (!s) return false;
  try {
    s.setItem(RECORD_KEY, JSON.stringify(records.slice(0, 5000).map(normalizeRecord).filter(Boolean)));
    return true;
  } catch { return false; }
}
export function mergeRecords(current, incoming) {
  const m = new Map();
  for (const record of [...current, ...incoming]) {
    const valid = normalizeRecord(record);
    if (valid) m.set(valid.id, valid);
  }
  return [...m.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5000);
}
export function saveSession(startedAt, place, storage) {
  const s = storageOrNull(storage);
  if (!s) return false;
  try { s.setItem(SESSION_KEY, JSON.stringify({ startedAt, place })); return true; }
  catch { return false; }
}
export function loadSession(storage) {
  const s = storageOrNull(storage);
  if (!s) return null;
  let raw;
  try { raw = s.getItem(SESSION_KEY); } catch { return null; }
  const value = safeParse(raw, null);
  if (!value || !Number.isFinite(value.startedAt) || value.startedAt < 0 || value.startedAt > Date.now()) return null;
  return { startedAt: value.startedAt, place: String(value.place || '문장 너머').slice(0, 70) };
}
export function clearSession(storage) {
  try { storageOrNull(storage)?.removeItem(SESSION_KEY); } catch { /* 저장 차단 */ }
}
export function savePosition(position, storage) {
  const s = storageOrNull(storage);
  if (!s) return;
  try { s.setItem(POSITION_KEY, JSON.stringify(position)); } catch { /* 저장 차단 */ }
}
export function loadPosition(storage) {
  const s = storageOrNull(storage);
  if (!s) return { x: 0, z: 8 };
  let raw;
  try { raw = s.getItem(POSITION_KEY); } catch { return { x: 0, z: 8 }; }
  const p = safeParse(raw, null);
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.z)) return { x: 0, z: 8 };
  return { x: Math.max(-42, Math.min(42, p.x)), z: Math.max(-42, Math.min(42, p.z)) };
}
export function recordsToJson(records) {
  return JSON.stringify({ app: 'bookscents-beyond', version: 1, exportedAt: new Date().toISOString(), records }, null, 2);
}
export function parseImport(source) {
  if (source.length > 3_000_000) throw new Error('파일이 너무 큽니다.');
  const data = safeParse(source, null);
  if (!data || data.app !== 'bookscents-beyond' || data.version !== 1 || !Array.isArray(data.records)) {
    throw new Error('문장 너머의 독서 일지 JSON 파일을 선택해주세요.');
  }
  return data.records.slice(0, 5000).map(normalizeRecord).filter(Boolean);
}
