# Assumptions, decisions and open questions

## Adopted product decisions

- Keep original Netflix/Guitar Hero/AI companion direction rather than jazz-only replacement UI.
- Jazz flagship; classical, blues, gospel, soul, pop categories built into taxonomy from day one.
- Existing videos are foundational; manual review stage makes generated interactive content reliable.
- MIDI-first and desktop Chrome/Edge first; acoustic microphone recognition deferred.
- Sheet music, falling notes and hybrid are three views of one exercise timeline.
- Original blue companion in lower-right, toggles Eyes-only/Full; optional expanded popover and hidden/text-only accessibility settings.
- Build one full end-to-end vertical slice before wider catalog, AI band or subscriptions.

## Engineering decisions needing explicit ADR

- Next.js vs other web framework; selected auth provider; ORM and queue provider.
- Managed streaming provider vs in-house encoding and signed delivery.
- Data residency, consent and retention strategy based on target markets.
- Score engraving adaptation and MusicXML↔MIDI canonical mapping.
- Calibration flow and note matching window per exercise/genre.
- Billing plan and subscription territories.

## Questions that do not block Phase 0

- Real app naming, mascot naming and commissioned character/IP clearance.
- First teacher video exact format, length, score/MIDI availability.
- Minimum supported instrument list and mobile/native companion scope.
- Pricing and instructor revenue model.
- Initial course languages and accessibility transcription needs.
- Whether courses are teacher-led sequences or modular learning paths.

Unresolved items should become ADRs, not be silently guessed by coding agents.
