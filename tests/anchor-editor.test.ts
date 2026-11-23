import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { addAnchor, buildPublished, checkPublishedForWrite, deleteAnchor, publishBlockedReason, rebaseNotes, updateAnchor } from '../lib/anchor-editor';
import { watchTimeline } from '../lib/lesson-manifest';
import { parseDraft } from '../lib/note-editor';
import { loadPublished } from '../lib/published-loader';
import { beatAtTime, timeAtBeat, type SyncAnchor } from '../lib/video-sync';

const text = readFileSync(new URL('./fixtures/published.anchors.fixture.json', import.meta.url), 'utf8');
const loaded = loadPublished(text);
assert.ok(loaded.ok);
const { manifest } = loaded;
const parsed = parseDraft(text);
assert.ok(parsed.ok);
const notes = parsed.notes;
const two: SyncAnchor[] = manifest.syncAnchors;

test('at every anchor, the matching note falls within 50 ms of the anchor time (same maths as WatchView/FallingNotes)', () => {
  const timeline = watchTimeline(manifest.notes);
  for (const anchor of manifest.syncAnchors) {
    const beatNow = beatAtTime(manifest.syncAnchors, anchor.mediaTimeMs); // useVideoBeat
    const note = timeline.notes.find(n => Math.abs(n.atMs / timeline.beatMs - anchor.beat) < 1e-9);
    assert.ok(note, `note at beat ${anchor.beat}`);
    const distanceBeats = (note.atMs - beatNow * timeline.beatMs) / timeline.beatMs; // FallingNotes offset from the hit line
    const noteVideoMs = timeAtBeat(manifest.syncAnchors, beatNow + distanceBeats);
    assert.ok(Math.abs(noteVideoMs - anchor.mediaTimeMs) <= 50, `${noteVideoMs} vs ${anchor.mediaTimeMs}`);
  }
});

test('publishing requires reviewedByHand, ≥ 2 anchors and notes', () => {
  assert.match(publishBlockedReason({ anchors: [two[0]], reviewedByHand: true, noteCount: 3 }) ?? '', /2 âncoras/);
  assert.match(publishBlockedReason({ anchors: two, reviewedByHand: false, noteCount: 3 }) ?? '', /Revisto à mão/);
  assert.match(publishBlockedReason({ anchors: two, reviewedByHand: true, noteCount: 0 }) ?? '', /notas/);
  assert.equal(publishBlockedReason({ anchors: two, reviewedByHand: true, noteCount: 3 }), null);
  assert.equal(buildPublished(manifest, notes, [two[0]], true).ok, false);
  assert.equal(buildPublished(manifest, notes, two, false).ok, false);
  assert.equal(buildPublished(manifest, [], two, true).ok, false);
});

test('buildPublished: ready + reviewed + ISO publishedAt, passes the student loader, keeps notes and anchors', () => {
  const built = buildPublished({ ...manifest, interactiveStatus: 'draft' }, notes, two, true, new Date('2026-01-02T03:04:05Z'));
  assert.ok(built.ok);
  const json = JSON.parse(built.text);
  assert.equal(json.reviewedByHand, true);
  assert.equal(json.interactiveStatus, 'ready');
  assert.equal(json.publishedAt, '2026-01-02T03:04:05.000Z');
  assert.deepEqual(json.syncAnchors, two);
  assert.equal(json.notes.length, notes.length);
  assert.ok(loadPublished(built.text).ok);
  assert.ok(checkPublishedForWrite(built.text).ok);
  assert.equal(checkPublishedForWrite(JSON.stringify({ ...json, reviewedByHand: false })).ok, false);
});

test('anchors: add/update/delete keep both clocks strictly increasing', () => {
  const added = addAnchor(two, { mediaTimeMs: 8000, beat: 16 });
  assert.ok(added.ok && added.anchors.length === 3);
  assert.equal(addAnchor(two, { mediaTimeMs: 8000, beat: 30 }).ok, false, 'beat out of order');
  assert.equal(addAnchor(two, { mediaTimeMs: 2000, beat: 5 }).ok, false, 'same time');
  assert.equal(addAnchor(two, { mediaTimeMs: Number.NaN, beat: 5 }).ok, false);
  assert.equal(updateAnchor(two, 1, { beat: 4 }).ok, false);
  const moved = updateAnchor(two, 1, { mediaTimeMs: 12000 });
  assert.ok(moved.ok && moved.anchors[1].mediaTimeMs === 12000);
  assert.equal(deleteAnchor(two, 0).length, 1);
});

test('rebaseNotes keeps each note at the same video time by default, or keeps beats on request', () => {
  const after = updateAnchor(two, 1, { mediaTimeMs: 12000 });
  assert.ok(after.ok);
  const kept = rebaseNotes(notes, two, after.anchors);
  notes.forEach((n, i) => {
    assert.ok(Math.abs(timeAtBeat(after.anchors, kept[i].startBeat) - timeAtBeat(two, n.startBeat)) < 1);
    const endOld = timeAtBeat(two, n.startBeat + n.durationBeats);
    assert.ok(Math.abs(timeAtBeat(after.anchors, kept[i].startBeat + kept[i].durationBeats) - endOld) < 1);
  });
  assert.deepEqual(rebaseNotes(notes, two, after.anchors, 'keep-beats'), notes);
  assert.deepEqual(rebaseNotes(notes, two, [two[0]]), notes);
});
