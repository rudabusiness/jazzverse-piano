'use client';
import { useEffect,useMemo,useRef,useState } from 'react';
import { demoLesson, noteName, evaluateFixture } from '@/lib/lesson';
import type { Evaluation } from '@/lib/music-engine';

const white=[0,2,4,5,7,9,11];
function Piano({active}:{active:number[]}) {
 const keys=Array.from({length:25},(_,i)=>48+i);
 return <div className="keyboard" aria-label="Teclado virtual de C3 a C5">{keys.filter(k=>white.includes(k%12)).map(k=><div key={k} className={active.includes(k)?'white-key active':'white-key'} title={noteName(k)}><small>{k%12===0?'C':''}</small></div>)}{keys.filter(k=>!white.includes(k%12)).map(k=>{const offset=(k-48)%12;const octave=Math.floor((k-48)/12);const map:Record<number,number>={1:0,3:1,6:3,8:4,10:5};return <div key={k} className={active.includes(k)?'black-key active':'black-key'} title={noteName(k)} style={{left:`calc((${octave*7+(map[offset]??0)+1}) * 100% / 15 - 1.3%)`}}/>})}</div>
}
export function LessonPlayer(){
 const [view,setView]=useState<'falling'|'score'|'hybrid'>('hybrid');
 const [status,setStatus]=useState('Liga um piano MIDI para começar.');
 const [active,setActive]=useState<number[]>([]);
 const [events,setEvents]=useState<{pitch:number;atMs:number}[]>([]);
 const [result,setResult]=useState<Evaluation|null>(null);
 const [playing,setPlaying]=useState(false);
 const [beat,setBeat]=useState(0);
 const accessRef=useRef<MIDIAccess|null>(null);
 const startedRef=useRef<number|null>(null);
 const eventsRef=useRef<{pitch:number;atMs:number}[]>([]);
 const playRef=useRef(false);
 useEffect(()=>{playRef.current=playing},[playing]);
 useEffect(()=>{
  if(!playing) return;
  const started=performance.now()-beat*60000/demoLesson.bpm;
  startedRef.current=started;
  let id=0;
  const tick=()=>{if(!playRef.current)return;const b=(performance.now()-started)*demoLesson.bpm/60000;if(b>=demoLesson.durationBeats){setBeat(demoLesson.durationBeats);setPlaying(false);if(accessRef.current?.inputs.size){setResult(evaluateFixture(eventsRef.current));}else{setResult(null);setStatus('Tentativa terminada sem teclado MIDI ligado. Não foi atribuída pontuação.');}return;}setBeat(b);id=requestAnimationFrame(tick);};
  id=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(id);
 },[playing]);
 useEffect(()=>()=>{if(accessRef.current)for(const input of accessRef.current.inputs.values())input.onmidimessage=null},[]);
 async function connect(){
  if(!navigator.requestMIDIAccess){setStatus('Este navegador não suporta Web MIDI. Usa Chrome ou Edge num computador.');return;}
  try{
   const a=await navigator.requestMIDIAccess();accessRef.current=a;
   const bind=()=>{for(const input of a.inputs.values())input.onmidimessage=e=>{if(!e.data)return;const [s,n,v]=e.data;const type=s&0xf0;if(type===0x90&&v>0){setActive(prev=>prev.includes(n)?prev:[...prev,n]);if(playRef.current&&startedRef.current!==null){const atMs=performance.now()-startedRef.current;const duration=demoLesson.durationBeats*60000/demoLesson.bpm;if(atMs>=0&&atMs<=duration){const event={pitch:n,atMs};eventsRef.current.push(event);setEvents(prev=>[...prev,event]);}}}else if(type===0x80||(type===0x90&&v===0)){setActive(prev=>prev.filter(x=>x!==n));}};setStatus(a.inputs.size?`MIDI ligado: ${[...a.inputs.values()].map(i=>i.name??'Teclado').join(', ')}`:'Permissão concedida, mas nenhum teclado MIDI foi encontrado.');};
   bind();a.onstatechange=bind;
  }catch{setStatus('Não foi possível aceder ao dispositivo MIDI. Verifica as permissões.');}
 }
 const target=useMemo(()=>demoLesson.notes.filter(n=>Math.abs(n.startBeat-beat)<.5).map(n=>n.midi),[beat]);
 function restart(){setPlaying(false);setBeat(0);setEvents([]);eventsRef.current=[];setResult(null);setActive([]);startedRef.current=null;}
 return <main className="page"><div className="breadcrumb">CURSO / JAZZ / LIÇÃO 01</div><div className="lesson-heading"><div><h1>Primeiros voicings: ii–V–I</h1><p className="muted">Uma introdução prática à harmonia jazzística em Dó maior.</p></div><span className="pill">{demoLesson.bpm} BPM · 4/4</span></div>
 <div className="lesson-grid"><div className="lesson-main"><div className="video-placeholder"><div className="video-badge">VÍDEO AINDA NÃO DISPONÍVEL</div><div className="video-symbol">▶</div><p>O teu vídeo gravado aparecerá aqui quando for enviado e sincronizado.</p></div>
 <div className="player-panel"><div className="section-head"><h2>Prática interativa</h2><div className="switcher"><button aria-pressed={view==='falling'} onClick={()=>setView('falling')}>Notas</button><button aria-pressed={view==='score'} onClick={()=>setView('score')}>Partitura</button><button aria-pressed={view==='hybrid'} onClick={()=>setView('hybrid')}>Híbrido</button></div></div>
 {(view==='hybrid'||view==='score')&&<div className="score"><span className="clef">𝄞</span><div className="staff"><div className="staff-lines"/><div className="chords"><span>Dm7</span><span>G7</span><span>Cmaj7</span></div><div className="noteheads"><span>●</span><span>●</span><span>●</span></div></div><small>Partitura ilustrativa — renderização MusicXML pendente</small></div>}
 {(view==='hybrid'||view==='falling')&&<div className="roll"><div className="beat-grid">{[0,1,2].map((bar)=><span className="bar-block" key={bar} style={{left:`${bar*33.333}%`}}>{['Dm7','G7','Cmaj7'][bar]}</span>)}<div className="playhead" style={{left:`${beat/demoLesson.durationBeats*100}%`}}/>{demoLesson.notes.map((n,i)=><span key={i} className={n.hand==='left'?'fall-note left':'fall-note right'} style={{left:`${(n.startBeat/demoLesson.durationBeats)*100+2}%`,width:`${n.durationBeats/demoLesson.durationBeats*100-2}%`,top:`${12+(n.midi-48)*3.5}%`}}/>)}</div><Piano active={active}/></div>}
 <div className="player-controls"><button className="primary" onClick={()=>setPlaying(v=>!v)}>{playing?'Pausar':'Reproduzir guia'}</button><button onClick={restart}>Reiniciar</button><button onClick={connect}>Ligar MIDI</button><span className="muted">{beat.toFixed(1)} / 12 tempos</span></div><div className="midi-status" role="status">{status}</div>
 </div></div><aside className="lesson-side"><div className="panel"><p className="eyebrow">AULA 01</p><h3>O que vais aprender</h3><ul><li>Reconhecer Dm7, G7 e Cmaj7</li><li>Ouvir as resoluções ii–V–I</li><li>Praticar voicings com duas mãos</li></ul></div><div className="panel"><p className="eyebrow">MIDI EM TEMPO REAL</p><h3>Teclas reconhecidas</h3><div className="recognized">{active.length?active.map(noteName).join(' · '):'Nenhuma tecla premida'}</div><p className="muted">Eventos captados nesta sessão: {events.length}</p><p className="muted">Notas previstas neste ponto: {target.map(noteName).join(', ')||'—'}</p>{result?<div className="results" role="status"><h3>Resultado da tentativa</h3><p><strong>{result.score}/100</strong> · {result.hitCount}/{result.expectedCount} notas-alvo</p><p className="muted">Omissões: {result.missCount} · Extras inesperadas: {result.unexpectedCount} · Tensões permitidas: {result.allowedTensionCount}</p><small>Regra provisória do SPEC · Avaliação só de ataques MIDI, sem persistência ainda.</small></div>:<p className="muted">A pontuação será calculada no fim da tentativa. É necessária entrada MIDI real durante a reprodução.</p>}</div></aside></div></main>;
}
