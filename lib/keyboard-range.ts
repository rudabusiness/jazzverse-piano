export const DEFAULT_KEYBOARD_RANGE = { first: 43, last: 72 } as const;
const PIANO_FIRST = 21;
const PIANO_LAST = 108;
const isBlack = (pitch: number) => [1, 3, 6, 8, 10].includes(pitch % 12);

/** Keyboard span for the falling notes: covers every note, never smaller than 43–72, starts/ends on white keys, within the 88 keys. */
export function keyboardRangeFor(notes: readonly { pitch: number }[]): { first: number; last: number } {
  let first: number = DEFAULT_KEYBOARD_RANGE.first;
  let last: number = DEFAULT_KEYBOARD_RANGE.last;
  for (const { pitch } of notes) {
    if (!Number.isFinite(pitch)) continue;
    first = Math.min(first, pitch);
    last = Math.max(last, pitch);
  }
  first = Math.max(PIANO_FIRST, first);
  last = Math.min(PIANO_LAST, last);
  while (isBlack(first)) first -= 1;
  while (isBlack(last)) last += 1;
  return { first: Math.max(PIANO_FIRST, first), last: Math.min(PIANO_LAST, last) };
}
