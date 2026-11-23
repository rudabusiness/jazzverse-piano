import { cpSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const source = dirname(require.resolve('@markusstrasser/pitchplease/package.json'));
const output = new URL('../public/pitchplease/', import.meta.url);
mkdirSync(new URL('models/', output), { recursive: true });
cpSync(join(source, 'engine'), new URL('engine/', output), { recursive: true });
cpSync(join(source, 'models/piano.bin'), new URL('models/piano.bin', output));
