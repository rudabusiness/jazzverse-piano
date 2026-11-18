# Product specification — JazzVerse Piano

Version 1.0. Last updated 2026-11-18. Scope: jazz-first, multi-genre piano education.

## 1. Vision, differentiation and design constraints

**Promise:** Turn professionally recorded piano lessons into an active, personalized piano-learning experience. The student chooses a course like streaming content, learns from a real teacher, practices like a rhythm game with an actual instrument, and improves with a persistent AI tutor.

**Differentiator:** A unified lesson timeline joins instructor video, verified score and notes, keyboard input, pedagogical assessment, and AI context. Not just prerecorded content + a chatbot; not just piano-key hit detection.

**Immutable design baseline:** Keep the approved premium cinematic dark UI, warm metallic-gold CTAs, blue/purple practice visualization, course rows, and original blue corner mascot. Do not turn the coach back into a large permanent chat column. Build an independent, original character and branding; avoid Bluey copyrighted art/name as production IP.

**Audience:** Initial beachhead: intermediate hobbyist pianists and adults interested in jazz harmony/comping/improvisation, with a beginner pathway but not a claim to fully teach piano from zero at launch. Other genres: classical, blues, soul/gospel, pop; all share core engine, metadata and player with pedagogical plugins.

## 2. Personas and jobs-to-be-done

- Jazz-curious pianist: knows keyboard basics; wants to understand and perform real jazz voicings and solos.
- Returning adult learner: wants short personalized sessions after work; values visible improvement and flexibility.
- Instructor/content editor: uploads existing videos, maps chapters to verified MIDI/MusicXML, authors practice tasks, approves AI suggestions.
- Admin/operator: manages catalog, permissions, licensing records, billing, moderation and analytics.

## 3. Critical learning loop

Discover course → enroll / continue → watch contextual micro-lesson → try guided exercise → connect MIDI → run count-in + listen/observe → perform → deterministic evaluator computes note/onset/duration and music-context features → AI interprets selected findings → repeat or progress → skill model updated → next recommendation.

**Guided practice mode:** notes fall toward a play line; show expected pitch and duration. May allow *wait for correct notes*, with explicit tempo and scoring differences.
**Performance mode:** timeline continues independent of player; measure temporal alignment and expression.
**Sight-reading mode:** score leads, falling notes reduced/hidden; evaluation is appropriate for the genre and task.
**Free-play/improvisation:** should not mark every dissonant note as wrong; harmonic analysis is advisory, plus human-curated rubrics.

## 4. Product areas and release scope

| Area | Vertical slice | MVP | Advanced |
|---|---|---|---|
| Home/Discover | Curated seed cards | Search, genre filter, personalized continue | Editorial + recommendation ranking |
| Course details | One jazz course | Instructor bio, curriculum, access control | Multiple teachers/paths |
| Video lessons | One licensed example | Video delivery, chaptered playback, bookmarks | Automated lesson ingest/review |
| MIDI input | USB MIDI + detection | Device picker, reconnect, calibration, sustain | Mobile/native bridge, microphone |
| Music view | Falling + verified score + hybrid | Loop, slow tempo, measure highlighting | Adaptive notation assistance |
| Evaluator | Notes + timing + latency | Chords, holds, rests, dynamics where available | Jazz phrasing, voicings, improv analytics |
| AI coach | Grounded Q&A and result explanation | Persistent history, suggested exercises | Real-time voice, adaptive curriculum |
| Mascot | Eyes/full toggle | Overlay chat, preferences, text/mute/hide | Rich expressive animation |
| Challenges | One rubric, honest scoring | Rewards, streaks, skill achievements | Tournaments and community |
| Progress | Session result | Skill tree, time, mastery, goals | Longitudinal learning insights |
| Repertoire | Original/licensed exercises | Licensed library, lead sheets | Arrangements/interactive standards |
| Instructor studio | Manifest import + review | Video upload, transcription suggestions, editor, publish states | Batch processing and multi-author |
| Billing | None | Subscription & entitlement checks | Family/team tiers |

## 5. Functional requirements with IDs

