'use client';
import { useState, type RefObject } from 'react';
import { addAnchor, deleteAnchor, updateAnchor } from '@/lib/anchor-editor';
import type { SyncAnchor } from '@/lib/video-sync';

const nowMs = (videoRef: RefObject<HTMLVideoElement | null>) => Math.round((videoRef.current?.currentTime ?? 0) * 1000);

function AnchorRow({ index, anchor, onUpdate, onUseNow, onDelete }: {
  index: number; anchor: SyncAnchor;
  onUpdate: (change: Partial<SyncAnchor>) => void; onUseNow: () => void; onDelete: () => void;
}) {
  // Text being typed; committed on blur / Enter so half-typed numbers never reach the validation.
  const [time, setTime] = useState<string | null>(null);
  const [beat, setBeat] = useState<string | null>(null);
  const commit = () => {
    const change: Partial<SyncAnchor> = {};
    if (time !== null && time.trim() !== '') change.mediaTimeMs = Number(time) * 1000;
    if (beat !== null && beat.trim() !== '') change.beat = Number(beat);
    setTime(null); setBeat(null);
    if (change.mediaTimeMs !== undefined || change.beat !== undefined) onUpdate(change);
  };
  const enter = (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === 'Enter') event.currentTarget.blur(); };
  return <li className="anchor-row" data-testid={`anchor-row-${index}`}>
    <label>Tempo (s) <input type="number" step="0.001" min="0" data-testid={`input-anchor-time-${index}`} value={time ?? String(anchor.mediaTimeMs / 1000)}
      onChange={e => setTime(e.target.value)} onBlur={commit} onKeyDown={enter} /></label>
    <label>Beat <input type="number" step="0.25" data-testid={`input-anchor-beat-${index}`} value={beat ?? String(anchor.beat)}
      onChange={e => setBeat(e.target.value)} onBlur={commit} onKeyDown={enter} /></label>
    <button type="button" data-testid={`btn-anchor-now-${index}`} onClick={onUseNow}>Usar tempo atual do vídeo</button>
    <button type="button" data-testid={`btn-delete-anchor-${index}`} onClick={onDelete}>Apagar</button>
  </li>;
}

/** Sync anchors (video time ↔ beat): list, create at the video's current time, move, delete. `onChange` receives only valid lists or a refusal reason. */
export function AnchorPanel({ anchors, currentBeat, videoRef, onChange, keepBeats, setKeepBeats }: {
  anchors: readonly SyncAnchor[]; currentBeat: number; videoRef: RefObject<HTMLVideoElement | null>;
  onChange: (next: SyncAnchor[]) => void; keepBeats: boolean; setKeepBeats: (value: boolean) => void;
}) {
  const [beatText, setBeatText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const suggestion = String(Math.round(currentBeat * 100) / 100);
  const accept = (result: { ok: true; anchors: SyncAnchor[] } | { ok: false; reason: string }) => {
    if (result.ok) { setError(null); onChange(result.anchors); } else setError(result.reason);
    return result.ok;
  };
  const add = () => {
    const beat = Number((beatText ?? suggestion).trim() === '' ? Number.NaN : beatText ?? suggestion);
    if (accept(addAnchor(anchors, { mediaTimeMs: nowMs(videoRef), beat }))) setBeatText(null);
  };
  return <div className="anchor-panel" data-testid="anchor-panel">
    <p className="muted">Uma âncora diz «neste instante do vídeo estamos neste beat». Precisa de pelo menos 2 (tempo e beat sempre a crescer). Por omissão, ao mudar as âncoras as notas mantêm o seu tempo no vídeo.</p>
    <ul className="anchor-list">
      {anchors.map((anchor, i) => <AnchorRow key={`${i}-${anchor.mediaTimeMs}-${anchor.beat}`} index={i} anchor={anchor}
        onUpdate={change => accept(updateAnchor(anchors, i, change))}
        onUseNow={() => accept(updateAnchor(anchors, i, { mediaTimeMs: nowMs(videoRef) }))}
        onDelete={() => { setError(null); onChange(deleteAnchor(anchors, i)); }} />)}
    </ul>
    <div className="player-controls">
      <label>Beat da nova âncora <input type="number" step="0.25" data-testid="input-anchor-beat" value={beatText ?? suggestion} onChange={e => setBeatText(e.target.value)} /></label>
      <button type="button" className="primary" data-testid="btn-add-anchor" onClick={add}>Âncora aqui</button>
      <label className="editor-check"><input type="checkbox" data-testid="chk-keep-beats" checked={keepBeats} onChange={e => setKeepBeats(e.target.checked)} /> Manter os beats das notas (em vez do tempo no vídeo)</label>
    </div>
    {error && <p className="editor-err" role="alert" data-testid="anchor-error">{error}</p>}
    {anchors.length < 2 && <p className="editor-err" data-testid="anchor-warning">Só {anchors.length} âncora(s): o sincronismo mantém a última tabela válida até haver 2.</p>}
  </div>;
}
