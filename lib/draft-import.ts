import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { midiBytesToNotes } from './midi-import';
import type { AiOriginal } from './ai-original';

export const DEFAULT_CONTENT_DIR = 'content/bebop-blues';

export type ImportResult = { noteCount: number; source: AiOriginal['source']; sourceLabel: string };

/**
 * Converts a raw automatic-transcription .mid into `draft.json` + `source/ai-original.json` inside `contentDir`
 * (which must hold `manifest.json`). Without `midiPath` it uses the Basic Pitch raw file; with one it records
 * `{tool: "external-midi", file}`. Everything is validated before any file is written, so a failure leaves existing files untouched.
 */
export function importDraft(contentDir: string = DEFAULT_CONTENT_DIR, midiPath?: string): ImportResult {
  const external = midiPath !== undefined;
  const file = external ? midiPath : join(contentDir, 'source', 'basic-pitch-raw.mid');
  if (!existsSync(file)) throw new Error(`Ficheiro MIDI não encontrado: ${file}`);
  const manifestFile = join(contentDir, 'manifest.json');
  if (!existsSync(manifestFile)) throw new Error(`manifest.json não encontrado: ${manifestFile}`);
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));

  let notes;
  try {
    notes = midiBytesToNotes(readFileSync(file), manifest.syncAnchors);
  } catch (e) {
    throw new Error(`Não é um MIDI válido: ${file} (${e instanceof Error ? e.message : String(e)})`);
  }
  if (notes.length === 0) throw new Error(`O MIDI não tem notas: ${file}`);

  const source: AiOriginal['source'] = external
    ? { tool: 'external-midi', file: basename(file) }
    : { tool: 'basic-pitch', version: '0.4.0' };
  const draft = { ...manifest, interactiveStatus: 'draft', reviewedByHand: false, source, notes };
  // Immutable reference of the raw AI transcription, so publishing can refuse an unedited AI draft.
  const aiOriginal: AiOriginal = {
    source,
    syncAnchors: manifest.syncAnchors,
    notes: notes.map(n => ({ midi: n.midi, startBeat: n.startBeat, durationBeats: n.durationBeats })),
  };
  mkdirSync(join(contentDir, 'source'), { recursive: true });
  writeFileSync(join(contentDir, 'draft.json'), JSON.stringify(draft, null, 2) + '\n');
  writeFileSync(join(contentDir, 'source', 'ai-original.json'), JSON.stringify(aiOriginal, null, 2) + '\n');
  const sourceLabel = external ? `external-midi, ${source.file}` : `basic-pitch ${source.version}`;
  return { noteCount: notes.length, source, sourceLabel };
}
