import { observeMicrophoneFrame, summarizeMicrophone } from '../lib/microphone-feedback';
import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateOnsets } from '../lib/music-engine';
import { metronomePulses } from '../lib/practice-metronome';
import { fixtureMusicXml, writtenPitch } from '../lib/lesson-notation';
import { advanceLoop, captureOnset, createPracticeTimeline, evaluatePractice, positionAt, timeAt, timeline } from '../lib/lesson-timeline';

const note=[{id:'n1',pitch:60,atMs:1000}];
test('perfect performance is 100',()=>{const r=evaluateOnsets(note,[{pitch:60,atMs:1000}]);assert.equal(r.score,100);assert.equal(r.hitCount,1);});
test('silence is 0 and missing target',()=>{const r=evaluateOnsets(note,[]);assert.equal(r.score,0);assert.equal(r.missCount,1);});
test('both inclusive boundaries match',()=>{for(const offset of [-150,150]){const r=evaluateOnsets(note,[{pitch:60,atMs:1000+offset}]);assert.equal(r.hitCount,1);assert.equal(r.score,70);}});
test('outside 151ms does not match',()=>{for(const offset of [-151,151]){const r=evaluateOnsets(note,[{pitch:60,atMs:1000+offset}]);assert.equal(r.hitCount,0);assert.equal(r.unexpectedCount,1);}});
test('duplicate event never gives duplicate credit',()=>{const r=evaluateOnsets(note,[{pitch:60,atMs:1000},{pitch:60,atMs:1000}]);assert.equal(r.hitCount,1);assert.equal(r.unexpectedCount,1);assert.equal(r.score,65);});
test('extra unexpected note lowers score',()=>{const r=evaluateOnsets(note,[{pitch:60,atMs:1000},{pitch:62,atMs:1000}]);assert.equal(r.score,65);});
test('permitted jazz color does not lower score or replace missing notes',()=>{
 const regions=[{fromMs:0,toMs:2000,chord:'C7',allowedExtraPitchClasses:[3]}];
 const r=evaluateOnsets(note,[{pitch:60,atMs:1000},{pitch:63,atMs:1100}],regions);
 assert.equal(r.score,100);assert.equal(r.allowedTensionCount,1);
 const missing=evaluateOnsets(note,[{pitch:63,atMs:1100}],regions);
 assert.equal(missing.score,0);assert.equal(missing.missCount,1);assert.equal(missing.allowedTensionCount,1);
});
test('same pitch color in disallowed region is unexpected',()=>{
 const regions=[{fromMs:0,toMs:1000,chord:'C7',allowedExtraPitchClasses:[3]},{fromMs:1000,toMs:2000,chord:'Dm7',allowedExtraPitchClasses:[]}];
 const r=evaluateOnsets([{id:'n',pitch:60,atMs:1100}],[{pitch:60,atMs:1100},{pitch:63,atMs:1200}],regions);
 assert.equal(r.unexpectedCount,1);
});
test('matches are deterministic with overlapping same pitch targets',()=>{
 const targets=[{id:'a',pitch:60,atMs:1000},{id:'b',pitch:60,atMs:1100}];
 const inputs=[{pitch:60,atMs:1040},{pitch:60,atMs:1080}];
 assert.deepEqual(evaluateOnsets(targets,inputs),evaluateOnsets(targets,inputs));assert.equal(evaluateOnsets(targets,inputs).hitCount,2);
});
test('rejects invalid data and zero target exercises',()=>{
 assert.throws(()=>evaluateOnsets([],[]));assert.throws(()=>evaluateOnsets(note,[{pitch:-1,atMs:0}]));assert.throws(()=>evaluateOnsets(note,[],[],0));
});

test('the original score, falling notes and MIDI targets share every event ID and pitch', () => {
 const xml = fixtureMusicXml();
 const result = evaluatePractice(timeline.notes.map(({ pitch, atMs }) => ({ pitch, atMs })));
 assert.equal(result.score, 100);
 assert.equal(result.hitCount, 12);
 assert.deepEqual(positionAt(0).activeNotes.map(note => note.pitch), [50, 53, 57, 60]);
 assert.deepEqual(positionAt(4_000).activeNotes.map(note => note.pitch), [43, 47, 50, 53]);
 assert.deepEqual(positionAt(8_000).activeNotes.map(note => note.pitch), [48, 52, 55, 59]);
 assert.deepEqual(timeline.measures.map(measure => measure.chord), ['Dm7', 'G7', 'Cmaj7']);
 assert.equal(positionAt(12_000).measure, undefined);
 const xmlMeasures = [...xml.matchAll(/<measure number="\d+">(.*?)<\/measure>/g)];
 assert.equal(xmlMeasures.length, timeline.measures.length);
 for (const [index, measure] of timeline.measures.entries()) {
  assert.equal(positionAt(measure.fromMs).measure, measure);
  assert.deepEqual(positionAt(measure.toMs - 1).activeNotes, measure.notes);
  const xmlNotes = [...xmlMeasures[index][1].matchAll(/<note id="([^"]+)">(.*?)<\/note>/g)];
  assert.equal(xmlNotes.length, measure.notes.length);
  for (const note of measure.notes) {
   const { step, octave } = writtenPitch(note.pitch);
   const serialized = xmlNotes.find(([_, id]) => id === note.id)?.[2];
   assert.ok(serialized);
   assert.ok(serialized.includes(`<pitch><step>${step}</step><octave>${octave}</octave></pitch>`));
   assert.ok(serialized.includes(`<duration>${note.durationBeats}</duration>`));
   assert.equal(result.matches.find(match => match.id === note.id)?.expectedMs, measure.fromMs);
  }
 }
});

