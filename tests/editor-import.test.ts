import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { importMidiForEditor, parseDraftRequest } from '../lib/editor-import';
import { isUnchangedFromAi } from '../lib/ai-original';

const bytes = new Uint8Array(readFileSync(new URL('./fixtures/small.mid', import.meta.url)));
const anchors = [{ mediaTimeMs: 0, beat: 0 }, { mediaTimeMs: 10_000, beat: 20 }];

test('importing small.mid gives 4 notes and the AI reference becomes those notes', () => {
  const r = importMidiForEditor(bytes, 'small.mid', anchors);
  assert.ok(r.ok);
  assert.deepEqual(r.notes.map(n => n.midi), [48, 64, 67, 72]);
  assert.deepEqual(r.source, { tool: 'external-midi', file: 'small.mid' });
  assert.equal(isUnchangedFromAi(r.notes, anchors, r.aiOriginal), true);
  assert.equal(isUnchangedFromAi(r.notes.slice(1), anchors, r.aiOriginal), false);
});

test('invalid MIDI is refused with a clear reason', () => {
  const bad = importMidiForEditor(new Uint8Array([1, 2, 3, 4]), 'x.mid', anchors);
  assert.ok(!bad.ok && bad.reason.includes('x.mid'));
});

test('draft request: validates the AI reference format', () => {
  const r = importMidiForEditor(bytes, 'small.mid', anchors);
  assert.ok(r.ok);
  assert.ok(parseDraftRequest(JSON.stringify({ draft: '{}', aiOriginal: r.aiOriginal })).ok);
  assert.ok(parseDraftRequest(JSON.stringify({ draft: '{}' })).ok);
  assert.ok(!parseDraftRequest(JSON.stringify({ draft: '{}', aiOriginal: { notes: [] } })).ok);
  assert.ok(!parseDraftRequest(JSON.stringify({ aiOriginal: r.aiOriginal })).ok);
  assert.ok(!parseDraftRequest('nope').ok);
});
