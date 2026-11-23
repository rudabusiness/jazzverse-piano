'use client';
import { memo, useEffect, useMemo, useRef, type Dispatch, type KeyboardEvent, type PointerEvent, type RefObject, type SetStateAction } from 'react';
import { useVideoBeat } from './use-video-beat';
import type { LessonManifest } from '@/lib/lesson-manifest';
import { addNote, moveNote, sortNotes, type EditorNote } from '@/lib/note-editor';
import { timeAtBeat } from '@/lib/video-sync';

const PX = 32;       // pixels per beat
const ROW = 9;       // pixels per semitone
const RULER = 22;    // ruler height
const DRAG_THRESHOLD = 3;

type Drag = { id: string; x: number; y: number; startBeat: number; midi: number; moved: boolean };

const Cursor = memo(function Cursor({ anchors, videoRef, scrollRef }: { anchors: LessonManifest['syncAnchors']; videoRef: RefObject<HTMLVideoElement | null>; scrollRef: RefObject<HTMLDivElement | null> }) {
  const beat = useVideoBeat(videoRef, anchors);
  const x = beat * PX;
  useEffect(() => {
    const box = scrollRef.current;
    const video = videoRef.current;
    if (!box || !video || video.paused) return;
    if (x < box.scrollLeft || x > box.scrollLeft + box.clientWidth - 40) box.scrollLeft = Math.max(0, x - 40);
  }, [x, scrollRef, videoRef]);
  return <div className="roll-cursor" data-testid="roll-cursor" style={{ left: x }} aria-hidden="true" />;
});

/** Simple piano-roll: beats on X, MIDI pitch on Y, a cursor following the video; select, drag, create and delete notes. */
export function NoteRoll({ base, notes, setNotes, selectedId, setSelectedId, snap, videoRef, onDelete }: {
  base: LessonManifest; notes: EditorNote[]; setNotes: Dispatch<SetStateAction<EditorNote[]>>;
  selectedId: string | null; setSelectedId: (id: string | null) => void; snap: boolean;
  videoRef: RefObject<HTMLVideoElement | null>; onDelete: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<Drag | null>(null);

  // The visible range is fixed when a file is opened so notes do not jump while editing.
  const { lo, hi, totalBeats } = useMemo(() => {
    const midis = base.notes.map(n => n.midi);
    const ends = base.notes.map(n => n.startBeat + n.durationBeats);
    return {
      lo: Math.max(0, Math.min(36, ...midis) - 2), hi: Math.min(127, Math.max(96, ...midis) + 2),
      totalBeats: Math.ceil(Math.max(base.syncAnchors[base.syncAnchors.length - 1].beat, ...ends)) + 4,
    };
  }, [base]);
  const limits = useMemo(() => ({ snap, minMidi: lo, maxMidi: hi, maxStartBeat: totalBeats - 0.5 }), [snap, lo, hi, totalBeats]);
  const height = (hi - lo + 1) * ROW;

  useEffect(() => { // start vertically around the middle of the notes
    const box = scrollRef.current;
    if (!box || base.notes.length === 0) return;
    const sorted = base.notes.map(n => n.midi).sort((a, b) => a - b);
    const mid = sorted[Math.floor(sorted.length / 2)];
    box.scrollTop = Math.max(0, RULER + (hi - mid) * ROW - box.clientHeight / 2);
  }, [base, hi]);

  const pitchAt = (y: number) => hi - Math.floor(y / ROW);

  // The drag lives in window listeners (not on the note nodes): re-rendering can never lose it, and
  // it ends on pointerup/pointercancel or as soon as a move arrives with no button pressed.
  const stopDrag = useRef<(() => void) | null>(null);
  useEffect(() => () => stopDrag.current?.(), []);

  function down(event: PointerEvent<HTMLDivElement>, note: EditorNote) {
    if (event.button !== 0) return;
    event.stopPropagation();
    stopDrag.current?.();
    scrollRef.current?.focus({ preventScroll: true });
    setSelectedId(note.id);
    const pointerId = event.pointerId;
    const d: Drag = { id: note.id, x: event.clientX, y: event.clientY, startBeat: note.startBeat, midi: note.midi, moved: false };
    drag.current = d;

    const onMove = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      if (e.buttons === 0) { end(); return; }
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      const to = { startBeat: d.startBeat + dx / PX, midi: d.midi - Math.round(dy / ROW) };
      setNotes(current => moveNote(current, d.id, to, limits));
    };
    const onEnd = (e: globalThis.PointerEvent) => { if (e.pointerId === pointerId) end(); };
    function end() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      if (drag.current === d) drag.current = null;
      stopDrag.current = null;
      if (d.moved) setNotes(current => sortNotes(current)); // order only changes once the gesture is over
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    stopDrag.current = end;
  }

  function create(event: PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return; // only the empty surface, never a note
    const rect = event.currentTarget.getBoundingClientRect();
    const at = { startBeat: (event.clientX - rect.left) / PX, midi: pitchAt(event.clientY - rect.top) };
    const added = addNote(notes, at, { snap });
    setNotes(added.notes);
    setSelectedId(added.note.id);
    scrollRef.current?.focus({ preventScroll: true });
  }

  function seek(event: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const beat = Math.max(0, (event.clientX - rect.left) / PX);
    video.currentTime = Math.max(0, Math.min(timeAtBeat(base.syncAnchors, beat) / 1000, video.duration || Infinity));
  }

  function key(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) { event.preventDefault(); onDelete(); }
    else if (event.key === 'Escape') setSelectedId(null);
  }

  const bars = Math.floor(totalBeats / 4);
  return <div className="note-roll" data-testid="editor-roll" ref={scrollRef} tabIndex={0} onKeyDown={key} aria-label="Piano-roll de edição de notas">
    <div className="roll-content" style={{ width: totalBeats * PX, height: height + RULER }}>
      <div className="roll-ruler" style={{ height: RULER }} onClick={seek} data-testid="roll-ruler" title="Clica para ir a este ponto do vídeo">
        {Array.from({ length: bars }, (_, i) => <span key={i} style={{ left: i * 4 * PX }}>{i * 4}</span>)}
      </div>
      <div className="roll-surface" style={{ top: RULER, height, backgroundSize: `${PX}px ${ROW * 12}px, ${PX * 4}px ${ROW * 12}px` }} onClick={create} data-testid="roll-surface">
        {notes.map(note => <div
          key={note.id}
          data-testid={`note-${note.id}`}
          className={`roll-note ${note.hand}${note.id === selectedId ? ' selected' : ''}`}
          style={{ left: note.startBeat * PX, top: (hi - note.midi) * ROW, width: Math.max(4, note.durationBeats * PX), height: ROW - 1 }}
          title={`MIDI ${note.midi} · beat ${note.startBeat.toFixed(3)}`}
          onPointerDown={e => down(e, note)}
          onClick={e => e.stopPropagation()}
        />)}
      </div>
      <Cursor anchors={base.syncAnchors} videoRef={videoRef} scrollRef={scrollRef} />
    </div>
  </div>;
}
