# Agent instructions for Codex — JazzVerse Piano

**Mission:** Build the actual production-quality app incrementally from the provided product pack. You are an engineering agent, not a mockup generator.

## Read before coding (required)

1. `specs/PRODUCT_SPEC.md`
2. `docs/ARCHITECTURE.md`
3. `docs/MUSIC_ENGINE.md`
4. `docs/SCREEN_SPECS.md`
5. `docs/DESIGN_SYSTEM.md`
6. `docs/AI_TUTOR.md`
7. `docs/VIDEO_PIPELINE.md`
8. `docs/TEST_PLAN.md`
9. `design/reference/approved-vision-floating-assistant.png` and screenshots

If the pack lives in `product/`, resolve paths from there. Treat `prototype/index.html` as layout guidance, not source production architecture; avoid copy-pasting demo data into real services.

## Nonnegotiable rules

- Preserve the approved visual direction and floating corner mascot Eyes/Full behavior; never replace it with a full-height default chat panel.
- No fake note recognition, fake progress, fake AI feedback, fake database writes, or fictitious success state in production. Place demo scaffolds behind explicit flags.
- MIDI scoring must be deterministic, locally computable, tested with event fixtures, versioned. Do not put an LLM in timing-critical music engine.
- Only expose licensed/verified lesson and score assets. Missing score → honest video-only mode.
- Keep strict TypeScript and validated I/O; verify authorization and entitlement server side.
- Work **one vertical slice at a time**. Implement with coherent tests and acceptance verification, then show what is done and what remains.
- Every change: list affected files, tests run, limitations, security/privacy implications, and a brief next recommended increment.
- Do not deploy to production, buy services or upload user content without explicit authorization.
- If sample video not provided, create clearly labeled **original** MIDI/MusicXML fixture for local development; never claim it came from the user's video.
- Check third-party dependencies/license/version before use. Write ADR for major alternatives; no unreviewed mass dependency install.

## Initial task order

1. Audit repository and environment; report missing decisions/dependencies. Don't rewrite existing unrelated files.
2. Setup monorepo and CI with sample design shell.
3. Implement `music-core` pure TS types/tempo maps/MIDI parser/scorer + unit golden fixtures.
4. Implement authenticated or local-development seeded lesson manifest serving one example lesson.
5. Render the interactive lesson player including video (placeholder *explicitly labeled* until user supplies approved media), falling notes, notation, practice controls and assistive UI.
6. Support real MIDI permission, connect/disconnect, calibration and actual key highlight.
7. Add deterministic session feedback then grounded AI explanation using validated result.
8. Add assistant compact states and single user-controlled popover.
9. E2E test and performance check on supported browser; request actual hardware test where unavailable.

## Definition of done for each PR

- Acceptance criteria stated and tested.
- Lint/typecheck/unit checks green; relevant e2e/screenshot tests run.
- Proper empty/loading/error states and keyboard/ARIA behavior.
- No new secrets in git, no unnecessary AI vendor data sharing, no unsupported content rights assumptions.
- README or ADR updated when behavior/contracts change.
