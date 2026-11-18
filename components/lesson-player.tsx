'use client';
import { useEffect, useRef, useState } from 'react';
import { FallingNotes, PracticeScore } from './practice-views';
import { demoLesson, noteName } from '@/lib/lesson';
import { advanceLoop, captureOnset, createPracticeTimeline, evaluatePractice, measureRanges, positionAt, timeAt, timeline, type ClockSegment, type MeasureRange } from '@/lib/lesson-timeline';
import { PracticeMetronome } from '@/lib/practice-metronome';
import type { Evaluation, PlayedOnset } from '@/lib/music-engine';

const tempos = [50, 75, 100, 120].map(percent => demoLesson.bpm * percent / 100);

export function LessonPlayer() {
 const [practice, setPractice] = useState(timeline);
 const practiceRef = useRef(timeline);
 const initialPosition = -practice.countInMs;
 const [view, setView] = useState<'falling' | 'score' | 'hybrid'>('hybrid');
 const [status, setStatus] = useState('Liga um piano MIDI para começar.');
 const [active, setActive] = useState<number[]>([]);
 const [eventCount, setEventCount] = useState(0);
 const [result, setResult] = useState<Evaluation | null>(null);
 const [playing, setPlaying] = useState(false);
 const [metronomeEnabled, setMetronomeEnabled] = useState(false);
 const [audioError, setAudioError] = useState('');
 const audioRef = useRef<AudioContext | null>(null);
 const metronomeRef = useRef<PracticeMetronome | null>(null);
 const [finished, setFinished] = useState(false);
 const [waitingForMidi, setWaitingForMidi] = useState(false);
 const [atMs, setAtMs] = useState(initialPosition);
 const accessRef = useRef<MIDIAccess | null>(null);
 const inputRef = useRef<MIDIInput | null>(null);
 const connectingRef = useRef(false);
 const connectionGeneration = useRef(0);
 const segmentRef = useRef<ClockSegment | null>(null);
 const offsetRef = useRef(initialPosition);
 const eventsRef = useRef<PlayedOnset[]>([]);
 const gradedInputRef = useRef<string | null>(null);

 useEffect(() => {
  if (!playing) return;
  let frame: number;
  const tick = (timestamp: number) => {
   const segment = segmentRef.current;
   if (!segment) return;
   const sample = Math.max(timestamp, segment.startedAt);
   const loopSegment = advanceLoop(segment, sample, practice);
   if (loopSegment) segmentRef.current = loopSegment;
   const now = timeAt(loopSegment ?? segment, sample);
   if (now < practice.endMs) {
    setAtMs(now);
    frame = requestAnimationFrame(tick);
    return;
   }
   segmentRef.current = null;
   offsetRef.current = practice.endMs;
   setAtMs(practice.endMs);
   setPlaying(false);
   setFinished(true);
   if (gradedInputRef.current && inputRef.current?.id === gradedInputRef.current) {
    setResult(evaluatePractice(eventsRef.current, practice));
   } else {
    setStatus('Guia concluído. Liga um teclado MIDI antes de iniciar uma tentativa com pontuação.');
   }
   gradedInputRef.current = null;
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
 }, [playing, practice]);

 useEffect(() => {
  const segment = segmentRef.current;
  const metronome = metronomeRef.current;
  if (!playing || !metronomeEnabled || !segment || !metronome) return;
  metronome.start(practice, segment);
  return () => metronome.stop();
 }, [playing, metronomeEnabled, practice]);

 async function toggleMetronome() {
  if (metronomeEnabled) {
   metronomeRef.current?.stop();
   setMetronomeEnabled(false);
   return;
  }
  try {
   if (!audioRef.current) {
    audioRef.current = new AudioContext();
    metronomeRef.current = new PracticeMetronome(audioRef.current);
   }
   const context = audioRef.current;
   await context.resume();
   if (audioRef.current !== context) return;
   setAudioError('');
   setMetronomeEnabled(true);
  } catch {
   if (!audioRef.current || audioRef.current.state !== 'closed') {
    setAudioError('Não foi possível ligar o metrónomo neste navegador.');
   }
  }
 }

 useEffect(() => () => {
  connectionGeneration.current += 1;
  metronomeRef.current?.stop();
  const audio = audioRef.current;
  audioRef.current = null;
  metronomeRef.current = null;
  if (audio && audio.state !== 'closed') void audio.close();
  if (inputRef.current) inputRef.current.onmidimessage = null;
  if (accessRef.current) accessRef.current.onstatechange = null;
  accessRef.current = null;
  inputRef.current = null;
 }, []);

 function pause() {
  const segment = segmentRef.current;
  if (!segment) return;
  metronomeRef.current?.stop();
  const practice = practiceRef.current;
  const timestamp = performance.now();
  const current = advanceLoop(segment, timestamp, practice) ?? segment;
  offsetRef.current = Math.min(practice.endMs, timeAt(current, timestamp));
  segmentRef.current = null;
  setAtMs(offsetRef.current);
  setPlaying(false);
 }

 function restart() {
  metronomeRef.current?.stop();
  segmentRef.current = null;
  offsetRef.current = -practiceRef.current.countInMs;
  eventsRef.current = [];
  gradedInputRef.current = null;
  setAtMs(offsetRef.current);
  setPlaying(false);
  setFinished(false);
  setWaitingForMidi(false);
  setEventCount(0);
  setResult(null);
  if (accessRef.current) bindInput(accessRef.current);
  else setStatus('Liga um piano MIDI para começar.');
 }

 function changePractice(bpm: number, range?: MeasureRange) {
  const next = createPracticeTimeline(bpm, range);
  practiceRef.current = next;
  setPractice(next);
  restart();
 }

 function togglePlayback() {
  if (segmentRef.current) {
   pause();
   return;
  }
  if (waitingForMidi) return;
  if (finished) restart();
  if (offsetRef.current === initialPosition) {
   gradedInputRef.current = practice.range ? null : inputRef.current?.id ?? null;
  }
  segmentRef.current = { startedAt: performance.now(), offsetMs: offsetRef.current };
  setPlaying(true);
 }

 function handleMidi(event: MIDIMessageEvent) {
  if (!event.data || event.data.length < 3) return;
  const [status, pitch, velocity] = event.data;
  const type = status & 0xf0;
  if (type === 0x80 || (type === 0x90 && velocity === 0)) {
   setActive(previous => previous.filter(note => note !== pitch));
   return;
  }
  if (type !== 0x90 || pitch > 127) return;
  setActive(previous => previous.includes(pitch) ? previous : [...previous, pitch]);
  const segment = segmentRef.current;
  if (!segment || !gradedInputRef.current || inputRef.current?.id !== gradedInputRef.current) return;
  const onset = captureOnset(segment, event.timeStamp, pitch, practiceRef.current);
  if (!onset) return;
  eventsRef.current.push(onset);
  setEventCount(eventsRef.current.length);
 }

 function bindInput(access: MIDIAccess) {
  const previous = inputRef.current;
  const required = gradedInputRef.current;
  const inputs = [...access.inputs.values()].filter(input => input.state === 'connected');
  const next = required
   ? inputs.find(input => input.id === required)
   : inputs.find(input => input.id === previous?.id) ?? inputs[0];
  if (previous !== (next ?? null)) {
   if (previous) previous.onmidimessage = null;
   setActive([]);
   inputRef.current = next ?? null;
   if (next) next.onmidimessage = handleMidi;
  }
  if (next) {
   setWaitingForMidi(false);
   setStatus(`MIDI ligado: ${next.name ?? 'Teclado'}`);
  } else if (required) {
   pause();
   setWaitingForMidi(true);
   setStatus('Teclado MIDI desligado. Volta a ligar o mesmo teclado para retomar ou reinicia a tentativa.');
  } else {
   setStatus(previous ? 'Teclado MIDI desligado.' : 'Permissão concedida, mas nenhum teclado MIDI foi encontrado.');
  }
 }

 async function connect() {
  if (!navigator.requestMIDIAccess) {
   setStatus('Este navegador não suporta Web MIDI. Usa Chrome ou Edge num computador.');
   return;
  }
  if (accessRef.current) {
   bindInput(accessRef.current);
   return;
  }
  if (connectingRef.current) return;
  connectingRef.current = true;
  const generation = connectionGeneration.current;
  try {
   const access = await navigator.requestMIDIAccess();
   if (generation !== connectionGeneration.current) return;
   accessRef.current = access;
   access.onstatechange = () => bindInput(access);
   bindInput(access);
  } catch {
   if (generation === connectionGeneration.current) {
    setStatus('Não foi possível aceder ao dispositivo MIDI. Verifica as permissões.');
   }
  } finally {
   connectingRef.current = false;
  }
 }

 const position = positionAt(atMs, practice);
 return (
  <main className="page">
   <div className="breadcrumb">CURSO / JAZZ / LIÇÃO 01</div>
   <div className="lesson-heading">
    <div>
     <h1>Primeiros voicings: ii–V–I</h1>
     <p className="muted">Uma introdução prática à harmonia jazzística em Dó maior.</p>
    </div>
    <span className="pill">{practice.bpm} BPM · {demoLesson.timeSignature.join('/')}</span>
   </div>
   <div className="lesson-grid">
    <div className="lesson-main">
     <div className="video-placeholder">
      <div className="video-badge">VÍDEO AINDA NÃO DISPONÍVEL</div>
      <div className="video-symbol">▶</div>
      <p>O teu vídeo gravado aparecerá aqui quando for enviado e sincronizado.</p>
     </div>
     <div className="player-panel">
      <div className="section-head">
       <h2>Prática interativa</h2>
       <div className="switcher">
        <button aria-pressed={view === 'falling'} onClick={() => setView('falling')}>Notas</button>
        <button aria-pressed={view === 'score'} onClick={() => setView('score')}>Partitura</button>
        <button aria-pressed={view === 'hybrid'} onClick={() => setView('hybrid')}>Híbrido</button>
       </div>
      </div>
      {view !== 'falling' && <PracticeScore progress={(practice.startBeat + Math.max(0, position.beat)) / demoLesson.durationBeats} activeNotes={position.activeNotes} />}
      {view !== 'score' && <FallingNotes atMs={atMs} active={active} practice={practice} />}
      <div className="player-controls">
       <button className="primary" onClick={togglePlayback} disabled={waitingForMidi}>
        {playing ? 'Pausar' : finished ? 'Repetir' : atMs === initialPosition ? 'Reproduzir guia' : 'Retomar'}
       </button>
       <button onClick={restart}>Reiniciar</button>
       <button onClick={connect}>Ligar MIDI</button>
       <button aria-pressed={metronomeEnabled} onClick={toggleMetronome}>Metrónomo</button>
       <label className="tempo-control">
        Andamento
        <select value={practice.bpm} onChange={event => changePractice(Number(event.currentTarget.value), practice.range)}>
         {tempos.map(bpm => <option key={bpm} value={bpm}>{bpm} BPM</option>)}
        </select>
       </label>
       <label className="tempo-control">
        Repetição
        <select value={practice.range ? measureRanges.indexOf(practice.range) : -1}
         onChange={event => changePractice(practice.bpm, measureRanges[Number(event.currentTarget.value)])}>
         <option value="-1">Desligada</option>
         {measureRanges.map(({ first, last }, index) => (
          <option key={index} value={index}>{first === last ? `Compasso ${first + 1}` : `Compassos ${first + 1}–${last + 1}`}</option>
         ))}
        </select>
       </label>
       <span className="muted">
        {atMs < 0
         ? `Preparação · ${Math.ceil(-position.beat)}`
         : `${position.beat.toFixed(1)} / ${practice.durationBeats} tempos`}
       </span>
      </div>
      {audioError && <p className="midi-status" role="status">{audioError}</p>}
      <div className="midi-status" role="status">{status}</div>
     </div>
    </div>
    <aside className="lesson-side">
     <div className="panel">
      <p className="eyebrow">AULA 01</p>
      <h3>O que vais aprender</h3>
      <ul>
       <li>Reconhecer Dm7, G7 e Cmaj7</li>
       <li>Ouvir as resoluções ii–V–I</li>
       <li>Praticar voicings com duas mãos</li>
      </ul>
     </div>
     <div className="panel">
      <p className="eyebrow">MIDI EM TEMPO REAL</p>
      <h3>Teclas reconhecidas</h3>
      <div className="recognized">{active.length ? active.map(noteName).join(' · ') : 'Nenhuma tecla premida'}</div>
      <p className="muted">Eventos captados nesta sessão: {eventCount}</p>
      <p className="muted">Acorde atual {position.measure?.chord ?? '—'}</p>
      <p className="muted">Notas previstas neste ponto: {position.activeNotes.map(note => noteName(note.pitch)).join(', ') || '—'}</p>
      {result
       ? <div className="results" role="status">
          <h3>Resultado da tentativa</h3>
          <p><strong>{result.score}/100</strong> · {result.hitCount}/{result.expectedCount} notas-alvo</p>
          <p className="muted">
           Omissões: {result.missCount} · Extras inesperadas: {result.unexpectedCount} · Tensões permitidas: {result.allowedTensionCount}
          </p>
          <small>{practice.bpm} BPM · {demoLesson.version} · Regra provisória do SPEC</small>
         </div>
       : <p className="muted">{practice.range
          ? 'A repetição é um modo livre, sem pontuação.'
          : 'A pontuação será calculada no fim da tentativa. Liga o teclado MIDI antes de iniciar para obter pontuação.'}</p>}
     </div>
    </aside>
   </div>
  </main>
 );
}
