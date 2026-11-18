# Screen-by-screen specifications and user interactions

**Visual references:** each named PNG in `design/screenshots/`; `prototype/index.html` presents a navigable, nonfunctional visual demo. All layouts preserve premium jazz palette and persistent corner assistant in applicable student screens. Screenshots are illustrative prototypes, not coded production screens. Production should also include login/onboarding, paywall, course-player empty states, error states and instructor admin screens not yet illustrated.

## 01. Discover / Home — `/discover` — `home.png`

**Goal:** immediate continuation and Netflix-like discovery. **Regions:** sidebar nav, featured cinematic banner with Resume/Explore CTAs, horizontal genre tiles (jazz first, classical/blues/soul/gospel/pop), personalized lesson and challenge shelves, corner AI assistant. **Data:** enrolled courses, curated highlights, recommendations, course cover assets, recent progress, entitlements. **Actions:** search, browse/filter, resume exact lesson and timestamp, open course. **States:** new user = recommended guided diagnostic; returning learner = resume. **Acceptance:** clicking Resume loads saved authorized lesson, keyboard focus usable, hero image never blocks legibility.

## 02. Course catalog — `/courses` — `courses.png`

**Goal:** choose learning paths. Filters by style, difficulty, skills, teacher, duration, available language; sortable course cards. **Data:** published accessible course metadata with descriptions/levels and badges. **Actions:** bookmark, preview, enroll, view details. **States:** no results, locked subscription, processing/unpublished excluded. **Acceptance:** filters reflected in URL, backend sorting/pagination, no fake course count.

## 03. Course detail — `/courses/[slug]` — `course-detail.png`

**Goal:** validate relevance and start. **Regions:** cover/video preview, teacher bio, syllabus sections with lesson durations, outcomes, requirements (MIDI optional for video but required for grading), progress, Continue/Start. **Data:** course version/instructor/entitlement/enrollment. **Acceptance:** persistent lesson progress per student and permission checks.

## 04. Interactive lesson player — `/lessons/[id]` — `lesson.png`

**Goal:** turn instructor video into measured guided practice. **Regions:** lesson breadcrumb, steps sidebar, real instructor video (captions), synchronized score, dominant falling note lane and keyboard, metrics side panel, tempo/loop/transport, subtle bottom-right mascot. **Modes:** Watch, Guided, Play-along, Loop, Review. **Interactions:** explicit connect MIDI, calibrate, select device, start count-in, pause/resume, seek bar, speed, toggle score, loop two measures, repeat. **Data:** signed video URL, verified manifest, expected note events, results, captions and progress. **Acceptance:** video/score/notes share beat mapping; client MIDI not round-tripped for scoring; accuracy isn't shown if no MIDI input. **Errors:** MIDI denied, no hardware, video fail, missing score data, lost connectivity; each with a constructive recovery.

## 05. Notation & practice view — `/practice/[exerciseId]` — `notation.png`

**Goal:** focused playing without a large video. Three toggleable views Falling / Score / Hybrid (no separate datasets or clocks). Show note name/fingering assistance and learning fade-out. **Acceptance:** same event alignment and expected pitch across displays; persists preference; correct highlighting after seeking/looping.

## 06. AI coach — persistent widget + optional `/coach` history — `coach.png`

**Goal:** contextual questions and targeted practice plans. **Default** corner character in `eyes` or `full` mode; tap to expand small anchored popover; never permanently occupies a third of player width. Optional full-page *history* may exist but is not the default interaction. **Data:** authorized lesson snippets, exact timestamp, last verified metrics, student preferences. **Actions:** Explain / Show measure / Set tempo / Practice for 5 minutes / Next lesson. **Acceptance:** grounded responses and action confirmation; can hide; no unsolicited voice; screen readers announce only actionable updates.

## 07. Challenges — `/challenges` — `challenges.png`

**Goal:** gamification serving skill. **Regions:** daily challenge, objective, rubric, score/timing, past attempts, awards and streak. **Data:** task configuration, real graded attempts and practice sessions. **Actions:** attempt/retry/share result (opt-in). **Acceptance:** score transparent and reproducible; streak based on meaningful practice thresholds; no practice shaming.

## 08. Progress — `/progress` — `progress.png`

**Goal:** visualize actual musicianship. **Regions:** skill tree (harmony, voicings, rhythm, reading, improvisation, repertoire), practice-duration trend, lesson completion, areas to improve, recommended exercises. **Data:** skill evidence linked to graded attempts and instructor-defined mastery criteria; no arbitrary unearned score. **Acceptance:** every visible statistic traceable to session evidence, user timezone correctness, accessible data table alternative to charts.

## 09. Repertoire / Standards — `/repertoire` — `library.png`

**Goal:** build a playable library. **Regions:** categories (Jazz, Classical, Blues, Soul/Gospel, Pop), title search, composer/genre/difficulty, progress, favorite, lead sheet and play-along. **Data:** publishing/license status for arrangement/sheet/audio/video, authorized access. **Acceptance:** never expose copyrighted unlicensed sheet music; score selection loads verified arrangement/version.

## 10. Profile, Device & Preferences — `/settings` — `profile.png`

**Goal:** control membership, goals and MIDI device. **Regions:** current goals, subscription, device picker, timing calibration, companion appearance Eyes/Full/Hidden, assistant voice/text and privacy. **Acceptance:** preference roundtrip, device status honest, exported/deleted private data correctly, subscription managed securely.

## 11. Assistant Eyes-only mode — `lesson-eyes-only.png`

**Goal:** cute always-present companion without obscuring performance. Only eyes/ears peeking above the bottom-right edge, accessible expand action, no chat card. Enter Full mode from preferences and return to Eyes-only from compact toggle. During graded performance suppress noncritical bubbles; hide option remains possible.

## Additional required administrative/operational screens (design in Phase 2)

- Auth + onboarding and first lesson diagnostic (genre, experience, hardware, musical goals).
- Instructor studio: upload, transcript, score sync/editor, exercise editor, publish checklist and preview.
- Subscription and trial/paywall, purchase success/failure, cancellation and billing receipts.
- Error pages: unsupported browser, no MIDI, disconnected device, service degraded, expired license, missing score.
- Responsive tablet overlays and companion mobile account/course browsing (not full-featured MIDI practice unless validated).

## Product wording rules

Use "Play along", "Practice this bar", "Ask your coach", "Show sheet music", "Connect keyboard", "Try a slower tempo", "Your next step". Avoid unsupported claims "AI can perfectly hear your piano" or "You have 92% musicality". Use "Measured note accuracy" if metric is from events.
