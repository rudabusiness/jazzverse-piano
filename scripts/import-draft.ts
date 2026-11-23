// Usage: npx tsx scripts/import-draft.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { midiBytesToNotes } from '../lib/midi-import';

const dir = 'content/bebop-blues';
const manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, 'utf8'));
const notes = midiBytesToNotes(readFileSync(`${dir}/source/basic-pitch-raw.mid`), manifest.syncAnchors);

const draft = {
  ...manifest,
  interactiveStatus: 'draft',
  reviewedByHand: false,
  source: { tool: 'basic-pitch', version: '0.4.0' },
  notes,
};
writeFileSync(`${dir}/draft.json`, JSON.stringify(draft, null, 2) + '\n');
// Immutable reference of the raw AI transcription (notes + the anchors used to convert them), so publishing can refuse an unedited AI draft.
const aiOriginal = {
  source: draft.source,
  syncAnchors: manifest.syncAnchors,
  notes: notes.map(n => ({ midi: n.midi, startBeat: n.startBeat, durationBeats: n.durationBeats })),
};
writeFileSync(`${dir}/source/ai-original.json`, JSON.stringify(aiOriginal, null, 2) + '\n');
console.log(`draft.json: ${notes.length} notes`);
