# Recorded video → interactive lesson pipeline

## Why not one-click magic?

Existing videos are valuable assets. But speech transcription is not the same as reliable polyphonic jazz note transcription, and teacher performance audio often has rubato, pedal, accompaniment, overlapping dialogue and nontrivial voicings. Fully automatic transcription+alignment must be treated as *draft assistance*, never published truth.

## Ingest stages

1. **Upload** private video with owner/rights information; validate codec, resolution, duration, file hash, owner and consent.
2. **Process** with durable jobs: normalize streaming renditions, generate thumbnails, extract speech audio, produce captions, detect approximate topic chapters. A failure never silently publishes half a lesson.
3. **Speech analysis**: transcript with timestamped segments + key terms, chord symbols and suggested lesson objectives. Mark technical terminology for human confirmation.
4. **Musical material**: prefer imported source MIDI and MusicXML/score/lead sheet. If absent, use piano transcription model suggestions *only* as editorial drafts; dense chords require verification. Label every event with confidence and original asset reference.
5. **Alignment editor**: instructor sees video player + piano roll + score; marks beat-to-video sync anchors, bars, time signature, tempo map, allowed voicing alternatives, hand assignment, teaching moments, exercise segments.
6. **AI extraction**: propose quiz questions, exercises, glossary and citations. Drafts must point to specific teacher video segment/measure and get approved.
7. **Review gates**: legal/rights, caption accuracy, note and chord accuracy, synchronization, pedagogy, difficulty, instrument input test and accessibility.
8. **Publish** immutable lesson manifest version + signed streaming asset; archive previous version and preserve student attempts' manifest links.

## Teacher studio views and actions

- Video inventory / upload wizard: name, source, instructor, license, metadata, processing status.
- Transcript editor: speaker/timestamp, captions, vocabulary, AI-highlight suggestions.
- Score/MIDI editor: measure grid, target notes, chord symbols, acceptable substitutions, hand split, uncertainty markers.
- Sync editor: anchor timeline, audio waveform, drag anchor, measure seek, sample play-along check.
- Exercise authoring: exact-notes, voicing, rhythm, call-and-response or improvisation prompt; define target skills and scorer.
- Publish check: errors and warnings separated; override with reason; version notes and audit trail.

## Lesson manifest invariants

- Explicit `manifestVersion`, `lessonId`, `rightsId`, `sourceVideoId` and canonical media time units.
- All note pitch/time values validated, tempo map sorted and nonzero, 2+ sync anchors for synchronized lessons, measure boundaries valid.
- No arbitrary executable JS embedded in manifest.
- Transcript citations reference authorized segments.
- A video-only lesson is valid with `interactiveStatus="not_ready"`, but app must not render fake score/falling notes.

## Sources and suitable starting tools (verify versions/licenses at integration)

- Spotify Basic Pitch produces approximate audio-to-MIDI and can seed editorial work, not guarantee jazz polyphony. https://github.com/spotify/basic-pitch
- OpenSheetMusicDisplay for browser MusicXML notation. https://opensheetmusicdisplay.org/
- Tone.js for browser music scheduling. https://tonejs.github.io/
- Web MIDI API for supported desktop browsers. https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API

## First lesson recommendation

Take a 4–8 minute original video about ii–V–I in C, plus a manually verified 4–8 bar pattern (Dm7 / G7 / Cmaj7) in source MIDI and MusicXML. Mark 3 chapters, 2 anchor points minimum, two practice tasks (play shell voicings + loop guide-tone resolutions) and 10 coach Q&A assertions. Compare edited timestamps and playback to the instructor demonstration on hardware.

## Local clip extraction (v1 — `bebop-blues`)

Working folder `pipeline-work/` is git-ignored. Tools live in `.venv/` (also git-ignored). Used yt-dlp 2026.10.26.

```bash
mkdir -p pipeline-work public/lessons/bebop-blues

# 1. Download only 3:09–4:32, cut on keyframes, up to 720p mp4
yt-dlp --download-sections "*3:09-4:32" --force-keyframes-at-cuts \
  -f "bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720][ext=mp4]/b[height<=720]" \
  --merge-output-format mp4 \
  -o "pipeline-work/raw.%(ext)s" \
  "https://www.youtube.com/watch?v=p-hZGY7wNE8"

# 2. Remux without re-encoding; faststart puts the moov atom first for streaming/seeking
ffmpeg -i pipeline-work/raw.mp4 -c copy -movflags +faststart public/lessons/bebop-blues/clip.mp4

# 3. Verify: duration must be 82–84 s (expected ≈ 83.0 s), h264 + aac
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height \
  -of default=nw=1 public/lessons/bebop-blues/clip.mp4
```

The player uses it as `<video controls playsInline preload="metadata" src="/lessons/bebop-blues/clip.mp4">` (no YouTube embed). See `docs/CONTENT_RIGHTS.md` before publishing any clip.

## AI draft transcription (basic-pitch → `draft.json`)

The raw transcription is only a **draft**: basic-pitch is not reliable on dense jazz polyphony, so every note must be reviewed by hand in the editor before anything is published. Never ship the raw output as `published.json`.

Environment (Python 3.10 venv in `.venv/`, git-ignored). These pins were needed to make basic-pitch 0.4.0 run with the TFLite backend:

