import { noteName } from '@/lib/lesson';
import { fixtureMusicXml, writtenPitch } from '@/lib/lesson-notation';
import { timeline, type PracticeTimeline, type TimelineNote } from '@/lib/lesson-timeline';

const keys = Array.from({ length: 30 }, (_, index) => 43 + index);
const whiteKeys = keys.filter(pitch => !writtenPitch(pitch).alter);
const laneWidth = 100 / whiteKeys.length;

function lane(pitch: number) {
  const whiteIndex = whiteKeys.indexOf(pitch);
  return whiteIndex >= 0
    ? (whiteIndex + 0.5) * laneWidth
    : (whiteKeys.indexOf(pitch - 1) + 1) * laneWidth;
}

export function FallingNotes({ atMs, active, practice }: { atMs: number; active: number[]; practice: PracticeTimeline }) {
  const horizonMs = 4 * practice.beatMs;
  return (
    <div className="roll">
      <div className="falling-lanes" aria-hidden="true">
        {whiteKeys.map(pitch => <span key={pitch} className="lane-divider" style={{ left: `${lane(pitch) - laneWidth / 2}%` }} />)}
        {practice.notes.filter(note => note.endMs > atMs && note.atMs <= atMs + horizonMs).map(note => {
          const top = Math.max(0, 100 - 100 * (note.endMs - atMs) / horizonMs);
          const bottom = Math.min(100, 100 - 100 * (note.atMs - atMs) / horizonMs);
          return <span key={note.id} data-note-id={note.id} className={`fall-note ${note.hand}`}
            style={{ left: `${lane(note.pitch)}%`, top: `${top}%`, height: `${bottom - top}%`, width: `${laneWidth * 0.58}%` }} />;
        })}
      </div>
      <div className="keyboard" aria-label="Teclado de Sol 2 a Dó 5">
        {whiteKeys.map(pitch => (
          <div key={pitch} className={active.includes(pitch) ? 'white-key active' : 'white-key'} title={noteName(pitch)}>
            <small>{pitch % 12 === 0 ? noteName(pitch) : ''}</small>
          </div>
        ))}
        {keys.filter(pitch => writtenPitch(pitch).alter).map(pitch => (
          <div key={pitch} className={active.includes(pitch) ? 'black-key active' : 'black-key'}
            title={noteName(pitch)} style={{ left: `${lane(pitch)}%`, width: `${laneWidth * 0.61}%` }} />
        ))}
      </div>
    </div>
  );
}

const musicXmlUrl = `data:application/vnd.recordare.musicxml+xml;charset=utf-8,${encodeURIComponent(fixtureMusicXml())}`;
const scoreStart = 64;
const measureWidth = 124;
const onsetInset = 14;
const scoreEnd = scoreStart + timeline.measures.length * measureWidth;
const scoreBottom = 147;
const staves = [
  { top: 35, bottom: 67, bottomPitch: 64, clef: '𝄞', clefY: 63 },
  { top: 115, bottom: scoreBottom, bottomPitch: 43, clef: '𝄢', clefY: 138 },
];

function WholeNote({ note, x, active }: { note: TimelineNote; x: number; active: boolean }) {
  const staff = staves[note.hand === 'right' ? 0 : 1];
  const step = writtenPitch(note.pitch).staffStep - writtenPitch(staff.bottomPitch).staffStep;
  const y = staff.bottom - step * 4;
  const ledgerLines = [];
  for (let line = staff.bottom + 8; line <= y; line += 8) ledgerLines.push(line);
  for (let line = staff.top - 8; line >= y; line -= 8) ledgerLines.push(line);
  return (
    <g className={active ? 'score-note current' : 'score-note'} data-note-id={note.id}>
      <title>{noteName(note.pitch)}</title>
      {ledgerLines.map(line => <path key={line} d={`M${x - 10} ${line}h20`} />)}
      <ellipse cx={x} cy={y} rx="6" ry="2.65" strokeWidth="2.5" fill="none" />
    </g>
  );
}

export function PracticeScore({ progress, activeNotes }: { progress: number; activeNotes: TimelineNote[] }) {
  const fraction = Math.max(0, Math.min(progress, 1));
  const cursorX = Math.min(scoreEnd, scoreStart + onsetInset + fraction * (scoreEnd - scoreStart));
  return (
    <figure className="score">
      <svg viewBox={`0 0 ${scoreEnd + 10} ${scoreBottom + 16}`} role="img"
        aria-label="Partitura original em 4/4 com três compassos: Dm7, G7 e Cmaj7">
        <path className="score-line" d={`M10 35V${scoreBottom} M${scoreStart} 35V${scoreBottom}`} />
        {staves.map(staff => (
          <g key={staff.top}>
            {Array.from({ length: 5 }, (_, i) => staff.top + i * 8).map(y => (
              <path key={y} className="score-line" d={`M10 ${y}H${scoreEnd}`} />
            ))}
            <text x="15" y={staff.clefY} className="score-clef">{staff.clef}</text>
            <text x="44" y={staff.top + 14} className="score-meter">4</text>
            <text x="44" y={staff.top + 28} className="score-meter">4</text>
          </g>
        ))}
        {timeline.measures.map((measure, index) => {
          const x = scoreStart + index * measureWidth;
          return (
            <g key={measure.chord}>
              <text x={x + 10} y="22" className="score-chord">{measure.chord}</text>
              <path className="score-line" d={`M${x + measureWidth} 35V${scoreBottom}`} />
              {measure.notes.map(note => <WholeNote key={note.id} note={note} x={x + onsetInset} active={activeNotes.some(active => active.id === note.id)} />)}
            </g>
          );
        })}
        <path className="score-cursor" d={`M${cursorX} 28V${scoreBottom + 6}`} />
      </svg>
      <figcaption><a href={musicXmlUrl} download="jazzverse-ii-v-i.musicxml">Transferir MusicXML</a></figcaption>
    </figure>
  );
}
