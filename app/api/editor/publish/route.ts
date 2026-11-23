import { rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { checkPublishedForWrite } from '@/lib/anchor-editor';
import { readAiOriginal } from '@/lib/ai-original-file';
import { draftWriteEnabled } from '@/lib/note-editor';

export const dynamic = 'force-dynamic';

/** Development only. Validates with the student loader and writes content/bebop-blues/published.json — never touches draft.json. */
export async function POST(request: Request) {
  if (!draftWriteEnabled(process.env.NODE_ENV)) return new Response('Not found', { status: 404 });
  // Same-origin only, so another website cannot make a developer's browser publish.
  const origin = request.headers.get('origin');
  if (origin !== null && new URL(origin).host !== request.headers.get('host')) return new Response('Forbidden', { status: 403 });
  const checked = checkPublishedForWrite(await request.text(), await readAiOriginal());
  if (!checked.ok) return Response.json({ ok: false, reason: checked.reason }, { status: 422 });
  const dir = path.join(process.cwd(), 'content', 'bebop-blues');
  const tmp = path.join(dir, 'published.json.tmp');
  await writeFile(tmp, checked.text, 'utf8');
  await rename(tmp, path.join(dir, 'published.json'));
  return Response.json({ ok: true, file: 'content/bebop-blues/published.json' });
}
