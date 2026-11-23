import { Midi } from '@tonejs/midi';
import { beatAtTime, type SyncAnchor } from './video-sync';
import type { MusicalNote } from './lesson';

/** A manifest note with a stable id (assigned in time/pitch order). */
export type ImportedNote = MusicalNote & { id: string };

/** Notes below middle C (MIDI 60) go to the left hand. */
const SPLIT_MIDI = 60;

function round(value: number) {
  return Math.round(value * 1e4) / 1e4;
}

/**
 * Reads .mid bytes whose times are seconds from the clip start (as basic-pitch writes them)
 * and converts them to manifest notes on the beat axis defined by `anchors`.
 * Pure: no I/O. Sorted by start beat, then pitch.
 */
export function midiBytesToNotes(bytes: Uint8Array, anchors: readonly SyncAnchor[]): ImportedNote[] {
  const midi = new Midi(bytes);
  return midi.tracks
    .flatMap(track => track.notes)
    .map(n => {
      const startBeat = beatAtTime(anchors, n.time * 1000);
      const endBeat = beatAtTime(anchors, (n.time + n.duration) * 1000);
      const hand: 'left' | 'right' = n.midi < SPLIT_MIDI ? 'left' : 'right';
      return { midi: n.midi, startBeat, durationBeats: endBeat - startBeat, hand };
    })
    .sort((a, b) => a.startBeat - b.startBeat || a.midi - b.midi)
    .map((n, i) => ({
      id: `n${String(i + 1).padStart(4, '0')}`,
      midi: n.midi,
      startBeat: round(n.startBeat),
      durationBeats: round(n.durationBeats),
      hand: n.hand,
    }));
}
