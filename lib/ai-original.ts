import { timeAtBeat, type SyncAnchor } from './video-sync';

/** Immutable reference of what the AI transcription produced: the notes and the anchors used to convert them to beats. */
export type AiOriginal = {
  source: { tool: string; version?: string; file?: string };
  syncAnchors: SyncAnchor[];
  notes: { midi: number; startBeat: number; durationBeats: number }[];
};

type NoteLike = { midi: number; startBeat: number; durationBeats: number };

export const AI_ORIGINAL_TOLERANCE_MS = 1;

export const UNCHANGED_FROM_AI_REASON = 'As notas são iguais à transcrição automática da IA. Corrige pelo menos uma nota antes de publicar.';

/** Structural check of ai-original.json text. */
export function parseAiOriginal(text: string | null): AiOriginal | null {
  if (text === null) return null;
  let json: unknown;
  try { json = JSON.parse(text); } catch { return null; }
  if (typeof json !== 'object' || json === null) return null;
  const { source, syncAnchors, notes } = json as Record<string, unknown>;
  const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
  if (typeof source !== 'object' || source === null) return null;
  if (!Array.isArray(syncAnchors) || syncAnchors.length < 2 || !syncAnchors.every(a => a && num(a.mediaTimeMs) && num(a.beat))) return null;
  if (!Array.isArray(notes) || notes.length === 0 || !notes.every(n => n && num(n.midi) && num(n.startBeat) && num(n.durationBeats))) return null;
  return json as AiOriginal;
}

function toVideoSpans(notes: readonly NoteLike[], anchors: readonly SyncAnchor[]) {
  return notes.map(n => ({ midi: n.midi, start: timeAtBeat(anchors, n.startBeat), end: timeAtBeat(anchors, n.startBeat + n.durationBeats) }));
}

/**
 * True when the note set equals the AI original: same pitches at the same video times (start and end, ±1 ms),
 * ignoring ids and order. Beats are converted to video time with each side's own anchors, so changing only the
 * anchors while keeping the notes at the same video time still counts as "unchanged".
 * Anything that cannot be compared (fewer than 2 anchors, bad numbers) counts as NOT unchanged — other checks block those.
 */
export function isUnchangedFromAi(notes: readonly NoteLike[], anchors: readonly SyncAnchor[], original: AiOriginal): boolean {
  if (notes.length !== original.notes.length) return false;
  let mine: ReturnType<typeof toVideoSpans>;
  let theirs: ReturnType<typeof toVideoSpans>;
  try {
    mine = toVideoSpans(notes, anchors);
    theirs = toVideoSpans(original.notes, original.syncAnchors);
  } catch { return false; }
  const free = [...mine];
  for (const o of theirs) {
    const i = free.findIndex(n => n.midi === o.midi && Math.abs(n.start - o.start) <= AI_ORIGINAL_TOLERANCE_MS && Math.abs(n.end - o.end) <= AI_ORIGINAL_TOLERANCE_MS);
    if (i === -1) return false;
    free.splice(i, 1);
  }
  return true;
}
