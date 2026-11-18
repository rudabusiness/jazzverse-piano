import { demoLesson } from './lesson';
import { DEFAULT_WINDOW_MS, evaluateOnsets, type PlayedOnset } from './music-engine';

const chords = [
  { chord: 'Dm7', allowedExtraPitchClasses: [4, 7, 11] },
  { chord: 'G7', allowedExtraPitchClasses: [9, 0, 4] },
  { chord: 'Cmaj7', allowedExtraPitchClasses: [2, 9] },
];

export type MeasureRange = { first: number; last: number };

export const measureRanges = chords.flatMap((_, first) =>
  chords.slice(first).map((_, offset) => ({ first, last: first + offset })),
);

export function createPracticeTimeline(bpm: number, range?: MeasureRange) {
  if (!Number.isFinite(bpm) || bpm <= 0) throw new RangeError('Invalid practice tempo');
  const beatMs = 60_000 / bpm;
  const [beatsPerMeasure] = demoLesson.timeSignature;
  if (range && !measureRanges.some(({ first, last }) => first === range.first && last === range.last)) {
    throw new RangeError('Invalid measure range');
  }
  const firstMeasure = range?.first ?? 0;
  const startBeat = firstMeasure * beatsPerMeasure;
  const durationBeats = ((range?.last ?? chords.length - 1) - firstMeasure + 1) * beatsPerMeasure;
  const durationMs = durationBeats * beatMs;
  const notes = demoLesson.notes.map((note, index) => ({
    ...note,
    id: `note-${index}`,
    pitch: note.midi,
    atMs: (note.startBeat - startBeat) * beatMs,
    endMs: (note.startBeat - startBeat + note.durationBeats) * beatMs,
  })).filter(note => note.atMs >= 0 && note.atMs < durationMs);
  const measures = chords.slice(firstMeasure, firstMeasure + durationBeats / beatsPerMeasure).map((harmony, index) => {
    const fromMs = index * beatsPerMeasure * beatMs;
    const toMs = (index + 1) * beatsPerMeasure * beatMs;
    return {
      ...harmony, fromMs, toMs,
      notes: notes.filter(note => note.atMs >= fromMs && note.atMs < toMs),
    };
  });
  const endMs = Math.max(durationMs, ...notes.map(note => note.atMs + DEFAULT_WINDOW_MS));

  return {
    bpm,
    range,
    startBeat,
    durationBeats,
    beatMs,
    countInMs: beatsPerMeasure * beatMs,
    durationMs,
    endMs,
    notes,
    measures,
  };
}

export const timeline = createPracticeTimeline(demoLesson.bpm);
export type PracticeTimeline = ReturnType<typeof createPracticeTimeline>;
export type TimelineNote = PracticeTimeline['notes'][number];

export function positionAt(atMs: number, practice = timeline) {
  return {
    beat: Math.min(atMs, practice.durationMs) / practice.beatMs,
    measure: practice.measures.find(measure => atMs >= measure.fromMs && atMs < measure.toMs),
    activeNotes: practice.notes.filter(note => atMs >= note.atMs && atMs < note.endMs),
  };
}

/** A running segment anchors both animation samples and Web MIDI event timestamps. */
export type ClockSegment = { startedAt: number; offsetMs: number };

export function timeAt(segment: ClockSegment, timestamp: number) {
  return segment.offsetMs + timestamp - segment.startedAt;
}

export function captureOnset(segment: ClockSegment, timestamp: number, pitch: number, practice = timeline): PlayedOnset | undefined {
  if (timestamp < segment.startedAt) return;
  const atMs = timeAt(segment, timestamp);
  if (atMs >= practice.endMs) return;
  // During count-in, only allow early attacks within the matching window for beat one.
  if (atMs < 0 && (atMs < -DEFAULT_WINDOW_MS || !practice.notes.some(note => note.atMs === 0 && note.pitch === pitch))) return;
  return { pitch, atMs };
}

export function evaluatePractice(performed: readonly PlayedOnset[], practice = timeline) {
  const targets = practice.notes.map(({ id, pitch, atMs }) => ({ id, pitch, atMs }));
  return evaluateOnsets(targets, performed, practice.measures);
}

/** Preserve the beat grid if a frame arrives after one or more loop boundaries. */
export function advanceLoop(segment: ClockSegment, timestamp: number, practice: PracticeTimeline): ClockSegment | undefined {
  const elapsed = timeAt(segment, timestamp);
  if (!practice.range || elapsed < practice.durationMs) return;
  return {
    startedAt: segment.startedAt - segment.offsetMs + Math.floor(elapsed / practice.durationMs) * practice.durationMs,
    offsetMs: 0,
  };
}
