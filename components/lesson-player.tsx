'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FallingNotes } from './practice-views';
import { WatchView } from './watch-view';
import { AbLoopControls } from './ab-loop-controls';
import { bebopBluesManifest, type LessonManifest } from '@/lib/lesson-manifest';
import { noteName } from '@/lib/lesson';
import { PRACTICE_TEMPO_PERCENTS, publishedToPractice } from '@/lib/published-practice';
import { advanceLoop, captureOnset, createPracticeTimeline, evaluatePractice, positionAt, timeAt, type ClockSegment } from '@/lib/lesson-timeline';
import { PracticeMetronome } from '@/lib/practice-metronome';
import { PianoSampler } from '@/lib/piano-sampler';
import type { Evaluation, PlayedOnset } from '@/lib/music-engine';

const midiPrompt = 'Liga um teclado MIDI para obter pontuação.';

/** `published` is the validated published manifest, or null while the notes are still under review (then no notes fall). */
export function LessonPlayer({ published }: { published: LessonManifest | null }) {
 const clip = published ?? bebopBluesManifest;
 // Practice runs only on the validated published notes. Without them there is no exercise (no demo, no grading).
 const adapted = useMemo(() => published ? publishedToPractice(published) : null, [published]);
 const [practice, setPractice] = useState(adapted?.timeline ?? createPracticeTimeline(60));
 const practiceRef = useRef(practice);
 const initialPosition = -practice.countInMs;
 const [mode, setMode] = useState<'watch' | 'practice'>('watch');
 const videoRef = useRef<HTMLVideoElement | null>(null);
 const [status, setStatus] = useState(midiPrompt);
 const [active, setActive] = useState<number[]>([]);
 const [eventCount, setEventCount] = useState(0);
 const [result, setResult] = useState<Evaluation | null>(null);
 const [playing, setPlaying] = useState(false);
 const [metronomeEnabled, setMetronomeEnabled] = useState(false);
 const [audioError, setAudioError] = useState('');
 const pianoRef = useRef<PianoSampler | null>(null);
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
    setStatus('Guia concluído. Liga um teclado MIDI para obter pontuação.');
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
  pianoRef.current?.close();
  pianoRef.current = null;
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
  else setStatus(midiPrompt);
 }

 function changePractice(bpm: number) {
  if (!adapted) return;
  const next = createPracticeTimeline(bpm, undefined, adapted.source);
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
   gradedInputRef.current = inputRef.current?.id ?? null;
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

 function playVirtualKey(pitch: number) {
  const piano = pianoRef.current ??= new PianoSampler();
  setAudioError('');
  void piano.play([pitch]).catch(() => setAudioError('Não foi possível reproduzir o som do piano.'));
 }

 const position = positionAt(atMs, practice);
 return (
  <main className="page">
   <div className="breadcrumb">CURSO / JAZZ / LIÇÃO 01</div>
   <div className="lesson-heading">
    <div>
     <h1>{clip.title}</h1>
     <p className="muted">{mode === 'watch' ? 'Vê o vídeo e acompanha as notas a cair.' : 'Toca as notas revistas da aula com um teclado MIDI.'}</p>
    </div>
    <div className="switcher" role="group" aria-label="Modo">
     <button aria-pressed={mode === 'watch'} onClick={() => setMode('watch')}>Ver</button>
     <button aria-pressed={mode === 'practice'} onClick={() => { videoRef.current?.pause(); setMode('practice'); }}>Prática</button>
    </div>
   </div>
   <div className="lesson-grid">
    <div className="lesson-main">
     <video ref={videoRef} className="lesson-video" controls playsInline preload="metadata" src={clip.video.url}>
      O teu navegador não suporta vídeo HTML5.
     </video>
     {mode === 'watch' && <div className="player-panel">
      <div className="section-head"><h2>Notas a cair</h2></div>
      <AbLoopControls videoRef={videoRef} />
      {published
       ? <WatchView manifest={published} videoRef={videoRef} onPlay={playVirtualKey} />
       : <p className="muted" role="status">Notas ainda em revisão.</p>}
      {audioError && <p className="midi-status" role="status">{audioError}</p>}
     </div>}
     {mode === 'practice' && !adapted && <div className="player-panel">
      <div className="section-head"><h2>Prática interativa</h2></div>
      <p className="muted" role="status">Notas ainda em revisão.</p>
     </div>}
     {mode === 'practice' && adapted && <div className="player-panel">
      <div className="section-head"><h2>Prática interativa</h2></div>
      <FallingNotes atMs={atMs} active={active} practice={practice} onPlay={playVirtualKey} keyboardDisabled={false} />
      <div className="player-controls">
       <button onClick={togglePlayback} disabled={waitingForMidi}>
        {playing ? 'Pausar' : finished ? 'Repetir' : atMs === initialPosition ? 'Reproduzir guia' : 'Retomar'}
       </button>
       <button onClick={restart}>Reiniciar</button>
       <button onClick={connect}>Usar MIDI</button>
       <button aria-pressed={metronomeEnabled} onClick={toggleMetronome}>Metrónomo</button>
       <label className="tempo-control">
        Andamento
        <select value={practice.bpm} onChange={event => changePractice(Number(event.currentTarget.value))}>
         {adapted.tempos.map((bpm, index) => <option key={bpm} value={bpm}>{PRACTICE_TEMPO_PERCENTS[index]} % · {Math.round(bpm)} BPM</option>)}
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
      <a className="audio-credit" href="/piano-samples/attribution.txt">Créditos do som de piano</a>
     </div>}
    </div>
    <aside className="lesson-side">
     {mode === 'watch' ? <div className="panel">
      <p className="eyebrow">MODO VER</p>
      <h3>{clip.title}</h3>
      <p className="muted">{published ? 'As notas seguem o relógio do vídeo: play, pausa e seek movem-nas.' : 'Notas ainda em revisão.'}</p>
     </div> : <>
     {adapted ? <div className="panel">
      <p className="eyebrow">ENTRADA EM TEMPO REAL</p>
      <h3>Teclas reconhecidas</h3>
      <div className="recognized">{active.length ? active.map(noteName).join(' · ') : 'Nenhuma nota detetada'}</div>
      <p className="muted">Eventos MIDI captados nesta sessão: {eventCount}</p>
      <p className="muted">Notas previstas neste ponto: {position.activeNotes.map(note => noteName(note.pitch)).join(', ') || '—'}</p>
      {result
       ? <div className="results" role="status">
          <h3>Resultado da tentativa</h3>
          <p><strong>{result.score}/100</strong> · {result.hitCount}/{result.expectedCount} notas-alvo</p>
          <p className="muted">Omissões: {result.missCount} · Extras inesperadas: {result.unexpectedCount}</p>
          <small>{Math.round(practice.bpm)} BPM · tolerância ±150 ms · notas revistas à mão</small>
         </div>
       : <p className="muted">Liga um teclado MIDI e começa a tentativa para obter pontuação. Sem MIDI, o guia só mostra as notas.</p>}
     </div> : <div className="panel">
      <p className="eyebrow">PRÁTICA</p>
      <h3>Notas ainda em revisão</h3>
      <p className="muted">A avaliação só fica disponível depois de as notas serem revistas e publicadas.</p>
     </div>}
     </>}
    </aside>
   </div>
  </main>
 );
}
