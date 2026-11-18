import { evaluateOnsets, type ExpectedOnset, type HarmonyRegion, type PlayedOnset, type Evaluation } from './music-engine';
export type MusicalNote = { midi: number; startBeat: number; durationBeats: number; hand: 'left' | 'right' };
export type Lesson = { id: string; version: string; title: string; category: string; difficulty: string; instructor: string; bpm: number; timeSignature: [number,number]; durationBeats: number; notes: MusicalNote[] };
/** Provisional teaching fixture from SPEC PH1-001; requires instructor approval. */
export const demoLesson: Lesson = {
 id:'jazz-ii-v-i-001', version:'fixture-1', title:'Primeiros voicings: ii–V–I em Dó', category:'Jazz', difficulty:'Iniciante', instructor:'Aula demonstrativa', bpm:60, timeSignature:[4,4], durationBeats:12,
 notes:[
 {midi:50,startBeat:0,durationBeats:4,hand:'left'},{midi:53,startBeat:0,durationBeats:4,hand:'right'},{midi:57,startBeat:0,durationBeats:4,hand:'right'},{midi:60,startBeat:0,durationBeats:4,hand:'right'},
 {midi:43,startBeat:4,durationBeats:4,hand:'left'},{midi:47,startBeat:4,durationBeats:4,hand:'right'},{midi:50,startBeat:4,durationBeats:4,hand:'right'},{midi:53,startBeat:4,durationBeats:4,hand:'right'},
 {midi:48,startBeat:8,durationBeats:4,hand:'left'},{midi:52,startBeat:8,durationBeats:4,hand:'right'},{midi:55,startBeat:8,durationBeats:4,hand:'right'},{midi:59,startBeat:8,durationBeats:4,hand:'right'}
 ]};
export const genres=['Jazz','Clássico','Blues','Soul & Gospel','Pop'];
export function noteName(midi:number) { const pitches=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];return pitches[midi%12]+(Math.floor(midi/12)-1); }
export function fixtureExpected(lesson:Lesson=demoLesson):ExpectedOnset[]{
 const msPerBeat=60000/lesson.bpm;
 return lesson.notes.map((n,i)=>({id:`note-${i}`,pitch:n.midi,atMs:n.startBeat*msPerBeat}));
}
export function fixtureHarmony(lesson:Lesson=demoLesson):HarmonyRegion[]{
 const b=60000/lesson.bpm;
 return [
 {fromMs:0,toMs:4*b,chord:'Dm7',allowedExtraPitchClasses:[4,7,11]},
 {fromMs:4*b,toMs:8*b,chord:'G7',allowedExtraPitchClasses:[9,0,4]},
 {fromMs:8*b,toMs:12*b,chord:'Cmaj7',allowedExtraPitchClasses:[2,9]}
 ];
}
export function evaluateFixture(performed:readonly PlayedOnset[],lesson:Lesson=demoLesson):Evaluation{
 return evaluateOnsets(fixtureExpected(lesson),performed,fixtureHarmony(lesson));
}
