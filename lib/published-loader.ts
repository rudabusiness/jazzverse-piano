import type { LessonManifest } from './lesson-manifest';

export type LoadResult = { ok: true; manifest: LessonManifest } | { ok: false; reason: string };

const refuse = (reason: string): LoadResult => ({ ok: false, reason });
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

/**
 * Pure gate for the student's lesson. `source` is the raw text of published.json (null/undefined when the file is missing).
 * Accepts only: reviewedByHand === true, interactiveStatus === "ready", ≥ 2 sync anchors strictly increasing
 * in both time and beat (in file order), and a non-empty list of valid notes. Anything else is refused with a reason.
 */
export function loadPublished(source: string | null | undefined): LoadResult {
  if (source === null || source === undefined) return refuse('Ficheiro published.json ausente');
  let json: unknown;
  try { json = JSON.parse(source); } catch { return refuse('JSON inválido'); }
  if (!isObject(json)) return refuse('O manifesto tem de ser um objeto');
  if (json.reviewedByHand !== true) return refuse('Não foi revisto à mão (reviewedByHand !== true)');
  if (json.interactiveStatus !== 'ready') return refuse('interactiveStatus não é "ready"');
  return validateShape(json);
}

/** Structural check shared with the read-only editor (which also opens the unreviewed draft). Does NOT check review status. */
export function validateShape(json: Record<string, unknown>): LoadResult {
  if (!text(json.manifestId) || !text(json.lessonId) || !text(json.title)) return refuse('Faltam manifestId, lessonId ou title');
  const video = json.video;
  if (!isObject(video) || !text(video.url) || !finite(video.durationMs) || video.durationMs <= 0) return refuse('Vídeo inválido');

  const anchors = json.syncAnchors;
  if (!Array.isArray(anchors) || anchors.length < 2) return refuse('São precisas pelo menos 2 âncoras de sincronismo');
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    if (!isObject(a) || !finite(a.mediaTimeMs) || !finite(a.beat)) return refuse(`Âncora ${i} inválida`);
    const p = anchors[i - 1] as { mediaTimeMs: number; beat: number } | undefined;
    if (p && (a.mediaTimeMs <= p.mediaTimeMs || a.beat <= p.beat)) return refuse(`Âncora ${i}: tempo e beat têm de crescer estritamente`);
  }

  const notes = json.notes;
  if (!Array.isArray(notes) || notes.length === 0) return refuse('Sem notas');
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    const ok = isObject(n) && Number.isInteger(n.midi) && (n.midi as number) >= 0 && (n.midi as number) <= 127
      && finite(n.startBeat) && finite(n.durationBeats) && n.durationBeats > 0 && (n.hand === 'left' || n.hand === 'right')
      && (n.id === undefined || typeof n.id === 'string');
    if (!ok) return refuse(`Nota ${i} inválida`);
  }
  return { ok: true, manifest: json as unknown as LessonManifest };
}
