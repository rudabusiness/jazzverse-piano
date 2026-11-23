// Regenerate with: npx tsx tests/fixtures/make-fixture.ts
import { writeFileSync } from 'node:fs';
import { Midi } from '@tonejs/midi';

const midi = new Midi();
const track = midi.addTrack();
track.addNote({ midi: 72, time: 2, duration: 1.5 });
track.addNote({ midi: 48, time: 0, duration: 1 });
track.addNote({ midi: 67, time: 0.5, duration: 0.5 });
track.addNote({ midi: 64, time: 0.5, duration: 0.5 });
writeFileSync(new URL('./small.mid', import.meta.url), midi.toArray());
