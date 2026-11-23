'use client';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AnchorPanel } from './anchor-panel';
import { NoteRoll } from './note-roll';
import { useVideoBeat } from './use-video-beat';
import { WatchView } from './watch-view';
import type { LessonManifest } from '@/lib/lesson-manifest';
import { buildPublished, hasEnoughAnchors, publishBlockedReason, rebaseNotes } from '@/lib/anchor-editor';
import type { SyncAnchor } from '@/lib/video-sync';
import { deleteNote, ensureIds, parseDraft, serializeDraft, type EditorNote } from '@/lib/note-editor';

const noop = () => {};
const devWrite = process.env.NODE_ENV === 'development';

function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/** Editor: the clip with the notes falling (reflecting edits) and a piano-roll to add, move and delete notes. */
export function EditorView({ manifest: initial, kind, fileName }: { manifest: LessonManifest; kind: 'published' | 'draft'; fileName: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [base, setBase] = useState(initial);
  const [source, setSource] = useState({ kind, fileName });
  const [notes, setNotes] = useState<EditorNote[]>(() => ensureIds(initial.notes));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snap, setSnap] = useState(true);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  // `anchors` is what the panel shows (may have < 2 while editing); `applied` is the last valid table, which the notes are expressed in.
  const [anchors, setAnchors] = useState<SyncAnchor[]>(initial.syncAnchors);
  const [applied, setApplied] = useState<SyncAnchor[]>(initial.syncAnchors);
  const [keepBeats, setKeepBeats] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const current = useMemo(() => ({ ...base, syncAnchors: applied }), [base, applied]);
  const live = useMemo(() => ({ ...current, notes }), [current, notes]);
  const currentBeat = useVideoBeat(videoRef, applied);
  const blocked = publishBlockedReason({ anchors, reviewedByHand: reviewed, noteCount: notes.length });
  const canSaveDraft = notes.length > 0 && hasEnoughAnchors(anchors);

  function changeAnchors(next: SyncAnchor[]) {
    setAnchors(next);
    if (!hasEnoughAnchors(next)) return;
    setNotes(n => rebaseNotes(n, applied, next, keepBeats ? 'keep-beats' : 'keep-time'));
    setApplied(next);
  }
  const draft = source.kind === 'draft';

  const remove = () => { if (selectedId) { setNotes(n => deleteNote(n, selectedId)); setSelectedId(null); } };

  async function save() {
    const text = serializeDraft(current, notes);
    download(text, 'draft.json');
    let message = 'draft.json descarregado.';
    let ok = true;
    if (devWrite) {
      try {
        const res = await fetch('/api/editor/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: text });
        if (res.ok) message += ' Gravado também em content/bebop-blues/draft.json.';
        else { ok = false; message += ` Não gravou em content/: ${(await res.json().catch(() => null))?.reason ?? res.status}.`; }
      } catch { ok = false; message += ' Não gravou em content/: sem ligação ao servidor.'; }
    }
    setStatus({ ok, text: message });
  }

  async function publish() {
    const built = buildPublished(base, notes, anchors, reviewed);
    if (!built.ok) { setStatus({ ok: false, text: built.reason }); return; }
    download(built.text, 'published.json');
    let message = 'published.json descarregado (o rascunho não foi alterado).';
    let ok = true;
    if (devWrite) {
      try {
        const res = await fetch('/api/editor/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: built.text });
        if (res.ok) message += ' Gravado também em content/bebop-blues/published.json.';
        else { ok = false; message += ` Não gravou em content/: ${(await res.json().catch(() => null))?.reason ?? res.status}.`; }
      } catch { ok = false; message += ' Não gravou em content/: sem ligação ao servidor.'; }
    }
    setStatus({ ok, text: message });
  }

  async function open(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const parsed = parseDraft(await file.text());
    if (!parsed.ok) { setStatus({ ok: false, text: `${file.name}: ${parsed.reason}` }); return; }
    setBase(parsed.manifest); setNotes(parsed.notes); setAnchors(parsed.manifest.syncAnchors); setApplied(parsed.manifest.syncAnchors); setReviewed(false); setSelectedId(null); setSource({ kind: 'draft', fileName: file.name });
    setStatus({ ok: true, text: `${file.name} aberto: ${parsed.notes.length} notas.` });
  }

  return <div className="editor">
    <div className={`editor-banner ${draft ? 'editor-draft' : 'editor-published'}`} role="status">
      <strong>{draft ? 'Rascunho' : 'Publicado'} — {source.fileName}</strong>
      {draft && <p>Transcrição por rever: as notas podem estar erradas ou em falta. Guardar gera sempre um rascunho (não revisto), nunca published.json.</p>}
      <p>{notes.length} notas · {applied.length} âncoras: {applied.map(a => `${(a.mediaTimeMs / 1000).toFixed(2)} s ↔ beat ${a.beat}`).join(' · ')}</p>
    </div>
    <video ref={videoRef} className="lesson-video" controls playsInline preload="metadata" src={base.video.url}>
      O teu navegador não suporta vídeo HTML5.
    </video>
    <div className="player-panel">
      <div className="section-head"><h2>Notas a cair</h2></div>
      <WatchView manifest={live} videoRef={videoRef} onPlay={noop} />
    </div>
    <div className="player-panel">
      <div className="section-head"><h2>Âncoras de sincronismo</h2></div>
      <AnchorPanel anchors={anchors} currentBeat={currentBeat} videoRef={videoRef} onChange={changeAnchors} keepBeats={keepBeats} setKeepBeats={setKeepBeats} />
    </div>
    <div className="player-panel">
      <div className="section-head"><h2>Piano-roll</h2></div>
      <div className="player-controls editor-tools">
        <button type="button" className="primary" data-testid="btn-save-draft" onClick={save} disabled={!canSaveDraft} title={canSaveDraft ? undefined : 'Precisa de notas e de pelo menos 2 âncoras válidas'}>Guardar rascunho</button>
        <button type="button" data-testid="btn-delete-note" onClick={remove} disabled={!selectedId}>Apagar nota</button>
        <label className="editor-check"><input type="checkbox" checked={snap} onChange={e => setSnap(e.target.checked)} /> Snap 1/8 de beat</label>
        <label className="editor-check">Abrir JSON <input type="file" accept=".json,application/json" data-testid="input-open-json" onChange={open} /></label>
      </div>
      <div className="player-controls editor-tools">
        <label className="editor-check"><input type="checkbox" data-testid="chk-reviewed" checked={reviewed} onChange={e => setReviewed(e.target.checked)} /> Revisto à mão</label>
        <button type="button" className="primary" data-testid="btn-publish" onClick={publish} disabled={blocked !== null}>Publicar</button>
        {blocked && <span className="editor-err" data-testid="publish-blocked-reason">{blocked}</span>}
      </div>
      {status && <p className={status.ok ? 'editor-ok' : 'editor-err'} role="status" data-testid="editor-status">{status.text}</p>}
      <p className="muted">Clica numa nota para a selecionar e arrasta-a no tempo e na altura; clica num espaço vazio para criar uma nota (0,5 beat); Delete/Backspace apaga a selecionada; clica na régua para ir a esse ponto do vídeo.</p>
      <NoteRoll base={current} notes={notes} setNotes={setNotes} selectedId={selectedId} setSelectedId={setSelectedId} snap={snap} videoRef={videoRef} onDelete={remove} />
    </div>
  </div>;
}
