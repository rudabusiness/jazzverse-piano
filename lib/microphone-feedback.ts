import type { PracticeTimeline } from './lesson-timeline';

export type MicrophoneEvidence = Map<number, number[]>;

export function observeMicrophoneFrame(
  evidence: MicrophoneEvidence,
  practice: PracticeTimeline,
  atMs: number,
  pitches: readonly number[],
) {
  const index = practice.measures.findIndex(({ fromMs, toMs }) => atMs >= fromMs && atMs < toMs);
  if (index === -1) return;
  const expected = practice.measures[index].notes;
  const heard = expected.filter(note => pitches.includes(note.pitch)).map(note => note.pitch);
  // Compare simultaneous detections. Separate fragments cannot count as one chord.
  if (heard.length > (evidence.get(index)?.length ?? 0)) evidence.set(index, heard);
}

export function summarizeMicrophone(evidence: MicrophoneEvidence, practice: PracticeTimeline) {
  return practice.measures.map(({ chord, notes }, index) => {
    const heard = evidence.get(index) ?? [];
    return { chord, heard, uncertain: notes.map(note => note.pitch).filter(pitch => !heard.includes(pitch)) };
  });
}
