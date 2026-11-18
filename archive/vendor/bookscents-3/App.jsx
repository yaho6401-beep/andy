import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import World from './World.jsx';
import {
  clearSession, loadPosition, loadRecords, loadSession, mergeRecords,
  parseImport, persistRecords, recordsToJson, savePosition, saveSession,
} from './storage.js';

const VILLAGE_URL = import.meta.env.VITE_VILLAGE_URL || 'https://andy-plum.vercel.app/archive/';
const HOME_URL = import.meta.env.VITE_HOME_URL || 'https://andy-plum.vercel.app/';
const CATEGORIES = ['한 줄', '두세 줄', '몇 페이지', '조금 더'];
const labels = { forward: '▲', back: '▼', left: '◀', right: '▶', up: '상승', down: '하강' };
const isTyping = (event) => {
  const element = event.target;
  return element instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) || element.isContentEditable);
};

function HoldButton({ action, controls, children, className = '' }) {
  const press = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    controls.current[action] = true;
  };
  const release = () => { controls.current[action] = false; };
  return <button type="button" className={`hold ${className}`} aria-label={action} onPointerDown={press}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>{children || labels[action]}</button>;
}

function MobileControls({ controls, flying, onToggleFly }) {
  return <div className="mobile-controls" aria-label="이동 조작">
    <div className="dpad">
      <HoldButton action="forward" controls={controls} className="north" />
      <HoldButton action="left" controls={controls} className="west" />
      <HoldButton action="back" controls={controls} className="south" />
      <HoldButton action="right" controls={controls} className="east" />
    </div>
    <div className="flight-controls">
      <button className="fly-button" onClick={onToggleFly}>{flying ? '착륙' : '비행'}</button>
      {flying && <><HoldButton action="up" controls={controls}/><HoldButton action="down" controls={controls}/></>}
    </div>
  </div>;
}

