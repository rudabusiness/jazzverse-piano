import test from 'node:test';
import assert from 'node:assert/strict';
import { beatAtTime, timeAtBeat, type SyncAnchor } from '../lib/video-sync';
import { bebopBluesManifest, watchTimeline } from '../lib/lesson-manifest';

const two: SyncAnchor[] = [{ mediaTimeMs: 0, beat: 0 }, { mediaTimeMs: 10_000, beat: 20 }];

test('5 s between anchors (0 s→0, 10 s→20) is beat 10', () => assert.equal(beatAtTime(two, 5000), 10));
test('anchors are hit exactly', () => { assert.equal(beatAtTime(two, 0), 0); assert.equal(beatAtTime(two, 10_000), 20); });
test('extrapolates linearly outside the anchors', () => {
  assert.equal(beatAtTime(two, 15_000), 30);
  assert.equal(beatAtTime(two, -2000), -4);
});
test('uses the nearest segment when extrapolating with 3 anchors', () => {
  const three = [...two, { mediaTimeMs: 20_000, beat: 50 }];
  assert.equal(beatAtTime(three, 5000), 10);
  assert.equal(beatAtTime(three, 15_000), 35);
  assert.equal(beatAtTime(three, 30_000), 80);
  assert.equal(beatAtTime(three, -1000), -2);
});
test('unsorted anchors are sorted', () => assert.equal(beatAtTime([two[1], two[0]], 5000), 10));
test('beat→time is the inverse, including outside the range', () => {
  for (const ms of [-3000, 0, 1234, 5000, 10_000, 17_500]) assert.ok(Math.abs(timeAtBeat(two, beatAtTime(two, ms)) - ms) < 1e-9);
  assert.equal(timeAtBeat(two, 10), 5000);
});
test('rejects fewer than 2 anchors and non-increasing anchors', () => {
  assert.throws(() => beatAtTime([two[0]], 0), RangeError);
  assert.throws(() => beatAtTime([], 0), RangeError);
  assert.throws(() => beatAtTime([two[0], { mediaTimeMs: 0, beat: 5 }], 0), RangeError);
  assert.throws(() => beatAtTime([two[0], { mediaTimeMs: 5000, beat: 0 }], 0), RangeError);
});

test('bebop-blues manifest is a draft with a usable clock and no invented notes', () => {
  assert.equal(bebopBluesManifest.video.url, '/lessons/bebop-blues/clip.mp4');
  assert.equal(bebopBluesManifest.video.durationMs, 83_000);
  assert.equal(bebopBluesManifest.interactiveStatus, 'draft');
  assert.ok(bebopBluesManifest.syncAnchors.length >= 2);
  assert.doesNotThrow(() => beatAtTime(bebopBluesManifest.syncAnchors, 1000));
  assert.deepEqual(bebopBluesManifest.notes, []);
});

// Development fixture only: NOT the instructor's playing.
test('watchTimeline places notes on the beat axis', () => {
  const fixture = [{ midi: 60, startBeat: 2, durationBeats: 1.5, hand: 'right' as const }];
  const { notes, beatMs } = watchTimeline(fixture);
  assert.equal(beatMs, 1000);
  assert.deepEqual(notes[0], { id: 'watch-0', pitch: 60, hand: 'right', atMs: 2000, endMs: 3500 });
});
