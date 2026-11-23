/** A point tying the video clock (ms) to the musical clock (beats). */
export type SyncAnchor = { mediaTimeMs: number; beat: number };

/** Sorts anchors by video time and checks both clocks strictly increase. */
export function normalizeAnchors(anchors: readonly SyncAnchor[]): SyncAnchor[] {
  if (anchors.length < 2) throw new RangeError('At least 2 sync anchors are required');
  const sorted = [...anchors].sort((a, b) => a.mediaTimeMs - b.mediaTimeMs);
  sorted.forEach((anchor, i) => {
    if (!Number.isFinite(anchor.mediaTimeMs) || !Number.isFinite(anchor.beat)) throw new RangeError('Sync anchors must be finite');
    const previous = sorted[i - 1];
    if (previous && (anchor.mediaTimeMs <= previous.mediaTimeMs || anchor.beat <= previous.beat)) {
      throw new RangeError('Sync anchors must strictly increase in both time and beat');
    }
  });
  return sorted;
}

function interpolate(points: readonly SyncAnchor[], key: 'mediaTimeMs' | 'beat', value: number) {
  const other = key === 'beat' ? 'mediaTimeMs' : 'beat';
  const next = points.findIndex(point => value < point[key]);
  // Segment [i, i+1]: first segment before the first anchor, last segment after the last.
  const i = next === -1 ? points.length - 2 : Math.max(0, next - 1);
  const a = points[i];
  const b = points[i + 1];
  return a[other] + (value - a[key]) * (b[other] - a[other]) / (b[key] - a[key]);
}

/** Video time (ms) → beat. Linear between anchors, extrapolated along the nearest segment outside. */
export function beatAtTime(anchors: readonly SyncAnchor[], mediaTimeMs: number): number {
  return interpolate(normalizeAnchors(anchors), 'mediaTimeMs', mediaTimeMs);
}

/** Beat → video time (ms). Inverse of {@link beatAtTime}. */
export function timeAtBeat(anchors: readonly SyncAnchor[], beat: number): number {
  return interpolate(normalizeAnchors(anchors), 'beat', beat);
}
