# Implementation kit synchronization status

Source: `JazzVerse_Piano_Complete_Build_Kit.zip` (2026-11-18). Scope: supporting materials only.

## Authority / conflict resolution

- `SPEC.md` on `main` remains the **official** product specification. It is more detailed in requirement IDs, governance, scoring and acceptance than the kit's `specs/PRODUCT_SPEC.md`.
- `BRIEFING.md` on `main` remains the **original briefing**.
- `README.md` on `main` remains intact.
- Imported agent instructions, tests and documentation are **supplementary**, not implicit amendments of the official scope.
- Any conflict between imported material and `SPEC.md` must be escalated for a product decision; do not silently supersede the official document.

## Import progress

This initial PR is a **partial sync**, not the complete ZIP import. Files committed to this branch are listed in the PR's changed-files tab.

The original kit also contains `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/MUSIC_ENGINE.md`, `docs/SCREEN_SPECS.md`, `docs/AI_TUTOR.md`, `docs/VIDEO_PIPELINE.md`, `docs/ROADMAP.md`, `docs/TEST_PLAN.md`, `docs/CONTENT_RIGHTS.md`, `specs/PRODUCT_SPEC.md`, `examples/lesson-manifest.example.json`, `prototype/index.html`, `design/render_screens.py`, and thirteen PNG visual references. These are **not all uploaded in this initial PR**; do not claim a complete sync until those files are individually verified on the branch.

## Design baseline

Preserve cinematic dark jazz aesthetics, Netflix-like course navigation, Guitar Hero-style falling notes, synchronized sheet music, and an original blue assistant floating in the corner (Eyes/Full modes), not a permanent chat sidebar.

## Phase 1 gate

One verified or explicitly development-only jazz ii–V–I lesson with real Web MIDI, deterministic timing/scoring, synchronized notation and falling notes, grounded tutor, and persisted practice outcome. No feature is complete solely from a mockup.
