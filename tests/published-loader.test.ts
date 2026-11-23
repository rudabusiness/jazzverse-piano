import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadPublished } from '../lib/published-loader';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const valid = JSON.parse(read('./fixtures/published.valid.fixture.json'));
const withChange = (change: (m: any) => void) => { const m = structuredClone(valid); change(m); return JSON.stringify(m); };

test('accepts a valid published manifest', () => {
  const result = loadPublished(read('./fixtures/published.valid.fixture.json'));
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.manifest.notes.length, 2);
});
test('refuses a draft manifest', () => assert.equal(loadPublished(read('./fixtures/draft.fixture.json')).ok, false));
test('refuses a manifest with 1 anchor', () => assert.equal(loadPublished(read('./fixtures/one-anchor.fixture.json')).ok, false));
test('refuses the real AI draft (content/bebop-blues/draft.json)', () => {
  assert.equal(loadPublished(read('../content/bebop-blues/draft.json')).ok, false);
});
test('refuses missing file, empty text and invalid JSON, each with a reason', () => {
  for (const source of [null, undefined, '', '{not json', '[]', 'null']) {
    const result = loadPublished(source);
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.reason.length > 0);
  }
});
test('refuses reviewedByHand false/absent/truthy-but-not-true', () => {
  assert.equal(loadPublished(withChange(m => { m.reviewedByHand = false; })).ok, false);
  assert.equal(loadPublished(withChange(m => { delete m.reviewedByHand; })).ok, false);
  assert.equal(loadPublished(withChange(m => { m.reviewedByHand = 'true'; })).ok, false);
});
test('refuses interactiveStatus other than "ready"', () => {
  assert.equal(loadPublished(withChange(m => { m.interactiveStatus = 'draft'; })).ok, false);
  assert.equal(loadPublished(withChange(m => { delete m.interactiveStatus; })).ok, false);
});
test('refuses anchors that do not strictly increase in time and beat, or are malformed', () => {
  const ok = (a: unknown[]) => loadPublished(withChange(m => { m.syncAnchors = a; })).ok;
  assert.equal(ok([{ mediaTimeMs: 0, beat: 0 }, { mediaTimeMs: 0, beat: 4 }]), false);
  assert.equal(ok([{ mediaTimeMs: 0, beat: 0 }, { mediaTimeMs: 1000, beat: 0 }]), false);
  assert.equal(ok([{ mediaTimeMs: 2000, beat: 4 }, { mediaTimeMs: 1000, beat: 8 }]), false);
  assert.equal(ok([{ mediaTimeMs: 0, beat: 0 }, { mediaTimeMs: 'x', beat: 8 }]), false);
  assert.equal(ok([]), false);
  assert.equal(ok([{ mediaTimeMs: 0, beat: 0 }, { mediaTimeMs: 1000, beat: 2 }, { mediaTimeMs: 2000, beat: 4 }]), true);
});
test('refuses missing, empty or invalid notes', () => {
  const ok = (notes: unknown) => loadPublished(withChange(m => { m.notes = notes; })).ok;
  assert.equal(ok(undefined), false);
  assert.equal(ok([]), false);
  assert.equal(ok([{ midi: 128, startBeat: 0, durationBeats: 1, hand: 'left' }]), false);
  assert.equal(ok([{ midi: 60.5, startBeat: 0, durationBeats: 1, hand: 'left' }]), false);
  assert.equal(ok([{ midi: 60, startBeat: 0, durationBeats: 0, hand: 'left' }]), false);
  assert.equal(ok([{ midi: 60, startBeat: null, durationBeats: 1, hand: 'left' }]), false);
  assert.equal(ok([{ midi: 60, startBeat: 0, durationBeats: 1, hand: 'both' }]), false);
});
