# Test strategy and release criteria

## Test pyramid

**Unit:** pure music timeline, tempo-map integration, MIDI parser, note-on/off pairing, sustain, chord matching, scoring rubrics, schema validation, access control, coach response validation. Fixed golden MIDI event fixtures with exact output assertions.

**Integration:** signed lesson manifest, caption and MusicXML imports, player video/notation seek, assessment persistence, login+entitlements, subscription webhook replay, instructor edit-review-publish, RAG retrieval permissions.

**E2E:** new learner browsing (anonymous), user onboarding, course resume, supported MIDI connect and disconnect, play-along completion, result + coach explanation, assistant Eyes/Full/Hidden, teacher upload/publish, payment trial/cancel, GDPR delete/export.

**Manual hardware:** Chrome/Edge across macOS/Windows and at least two keyboards; compare latency, ghost notes, sustain pedal, MIDI channel settings, sleep/wake and background tab recovery. Record results in a matrix.

**Pedagogy QA:** trained jazz instructor annotates 50+ target phrases and alternative voicings. Compare engine decisions with ground truth, including deliberate substitutions and altered tensions. Classify false-error and false-correct rates; this is more valuable than high aggregate scores.

**Accessibility:** WCAG 2.2 AA target where applicable; headings/labels, keyboard, visible focus, reduced motion, captions, color contrast, accessible textual alternative for practice visuals, no audio-only instructions.

**Security:** RBAC, IDOR, signed video URL expiry, unauthorized content, RAG injection in transcripts, secret handling, dependency scanning, subscription webhook replay, rate limiting, raw-MIDI privacy and retention.

## Release criteria (targets to validate)

- Vertical slice has zero critical/blocker issues and 100% passing deterministic music engine golden tests.
- Manual support matrix reports successful note capture, held notes, sustain and disconnect recovery for baseline environment.
- Audio/video notation synchronization verified at start/middle/end of example lesson by teacher review.
- Any AI feedback about performance cites a real measurement or explicitly says none exists.
- No unlicensed demonstration assets in the paid catalog; clear asset rights inventory.
- Error/empty/loading states for all MVP flows.
- CI includes typecheck, lint, unit, integration/e2e smoke and screenshot regression at consistent viewport.

## Example Gherkin scenarios

```gherkin
Scenario: MIDI note is graded without network dependency
  Given an authored exercise expects MIDI note 60 at beat 1
  And the learner calibrated a connected MIDI keyboard
  When the device emits note_on 60 at the calibrated expected time
  Then the UI highlights the key immediately
  And the local evaluator records a matched note
  And a temporarily unavailable network does not change the result

Scenario: Missing verified score prevents misleading interactive content
  Given the current video has no approved note manifest
  When the student opens the lesson
  Then the video-only lesson opens
  And the app shows an honest non-interactive status
  And it does not render fabricated falling notes or accuracy

Scenario: Mascot eyes-only during a graded performance
  Given the learner has selected eyes-only
  When a graded play-along starts
  Then only the peeking eyes/ears are shown in the corner
  And noncritical messages do not obscure the piano/score
  And the student can open or hide the assistant at any time

Scenario: Alternate jazz voicing is accepted only under configured rule
  Given an exercise is labeled free jazz comping
  And it allows a G7 shell voicing of B and F
  When the student plays B and F during the G7 measure
  Then the evaluator records an accepted harmonic voicing
  But the same input can be graded differently in an exact-notes exercise
```
