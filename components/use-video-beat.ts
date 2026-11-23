'use client';
import { useEffect, useState, type RefObject } from 'react';
import { beatAtTime, type SyncAnchor } from '@/lib/video-sync';

const settled = ['pause', 'ended', 'waiting'] as const;
const passive = ['seeking', 'seeked', 'timeupdate', 'loadedmetadata'] as const;

/** Current beat of the <video> through the anchors: rAF while playing, plus pause/seeked/timeupdate etc. */
export function useVideoBeat(videoRef: RefObject<HTMLVideoElement | null>, anchors: readonly SyncAnchor[]): number {
  const [beat, setBeat] = useState(() => beatAtTime(anchors, 0));
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let frame = 0;
    const sync = () => setBeat(beatAtTime(anchors, video.currentTime * 1000));
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
  }, [videoRef, anchors]);
  return beat;
}
