/**
 * Deterministic onset evaluator for the provisional MID-002..004 SPEC rules.
 * The ±150ms and 70/30 weights are PROPOSED product parameters, not approved gates.
 * Inputs are already normalized to practice-relative monotonic milliseconds.
 */
export type ExpectedOnset = { id: string; pitch: number; atMs: number };
export type PlayedOnset = { pitch: number; atMs: number };
export type HarmonyRegion = { fromMs: number; toMs: number; chord: string; allowedExtraPitchClasses: number[] };
export type OnsetMatch = { id: string; pitch: number; expectedMs: number; performedMs: number; deviationMs: number };
export type UnexpectedNote = PlayedOnset & { reason: 'unexpected' | 'out-of-window' };
export type AllowedTension = PlayedOnset & { chord: string };
export type Evaluation = {
 ruleset: 'jazzverse-onset-v1-proposed';
 score: number; accuracy: number; timing: number;
 expectedCount: number; hitCount: number; missCount: number;
 unexpectedCount: number; allowedTensionCount: number;
 meanAbsoluteDeviationMs: number | null;
 matches: OnsetMatch[]; misses: ExpectedOnset[];
 unexpected: UnexpectedNote[]; allowedTensions: AllowedTension[];
};
export const DEFAULT_WINDOW_MS = 150;
const pitchClass = (pitch: number) => ((pitch % 12) + 12) % 12;
const rounded = (n: number) => Math.round(n * 1e6) / 1e6;

/** Notes outside the attempt must be filtered by the transport before calling this function. */
export function evaluateOnsets(
 expected: readonly ExpectedOnset[],
 performed: readonly PlayedOnset[],
 regions: readonly HarmonyRegion[] = [],
 windowMs: number = DEFAULT_WINDOW_MS,
): Evaluation {
 if (!Number.isFinite(windowMs) || windowMs <= 0) throw new Error('Invalid onset window');
 if (expected.length === 0) throw new Error('Cannot score an exercise with zero targets');
 for (const n of [...expected, ...performed]) {
  if (!Number.isInteger(n.pitch) || n.pitch < 0 || n.pitch > 127 || !Number.isFinite(n.atMs)) throw new Error('Invalid note event');
 }
 const ids = new Set(expected.map(e => e.id));
 if (ids.size !== expected.length) throw new Error('Duplicate expected note ids');
 const targets = [...expected].sort((a,b)=>a.atMs-b.atMs||a.id.localeCompare(b.id));
 // Global deterministic candidate ordering: smallest onset delta, then older target,
 // then recorded onset index. Each expected and performed note can be matched once.
 const candidates: {ti:number; pi:number; delta:number}[]=[];
 for(let ti=0;ti<targets.length;ti++)for(let pi=0;pi<performed.length;pi++){
  const delta=Math.abs(targets[ti].atMs-performed[pi].atMs);
  if(targets[ti].pitch===performed[pi].pitch && delta<=windowMs+1e-9)candidates.push({ti,pi,delta});
 }
 candidates.sort((a,b)=>a.delta-b.delta||targets[a.ti].atMs-targets[b.ti].atMs||a.ti-b.ti||a.pi-b.pi);
 const usedT=new Set<number>(),usedP=new Set<number>();const matches:OnsetMatch[]=[];
 for(const c of candidates){if(usedT.has(c.ti)||usedP.has(c.pi))continue;
  usedT.add(c.ti);usedP.add(c.pi);
  const t=targets[c.ti],p=performed[c.pi];
  matches.push({id:t.id,pitch:t.pitch,expectedMs:t.atMs,performedMs:p.atMs,deviationMs:rounded(p.atMs-t.atMs)});
 }
 matches.sort((a,b)=>a.expectedMs-b.expectedMs||a.id.localeCompare(b.id));
 const misses=targets.filter((_,i)=>!usedT.has(i));
 const allowedTensions:AllowedTension[]=[];const unexpected:UnexpectedNote[]=[];
 for(let i=0;i<performed.length;i++){if(usedP.has(i))continue;
  const p=performed[i];
  // Pitch belonging to a target near enough to be the 'wrongly timed' same note
  // must not be reclassified as a permitted jazz tension.
  const lateOrEarly=targets.some(t=>t.pitch===p.pitch);
  const region=regions.find(r=>p.atMs>=r.fromMs && p.atMs<r.toMs);
  if(!lateOrEarly&&region&&region.allowedExtraPitchClasses.includes(pitchClass(p.pitch))){
   allowedTensions.push({...p,chord:region.chord});
  }else unexpected.push({...p,reason:lateOrEarly?'out-of-window':'unexpected'});
 }
 const N=expected.length,H=matches.length,E=unexpected.length;
 const accuracy=H/(N+E);
 const timing=matches.reduce((sum,m)=>sum+Math.max(0,1-Math.abs(m.deviationMs)/windowMs),0)/N;
 const score=Math.max(0,Math.min(100,Math.round(100*(.7*accuracy+.3*timing))));
 return {ruleset:'jazzverse-onset-v1-proposed',score,accuracy:rounded(accuracy),timing:rounded(timing),expectedCount:N,hitCount:H,missCount:N-H,unexpectedCount:E,allowedTensionCount:allowedTensions.length,meanAbsoluteDeviationMs:H?rounded(matches.reduce((s,m)=>s+Math.abs(m.deviationMs),0)/H):null,matches,misses,unexpected,allowedTensions};
}
