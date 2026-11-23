import test from 'node:test';
import assert from 'node:assert/strict';
import { keyboardRangeFor } from '../lib/keyboard-range';

const black = (p: number) => [1, 3, 6, 8, 10].includes(p % 12);

test('empty list falls back to 43–72', () => {
  assert.deepEqual(keyboardRangeFor([]), { first: 43, last: 72 });
});

test('notes 29–93 are all inside the range, which starts and ends on white keys', () => {
  const notes = [{ pitch: 29 }, { pitch: 60 }, { pitch: 93 }];
  const { first, last } = keyboardRangeFor(notes);
  for (const n of notes) assert.ok(n.pitch >= first && n.pitch <= last);
  assert.equal(black(first), false);
  assert.equal(black(last), false);
});

test('narrow note sets keep at least 43–72', () => {
  assert.deepEqual(keyboardRangeFor([{ pitch: 60 }]), { first: 43, last: 72 });
});

test('black edge notes widen to white keys; result is clamped to 21–108', () => {
  assert.deepEqual(keyboardRangeFor([{ pitch: 42 }, { pitch: 73 }]), { first: 41, last: 74 });
  assert.deepEqual(keyboardRangeFor([{ pitch: 5 }, { pitch: 120 }]), { first: 21, last: 108 });
});
