'use client';

import { create, type Detector } from '@markusstrasser/pitchplease';
import type { Cursor, OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { useEffect, useRef, useState } from 'react';
import { fixtureMusicXml } from '@/lib/lesson-notation';
import { noteName } from '@/lib/lesson';
import { PianoSampler } from '@/lib/piano-sampler';
import { keyboardLayout, PianoKeys } from './piano-keys';

function pitchesAt(cursor: Cursor) {
  return [...new Set(cursor.NotesUnderCursor()
    .filter(note => !note.isRest())
    .map(note => note.halfTone + 12)
    .filter(pitch => Number.isInteger(pitch) && pitch >= 21 && pitch <= 108))]
    .sort((a, b) => a - b);
}

export function BookPractice() {
  const host = useRef<HTMLDivElement>(null);
  const display = useRef<OpenSheetMusicDisplay | null>(null);
  const audio = useRef<PianoSampler | null>(null);
  const target = useRef<number[]>([]);
  const played = useRef(new Set<number>());
  const microphone = useRef<Detector | null>(null);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [step, setStep] = useState<{ measure: number; notes: number[] } | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => () => {
    microphone.current?.stop();
    microphone.current = null;
    audio.current?.close();
    display.current?.clear();
  }, []);

  function updateStep(cursor: Cursor) {
    target.current = cursor.Iterator.EndReached ? [] : pitchesAt(cursor);
    played.current.clear();
    setStep(cursor.Iterator.EndReached ? null : {
      measure: cursor.Iterator.CurrentMeasureIndex + 1,
      notes: target.current,
    });
  }

  function next() {
    const cursor = display.current?.cursor;
    if (!cursor || cursor.Iterator.EndReached) return;
    do {
      cursor.next();
    } while (!cursor.Iterator.EndReached && pitchesAt(cursor).length === 0);
    updateStep(cursor);
    if (cursor.Iterator.EndReached) stopListening();
  }

  function restart() {
    const cursor = display.current?.cursor;
    if (!cursor) return;
    cursor.reset();
    updateStep(cursor);
    if (target.current.length === 0) next();
  }

  function stopListening() {
    const detector = microphone.current;
    microphone.current = null;
    detector?.stop();
    setListening(false);
  }

  async function load(name: string, read: () => Promise<string>) {
    const container = host.current;
    if (!container) return;
    stopListening();
    setLoading(true);
    setMessage('');
    setStep(null);
    setTitle('');
    target.current = [];
    display.current?.clear();
    display.current = null;
    try {
      // Standard MusicXML exports can declare a public DTD; the renderer does not need it.
      const xml = (await read()).replace(/<!DOCTYPE[^>\[]*>/gi, '');
      if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('unsupported XML declarations');
      const parsed = new DOMParser().parseFromString(xml, 'application/xml');
      if (parsed.documentElement.localName !== 'score-partwise' || parsed.querySelector('parsererror')) {
        throw new Error('invalid MusicXML');
      }
      const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay');
      if (host.current !== container) return;
      const score = new OpenSheetMusicDisplay(container, { backend: 'svg', drawTitle: true, followCursor: true });
      display.current = score;
      await score.load(parsed);
      if (host.current !== container) return;
      score.render();
      score.cursor.show();
      setTitle(name);
      restart();
    } catch {
      if (host.current !== container) return;
      display.current?.clear();
      display.current = null;
      setMessage('Não foi possível abrir a partitura. Usa um ficheiro MusicXML (.musicxml ou .xml).');
    } finally {
      if (host.current === container) setLoading(false);
    }
  }

  async function listen() {
    if (microphone.current) {
      stopListening();
      return;
    }
    audio.current?.close();
    let previous = new Set<number>();
    const detector = create({
      model: 'piano', assetBaseUrl: '/pitchplease/',
      onNotes(notes) {
        if (microphone.current !== detector) return;
        const heard = new Set(notes.map(note => note.midi));
        const expected = target.current;
        if (expected.length && expected.every(pitch => heard.has(pitch)) &&
          expected.some(pitch => !previous.has(pitch))) next();
        previous = heard;
      },
      onError() {
        if (microphone.current !== detector) return;
        stopListening();
        setMessage('Não foi possível usar o microfone. Verifica as permissões do navegador.');
      },
    });
    microphone.current = detector;
    setListening(true);
    setMessage('');
    await detector.start();
  }

  function play(pitches: number[]) {
    const sampler = audio.current ??= new PianoSampler();
    void sampler.play(pitches).catch(() => setMessage('Não foi possível reproduzir o som do piano.'));
  }

  function playKey(pitch: number) {
    play([pitch]);
    const expected = target.current;
    if (!expected.includes(pitch)) return;
    played.current.add(pitch);
    if (expected.every(note => played.current.has(note))) next();
  }

  const lowest = step?.notes[0] ?? 60;
  const highest = step?.notes.at(-1) ?? lowest;
  const firstKey = Math.max(21, Math.min(48, Math.floor(lowest / 12) * 12));
  const lastKey = Math.min(108, Math.max(72, (Math.floor(highest / 12) + 1) * 12));
  const layout = keyboardLayout(firstKey, lastKey);

  return <section className="player-panel book-practice">
    <div className="player-controls">
      <label className="book-upload">Abrir partitura
        <input type="file" accept=".musicxml,.xml" disabled={loading} onChange={event => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (!file) return;
          if (file.size > 3_000_000) {
            setMessage('Escolhe um exercício MusicXML até 3 MB.');
            return;
          }
          void load(file.name, () => file.text());
        }} />
      </label>
      <button onClick={() => void load('Cadência ii–V–I', async () => fixtureMusicXml())} disabled={loading}>Abrir exemplo</button>
    </div>
    {!title && !loading && <p className="muted">Abre um exercício do teu livro em MusicXML ou experimenta a cadência ii–V–I. O ficheiro fica neste navegador.</p>}
    {loading && <p role="status">A preparar a partitura…</p>}
    {message && <p role="status">{message}</p>}
    {title && <h2>{title}</h2>}
    <div ref={host} className={title ? 'book-score' : undefined} />
    {title && <div className="player-controls">
      <button disabled={!step} onClick={listen} aria-pressed={listening}>{listening ? 'Parar microfone' : 'Seguir com microfone'}</button>
      <button disabled={!step || listening} onClick={() => play([...target.current])}>Ouvir notas</button>
      <button disabled={!step} onClick={next}>Avançar</button>
      <button onClick={restart}>Recomeçar</button>
    </div>}
    {title && <p className="book-target" role="status">{step
      ? `Compasso ${step.measure} · ${step.notes.map(noteName).join(' · ')}`
      : 'Fim do exercício'}</p>}
    <div className="book-keyboard" style={{ '--white-keys': layout.white.length } as React.CSSProperties}>
      <PianoKeys layout={layout} active={step?.notes ?? []} onPlay={playKey} disabled={listening} />
    </div>
    <a className="audio-credit" href="/piano-samples/attribution.txt">Créditos do som de piano</a>
  </section>;
}
