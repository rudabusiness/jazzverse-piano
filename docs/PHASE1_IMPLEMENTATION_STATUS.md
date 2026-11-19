# Phase 1 implementation status

This branch contains the **first application shell**, not a finished learning platform.

## Implemented
- Next.js + React + TypeScript initial scaffold.
- Netflix-style course discovery landing page with musical categories (demo course cards).
- Interactive lesson layout with an **original**, locally defined ii–V–I exercise.
- Three synchronized practice views: falling notes, rendered two-staff notation for the original fixture, and hybrid. The fixture can also be downloaded as MusicXML with matching note IDs.
- Web MIDI permissions, note-on/note-off highlight, device-state messaging.
- Compact blue floating mascot with Eyes-only / Full and static explanatory popover.
- Sampled virtual piano and a local MusicXML book-exercise reader with score cursor, pitch-only practice and optional acoustic-piano input. Scanned PDF import is not implemented.
- Experimental local acoustic-piano recognition via PitchPlease, with per-chord detection summaries. Microphone mode does not assign a timing score.
- Measure-range looping for ungraded practice, with a count-in on the first pass and a continuous beat grid across the wrap.
- Optional Web Audio metronome with accented downbeats during count-in and practice. Pausing, resetting or disabling the metronome cancels scheduled clicks.
- One monotonic practice clock for both visual modes and MIDI attack timestamps, with a visual count-in, pause/resume, restart and four practice tempos. Changing tempo discards the current attempt and keeps the onset window fixed in milliseconds.
- Clear UI labels for all unfinished features.
- Deterministic onset evaluator (`lib/music-engine.ts`) implementing the **provisional** official SPEC MID-002..004 rubric: ±150 ms, duplicate protection, explicit jazz tensions, 70/30 score.
- MIDI events recorded relative to the practice timebase and scored after a completed session, only if a MIDI device is present.
- Demo fixture aligned to SPEC PH1-001 (60 BPM, 12 targets), pending instructor approval.
- Golden unit tests for timing boundaries, silence, extra notes, duplicate attacks and permitted jazz tensions.

## NOT implemented
- Real instructor video, timestamps or video-to-MIDI mapping.
- Import and rendering of external MusicXML scores.
- Score persistence, calibration and advanced timing validation (onset evaluator and temporary UI score now implemented).
- AI provider connection, chat, lesson retrieval or grounded feedback.
- Auth, subscriptions, API, DB, analytics, source assets.
- Real instrument timing calibration, hardware E2E test, accessibility audit.
- Session history and persistence; no saved result yet.

## Validation to run in Codex or CI
```sh
npm install
npm run typecheck
npm test
npm run build
npm run dev
```
Check on Chrome/Edge desktop with a real USB MIDI keyboard and explicit permission. The demo can be explored without MIDI but must not claim successful recognition without hardware input.

## Next engineering slice
1. Fix issues from first real build.
2. Introduce pure TS music event model, tests and scoring.
3. Validate the original fixture with a real MIDI keyboard and measure visual synchronization.
4. Add actual licensed instructor video and teacher-review publishing workflow.
5. Add AI tutor only after performance state is reliable.

**Timeline verification:** the automated fixtures verify 12 shared event IDs, pitch and duration in the MusicXML export, perfect MIDI scoring, and timestamp normalization across pause and resume. A Chrome smoke test with simulated Web MIDI exercised all three views, disconnect/reconnect, restart, and the ungraded guide. The clock and evaluator run locally and keep MIDI attacks in memory for the current attempt. Physical MIDI timing has not been measured.

This document does not amend the official `SPEC.md`.
