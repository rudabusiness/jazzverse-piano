'use client';
import { useEffect, useMemo, useState, type RefObject } from 'react';
import { FallingNotes } from './practice-views';
import { watchTimeline, type LessonManifest } from '@/lib/lesson-manifest';
import { beatAtTime } from '@/lib/video-sync';

const settled = ['pause', 'ended', 'waiting'] as const;
const passive = ['seeking', 'seeked', 'timeupdate', 'loadedmetadata'] as const;

/** Falling notes clocked by the <video>: rAF while playing, plus pause/seeked/timeupdate etc. */
export function WatchView({ manifest, videoRef, onPlay }: { manifest: LessonManifest; videoRef: RefObject<HTMLVideoElement | null>; onPlay: (pitch: number) => void }) {
  const [beat, setBeat] = useState(() => beatAtTime(manifest.syncAnchors, 0));
  const practice = useMemo(() => watchTimeline(manifest.notes), [manifest]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let frame = 0;
    const sync = () => setBeat(beatAtTime(manifest.syncAnchors, video.currentTime * 1000));
    const loop = () => { sync(); frame = requestAnimationFrame(loop); };
    const start = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; sync(); };
    const refresh = () => { if (!frame) sync(); };
    video.addEventListener('play', start);
    video.addEventListener('playing', start);
    settled.forEach(name => video.addEventListener(name, stop));
    passive.forEach(name => video.addEventListener(name, refresh));
    if (!video.paused && !video.ended) start(); else sync();
    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener('play', start);
      video.removeEventListener('playing', start);
      settled.forEach(name => video.removeEventListener(name, stop));
      passive.forEach(name => video.removeEventListener(name, refresh));
    };
  }, [videoRef, manifest]);

  return <>
    <FallingNotes atMs={beat * practice.beatMs} active={[]} practice={practice} onPlay={onPlay} keyboardDisabled={false} />
  </>;
}
