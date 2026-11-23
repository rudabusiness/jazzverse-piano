'use client';
import { useRef } from 'react';
import { WatchView } from './watch-view';
import type { LessonManifest } from '@/lib/lesson-manifest';

const noop = () => {};

/** Read-only: the clip with the file's notes falling, clocked by the video through the file's own anchors. */
export function EditorView({ manifest, kind, fileName }: { manifest: LessonManifest; kind: 'published' | 'draft'; fileName: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const draft = kind === 'draft';
  return <div className="editor">
    <div className={`editor-banner ${draft ? 'editor-draft' : 'editor-published'}`} role="status">
      <strong>{draft ? 'Rascunho da IA' : 'Publicado'} — {fileName}</strong>
      {draft && <p>Transcrição automática por rever: as notas podem estar erradas ou em falta. Só leitura.</p>}
      <p>{manifest.notes.length} notas · {manifest.syncAnchors.length} âncoras: {manifest.syncAnchors.map(a => `${(a.mediaTimeMs / 1000).toFixed(2)} s ↔ beat ${a.beat}`).join(' · ')}</p>
    </div>
    <video ref={videoRef} className="lesson-video" controls playsInline preload="metadata" src={manifest.video.url}>
      O teu navegador não suporta vídeo HTML5.
    </video>
    <div className="player-panel">
      <div className="section-head"><h2>Notas a cair</h2></div>
      <WatchView manifest={manifest} videoRef={videoRef} onPlay={noop} />
    </div>
  </div>;
}