- FR-001 Account registration/sign-in, email verification, accessible settings and deletion/export.
- FR-002 Browse genres and instructors, search, course page, lesson ordering, resume position.
- FR-003 Video player with captions, keyboard shortcuts, speed control and bookmarks.
- FR-004 Deterministic unified timeline model; source of truth is beat position / tempo map and explicit media mapping, never independent animation clocks.
- FR-005 MIDI device permission, user gesture, selection, reconnect/disconnect, events (note on/off, velocity, sustain CC64), calibration and diagnostics.
- FR-006 Falling notes render expected pitches, durations, hands, upcoming chords; distinguish player input visually.
- FR-007 MusicXML score renderer with cursor/highlighting. Modes falling/score/hybrid persist by user and device.
- FR-008 Practice controls: play/pause, metronome, count-in, loop A/B at measures, 50–120% tempo with pitch-safe playback policy, restart measure.
- FR-009 Graded attempts store missed/extra pitches, onset error, hold error, chord grouping, rubric, device latency and evaluator version.
- FR-010 Jazz task type allows authorized voicing alternatives and harmonic tension context; no absolute score for artistic improv.
- FR-011 Coach answer retrieval restricted to accessible lesson transcripts and curriculum material, plus authorized summarized assessment; citations to lesson segments and explicit uncertainty.
- FR-012 Coach actions are typed, permission-checked: explain term, highlight bar, create exercise draft, jump to timestamp, set tempo within safe range, open next lesson. Never silently mutate courses/billing/account.
- FR-013 Mascot options: eyes-only, full, hidden, text-only; accessible toggle, optional sound, pause notifications in performance mode.
- FR-014 Progress dashboard with real calculated practice duration, mastery by skill, goals and follow-up actions.
- FR-015 Content admin: ingest original video/transcript, pair with MusicXML/MIDI or author score, verify sync and rubric, review, publish, rollback.
- FR-016 Content entitlement, signed video URLs, audit event log, subscriptions, privacy controls and server-enforced authorization.
- FR-017 Reliability: reconnect after MIDI port loss; local event capture and retry-safe session submission; prevent duplicate scoring.
- FR-018 Desktop layout first, tablet adaptation, keyboard navigation, screen-reader-friendly controls, reduced-motion, subtitles.

## 6. Explicit exclusions for vertical slice

No full automatic jazz transcription guarantees, virtual band reactive to improvisation, voice cloning, full acoustic multi-pitch microphone analysis, social live jam, instructor marketplace, native iOS app or billing. They may be planned but must not block proof-of-learning.

## 7. Success measures and gates (targets to validate, not claims)

**Vertical slice gate:** One student can connect one supported MIDI keyboard, watch a real licensed lesson, play a 4–8 measure verified passage, see falling notes and synchronized notation, get stable deterministic feedback and ask a grounded lesson question. This journey works reliably on the selected hardware/browser.

**Internal latency targets (engineering hypotheses):** note display feedback p95 under 50 ms after event receipt on test hardware; offline replay deterministic; stable visual scroll at ~60 FPS on reference desktop; local scoring independent of network. Audio/video sync and perceived timing require actual device testing and calibration.

**MVP product validation:** lesson completion, percentage of students returning to practice, median deliberate practice minutes, skill retention after days, MIDI connection success and time-to-first-note, and frequency of useful AI feedback. A/B test without manipulative retention mechanics.

## 8. Standard user journeys and errors

- New learner without MIDI: can browse, watch, learn theory, and open an on-screen demo; graded performance is gated with clear instructions. Do not fake accurate grading.
- MIDI disconnected mid-session: pause grading with a visible banner; preserve buffered events and offer reconnect.
- Lesson missing verified note data: play as video-only with transparent status; do not show inaccurate falling notes.
- Ambiguous improvised note: explain context/possible function and never insist that a creative choice is objectively wrong.
- High latency detected: calibration assistant; user can disable strict timing scoring until calibrated.
- User hides mascot: no chat popups; restore by clearly labeled menu or keyboard action.

## 9. Definition of done

A feature is done only with acceptance tests, keyboard accessibility, loading/error/empty states, analytics event, privacy review, minimal instrumentation, performance check, and docs. A pretty screenshot alone is not completion.
