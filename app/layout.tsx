import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'JazzVerse Piano', description: 'Aprende piano com aulas interativas, jogos musicais e um mentor de IA.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt"><body>{children}</body></html>; }