function Journal({ records, onDelete, onImport, onClose, onClear }) {
  const upload = useRef();
  const exportJson = () => {
    const blob = new Blob([recordsToJson(records)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `문장너머_독서일지_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  return <div className="sheet-cover" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="sheet journal" role="dialog" aria-modal="true" aria-label="나의 사색 일지">
      <div className="sheet-head"><div><small>MY LITTLE READING JOURNEY</small><h2>나의 사색 일지</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="일지 닫기">✕</button></div>
      <p className="muted">많이 읽은 기록이 아니라, 다시 책을 펼친 순간들이 쌓이는 곳입니다.</p>
      <div className="journal-actions">
        <button onClick={exportJson} disabled={!records.length}>JSON 내보내기</button>
        <button onClick={() => upload.current?.click()}>기록 가져오기</button>
        <input ref={upload} type="file" hidden accept="application/json,.json" onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) await onImport(file);
          event.target.value = '';
        }}/>
        <button className="danger-outline" onClick={onClear} disabled={!records.length}>전체 삭제</button>
      </div>
      {records.length === 0 ? <div className="empty-state">아직 기록이 없습니다.<br/>한 줄부터 시작해도 좋습니다. 🌿</div> :
        <div className="record-list">
          {records.map((r) => <article className="record" key={r.id}>
            <div className="record-top"><strong>{r.title || '제목을 적지 않은 독서'}</strong>
              <button className="small-remove" onClick={() => onDelete(r.id)}>삭제</button></div>
            <small>{new Date(r.date).toLocaleDateString('ko-KR')} · {r.place} · {r.category}
              {r.durationMinutes ? ` · 약 ${r.durationMinutes}분` : ''}</small>
            {r.thought && <p>{r.thought}</p>}
          </article>)}
        </div>}
      <p className="storage-note">이 기록은 현재 브라우저에만 저장됩니다. 기기 변경·브라우저 데이터 삭제 전에 JSON으로 내보내세요. 공용 기기에서는 타인이 볼 수 있습니다.</p>
    </section>
  </div>;
}

function ReadingSheet({ stage, startedAt, elapsed, place, category, setCategory, title, setTitle,
  thought, setThought, onFinish, onSave, onDiscard, onBack }) {
  return <div className="sheet-cover reading-cover">
    <section className="sheet reading-sheet" role="dialog" aria-modal="true" aria-label="독서 모드">
      <div className="reading-emblem">✦</div>
      <small>BEYOND THE PAGE · {place}</small>
      {stage === 'reading' ? <>
        <h2>잠시 책을 펼쳐볼까요?</h2>
        <p>한 줄도 괜찮아요. 화면을 잠시 내려놓고 현실의 책을 읽어보세요.</p>
        <div className="elapsed">{elapsed}</div>
        <small>읽은 양과 관계없이 언제든 마칠 수 있어요.</small>
        <button className="primary large" onClick={onFinish}>독서 마치기</button>
        <button className="text-button" onClick={onDiscard}>기록 없이 나가기</button>
      </> : <>
        <h2>오늘의 한 줄도 소중합니다.</h2>
        <p>얼마나 읽었는지 고르지 않아도 좋습니다. 원한다면 작은 기록을 남겨보세요.</p>
        <div className="choice-row">{CATEGORIES.map((c) => <button key={c}
          className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
        <label className="field">책 제목 <span>선택</span><input maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="오늘 펼친 책" /></label>
        <label className="field">잠시 떠오른 생각 <span>선택</span>
          <textarea maxLength={1000} value={thought} onChange={e => setThought(e.target.value)} rows={3} placeholder="짧은 한마디여도 충분해요." /></label>
        <div className="action-row"><button className="primary" onClick={onSave}>작은 기록 남기기</button>
          <button onClick={onDiscard}>기록 없이 마치기</button></div>
        <button className="text-button" onClick={onBack}>조금 더 읽기</button>
      </>}
      <small className="privacy-note">기록은 기본 비공개 · AI 감상문 작성 없음</small>
    </section>
  </div>;
}

export default function App() {
  const controls = useRef({});
  const initialPosition = useMemo(() => loadPosition(), []);
  const initialSession = useMemo(() => loadSession(), []);
  const [quality, setQuality] = useState(() => {
    try { return window.matchMedia('(pointer: coarse)').matches ? 'low' : 'medium'; }
    catch { return 'medium'; }
  });
  const [flight, setFlight] = useState(false);
  const [worldInfo, setWorldInfo] = useState({ zone: '사유의 숲', x: 0, z: 8, nearPortal: true });
  const [stage, setStage] = useState(initialSession ? 'reading' : 'idle');
  const [startedAt, setStartedAt] = useState(initialSession?.startedAt || null);
  const [readingPlace, setReadingPlace] = useState(initialSession?.place || '사유의 숲');
  const [elapsed, setElapsed] = useState('00:00');
  const [records, setRecords] = useState(() => loadRecords());
  const [journalOpen, setJournalOpen] = useState(false);
  const [category, setCategory] = useState('한 줄');
  const [title, setTitle] = useState('');
  const [thought, setThought] = useState('');
  const [notice, setNotice] = useState('');
  const lastPositionSave = useRef(0);
  const notify = (msg) => { setNotice(msg); window.setTimeout(() => setNotice(''), 4000); };

  const onMove = useCallback((data) => {
    setWorldInfo(prev => (prev.zone === data.zone && prev.nearPortal === data.nearPortal &&
      Math.abs(prev.x - data.x) < 2 && Math.abs(prev.z - data.z) < 2 ? prev : data));
    if (Date.now() - lastPositionSave.current > 6000) {
      savePosition({ x: data.x, z: data.z });
      lastPositionSave.current = Date.now();
    }
  }, []);

  useEffect(() => {
    const mapping = { KeyW: 'forward', ArrowUp: 'forward', KeyS: 'back', ArrowDown: 'back',
      KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
      Space: 'up', ControlLeft: 'down', ControlRight: 'down', KeyC: 'down', ShiftLeft: 'sprint', ShiftRight: 'sprint' };
    const down = (e) => {
      if (isTyping(e)) return;
      if (e.code === 'KeyF' && !e.repeat && stage === 'idle') setFlight(v => !v);
      if (mapping[e.code]) { e.preventDefault(); controls.current[mapping[e.code]] = true; }
    };
    const up = (e) => { if (mapping[e.code]) controls.current[mapping[e.code]] = false; };
    const reset = () => { controls.current = {}; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', reset);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', reset); };
  }, [stage]);

  useEffect(() => {
    if (stage !== 'reading' || !startedAt) return;
    const tick = () => {
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
      const sec = (seconds % 60).toString().padStart(2, '0');
      setElapsed(`${mins}:${sec}`);
    };
    tick();
    const timer = setInterval(tick, 5000);
    return () => clearInterval(timer);
  }, [stage, startedAt]);

  const beginReading = () => {
    const now = Date.now();
    setStartedAt(now);
    setReadingPlace(worldInfo.zone);
    saveSession(now, worldInfo.zone);
    setStage('reading');
    controls.current = {};
  };
  const discard = () => {
    clearSession(); setStage('idle'); setStartedAt(null);
    setTitle(''); setThought(''); setCategory('한 줄');
  };
  const saveRecord = () => {
    const minutes = Math.min(1440, Math.max(0, Math.floor((Date.now() - startedAt) / 60000)));
    const record = { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      date: new Date().toISOString(), category, place: readingPlace,
      title: title.trim(), thought: thought.trim(), durationMinutes: minutes };
    const next = mergeRecords(records, [record]);
    const okay = persistRecords(next);
    setRecords(next);
    discard();
    notify(okay ? '작은 독서의 순간이 기록되었어요. 🌱' : '브라우저 저장이 차단되어 있어요. 일지를 JSON으로 내보내 보관해주세요.');
  };
  const deleteRecord = (id) => {
    if (!window.confirm('선택한 기록을 삭제할까요?')) return;
    const next = records.filter(r => r.id !== id);
    if (!persistRecords(next)) notify('저장소에 반영되지 않았습니다.');
    setRecords(next);
  };
  const clearRecords = () => {
    if (!window.confirm('모든 독서 기록을 삭제할까요? 이 작업은 되돌릴 수 없습니다. 먼저 내보내기를 권장합니다.')) return;
    if (!persistRecords([])) notify('저장소에 반영되지 않았습니다.');
    setRecords([]);
  };
  const importRecords = async (file) => {
    try {
      if (file.size > 3_000_000) throw new Error('파일이 너무 큽니다.');
      const incoming = parseImport(await file.text());
      const next = mergeRecords(records, incoming);
      const okay = persistRecords(next);
      setRecords(next);
      notify(okay ? `${incoming.length}건을 확인하고 기존 기록과 병합했습니다.` : '가져왔지만 기기 저장에는 실패했습니다. 내보내기를 이용해주세요.');
    } catch (e) { notify(e.message || '가져오지 못했습니다.'); }
  };

  return <main className="app">
    <World controls={controls} flight={flight} reading={stage !== 'idle'} quality={quality}
      onMove={onMove} startPosition={initialPosition}/>
    <header className="topbar">
      <div className="brand"><small>BOOKS & SCENTS · METAVERSE 3.0</small><strong>문장 너머</strong>
        <span>한 줄의 독서, 한 걸음의 여행, 한순간의 사색.</span></div>
      <div className="top-actions">
        <button onClick={() => setJournalOpen(true)}>📖 나의 일지 <em>{records.length}</em></button>
        <a href={VILLAGE_URL} title="기존 책과향기 마을로 이동">마을로</a>
        <a className="home-link" href={HOME_URL}>홈</a>
      </div>
    </header>
    <div className="place-pill"><span className="status-dot"/>{worldInfo.zone}<span>· 개인 여행</span></div>
    <div className="hint-pill">끌어서 시점 회전 · WASD 이동 · F 비행 · Space 상승 · C 하강</div>
    <div className="left-actions">
      <button className="read-button" onClick={beginReading} disabled={stage !== 'idle'}>📖 잠시 책 읽기</button>
      <button className="secondary-button" onClick={() => setFlight(f => !f)} disabled={stage !== 'idle'}>{flight ? '🌿 착륙하기' : '🪁 자유 비행'}</button>
      <label className="quality">화질
        <select value={quality} onChange={e => setQuality(e.target.value)}>
          <option value="low">가볍게</option><option value="medium">보통</option><option value="high">높음</option>
        </select>
      </label>
    </div>
    {worldInfo.nearPortal && stage === 'idle' && <div className="portal-callout">
      <span>✧ 숲속 도서관의 포털</span><strong>다른 사람과 함께하는 세계가 그리우신가요?</strong>
      <a href={VILLAGE_URL}>책과향기 마을로 이동 ↗</a>
    </div>}
    <MobileControls controls={controls} flying={flight} onToggleFly={() => setFlight(f => !f)}/>
    {stage !== 'idle' && <ReadingSheet stage={stage} startedAt={startedAt} elapsed={elapsed}
      place={readingPlace} category={category} setCategory={setCategory}
      title={title} setTitle={setTitle} thought={thought} setThought={setThought}
      onFinish={() => setStage('finish')} onSave={saveRecord} onDiscard={discard} onBack={() => setStage('reading')}/>}
    {journalOpen && <Journal records={records} onDelete={deleteRecord} onClear={clearRecords}
      onImport={importRecords} onClose={() => setJournalOpen(false)}/>}
    {notice && <div role="status" className="toast">{notice}</div>}
  </main>;
}
