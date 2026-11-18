# Execution roadmap — from zero to production

Estimates are **planning ranges, not commitments**, for a capable small team with one dedicated full-stack lead, one music-tech engineer, UX/frontend designer/engineer support, and a part-time piano educator. Agent-generated code needs human review; a single solo developer will often need longer. Cost, schedule and feasibility depend heavily on source lesson quality and MIDI compatibility.

## Phase 0 — Product & engineering foundation (1–2 weeks planning range)

**Deliver:** monorepo, lint/typecheck/tests/CI, app shell/tokens, core data model migrations, seeds, typed lesson-manifest schema, authorization pattern, design references, one rights-approved video, one score and source MIDI fixture. Create ADRs for stack, provider, audio clock. Establish local dev and preview/staging.

**Gate:** CI green; demo shell responsive; no production secrets; real signed video asset path scaffolded. Decide exactly which MIDI keyboard/browser combo to support first.

## Phase 1 — End-to-end vertical slice (3–6 weeks planning range)

**1.1** Upload/license one short ii–V–I recorded lesson; create human-reviewed MIDI + MusicXML + captions + chord annotations.
**1.2** Build real Web MIDI connect/disconnect UI and calibration; use captured MIDI event logs in tests.
**1.3** Build one authoritative beat/tempo timeline; falling notes Canvas + virtual piano with actual key highlights; beat/measure mapping.
**1.4** Render score with MusicXML and synchronize cursor; video chapter seeks/anchors; modes falling/score/hybrid.
**1.5** Implement deterministic note/chord grading, feedback with misses/early/late/duration; loop/tempo; persist attempt result.
**1.6** Add original corner mascot Eyes-only/Full, chat popover with lesson retrieval and graded-result explanation; limited typed actions.
**1.7** End-to-end smoke on physical MIDI hardware and one accessibility review; instructor validates scoring.

**Gate:** A learner can complete a full meaningful lesson on supported hardware with verified sync and non-fabricated AI feedback. No fabricated charts or sample performance scores in production path.

## Phase 2 — MVP academy and teacher tools (6–10 weeks planning range)

- Real auth, enrollment, course library, details, progress persistence and resume.
- Instructor upload wizard, transcript edits, score/MIDI import, sync anchors, exercise authoring and publish approval.
- Course search/filter, repertoire licensing metadata, reusable curriculum taxonomy and progress dashboard.
- Basic challenges and achievement logic; subscriptions/entitlements with billing backend; ops monitoring.
- Automated accessibility, privacy/export/deletion and security tests; beta onboarding and first cohort.

**Gate:** Instructors can publish a new video-based interactive lesson without a developer editing code; content rights are recorded; paying student can access subscribed lessons; student results persist and explain accurately.

## Phase 3 — Beta refinement and launch hardening (4–8 weeks planning range)

- Quality and reliability telemetry; MIDI device matrix; latency calibration improvements.
- Teacher-reviewed music pedagogy validation; onboarding funnel improvements; course content production.
- RAG evaluator and AI safety tests, abuse/rate limiting, support and incident runbooks.
- Video CDN, cache, database backup/restore, paid workflow and GDPR readiness.
- Responsive tablet adaptation, localized UX, support resources.

**Gate:** Agreed stability/privacy/performance baselines under realistic cohort. Access control and payment flows passed external QA.

## Phase 4 — Research & differentiators (parallel research / post-launch)

- Genre-specific harmony + improvisation analysis with rubric confidence; audience validation by real musicians.
- More advanced MIDI expression and optional acoustic/microphone polyphonic transcription (separate latency/accuracy lab).
- Interactive rhythm section with predictable tempo/harmony first, then responsive jam engine if feasible.
- Longitudinal personalized practice plans, human mentorship integration, collaborative learning.

## Priority backlog (epics + first story IDs)

| Priority | Epic | Key stories |
|---|---|---|
| P0 | Foundation | APP-001 shell/tokens, APP-002 CI, APP-003 schema and seeded manifest |
| P0 | Music | MUS-001 MIDI connect, MUS-002 calibration, MUS-003 timeline, MUS-004 note scoring |
| P0 | Player | PLY-001 video, PLY-002 falling notes, PLY-003 MusicXML, PLY-004 hybrid & loops |
| P0 | AI | AI-001 lesson text retrieval, AI-002 feedback grounder, AI-003 mascot modes |
| P1 | Academy | EDU-001 courses, EDU-002 auth, EDU-003 enrollments, EDU-004 progress |
| P1 | Content | CMS-001 upload, CMS-002 transcript, CMS-003 sync editor, CMS-004 approve/publish |
| P1 | Business | BUS-001 entitlements, BUS-002 subscription webhook, BUS-003 billing UI |
| P1 | Reliability | QA-001 device matrix, QA-002 e2e, QA-003 security/privacy, QA-004 telemetry |
| P2 | Jazz intelligence | MUS-020 alt voicings, MUS-021 groove, MUS-022 improv rubric |
| P3 | Exploratory | RND-001 microphone recognition, RND-002 responsive trio |

## Estimated staffing and cost drivers

Team archetype: product owner/piano educator (part-time), designer/frontend, full-stack/backend, music/audio engineer, QA (shared), AI integration (shared). One person can cover multiple roles but not skip domain expertise or testing. Largest cost variability: licensed musical content, instructor review of scores, video hosting/bandwidth, real-device testing, and iterative musical assessment. Don't lock a cash budget before content and usage assumptions.

## Highest-risk assumptions to validate early

1. Can students reliably connect their target physical keyboard in chosen browsers?
2. Do user's archived videos have usable source MIDI/score? If not, cost of human transcription may dominate.
3. Can a game-like interface truly improve literacy/skills rather than chasing notes?
4. Does context-aware AI give correct, genuinely helpful feedback from deterministic evaluator outputs?
5. Can rights to standards/arrangements and recordings be cleared for target territories?
6. Do people enjoy a corner mascot during intensive practice, or should Eyes-only be default?
