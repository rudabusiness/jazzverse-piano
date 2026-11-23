import manifestJson from '@/content/bebop-blues/manifest.json';
import type { MusicalNote } from './lesson';
import type { SyncAnchor } from './video-sync';

export type LessonManifest = {
  manifestId: string;
  lessonId: string;
  title: string;
  interactiveStatus: 'draft' | 'ready';
  video: { url: string; durationMs: number };
  syncAnchors: SyncAnchor[];
  notes: MusicalNote[];
};

export const bebopBluesManifest = manifestJson as LessonManifest;

export type WatchNote = { id: string; pitch: number; hand: 'left' | 'right'; atMs: number; endMs: number };

/** Notes on a beat axis: beat b sits at b*1000 and beatMs is 1000, so FallingNotes shows 4 beats ahead. */
export function watchTimeline(notes: readonly MusicalNote[]) {
  return {
    beatMs: 1000,
    notes: notes.map((note, index): WatchNote => ({
      id: `watch-${index}`, pitch: note.midi, hand: note.hand,
      atMs: note.startBeat * 1000, endMs: (note.startBeat + note.durationBeats) * 1000,
    })),
  };
}
