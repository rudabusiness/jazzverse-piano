import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { importDraft } from '../lib/draft-import';
import { isUnchangedFromAi, parseAiOriginal } from '../lib/ai-original';

const fixture = new URL('./fixtures/small.mid', import.meta.url).pathname;
const anchors = [{ mediaTimeMs: 0, beat: 0 }, { mediaTimeMs: 10_000, beat: 20 }];

function tempContent() {
  const dir = mkdtempSync(join(tmpdir(), 'draft-import-'));
  mkdirSync(join(dir, 'source'));
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ title: 't', syncAnchors: anchors }));
  return dir;
}

test('external .mid → draft with the fixture notes and a coherent ai-original', () => {
  const dir = tempContent();
  try {
    const r = importDraft(dir, fixture);
    assert.equal(r.noteCount, 4);
    assert.equal(r.sourceLabel, 'external-midi, small.mid');
    const draft = JSON.parse(readFileSync(join(dir, 'draft.json'), 'utf8'));
    assert.equal(draft.interactiveStatus, 'draft');
    assert.equal(draft.reviewedByHand, false);
    assert.deepEqual(draft.source, { tool: 'external-midi', file: 'small.mid' });
    assert.deepEqual(draft.notes.map((n: { midi: number }) => n.midi), [48, 64, 67, 72]);
    const original = parseAiOriginal(readFileSync(join(dir, 'source', 'ai-original.json'), 'utf8'));
    assert.ok(original);
    assert.deepEqual(original.source, draft.source);
    assert.equal(isUnchangedFromAi(draft.notes, draft.syncAnchors, original), true);
    assert.equal(isUnchangedFromAi(draft.notes.slice(1), draft.syncAnchors, original), false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('no argument uses source/basic-pitch-raw.mid and records basic-pitch 0.4.0', () => {
  const dir = tempContent();
  try {
    copyFileSync(fixture, join(dir, 'source', 'basic-pitch-raw.mid'));
    const r = importDraft(dir);
    assert.equal(r.noteCount, 4);
    assert.deepEqual(JSON.parse(readFileSync(join(dir, 'draft.json'), 'utf8')).source, { tool: 'basic-pitch', version: '0.4.0' });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('missing, invalid or empty MIDI throws and leaves existing files untouched', () => {
  const dir = tempContent();
  try {
    writeFileSync(join(dir, 'draft.json'), 'OLD');
    writeFileSync(join(dir, 'source', 'ai-original.json'), 'OLD');
    writeFileSync(join(dir, 'bad.mid'), 'not a midi file');
    // header + one empty track: valid MIDI with zero notes
    writeFileSync(join(dir, 'empty.mid'), Buffer.from('4d546864000000060000000101e04d54726b0000000400ff2f00', 'hex'));
    assert.throws(() => importDraft(dir, join(dir, 'nope.mid')), /não encontrado/);
    assert.throws(() => importDraft(dir, join(dir, 'bad.mid')), /MIDI válido/);
    assert.throws(() => importDraft(dir, join(dir, 'empty.mid')), /não tem notas/);
    assert.equal(readFileSync(join(dir, 'draft.json'), 'utf8'), 'OLD');
    assert.equal(readFileSync(join(dir, 'source', 'ai-original.json'), 'utf8'), 'OLD');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