```bash
python3.10 -m venv .venv
.venv/bin/pip install basic-pitch==0.4.0 numpy==1.26.4 setuptools==69.5.1 tflite-runtime==2.14.0
```

Commands (run once; the raw `.mid` is kept in `content/bebop-blues/source/basic-pitch-raw.mid`, times in seconds from the clip start):

```bash
# 1. Mono 22.05 kHz audio from the clip
ffmpeg -i public/lessons/bebop-blues/clip.mp4 -vn -ac 1 -ar 22050 pipeline-work/clip-audio.wav

# 2. Transcribe
.venv/bin/basic-pitch pipeline-work/basic-pitch pipeline-work/clip-audio.wav --save-note-events
```

Import into the manifest format (needs `@tonejs/midi` 2.0.28; converts seconds → beats with the manifest's `syncAnchors`, hand = left if MIDI < 60 else right):

```bash
npm run import-midi -- [ficheiro.mid]
```

Without an argument it reads `content/bebop-blues/source/basic-pitch-raw.mid` and records `source: {tool: "basic-pitch", version: "0.4.0"}`. With a path it converts that `.mid` instead and records `source: {tool: "external-midi", file: "<file name>"}` (no version is invented). Example, a MIDI exported from MT3 (model `ismir2021`): `npm run import-midi -- ~/Downloads/mt3-clip.mid`. An external `.mid` is also a raw automatic transcription: correct it in `/editor` before publishing. In both cases `source/ai-original.json` is rewritten with the same notes, so the "unchanged from AI" check stays consistent with `draft.json`. The command fails (exit code ≠ 0, existing files untouched) if the file is missing, is not valid MIDI or has no notes; on success it prints `draft.json: N notas (fonte: …)`.

This writes `content/bebop-blues/draft.json` (`interactiveStatus: "draft"`, `reviewedByHand: false`, `source: {tool: "basic-pitch", version: "0.4.0"}`). Re-run it after the anchors change. `/lesson` does not read the draft.

## End-to-end v1 pipeline (`bebop-blues`)

```
yt-dlp → ffmpeg (clip.mp4, faststart) → wav → basic-pitch 0.4.0 → scripts/import-draft.ts
       → /editor (notes, anchors, "Revisto à mão", Publicar) → content/bebop-blues/published.json → /lesson
```

| # | Step | Where | Output |
|---|------|-------|--------|
| 1 | `yt-dlp --download-sections "*3:09-4:32" --force-keyframes-at-cuts …` | `pipeline-work/` (git-ignored) | `raw.mp4` |
| 2 | `ffmpeg -i raw.mp4 -c copy -movflags +faststart …` | — | `public/lessons/bebop-blues/clip.mp4` (≈ 83 s, h264 + aac) |
| 3 | `ffmpeg -i clip.mp4 -vn -ac 1 -ar 22050 …` | — | `pipeline-work/clip-audio.wav` |
| 4 | `.venv/bin/basic-pitch … --save-note-events` | `.venv` (Python 3.10; basic-pitch 0.4.0, numpy 1.26.4, setuptools 69.5.1, tflite-runtime 2.14.0) | raw `.mid` → `content/bebop-blues/source/basic-pitch-raw.mid` |
| 5 | `npm run import-midi -- [ficheiro.mid]` (default: Basic Pitch `.mid`; or an external one, e.g. MT3) | — | `content/bebop-blues/draft.json` (draft, not reviewed) |
| 6 | `npm run dev` → `/editor` | browser | fix notes (move / delete / add), set ≥ 2 sync anchors, tick **Revisto à mão**, **Publicar** |
| 7 | Commit `content/bebop-blues/published.json` | git | the only file `/lesson` accepts |
| 8 | `/lesson` | browser | **Ver**: falling notes follow `video.currentTime` (A–B loop). **Prática**: the same published notes become the MIDI exercise |

Rules:

- The raw AI transcription is never the lesson. `published.json` is only valid with `reviewedByHand: true`, `interactiveStatus: "ready"`, ≥ 2 strictly increasing anchors and valid notes (`lib/published-loader.ts`). Anything else → `/lesson` shows the video and "Notas ainda em revisão"; no notes, no grading.
- Publishing from `/editor` writes `published.json` and keeps `draft.json`. In production the file must be committed (the editor's write route is dev-only).
- Check `docs/CONTENT_RIGHTS.md` before committing a clip or publishing.

### Practice mode on the published notes

`lib/published-practice.ts` (pure, tested in `tests/published-practice.test.ts`) turns the validated manifest into an exercise for the existing engine (`createPracticeTimeline`, `evaluatePractice`/`evaluateOnsets`):

- **Tempo**: the average of the sync anchors, `60000 · Δbeat / Δms` between the first and last anchor. Practice tempos are 50 / 75 / 100 / 120 % of it. Rubato in the video is flattened to this straight grid.
- **Notes**: beats are kept (shifted by whole 4-beat measures only if some start before beat 0); ids are the manifest ids, or a stable `p<index>-<midi>-<startBeat>`, and duplicates are made unique.
- **Grading**: Web MIDI only, ±150 ms window, local. No chord labels exist in the manifest, so no "allowed tension" is credited: only the listed notes count. Without a connected MIDI keyboard no note is captured and no score is produced.
- **Out of scope in v1**: microphone input, score/hybrid view and measure repeat on published notes (the on-screen keyboard shows C♯2–C5 only, so notes outside that range are graded but not drawn).
