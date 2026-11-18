# Music engine specification — deterministic first, jazz-aware second

## 1. Input and canonical events

```ts
type MidiNoteEvent = {
  kind: 'note_on' | 'note_off';
  pitch: number;           // MIDI 0..127
  velocity: number;        // MIDI 0..127
  channel: number;
  eventTimeMs: number;     // normalized monotonic timestamp
  deviceId: string;
};

type ExpectedNote = {
  id: string;
  pitch: number;
  startBeat: number;
  durationBeats: number;
  hand?: 'left' | 'right';
  track?: string;
  role?: 'melody' | 'bass' | 'voicing' | 'ornament';
};

type TempoPoint = { beat: number; bpm: number };
type SyncAnchor = { beat: number; videoTimeMs: number };
```

Normalize MIDI channel/status bytes, convert `note_on velocity=0` to note-off, handle all-notes-off, panic, duplicate event jitter, disconnected devices, damper pedal CC64 and note-release semantics. Keep event listeners independent of React render loop. Prevent stuck notes.

## 2. Practice timing modes

- `follow-the-keys`: expected event advances after correct target; score should indicate that there is no strict fixed-time evaluation.
- `play-along`: music clock advances independently; onset timing and hold durations assessed.
- `free-improv`: no fixed target pitch sequence; qualitative analysis uses harmonic context, rhythm and phrase patterns; no false binary correctness.
- `ear-training`: listen/respond and compare aural task output with allowed exact or equivalent answers.

## 3. Alignment pipeline

1. Calibrate per-device input latency with repeatable metronome taps; store measured offset + confidence. Do not pretend browser USB/MIDI/audio path has zero latency.
2. Convert expected beats to music timeline milliseconds using tempo map integration. Allow swing ratio/grace notes via explicit event metadata where authored.
3. Collect performed note-on/off windows. Group near-simultaneous notes into candidate chords, use task-specific chord windows; do not require literal simultaneous onset.
4. Perform monotonic matching (e.g. constrained bipartite matching for local chord windows, or DTW for phrase-level alignment); minimize pitch error, onset error and duration error with weighted cost.
5. Mark missing, extra, late/early, truncated, sustained. Don't count the same note twice in dense passages. Distinguish accidental velocity=0 from intentional release.
6. Compute per-skill evidence, explanatory snippets and transparency-friendly score categories. Save raw accuracy/timing metrics plus ruleset/evaluator version.

## 4. Example beginner scoring rubric (subject to instructor validation)

```text
score = 0.50 * correct_pitch_recall
      + 0.30 * onset_accuracy
      + 0.10 * duration_accuracy
      + 0.10 * rhythmic_continuity
```

The weights are **defaults for prototypes only**. Difficulty, style, task and instructor review must adjust them. A chord exercise is graded on accepted pitch sets/voice leading; a swing comping task emphasizes pulse, anticipation and timing within musical context. Never claim a numeric "musicality score" is objective.

For note matching define onset tolerance in milliseconds/beat fraction; defaults vary with tempo and calibration confidence. Provide a visual explanation: expected F3 at beat 2; performed F3 +83 ms after calibrated expected beat. Scores must be reproducible on golden fixtures.

## 5. Jazz harmony model

Analyze chord symbols and harmonic roles separately from played note names:

- Chord qualities: maj7, m7, 7, m7b5, dim7, sus, altered and 6/9.
- Allowed note sets for tasks: exact voicing if a specific hand shape is taught; equivalence sets and optional tensions if task aims at harmonic function.
- Voice leading: nearest motion between chord voices, resolution of guide tones (thirds and sevenths), contrary motion, register and hand split, pedal overlap.
- Improvisation context: target chord tones on strong beats, tensions/approach notes, motif reuse, rests and rhythmic variation — always contextual, never binary art evaluation.
- Instructor can annotate exceptions, substitute chords and acceptable alternative fingerings/voicings.

**Example:** Dm7 → G7 → Cmaj7. F is chord 7 of G7; B is chord 3. E and B can outline Cmaj7. The rules engine must not reject legitimate G7 color tones because a fixed melody track expected a different note.

## 6. Score/notation mapping

- Canonical `ExpectedNote[]` in beat positions.
- MusicXML import with tempo/time-signature/measure mapping; use OpenSheetMusicDisplay for engraving, but explicit mapping from MusicXML node IDs to expected-note IDs is necessary for highlighting.
- Falling-note renderer positions bars by `y = hitLineY - (noteBeat - currentBeat) * pixelsPerBeat`, clamps virtualized visible notes. Piano geometry mathematically matches MIDI pitches and octaves, with fixed keyboard range viewport and scroll.
- Audio effects/synth output scheduled on audio clock; visual FPS may drop without altering event timestamps or scoring.
- Precompute note lane position and geometry; avoid React setState on 60 FPS loop.

## 7. Tests and edge cases

Golden test fixtures (commit all expected outputs): single note in time; wrong pitch; missing note; extra note; overlapping notes; arpeggiated chord; two hands; sustain pedal; tempo change; swing eighths; grace note; reconnect mid-bar; late clock tick; browser page backgrounded; double note-off; MIDI channel variations; polyphony; chord alternatives; long held chord; note-on velocity zero. Test deterministic results with fixed event streams, not screenshots alone.

Browser/hardware matrix in MVP: Chrome and Edge desktop with USB MIDI; actual devices from at least two manufacturers; OS versions logged. Safari Web MIDI support is not assumed. Microphone-to-note recognition is a separate research track with latency and multi-pitch confidence testing.
