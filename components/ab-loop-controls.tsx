'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { formatLoopTime, isValidLoop, shouldWrap, type LoopPoint } from '@/lib/ab-loop';

const stopEvents = ['pause', 'ended'] as const;
const passiveEvents = ['seeked', 'timeupdate'] as const;

/** A–B loop over the <video>. The video's currentTime stays the only clock, so falling notes follow by themselves. */
export function AbLoopControls({ videoRef }: { videoRef: RefObject<HTMLVideoElement | null> }) {
  const [a, setA] = useState<LoopPoint>(null);
  const [b, setB] = useState<LoopPoint>(null);
  const [enabled, setEnabled] = useState(false);
  const valid = isValidLoop(a, b);
  const live = useRef({ a, b, enabled: enabled && valid });
  live.current = { a, b, enabled: enabled && valid };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let frame = 0;
    const check = () => {
      const { a: from, b: to, enabled: on } = live.current;
      if (from !== null && shouldWrap(video.currentTime, from, to, on)) video.currentTime = from;
    };
    const loop = () => { check(); frame = requestAnimationFrame(loop); };
    const start = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const passive = () => { if (!frame) check(); };
    video.addEventListener('play', start);
    video.addEventListener('playing', start);
    stopEvents.forEach(name => video.addEventListener(name, stop));
    passiveEvents.forEach(name => video.addEventListener(name, passive));
    if (!video.paused && !video.ended) start();
    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener('play', start);
      video.removeEventListener('playing', start);
      stopEvents.forEach(name => video.removeEventListener(name, stop));
      passiveEvents.forEach(name => video.removeEventListener(name, passive));
    };
  }, [videoRef]);

  const now = () => videoRef.current?.currentTime ?? 0;
  const clear = () => { setA(null); setB(null); setEnabled(false); };
  return <div className="ab-loop" role="group" aria-label="Loop A–B">
    <button data-testid="btn-mark-a" onClick={() => setA(now())}>Marcar A</button>
    <span data-testid="ab-a-label" className="ab-time">A {formatLoopTime(a)}</span>
    <button data-testid="btn-mark-b" onClick={() => setB(now())}>Marcar B</button>
    <span data-testid="ab-b-label" className="ab-time">B {formatLoopTime(b)}</span>
    <button data-testid="btn-clear-ab" onClick={clear}>Limpar</button>
    <label className="ab-toggle">
      <input data-testid="toggle-ab-loop" type="checkbox" role="switch" checked={enabled && valid} disabled={!valid} onChange={event => setEnabled(event.target.checked)} />
      Loop A–B
    </label>
    {a !== null && b !== null && !valid && <span className="muted" role="status">B tem de ficar pelo menos 0,5 s depois de A.</span>}
  </div>;
}
