'use client';
import { useMemo, type RefObject } from 'react';
import { FallingNotes } from './practice-views';
import { useVideoBeat } from './use-video-beat';
import { watchTimeline, type LessonManifest } from '@/lib/lesson-manifest';

/** Falling notes clocked by the <video> through the manifest's anchors. */
export function WatchView({ manifest, videoRef, onPlay }: { manifest: LessonManifest; videoRef: RefObject<HTMLVideoElement | null>; onPlay: (pitch: number) => void }) {
  const beat = useVideoBeat(videoRef, manifest.syncAnchors);
  const practice = useMemo(() => watchTimeline(manifest.notes), [manifest]);
  return <>
    <FallingNotes atMs={beat * practice.beatMs} active={[]} practice={practice} onPlay={onPlay} keyboardDisabled={false} />
  </>;
}
