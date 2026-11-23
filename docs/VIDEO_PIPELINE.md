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
