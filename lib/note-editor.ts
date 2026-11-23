import type { MusicalNote } from './lesson';
import type { LessonManifest } from './lesson-manifest';
import { validateShape } from './published-loader';

/** A manifest note that always carries a unique id (the editor needs a stable handle). */
export type EditorNote = MusicalNote & { id: string };

export const NEW_NOTE_BEATS = 0.5;
export const SNAP_BEATS = 1 / 8;
/** Hand rule for notes created in the editor: below middle C (MIDI 60) is the left hand. */
export const handForMidi = (midi: number): 'left' | 'right' => (midi < 60 ? 'left' : 'right');

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));
const round4 = (value: number) => Math.round(value * 10000) / 10000;
export const snapBeat = (beat: number, step = SNAP_BEATS) => Math.round(beat / step) * step;

/** Time order, then pitch, then id — deterministic so exported files diff cleanly. */
export function sortNotes<T extends EditorNote>(notes: readonly T[]): T[] {
  return [...notes].sort((a, b) => a.startBeat - b.startBeat || a.midi - b.midi || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Next free id "n0001"-style: above every numeric id in use and guaranteed not to collide with any id. */
export function newId(notes: readonly { id?: string }[]): string {
  const used = new Set(notes.map(n => n.id));
  let next = 1;
  for (const id of used) {
    const m = typeof id === 'string' ? /^n(\d+)$/.exec(id) : null;
    if (m) next = Math.max(next, Number(m[1]) + 1);
  }
  let id = `n${String(next).padStart(4, '0')}`;
  while (used.has(id)) { next += 1; id = `n${String(next).padStart(4, '0')}`; }
  return id;
}

/** Gives every note a unique id (keeps existing unique ids, replaces missing/duplicate ones) and sorts. */
export function ensureIds(notes: readonly (MusicalNote & { id?: string })[]): EditorNote[] {
  const taken = new Set<string>();
  const keep = notes.map(n => (typeof n.id === 'string' && n.id.length > 0 && !taken.has(n.id) ? (taken.add(n.id), n.id) : undefined));
  const out: EditorNote[] = [];
  notes.forEach((n, i) => {
    const id = keep[i] ?? newId([...taken].map(t => ({ id: t })));
    taken.add(id);
    out.push({ ...n, id });
  });
  return sortNotes(out);
}

/** Adds a note (default 0.5 beat, hand by pitch). Returns the new list and the new note. */
export function addNote(notes: readonly EditorNote[], at: { startBeat: number; midi: number }, opts: { snap?: boolean; durationBeats?: number } = {}) {
  const midi = clamp(Math.round(at.midi), 0, 127);
  const startBeat = round4(Math.max(0, opts.snap ? snapBeat(at.startBeat) : at.startBeat));
  const note: EditorNote = { id: newId(notes), midi, startBeat, durationBeats: opts.durationBeats ?? NEW_NOTE_BEATS, hand: handForMidi(midi) };
  return { notes: sortNotes([...notes, note]), note };
}

export type MoveLimits = { snap?: boolean; minMidi?: number; maxMidi?: number; maxStartBeat?: number };

/** Sets a note's start and/or pitch (absolute values). Pitch is always a whole semitone; time snaps to 1/8 beat if asked. The hand is kept.
 *  The list order is NOT changed (the UI keeps the same DOM nodes while dragging); call sortNotes when the gesture ends. Export sorts anyway. */
export function moveNote(notes: readonly EditorNote[], id: string, to: { startBeat?: number; midi?: number }, limits: MoveLimits = {}): EditorNote[] {
  if (!notes.some(n => n.id === id)) return [...notes];
  return notes.map(n => {
    if (n.id !== id) return n;
    const midi = to.midi === undefined ? n.midi : clamp(Math.round(to.midi), limits.minMidi ?? 0, limits.maxMidi ?? 127);
    const raw = to.startBeat === undefined ? n.startBeat : to.startBeat;
    const startBeat = round4(clamp(limits.snap ? snapBeat(raw) : raw, 0, limits.maxStartBeat ?? Infinity));
    return { ...n, midi, startBeat };
  });
}

export function deleteNote(notes: readonly EditorNote[], id: string): EditorNote[] {
  return notes.filter(n => n.id !== id);
}

/** The draft file: everything in the manifest kept, notes replaced by the edited ones, status forced to draft/unreviewed. */
export function buildDraft(manifest: LessonManifest, notes: readonly EditorNote[]): Record<string, unknown> {
  return { ...manifest, interactiveStatus: 'draft', reviewedByHand: false, notes: sortNotes(notes) };
}
export const serializeDraft = (manifest: LessonManifest, notes: readonly EditorNote[]) => `${JSON.stringify(buildDraft(manifest, notes), null, 2)}\n`;

export type ParsedDraft = { ok: true; manifest: LessonManifest; notes: EditorNote[] } | { ok: false; reason: string };

/** Parses a draft/published JSON text for the editor (structural check only, ids repaired). */
export function parseDraft(text: string): ParsedDraft {
  let json: unknown;
  try { json = JSON.parse(text); } catch { return { ok: false, reason: 'JSON inválido' }; }
  if (typeof json !== 'object' || json === null || Array.isArray(json)) return { ok: false, reason: 'O manifesto tem de ser um objeto' };
  const shape = validateShape(json as Record<string, unknown>);
  if (!shape.ok) return shape;
  return { ok: true, manifest: shape.manifest, notes: ensureIds(shape.manifest.notes) };
}

export const MAX_DRAFT_CHARS = 2_000_000;

/** What the dev-only route accepts: a structurally valid manifest that is explicitly an unreviewed draft. Returns the text to write. */
export function checkDraftForWrite(text: string): { ok: true; text: string } | { ok: false; reason: string } {
  if (text.length > MAX_DRAFT_CHARS) return { ok: false, reason: 'Ficheiro demasiado grande' };
  const parsed = parseDraft(text);
  if (!parsed.ok) return parsed;
  const m = JSON.parse(text) as Record<string, unknown>;
  if (m.interactiveStatus !== 'draft') return { ok: false, reason: 'interactiveStatus tem de ser "draft"' };
  if (m.reviewedByHand !== false) return { ok: false, reason: 'reviewedByHand tem de ser false' };
  return { ok: true, text: serializeDraft(parsed.manifest, parsed.notes) };
}

/** The write route exists only under `next dev`. */
export const draftWriteEnabled = (nodeEnv: string | undefined) => nodeEnv === 'development';
