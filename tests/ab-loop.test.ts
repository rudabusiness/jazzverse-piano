import test from 'node:test';
import assert from 'node:assert/strict';
import { formatLoopTime, isValidLoop, shouldWrap } from '../lib/ab-loop';

test('valid loop needs A<B by at least 0.5 s', () => {
  assert.equal(isValidLoop(10, 20), true);
  assert.equal(isValidLoop(10, 10.5), true);
  assert.equal(isValidLoop(10, 10.4), false);
  assert.equal(isValidLoop(20, 10), false);
  assert.equal(isValidLoop(null, 10), false);
  assert.equal(isValidLoop(10, null), false);
  assert.equal(isValidLoop(-1, 10), false);
  assert.equal(isValidLoop(NaN, 10), false);
});
test('wraps at B, after B and on seek past B', () => {
  assert.equal(shouldWrap(19.99, 10, 20, true), false);
  assert.equal(shouldWrap(20, 10, 20, true), true);
  assert.equal(shouldWrap(25, 10, 20, true), true);
});
test('never wraps when disabled or invalid', () => {
  assert.equal(shouldWrap(25, 10, 20, false), false);
  assert.equal(shouldWrap(25, 10, 10.2, true), false);
  assert.equal(shouldWrap(25, null, 20, true), false);
  assert.equal(shouldWrap(NaN, 10, 20, true), false);
});
test('formats mm:ss.s', () => {
  assert.equal(formatLoopTime(null), '--:--.-');
  assert.equal(formatLoopTime(0), '00:00.0');
  assert.equal(formatLoopTime(10), '00:10.0');
  assert.equal(formatLoopTime(65.43), '01:05.4');
  assert.equal(formatLoopTime(599.99), '09:59.9');
});
