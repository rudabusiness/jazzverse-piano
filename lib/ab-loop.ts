/** Pure A–B loop decisions for the lesson video (times in seconds). */
export const MIN_LOOP_SECONDS = 0.5;

export type LoopPoint = number | null;

/** A loop is usable only when both points exist, are finite, A ≥ 0 and B − A ≥ 0.5 s. */
export function isValidLoop(a: LoopPoint, b: LoopPoint): boolean {
  return a !== null && b !== null && Number.isFinite(a) && Number.isFinite(b) && a >= 0 && b - a >= MIN_LOOP_SECONDS - 1e-9;
}

/** True when the video should jump back to A: loop on, valid, and the clock reached or passed B. */
export function shouldWrap(currentTime: number, a: LoopPoint, b: LoopPoint, enabled: boolean): boolean {
  return enabled && isValidLoop(a, b) && Number.isFinite(currentTime) && b !== null && currentTime >= b;
}

/** mm:ss.s label, or "--:--.-" when the point is not set. */
export function formatLoopTime(seconds: LoopPoint): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return '--:--.-';
  const tenths = Math.floor(seconds * 10 + 1e-9);
  const m = Math.floor(tenths / 600);
  const s = (tenths % 600) / 10;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
}
