import type { LessonManifest } from './lesson-manifest';
import { createPracticeTimeline, type PracticeSource, type PracticeTimeline } from './lesson-timeline';
import { normalizeAnchors } from './video-sync';

const BEATS_PER_MEASURE = 4;
export const PRACTICE_TEMPO_PERCENTS = [50, 75, 100, 120] as const;

export type PublishedPractice = {
  /** Original tempo derived from the sync anchors (beats per minute of the teacher's video). */
  bpm: number;
  /** 50/75/100/120 % of `bpm`. */
  tempos: number[];
  source: PracticeSource;
  /** Practice timeline at 100 % tempo. */
  timeline: PracticeTimeline;
};

/** Average tempo across the first and last sync anchor: Δbeat per Δvideo-minute. */
export function bpmFromAnchors(manifest: Pick<LessonManifest, 'syncAnchors'>): number {
  const anchors = normalizeAnchors(manifest.syncAnchors);
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  return 60_000 * (last.beat - first.beat) / (last.mediaTimeMs - first.mediaTimeMs);
}

/**
 * Pure adapter: validated published manifest → exercise for the existing practice engine.
 * Notes keep their beat positions (shifted by whole measures only if some start before beat 0),
 * ids are the manifest ids (or a stable `p<index>-<midi>-<startBeat>`), and duplicates are made unique.
 * The tempo is the anchors' average, so a video with rubato is practised on a straight grid.
 * Throws RangeError when the manifest cannot be practised (callers must pass a loadPublished() result).
 */
export function publishedToPractice(manifest: LessonManifest): PublishedPractice {
  if (manifest.notes.length === 0) throw new RangeError('Manifest has no notes');
  const bpm = bpmFromAnchors(manifest);
  if (!Number.isFinite(bpm) || bpm <= 0) throw new RangeError('Manifest tempo is not positive');

  const minStart = Math.min(...manifest.notes.map(note => note.startBeat));
  const origin = minStart < 0 ? Math.floor(minStart / BEATS_PER_MEASURE) * BEATS_PER_MEASURE : 0;
  const used = new Set<string>();
  const notes = manifest.notes.map((note, index) => {
    const startBeat = note.startBeat - origin;
    let id = (note as { id?: string }).id || `p${index}-${note.midi}-${startBeat}`;
    if (used.has(id)) id = `${id}#${index}`;
    used.add(id);
    return { id, midi: note.midi, startBeat, durationBeats: note.durationBeats, hand: note.hand };
  });
  const endBeat = Math.max(...notes.map(note => note.startBeat + note.durationBeats));
  const measureCount = Math.max(1, Math.ceil(endBeat / BEATS_PER_MEASURE));
  const source: PracticeSource = {
    timeSignature: [BEATS_PER_MEASURE, 4],
    // Published notes carry no chord symbols: no jazz-tension allowance, only the listed notes count.
    harmony: Array.from({ length: measureCount }, () => ({ chord: '—', allowedExtraPitchClasses: [] })),
    notes,
  };
  return {
    bpm,
    tempos: PRACTICE_TEMPO_PERCENTS.map(percent => bpm * percent / 100),
    source,
    timeline: createPracticeTimeline(bpm, undefined, source),
  };
}
