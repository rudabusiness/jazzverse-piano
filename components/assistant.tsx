'use client';
import { useState } from 'react';

export function Assistant() {
 const [mode,setMode]=useState<'eyes'|'full'>('eyes');
 const [open,setOpen]=useState(false);
 return <aside className="assistant" aria-label="Mentor musical">
   {open && <div className="assistant-popover" role="dialog" aria-label="Mentor musical"><div className="assistant-header"><strong>O teu mentor</strong><button onClick={()=>setOpen(false)} aria-label="Fechar">×</button></div><p>Olá! Vamos praticar uma cadência ii–V–I em Dó. Liga um piano MIDI para vermos as notas que tocas.</p><p className="muted">Esta é uma demonstração da interface. A conversa com IA ainda não está ligada.</p><div className="assistant-modes"><button aria-pressed={mode==='eyes'} onClick={()=>setMode('eyes')}>Só olhos</button><button aria-pressed={mode==='full'} onClick={()=>setMode('full')}>Mascote completo</button></div></div>}
   <button className={mode==='eyes'?'mascot eyes':'mascot full'} onClick={()=>setOpen(o=>!o)} aria-label={open?'Fechar mentor':'Abrir mentor musical'} aria-expanded={open}>
     <span className="mascot-ears"><i/><i/></span><span className="mascot-face"><span className="mascot-eyes"><i/><i/></span>{mode==='full'&&<span className="mascot-mouth">⌣</span>}</span>
   </button>
 </aside>
}
