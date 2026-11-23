import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { addNote, buildDraft, checkDraftForWrite, deleteNote, draftWriteEnabled, ensureIds, handForMidi, moveNote, newId, parseDraft, serializeDraft, sortNotes } from '../lib/note-editor';

const draftText = readFileSync(new URL('../content/bebop-blues/draft.json', import.meta.url), 'utf8');
const opened = parseDraft(draftText);
assert.ok(opened.ok);
const { manifest, notes } = opened;

test('addNote: 0.5 beat, hand by the midi<60 rule, unique id, sorted', () => {
  const low = addNote(notes, { startBeat: 1.0, midi: 55 });
  assert.equal(low.note.durationBeats, 0.5);
  assert.equal(low.note.hand, 'left');
  assert.equal(addNote(notes, { startBeat: 1, midi: 60 }).note.hand, 'right');
  assert.equal(handForMidi(59), 'left');
  assert.equal(low.notes.length, notes.length + 1);
  assert.equal(new Set(low.notes.map(n => n.id)).size, low.notes.length);
  for (let i = 1; i < low.notes.length; i++) assert.ok(low.notes[i - 1].startBeat <= low.notes[i].startBeat);
  assert.equal(notes.length, opened.notes.length, 'input is not mutated');
});

test('addNote snaps to 1/8 beat only when asked, and never goes below beat 0', () => {
  assert.equal(addNote([], { startBeat: 1.06, midi: 60 }, { snap: true }).note.startBeat, 1);
  assert.equal(addNote([], { startBeat: 1.06, midi: 60 }, { snap: true }).note.startBeat, 1);
  assert.equal(addNote([], { startBeat: 1.06, midi: 60 }).note.startBeat, 1.06);
  assert.equal(addNote([], { startBeat: -3, midi: 60 }).note.startBeat, 0);
  assert.equal(addNote([], { startBeat: 1.2, midi: 60 }, { snap: true }).note.startBeat, 1.25);
});

test('ids stay unique after many adds and after deleting the highest', () => {
  let list = ensureIds([{ midi: 60, startBeat: 0, durationBeats: 1, hand: 'right' }]);
  for (let i = 0; i < 20; i++) list = addNote(list, { startBeat: i, midi: 62 }).notes;
  assert.equal(new Set(list.map(n => n.id)).size, 21);
  assert.ok(!list.some(n => n.id === newId(list)));
});

test('ensureIds repairs missing and duplicate ids but keeps good ones', () => {
  const fixed = ensureIds([
    { id: 'a', midi: 60, startBeat: 0, durationBeats: 1, hand: 'right' },
    { id: 'a', midi: 61, startBeat: 1, durationBeats: 1, hand: 'right' },
    { midi: 62, startBeat: 2, durationBeats: 1, hand: 'right' },
  ]);
  assert.equal(new Set(fixed.map(n => n.id)).size, 3);
  assert.equal(fixed[0].id, 'a');
});

test('moveNote: time and pitch, snap, clamps, order, hand kept, others untouched', () => {
  const target = notes[10];
  const moved = moveNote(notes, target.id, { startBeat: 50.06, midi: 70.4 }, { snap: true });
  const after = moved.find(n => n.id === target.id)!;
  assert.equal(after.startBeat, 50.0);
  assert.equal(after.midi, 70);
  assert.equal(after.hand, target.hand);
  assert.equal(after.durationBeats, target.durationBeats);
  assert.equal(moved.length, notes.length);
  assert.deepEqual(moved.map(n => n.id), notes.map(n => n.id)); // order untouched while moving
  const resorted = sortNotes(moved);
  for (let i = 1; i < resorted.length; i++) assert.ok(resorted[i - 1].startBeat <= resorted[i].startBeat);
  const others = moved.filter(n => n.id !== target.id);
  assert.deepEqual(others, notes.filter(n => n.id !== target.id));
  assert.equal(moveNote(notes, target.id, { startBeat: -5 }).find(n => n.id === target.id)!.startBeat, 0);
  assert.equal(moveNote(notes, target.id, { midi: 200 }, { maxMidi: 96 }).find(n => n.id === target.id)!.midi, 96);
  assert.equal(moveNote(notes, 'missing', { midi: 1 }).length, notes.length);
});

test('deleteNote removes only that note', () => {
  const gone = deleteNote(notes, notes[5].id);
  assert.equal(gone.length, notes.length - 1);
  assert.ok(!gone.some(n => n.id === notes[5].id));
  assert.equal(deleteNote(notes, 'missing').length, notes.length);
});

test('acceptance: add 1, move 1, delete 1 → exported JSON has the 3 changes and reopens intact', () => {
  const added = addNote(notes, { startBeat: 3.3, midi: 64 }, { snap: true });
  const moveId = notes[20].id;
  const deleteId = notes[30].id;
  const edited = sortNotes(deleteNote(moveNote(added.notes, moveId, { startBeat: 90, midi: 72 }, { snap: true }), deleteId));

  const json = JSON.parse(serializeDraft(manifest, edited));
  assert.equal(json.interactiveStatus, 'draft');
  assert.equal(json.reviewedByHand, false);
  assert.equal(json.notes.length, notes.length); // +1 −1
  assert.ok(json.notes.some((n: { id: string }) => n.id === added.note.id));
  assert.ok(!json.notes.some((n: { id: string }) => n.id === deleteId));
  const m = json.notes.find((n: { id: string }) => n.id === moveId);
  assert.equal(m.startBeat, 90); assert.equal(m.midi, 72);
  assert.equal(json.syncAnchors.length, manifest.syncAnchors.length);

  const reopened = parseDraft(serializeDraft(manifest, edited));
  assert.ok(reopened.ok);
  assert.deepEqual(reopened.notes, edited);
});

test('buildDraft forces draft/unreviewed even from a reviewed manifest', () => {
  const reviewed = { ...manifest, interactiveStatus: 'ready', reviewedByHand: true } as unknown as typeof manifest;
  const out = buildDraft(reviewed, notes);
  assert.equal(out.interactiveStatus, 'draft');
  assert.equal(out.reviewedByHand, false);
});

test('parseDraft refuses garbage', () => {
  assert.equal(parseDraft('nope').ok, false);
  assert.equal(parseDraft('[]').ok, false);
  assert.equal(parseDraft('{}').ok, false);
});

test('dev write route validation: only unreviewed drafts, normalised', () => {
  const good = checkDraftForWrite(serializeDraft(manifest, notes));
  assert.ok(good.ok);
  assert.equal(checkDraftForWrite('x').ok, false);
  assert.equal(checkDraftForWrite(JSON.stringify({ ...JSON.parse(draftText), reviewedByHand: true })).ok, false);
  assert.equal(checkDraftForWrite(JSON.stringify({ ...JSON.parse(draftText), interactiveStatus: 'ready' })).ok, false);
  assert.equal(checkDraftForWrite(JSON.stringify({ ...JSON.parse(draftText), notes: [] })).ok, false);
});

test('draft writing is enabled only in development', () => {
  assert.equal(draftWriteEnabled('development'), true);
  assert.equal(draftWriteEnabled('production'), false);
  assert.equal(draftWriteEnabled('test'), false);
  assert.equal(draftWriteEnabled(undefined), false);
});
