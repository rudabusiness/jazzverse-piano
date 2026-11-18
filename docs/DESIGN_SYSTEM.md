# Design system and interaction guide

## Visual intent

The look is a premium evening jazz club: deep navy/purple surfaces, warm gold as the primary accent, cool electric blue/purple for music notes. Avoid generic gamer-neon overload. The reference overview lives at `design/reference/approved-vision-floating-assistant.png`. Screen images are in `design/screenshots/`; the HTML prototype is navigable.

## Tokens (starting points; accessibility review required)

```css
:root {
  --bg-canvas: #090B17;
  --bg-sidebar: #0E1020;
  --bg-surface: #14182D;
  --bg-elevated: #1D2139;
  --border-subtle: #34314E;
  --text-primary: #F7F1E9;
  --text-muted: #AAA8C4;
  --accent-gold: #F1C879;
  --accent-gold-pressed: #D9AE66;
  --note-left: #A67EFF;
  --note-right: #6BBDF8;
  --success: #69D3AF;
  --warning: #E5AD63;
  --danger: #F08D91;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-card: 18px;
  --radius-hero: 22px;
  --space-unit: 4px;
}
```

Colors are **not a substitute** for labels, iconography or note names. Validate contrast, especially muted copy and gold on gradients. Layout minimum touch targets 44×44 CSS pixels for touch scenarios. Provide focus rings and reduced motion.

## Typography

- Display: elegant licensed serif such as Fraunces or a system serif fallback for hero titles, 36–48 px desktop. Body/UI: Inter or system sans 13–16 px; never shrink controls to fit marketing screenshots.
- Hierarchy: page title 36 px, section 22 px, card title 16–18 px, body 14–16 px, metadata 12–13 px. Typography scales with viewport.
- Real notation uses a proper SMuFL font via notation library; do not fake printed music with arbitrary Unicode notes in production.

## Grid and shell

Desktop target: 1440–1600 px wide, left sidebar ~224–240 px, app content max 1450 px, 24–32 px margin, 16–24 px gutters. Player three-column template: lesson steps ~200 px / responsive center / analytics ~240–270 px. On tablet collapse sidebar and allow video/score/player to stack; **keyboard/falling notes remain prioritized**. Phone is a companion course/chat experience at first; do not promise usable 88-key practice at 360 px.

## Primary components

- `AppShell`, `NavigationSidebar`, `TopBar`, `GenreTabs`, `CourseHero`, `CourseCard`, `InstructorCard`, `CourseOutline`, `VideoStage`, `SyncTimeline`, `NotationPanel`, `FallingNotesCanvas`, `PianoKeyboard`, `PracticeTransport`, `LoopRange`, `TempoControl`, `MetricsPanel`, `SessionResults`, `SkillTree`, `RepertoireTable`, `LessonUploadWizard`, `PublishChecklist`, `AssistantMascot`, `AssistantPopover`, `DeviceSelector`, `ErrorState`, `EmptyState`.
- Prefer semantic buttons, links, progress roles and labeled inputs. Keyboard shortcuts must not conflict with typing in AI chat.
- Keep game feedback informative without distracting from the teacher or keyboard: gold for CTA, blue/purple for note lanes/hands, green for confirmed correct, orange for gentle warnings.

## Original corner AI companion (approved modification)

**Never** render a large permanently open AI chat page as the sole experience. The companion appears at the lower-right corner in any learning view, and may open a dismissible popover.

State machine:
- `hidden`: no visual character; accessible menu action restores.
- `eyes`: peeking eyes/ears, approximately 72–100 px wide and no speech bubble, default during focused playing.
- `full`: whole original blue mascot approximately 88–120 px wide, optional one-line feedback bubble.
- `chat-open`: anchored popover width 320–380 px on desktop; on small viewports becomes a mobile sheet. Return to prior visual mode on close.
- `speaking/listening/thinking/success/warning`: subtle animation variants. Must respect reduced-motion and voice preferences.

Behavior: never obstruct piano notes, score cursor, video captions, transport controls or primary CTA. Drag positioning and saved preference can be future enhancements; initial version uses a safe offset based on view. During graded performance, noncritical interruptions are queued. Character should have original silhouette and name (working name "Milo"), avoiding resemblance to Bluey or third-party IP.

## Player interaction

- Display toggle `Falling Notes | Sheet Music | Hybrid`; persist per device/user; default `Hybrid` for music-literacy learning, but adaptive recommendation can suggest switching.
- `Playback` and `Practice` are distinct controls: pausing a reference video does not automatically stop an unrelated exercise unless explicitly linked.
- Visible `MIDI connected` status, `calibration` action, `tempo`, `metronome`, `count-in`, `loop A/B`, `difficulty`, `score rubric` tooltip, `play/pause`, `captions`.
- Sheet music follows measure cursor; falling notes use the identical authoritative beat clock and scroll direction.
- Screen reader alternatives to spatial piano visualizations: textual next chord/note, measure and timing summary, accessible controls.

## UI states and assets

Every screen requires initial skeleton, empty state, error and retry, success, partial-data, restricted-access state. All course art/photos/mascot animations must be original, licensed or commissioned. Branding is provisional; do a name/trademark clearance before launch.

## Screen map

01 Home/Discover — `design/screenshots/home.png`
02 Course Library — `design/screenshots/courses.png`
03 Course Details — `design/screenshots/course-detail.png`
04 Lesson Player — `design/screenshots/lesson.png`
05 Notation/Hybrid — `design/screenshots/notation.png`
06 AI Coach expanded — `design/screenshots/coach.png`
07 Challenges — `design/screenshots/challenges.png`
08 Progress — `design/screenshots/progress.png`
09 Repertoire — `design/screenshots/library.png`
10 Profile/Settings — `design/screenshots/profile.png`
11 Companion Eyes Only — `design/screenshots/lesson-eyes-only.png`
