// Usage: npm run import-midi -- [ficheiro.mid]
// Sem argumento: content/bebop-blues/source/basic-pitch-raw.mid (Basic Pitch 0.4.0). Com argumento: MIDI externo (ex.: MT3).
import { importDraft } from '../lib/draft-import';

try {
  const r = importDraft(undefined, process.argv[2]);
  console.log(`draft.json: ${r.noteCount} notas (fonte: ${r.sourceLabel})`);
} catch (e) {
  console.error(`Erro: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
}
