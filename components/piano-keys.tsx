import { noteName } from '@/lib/lesson';
import { writtenPitch } from '@/lib/lesson-notation';

export function keyboardLayout(first: number, last: number) {
  const keys = Array.from({ length: last - first + 1 }, (_, index) => first + index);
  const white = keys.filter(pitch => !writtenPitch(pitch).alter);
  const width = 100 / white.length;
  const lane = (pitch: number) => writtenPitch(pitch).alter
    ? (white.indexOf(pitch - 1) + 1) * width
    : (white.indexOf(pitch) + .5) * width;
  return { keys, white, width, lane };
}

export function PianoKeys({ layout, active, onPlay, disabled }: {
  layout: ReturnType<typeof keyboardLayout>;
  active: readonly number[];
  onPlay: (pitch: number) => void;
  disabled?: boolean;
}) {
  const { keys, white, width, lane } = layout;
  return <div className="keyboard" role="group" aria-label="Teclado de piano">
    {white.map(pitch => (
      <button key={pitch} type="button" className={`white-key${active.includes(pitch) ? ' active' : ''}`}
        aria-label={noteName(pitch)} disabled={disabled} onClick={() => onPlay(pitch)}>
        <small>{pitch % 12 === 0 ? noteName(pitch) : ''}</small>
      </button>
    ))}
    {keys.filter(pitch => writtenPitch(pitch).alter).map(pitch => (
      <button key={pitch} type="button" className={`black-key${active.includes(pitch) ? ' active' : ''}`}
        aria-label={noteName(pitch)} disabled={disabled} onClick={() => onPlay(pitch)}
        style={{ left: `${lane(pitch)}%`, width: `${width * .61}%` }} />
    ))}
  </div>;
}
