import type { LessonManifest } from './lesson-manifest';
import { sortNotes, type EditorNote } from './note-editor';
import { loadPublished } from './published-loader';
import { beatAtTime, timeAtBeat, type SyncAnchor } from './video-sync';

const round4 = (value: number) => Math.round(value * 10000) / 10000;

export type AnchorCheck = { ok: true } | { ok: false; reason: string };

/** Strict check of a list of anchors (in video-time order): finite, time AND beat strictly increasing. Fewer than 2 is allowed here (work in progress); see {@link hasEnoughAnchors}. */
export function checkAnchors(anchors: readonly SyncAnchor[]): AnchorCheck {
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    if (!Number.isFinite(a.mediaTimeMs) || !Number.isFinite(a.beat)) return { ok: false, reason: `Âncora ${i}: tempo e beat têm de ser números` };
    if (a.mediaTimeMs < 0) return { ok: false, reason: `Âncora ${i}: o tempo não pode ser negativo` };
    const p = anchors[i - 1];
    if (p && a.mediaTimeMs <= p.mediaTimeMs) return { ok: false, reason: 'O tempo do vídeo tem de crescer estritamente entre âncoras' };
    if (p && a.beat <= p.beat) return { ok: false, reason: 'O beat tem de crescer estritamente entre âncoras' };
  }
  return { ok: true };
}

export const hasEnoughAnchors = (anchors: readonly SyncAnchor[]) => anchors.length >= 2 && checkAnchors(anchors).ok;

const byTime = (a: SyncAnchor, b: SyncAnchor) => a.mediaTimeMs - b.mediaTimeMs;
const clean = (a: SyncAnchor): SyncAnchor => ({ mediaTimeMs: Math.round(a.mediaTimeMs), beat: round4(a.beat) });

export type AnchorResult = { ok: true; anchors: SyncAnchor[] } | { ok: false; reason: string };

/** Adds an anchor (time rounded to whole ms, beat to 4 decimals). Refused if the result is not strictly increasing in both clocks. */
export function addAnchor(anchors: readonly SyncAnchor[], anchor: SyncAnchor): AnchorResult {
  const next = [...anchors, clean(anchor)].sort(byTime);
  const checked = checkAnchors(next);
  return checked.ok ? { ok: true, anchors: next } : checked;
}

/** Replaces part of anchor `index`. The list is re-sorted by time; refused if invalid. */
export function updateAnchor(anchors: readonly SyncAnchor[], index: number, change: Partial<SyncAnchor>): AnchorResult {
  if (!Number.isInteger(index) || index < 0 || index >= anchors.length) return { ok: false, reason: 'Âncora inexistente' };
  const next = anchors.map((a, i) => (i === index ? clean({ ...a, ...change }) : a)).sort(byTime);
  const checked = checkAnchors(next);
  return checked.ok ? { ok: true, anchors: next } : checked;
}

export function deleteAnchor(anchors: readonly SyncAnchor[], index: number): SyncAnchor[] {
  return anchors.filter((_, i) => i !== index);
}

/**
 * Re-expresses the notes after the anchor table changed.
 * 'keep-time' (default): every note stays at the same video time (beats recalculated through the new table).
 * 'keep-beats': beats untouched. Needs both tables to have ≥ 2 anchors, otherwise notes are returned unchanged.
 */
export function rebaseNotes<T extends EditorNote>(notes: readonly T[], from: readonly SyncAnchor[], to: readonly SyncAnchor[], mode: 'keep-time' | 'keep-beats' = 'keep-time'): T[] {
  if (mode === 'keep-beats' || !hasEnoughAnchors(from) || !hasEnoughAnchors(to)) return [...notes];
  return notes.map(n => {
    const start = beatAtTime(to, timeAtBeat(from, n.startBeat));
    const end = beatAtTime(to, timeAtBeat(from, n.startBeat + n.durationBeats));
    return { ...n, startBeat: round4(start), durationBeats: Math.max(0.0001, round4(end - start)) };
  });
}

export type PublishInput = { anchors: readonly SyncAnchor[]; reviewedByHand: boolean; noteCount: number };

/** Why "Publicar" is blocked, or null when allowed. */
export function publishBlockedReason({ anchors, reviewedByHand, noteCount }: PublishInput): string | null {
  if (!hasEnoughAnchors(anchors)) return 'Precisa de pelo menos 2 âncoras válidas (tempo e beat estritamente crescentes).';
  if (noteCount === 0) return 'Não há notas para publicar.';
  if (!reviewedByHand) return 'Marque "Revisto à mão" para poder publicar.';
  return null;
}

export type Published = { ok: true; text: string } | { ok: false; reason: string };

/** Builds published.json text from the base manifest + current notes and anchors, validated with the student loader. Never touches draft.json. */
export function buildPublished(base: LessonManifest, notes: readonly EditorNote[], anchors: readonly SyncAnchor[], reviewedByHand: boolean, now: Date = new Date()): Published {
  const blocked = publishBlockedReason({ anchors, reviewedByHand, noteCount: notes.length });
  if (blocked) return { ok: false, reason: blocked };
  const manifest = { ...base, interactiveStatus: 'ready', reviewedByHand: true, publishedAt: now.toISOString(), syncAnchors: [...anchors], notes: sortNotes(notes) };
  const text = `${JSON.stringify(manifest, null, 2)}\n`;
  const loaded = loadPublished(text);
  return loaded.ok ? { ok: true, text } : { ok: false, reason: loaded.reason };
}

export const MAX_PUBLISHED_CHARS = 2_000_000;

/** What the dev-only publish route accepts: text that passes the student loader. */
export function checkPublishedForWrite(text: string): Published {
  if (text.length > MAX_PUBLISHED_CHARS) return { ok: false, reason: 'Ficheiro demasiado grande' };
  const loaded = loadPublished(text);
  return loaded.ok ? { ok: true, text } : { ok: false, reason: loaded.reason };
}
