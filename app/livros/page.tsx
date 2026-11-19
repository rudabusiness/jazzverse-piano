import Link from 'next/link';
import { Assistant } from '@/components/assistant';
import { BookPractice } from '@/components/book-practice';

export default function BooksPage() {
  return <div className="content">
    <header className="topbar"><Link href="/lesson">← Voltar à prática</Link></header>
    <main className="page">
      <div className="lesson-heading"><h1>Livros interativos</h1></div>
      <BookPractice />
    </main>
    <Assistant />
  </div>;
}
