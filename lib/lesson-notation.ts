import { demoLesson } from './lesson';
import { timeline, type TimelineNote } from './lesson-timeline';

const pitches = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
const steps = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function writtenPitch(midi: number) {
  const step = pitches[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  const alter = Number([1, 3, 6, 8, 10].includes(midi % 12));
  return { step, octave, alter, staffStep: octave * 7 + steps.indexOf(step) };
}

/** Export the original, whole-measure ii–V–I fixture using its canonical note IDs. */
export function fixtureMusicXml() {
  const [beats, beatType] = demoLesson.timeSignature;
  const attributes = `<attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>${beats}</beats><beat-type>${beatType}</beat-type></time><staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef></attributes><direction><sound tempo="${demoLesson.bpm}"/></direction>`;

  function voice(notes: TimelineNote[], staff: number) {
    return notes.map(({ id, pitch, durationBeats }, index) => {
      const { step, octave, alter } = writtenPitch(pitch);
      return `<note id="${id}">${index ? '<chord/>' : ''}<pitch><step>${step}</step>${alter ? '<alter>1</alter>' : ''}<octave>${octave}</octave></pitch><duration>${durationBeats}</duration><voice>${staff}</voice><type>whole</type><staff>${staff}</staff></note>`;
    }).join('');
  }

  const measures = timeline.measures.map(({ notes }, index) => {
    const right = voice(notes.filter(note => note.hand === 'right'), 1);
    const left = voice(notes.filter(note => note.hand === 'left'), 2);
    return `<measure number="${index + 1}">${index === 0 ? attributes : ''}${right}<backup><duration>${beats}</duration></backup>${left}</measure>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <work><work-title>JazzVerse Piano · ii–V–I (exercício original)</work-title></work>
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
${measures}
  </part>
</score-partwise>`;
}