test('count-in, pause and resume keep MIDI time aligned with rendered position', () => {
 const start = { startedAt: 10_000, offsetMs: -timeline.countInMs };
 assert.equal(timeAt(start, 14_000), 0);
 assert.equal(captureOnset(start, 13_849, 50), undefined);
 assert.equal(captureOnset(start, 13_850, 52), undefined);
 const early = captureOnset(start, 13_850, 50)!;
 assert.equal(evaluatePractice([early]).matches[0].deviationMs, -150);

 const resumed = { startedAt: 19_000, offsetMs: timeAt(start, 16_500) };
 assert.equal(captureOnset(resumed, 18_999, 43), undefined);
 const secondChord = captureOnset(resumed, 20_500, 43)!;
 assert.equal(positionAt(secondChord.atMs).measure?.chord, 'G7');
 assert.equal(evaluatePractice([secondChord]).matches[0].deviationMs, 0);
 assert.equal(captureOnset(resumed, 28_500, 48), undefined);
});

test('practice tempos scale the count-in, chord positions and MIDI targets while preserving event IDs', () => {
 for (const bpm of [30, 45, 60, 72]) {
  const practice = createPracticeTimeline(bpm);
  const clock = { startedAt: 1_000, offsetMs: -practice.countInMs };
  assert.equal(practice.countInMs, 4 * 60_000 / bpm);
  assert.equal(positionAt(-practice.countInMs, practice).beat, -4);
  assert.deepEqual(practice.notes.map(note => note.id), timeline.notes.map(note => note.id));
  for (const note of practice.notes) {
   assert.equal(note.atMs, note.startBeat * practice.beatMs);
   assert.equal(note.endMs, (note.startBeat + note.durationBeats) * practice.beatMs);
   assert.ok(positionAt(note.atMs, practice).activeNotes.includes(note));
  }
  const onsets = practice.notes.map(note => {
   const onset = captureOnset(clock, clock.startedAt + practice.countInMs + note.atMs, note.pitch, practice);
   assert.ok(onset);
   return onset;
  });
  assert.equal(evaluatePractice(onsets, practice).score, 100);
  const secondChord = practice.measures[1].fromMs;
  assert.equal(positionAt(secondChord, practice).measure?.chord, 'G7');
  assert.equal(evaluatePractice([{ pitch: 43, atMs: secondChord + 150 }], practice).hitCount, 1);
  assert.equal(evaluatePractice([{ pitch: 43, atMs: secondChord + 151 }], practice).hitCount, 0);
  assert.throws(() => createPracticeTimeline(0), RangeError);
 }
});

test('metronome follows the count-in, selected tempo and resumed position', () => {
 const practice = createPracticeTimeline(30);
 const pulses = metronomePulses(practice, { startedAt: 1_000, offsetMs: -practice.countInMs });
 assert.equal(pulses.length, 16);
 assert.deepEqual(pulses.filter(pulse => pulse.accented).map(pulse => pulse.timestamp),
  [1_000, 9_000, 17_000, 25_000]);
 assert.equal(pulses.at(-1)?.timestamp, 31_000);
 const resumed = metronomePulses(practice, { startedAt: 40_000, offsetMs: 7_250 });
 assert.deepEqual(resumed[0], { timestamp: 40_750, accented: true });
 assert.deepEqual(metronomePulses(practice, { startedAt: 40_000, offsetMs: practice.durationMs }), []);
});

test('a selected measure repeats on the original beat grid with matching note IDs and pulses', () => {
 const practice = createPracticeTimeline(30, { first: 1, last: 1 });
 assert.equal(practice.startBeat, 4);
 assert.equal(practice.durationMs, 8_000);
 assert.equal(positionAt(0, practice).measure?.chord, 'G7');
 assert.deepEqual(practice.notes.map(note => note.id), ['note-4', 'note-5', 'note-6', 'note-7']);
 const segment = { startedAt: 1_000, offsetMs: -8_000 };
 assert.equal(advanceLoop(segment, 16_999, practice), undefined);
 assert.deepEqual(advanceLoop(segment, 17_000, practice), { startedAt: 17_000, offsetMs: 0 });
 const resumed = { startedAt: 10_000, offsetMs: 3_000 };
 const afterSkippedCycles = advanceLoop(resumed, 32_250, practice);
 assert.deepEqual(afterSkippedCycles, { startedAt: 31_000, offsetMs: 0 });
 assert.equal(timeAt(afterSkippedCycles!, 32_250), 1_250);
 assert.equal(metronomePulses(practice, segment).length, 8);
 assert.deepEqual(metronomePulses(practice, afterSkippedCycles!).map(pulse => pulse.timestamp),
  [31_000, 33_000, 35_000, 37_000]);
 assert.throws(() => createPracticeTimeline(60, { first: 2, last: 1 }), RangeError);
});

test('microphone evidence groups simultaneous target notes in the correct measure', () => {
 const evidence = new Map<number, number[]>();
 observeMicrophoneFrame(evidence, timeline, -1, [50, 53, 57, 60]);
 observeMicrophoneFrame(evidence, timeline, 100, [50, 53, 97]);
 observeMicrophoneFrame(evidence, timeline, 200, [57, 60]);
 observeMicrophoneFrame(evidence, timeline, 4_000, [43, 47, 50, 53]);
 observeMicrophoneFrame(evidence, timeline, 12_000, [48, 52, 55, 59]);
 assert.deepEqual(summarizeMicrophone(evidence, timeline), [
  { chord: 'Dm7', heard: [50, 53], uncertain: [57, 60] },
  { chord: 'G7', heard: [43, 47, 50, 53], uncertain: [] },
  { chord: 'Cmaj7', heard: [], uncertain: [48, 52, 55, 59] },
 ]);
});
