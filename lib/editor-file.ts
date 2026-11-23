import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { LessonManifest } from './lesson-manifest';
import { loadPublished, validateShape } from './published-loader';

export type EditorFile = { kind: 'published' | 'draft'; fileName: string; manifest: LessonManifest };
export type EditorLoad = { ok: true; file: EditorFile } | { ok: false; reason: string };

/** Pure: published.json if it passes the student gate, otherwise draft.json if structurally valid. */
export function pickEditorFile(published: string | null, draft: string | null): EditorLoad {
  const pub = loadPublished(published);
  if (pub.ok) return { ok: true, file: { kind: 'published', fileName: 'published.json', manifest: pub.manifest } };
  if (draft === null) return { ok: false, reason: 'Nem published.json válido nem draft.json encontrados' };
  let json: unknown;
  try { json = JSON.parse(draft); } catch { return { ok: false, reason: 'draft.json: JSON inválido' }; }
  if (typeof json !== 'object' || json === null || Array.isArray(json)) return { ok: false, reason: 'draft.json: o manifesto tem de ser um objeto' };
  const shape = validateShape(json as Record<string, unknown>);
  if (!shape.ok) return { ok: false, reason: `draft.json: ${shape.reason}` };
  return { ok: true, file: { kind: 'draft', fileName: 'draft.json', manifest: shape.manifest } };
}

async function read(name: string): Promise<string | null> {
  try { return await readFile(path.join(process.cwd(), 'content', 'bebop-blues', name), 'utf8'); } catch { return null; }
}

/** Server only. */
export async function readEditorFile(): Promise<EditorLoad> {
  return pickEditorFile(await read('published.json'), await read('draft.json'));
}
