import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadPublished, type LoadResult } from './published-loader';

/** Server only. Reads content/bebop-blues/published.json (never draft.json) and validates it. */
export async function readPublished(): Promise<LoadResult> {
  const file = path.join(process.cwd(), 'content', 'bebop-blues', 'published.json');
  let source: string | null = null;
  try { source = await readFile(file, 'utf8'); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') return { ok: false, reason: 'Não foi possível ler published.json' };
  }
  const result = loadPublished(source);
  if (!result.ok && source !== null) console.warn(`[lesson] published.json recusado: ${result.reason}`);
  return result;
}
