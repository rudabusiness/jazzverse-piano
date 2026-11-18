# Copy/paste into Codex or Claude Code

You are the technical lead implementing **JazzVerse Piano**, a premium AI-assisted piano academy. The entire product specification and design pack is in this repository. Inspect it before coding.

**Do not start with random UI components.** First read: `README.md`, `specs/PRODUCT_SPEC.md`, `agent/AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/MUSIC_ENGINE.md`, `docs/VIDEO_PIPELINE.md`, `docs/AI_TUTOR.md`, `docs/SCREEN_SPECS.md`, `docs/DESIGN_SYSTEM.md`, `docs/ROADMAP.md`, and `docs/TEST_PLAN.md`. Inspect `design/reference/approved-vision-floating-assistant.png` and individual screen references.

Business model: Netflix-style real-instructor video courses across jazz (main identity), classical, blues, gospel/soul and pop. The core is Guitar Hero-style falling notes + real physical MIDI keyboard + synchronized music notation + measurable real learning. A small original blue AI companion remains floating bottom-right and can show eyes only, whole character, be hidden or open a compact chat. Do not replace it with a permanent large chat panel.

For this iteration implement **Phase 0 + the Phase 1 vertical slice only**. Deliver an executable, tested, locally reproducible initial repo:

1. Propose architecture decisions and create relevant ADR(s) (avoid unjustified technology sprawl).
2. Initialize strict TypeScript app/monorepo structure and CI scripts.
3. Build reusable design tokens/AppShell and player screen aligned to approved references.
4. Define immutable validated lesson manifest with original 4–8-bar ii–V–I exercise fixture; do not claim to have a user's video if it is absent.
5. Implement pure deterministic MIDI parser, tempo mapping, local event matcher, note and timing scoring, and golden test cases.
6. Build real Web MIDI device connection/disconnection handling with honest unsupported-browser UI and calibration path.
7. Build one player integrating falling notes, keyboard highlighting, MusicXML notation, chapter/video timeline and practice controls. One canonical beat clock, no fake score.
8. Add Eyes-only/Full/Hidden companion and collapsible contextual chat UI. Ground coach replies only in verified source transcript/result; mocked provider must be clearly flagged in dev.
9. Add tests and one end-to-end scenario covering connection, practice and feedback. Where physical-device testing can't run, specify manual hardware steps.

Before coding, give a concise implementation plan and list uncertainties. Then proceed with code and tests without expanding into the full MVP. At the end report exact files, commands, test results, remaining gaps and next highest-priority PR. Never claim work complete when it is still mocked. Do not deploy or spend money without authorization.
