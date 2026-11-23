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
console.log(`draft.json: ${notes.length} notes`);
