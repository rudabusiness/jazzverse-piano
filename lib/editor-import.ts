import { midiBytesToNotes, type ImportedNote } from './midi-import';
import { parseAiOriginal, type AiOriginal } from './ai-original';
import type { SyncAnchor } from './video-sync';

export type EditorImport =
  | { ok: true; notes: ImportedNote[]; aiOriginal: AiOriginal; source: { tool: 'external-midi'; file: string } }
  | { ok: false; reason: string };

/**
 * Pure. Converts a .mid chosen in the editor into the notes to show, and makes those notes the raw-AI reference
 * (an imported MIDI, e.g. from MT3, is itself an unreviewed automatic transcription). On any failure nothing is replaced.
 */
export function importMidiForEditor(bytes: Uint8Array, fileName: string, anchors: readonly SyncAnchor[]): EditorImport {
  let notes: ImportedNote[];
  try { notes = midiBytesToNotes(bytes, anchors); }
  catch (e) { return { ok: false, reason: `${fileName}: não é um MIDI válido (${e instanceof Error ? e.message : String(e)})` }; }
  notes = notes.filter(n => n.durationBeats > 0);
  if (notes.length === 0) return { ok: false, reason: `${fileName}: o MIDI não tem notas` };
  const source = { tool: 'external-midi' as const, file: fileName };
  const aiOriginal: AiOriginal = {
    source,
    syncAnchors: anchors.map(a => ({ ...a })),
    notes: notes.map(n => ({ midi: n.midi, startBeat: n.startBeat, durationBeats: n.durationBeats })),
  };
  return { ok: true, notes, aiOriginal, source };
}

export const MAX_DRAFT_REQUEST_CHARS = 4_000_000;

/** Body of POST /api/editor/draft: `{ draft: <draft.json text>, aiOriginal?: AiOriginal }`. */
export function parseDraftRequest(body: string): { ok: true; draft: string; aiOriginal: AiOriginal | null } | { ok: false; reason: string } {
  if (body.length > MAX_DRAFT_REQUEST_CHARS) return { ok: false, reason: 'Pedido demasiado grande' };
  let json: unknown;
  try { json = JSON.parse(body); } catch { return { ok: false, reason: 'JSON inválido' }; }
  if (typeof json !== 'object' || json === null) return { ok: false, reason: 'Pedido inválido' };
  const { draft, aiOriginal } = json as Record<string, unknown>;
  if (typeof draft !== 'string') return { ok: false, reason: 'Falta o campo draft' };
  if (aiOriginal === undefined || aiOriginal === null) return { ok: true, draft, aiOriginal: null };
  const parsed = parseAiOriginal(JSON.stringify(aiOriginal));
  if (!parsed) return { ok: false, reason: 'Referência da IA (aiOriginal) inválida: formato das notas ou âncoras errado' };
  return { ok: true, draft, aiOriginal: parsed };
}
