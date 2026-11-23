import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isUnchangedFromAi, parseAiOriginal, UNCHANGED_FROM_AI_REASON, type AiOriginal } from '../lib/ai-original';
import { buildPublished, checkPublishedForWrite, publishBlockedReason, rebaseNotes } from '../lib/anchor-editor';
import { ensureIds } from '../lib/note-editor';
import { loadPublished } from '../lib/published-loader';
import type { SyncAnchor } from '../lib/video-sync';

const text = readFileSync(new URL('./fixtures/published.anchors.fixture.json', import.meta.url), 'utf8');
const loaded = loadPublished(text);
assert.ok(loaded.ok);
const { manifest } = loaded;
const anchors: SyncAnchor[] = manifest.syncAnchors;
const notes = ensureIds(manifest.notes);
const original: AiOriginal = {
  source: { tool: 'basic-pitch', version: '0.4.0' },
  syncAnchors: anchors,
  notes: manifest.notes.map(n => ({ midi: n.midi, startBeat: n.startBeat, durationBeats: n.durationBeats })),
};

test('identical notes are "unchanged"; ids and order do not matter', () => {
  assert.equal(isUnchangedFromAi(notes, anchors, original), true);
  const shuffled = [...notes].reverse().map((n, i) => ({ ...n, id: `x${i}` }));
  assert.equal(isUnchangedFromAi(shuffled, anchors, original), true);
});

test('moving, resizing, re-pitching, deleting or adding one note counts as edited', () => {
  const [first, ...rest] = notes;
  assert.equal(isUnchangedFromAi([{ ...first, startBeat: first.startBeat + 0.125 }, ...rest], anchors, original), false);
  assert.equal(isUnchangedFromAi([{ ...first, durationBeats: first.durationBeats + 0.125 }, ...rest], anchors, original), false);
  assert.equal(isUnchangedFromAi([{ ...first, midi: first.midi + 1 }, ...rest], anchors, original), false);
  assert.equal(isUnchangedFromAi(rest, anchors, original), false);
  assert.equal(isUnchangedFromAi([...notes, { ...first, id: 'extra', midi: first.midi + 12 }], anchors, original), false);
});

test('changing only the anchors while keeping the video time is still "unchanged"', () => {
  const next: SyncAnchor[] = [anchors[0], { mediaTimeMs: anchors[1].mediaTimeMs, beat: anchors[1].beat * 2 }];
  const rebased = rebaseNotes(notes, anchors, next, 'keep-time');
  assert.equal(isUnchangedFromAi(rebased, next, original), true);
  // keep-beats under a different table moves notes in the video → edited
  assert.equal(isUnchangedFromAi(notes, next, original), false);
});

test('publish is blocked with the clear message when notes equal the AI original', () => {
  const input = { anchors, reviewedByHand: true, noteCount: notes.length };
  assert.equal(publishBlockedReason({ ...input, unchangedFromAi: true }), UNCHANGED_FROM_AI_REASON);
  assert.equal(buildPublished(manifest, notes, anchors, true, new Date(), original).ok, false);
  const edited = [{ ...notes[0], startBeat: notes[0].startBeat + 0.125 }, ...notes.slice(1)];
  assert.equal(buildPublished(manifest, edited, anchors, true, new Date(), original).ok, true);
  // reference missing → fail closed
  assert.equal(buildPublished(manifest, edited, anchors, true, new Date(), null).ok, false);
});

test('the dev publish route check refuses an unedited manifest and accepts an edited one', () => {
  const unedited = checkPublishedForWrite(text, original);
  assert.equal(unedited.ok, false);
  assert.equal(!unedited.ok && unedited.reason, UNCHANGED_FROM_AI_REASON);
  const json = JSON.parse(text);
  json.notes = json.notes.slice(1);
  assert.equal(checkPublishedForWrite(JSON.stringify(json), original).ok, true);
  assert.equal(checkPublishedForWrite(text, null).ok, false);
});

test('ai-original.json in content/ is well-formed and matches the current draft', () => {
  const real = parseAiOriginal(readFileSync(new URL('../content/bebop-blues/source/ai-original.json', import.meta.url), 'utf8'));
  assert.ok(real && real.notes.length > 0);
  const draft = JSON.parse(readFileSync(new URL('../content/bebop-blues/draft.json', import.meta.url), 'utf8'));
  assert.equal(isUnchangedFromAi(draft.notes, draft.syncAnchors, real), true);
});
