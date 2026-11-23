import Link from 'next/link';
import { LessonPlayer } from '@/components/lesson-player';
import { Assistant } from '@/components/assistant';
import { readPublished } from '@/lib/published-file';

export const dynamic = 'force-dynamic';

export default async function LessonPage(){const published=await readPublished();return <div className="shell"><aside className="sidebar"><div className="logo">J<span>azz</span>Verse<small>PIANO ACADEMY</small></div><nav aria-label="Navegação"><Link href="/">⌂ &nbsp; Descobrir</Link><Link className="nav-active" href="/lesson">♫ &nbsp; Praticar</Link><Link href="/livros">Livros</Link></nav><div className="side-note"><span className="eyebrow">DICA DE PRÁTICA</span><p>Começa lentamente. A precisão vem antes da velocidade.</p></div></aside><div className="content"><header className="topbar"><Link href="/">← Voltar aos cursos</Link><span className="pill">Jazz Piano Fundamentals</span></header><LessonPlayer published={published.ok?published.manifest:null}/></div><Assistant/></div>;}
