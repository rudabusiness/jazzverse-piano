import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadPublished } from '../lib/published-loader';
import { bpmFromAnchors, publishedToPractice } from '../lib/published-practice';
import { captureOnset, createPracticeTimeline, evaluatePractice } from '../lib/lesson-timeline';

const load = () => {
  const result = loadPublished(readFileSync(new URL('./fixtures/published.valid.fixture.json', import.meta.url), 'utf8'));
  assert.ok(result.ok);
  return result.manifest;
};

test('adapter derives bpm from anchors and keeps stable note ids', () => {
  const manifest = load();
  assert.equal(bpmFromAnchors(manifest), 120); // 20 beats in 10 s
  const practice = publishedToPractice(manifest);
  assert.deepEqual(practice.tempos, [60, 90, 120, 144]);
  assert.deepEqual(practice.timeline.notes.map(n => n.id), ['f1', 'f2']);
  assert.deepEqual(publishedToPractice(manifest).timeline.notes, practice.timeline.notes);
  assert.equal(practice.timeline.notes[1].atMs, 1000); // beat 2 at 120 bpm
});

test('a perfect simulated performance over the published fixture scores 100 at every tempo', () => {
  const practice = publishedToPractice(load());
  for (const bpm of practice.tempos) {
    const timeline = createPracticeTimeline(bpm, undefined, practice.source);
    const clock = { startedAt: 5_000, offsetMs: -timeline.countInMs };
    const onsets = timeline.notes.map(note => {
      const onset = captureOnset(clock, clock.startedAt + timeline.countInMs + note.atMs, note.pitch, timeline);
      assert.ok(onset);
      return onset;
    });
    const result = evaluatePractice(onsets, timeline);
    assert.equal(result.score, 100);
    assert.equal(result.hitCount, 2);
  }
});

test('with no MIDI events no note is credited and the score is 0', () => {
  const { timeline } = publishedToPractice(load());
  const result = evaluatePractice([], timeline);
  assert.equal(result.score, 0);
  assert.equal(result.hitCount, 0);
  assert.equal(result.missCount, 2);
});

test('notes before beat 0 are shifted by whole measures instead of dropped; duplicate ids stay unique', () => {
  const manifest = load();
  const edited = { ...manifest, notes: [
    { midi: 60, startBeat: -1, durationBeats: 1, hand: 'right' as const },
    { midi: 60, startBeat: -1, durationBeats: 1, hand: 'right' as const, id: 'x' },
    { midi: 62, startBeat: 3, durationBeats: 1, hand: 'right' as const, id: 'x' },
  ] };
  const { timeline } = publishedToPractice(edited);
  assert.equal(timeline.notes.length, 3);
  assert.equal(new Set(timeline.notes.map(n => n.id)).size, 3);
  assert.equal(timeline.notes[0].startBeat, 3);
});

test('refuses a manifest without notes', () => {
  assert.throws(() => publishedToPractice({ ...load(), notes: [] }), RangeError);
});
