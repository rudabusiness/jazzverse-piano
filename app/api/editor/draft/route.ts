import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { checkDraftForWrite, draftWriteEnabled } from '@/lib/note-editor';
import { parseDraftRequest } from '@/lib/editor-import';

export const dynamic = 'force-dynamic';

/** Development only. Validates the JSON and writes content/bebop-blues/draft.json — nothing else, never published.json. */
export async function POST(request: Request) {
  if (!draftWriteEnabled(process.env.NODE_ENV)) return new Response('Not found', { status: 404 });
  // Same-origin only, so another website cannot make a developer's browser overwrite the draft.
  const origin = request.headers.get('origin');
  if (origin !== null && new URL(origin).host !== request.headers.get('host')) return new Response('Forbidden', { status: 403 });
  const req = parseDraftRequest(await request.text());
  if (!req.ok) return Response.json({ ok: false, reason: req.reason }, { status: 400 });
  const checked = checkDraftForWrite(req.draft);
  if (!checked.ok) return Response.json({ ok: false, reason: checked.reason }, { status: 400 });
  const dir = path.join(process.cwd(), 'content', 'bebop-blues');
  if (req.aiOriginal) {
    // After a MIDI import the imported notes are the raw-AI reference; publish compares against this file.
    await mkdir(path.join(dir, 'source'), { recursive: true });
    const aiTmp = path.join(dir, 'source', 'ai-original.json.tmp');
    await writeFile(aiTmp, JSON.stringify(req.aiOriginal, null, 2) + '\n', 'utf8');
    await rename(aiTmp, path.join(dir, 'source', 'ai-original.json'));
  }
  const tmp = path.join(dir, 'draft.json.tmp');
  await writeFile(tmp, checked.text, 'utf8');
  await rename(tmp, path.join(dir, 'draft.json'));
  return Response.json({ ok: true, file: 'content/bebop-blues/draft.json' });
}
