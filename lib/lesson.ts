export type MusicalNote = { midi: number; startBeat: number; durationBeats: number; hand: 'left' | 'right' };
export type Lesson = { id: string; title: string; category: string; difficulty: string; instructor: string; bpm: number; timeSignature: [number,number]; durationBeats: number; notes: MusicalNote[] };
export const demoLesson: Lesson = {
 id: 'jazz-ii-v-i-001', title: 'Primeiros voicings: ii–V–I em Dó', category:'Jazz', difficulty:'Iniciante', instructor:'Aula demonstrativa', bpm: 80, timeSignature: [4,4], durationBeats:12,
 notes: [
 {midi:50,startBeat:0,durationBeats:3,hand:'left'},{midi:53,startBeat:0,durationBeats:3,hand:'right'},{midi:60,startBeat:0,durationBeats:3,hand:'right'},
 {midi:55,startBeat:4,durationBeats:3,hand:'left'},{midi:59,startBeat:4,durationBeats:3,hand:'right'},{midi:65,startBeat:4,durationBeats:3,hand:'right'},
 {midi:48,startBeat:8,durationBeats:3,hand:'left'},{midi:52,startBeat:8,durationBeats:3,hand:'right'},{midi:59,startBeat:8,durationBeats:3,hand:'right'}]
};
export const genres = ['Jazz','Clássico','Blues','Soul & Gospel','Pop'];
export function noteName(midi:number) { const pitches=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];return pitches[midi%12]+(Math.floor(midi/12)-1); }
