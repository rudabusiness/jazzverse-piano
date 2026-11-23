import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pickEditorFile } from '../lib/editor-file';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const draft = read('../content/bebop-blues/draft.json');
const published = read('./fixtures/published.valid.fixture.json');
const broken = 'not json';

test('falls back to the AI draft when there is no published.json', () => {
  const result = pickEditorFile(null, draft);
  assert.equal(result.ok && result.file.kind, 'draft');
  assert.equal(result.ok && result.file.fileName, 'draft.json');
});
test('prefers a valid published.json over the draft', () => {
  const result = pickEditorFile(published, draft);
  assert.equal(result.ok && result.file.kind, 'published');
});
test('an invalid published.json falls back to the draft', () => {
  const result = pickEditorFile(broken, draft);
  assert.equal(result.ok && result.file.kind, 'draft');
});
test('refuses when nothing valid exists', () => {
  assert.equal(pickEditorFile(null, null).ok, false);
  assert.equal(pickEditorFile(null, broken).ok, false);
  assert.equal(pickEditorFile(null, '[]').ok, false);
  assert.equal(pickEditorFile(null, '42').ok, false);
});
