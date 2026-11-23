import Link from 'next/link';
import { EditorView } from '@/components/editor-view';
import { readAiOriginal } from '@/lib/ai-original-file';
import { readEditorFile } from '@/lib/editor-file';

export const dynamic = 'force-dynamic';

export default async function EditorPage() {
  const loaded = await readEditorFile();
  const aiOriginal = await readAiOriginal();
  return <div className="content"><header className="topbar"><Link href="/lesson">← Voltar à aula</Link><span className="pill">Editor de notas</span></header>
    <main className="page">{loaded.ok
      ? <EditorView manifest={loaded.file.manifest} kind={loaded.file.kind} fileName={loaded.file.fileName} aiOriginal={aiOriginal} />
      : <p className="editor-banner editor-draft" role="alert">Não foi possível carregar o ficheiro: {loaded.reason}</p>}</main></div>;
}
