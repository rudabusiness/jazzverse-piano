import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseAiOriginal, type AiOriginal } from './ai-original';

/** Server only. null when content/bebop-blues/source/ai-original.json is missing or malformed. */
export async function readAiOriginal(): Promise<AiOriginal | null> {
  try { return parseAiOriginal(await readFile(path.join(process.cwd(), 'content', 'bebop-blues', 'source', 'ai-original.json'), 'utf8')); } catch { return null; }
}
