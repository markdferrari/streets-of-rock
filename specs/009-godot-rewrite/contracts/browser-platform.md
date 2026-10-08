# Browser Platform and Accessibility Contract

**Applies to:** feature 009 FR-002, FR-007, FR-009–011, FR-013–014.

## Boundary

One `window.SorBrowser` adapter with API version 1 handles browser capabilities only.
The visible interface and all decisions live in Godot. A minimal HTML boot/progress/
failure/retry surface exists before the engine starts or after an unrecoverable
engine failure; it contains no selection/combat implementation.

Godot retains callback references for engine lifetime and unregisters listeners on
teardown. Pass explicit JSON-compatible projections across JavaScriptBridge rather
than mutable engine objects.

| Operation / message | Input or output | Rules |
| --- | --- | --- |
| initialize(callback) | Environment snapshot, raw values for the three saved keys, expected release ID and cache state | Unsupported protocol is a visible boot error. |
| environment | CSS viewport width/height, DPR, safeInsets(top/right/bottom/left), visible, focused, portrait, reducedMotion | Initial snapshot and changes; positive finite geometry; never auto-resume. |
| readStored / writeStored | Allowlisted key; optional raw JSON string; structured ok/unavailable result | No arbitrary key access; GDScript owns parsing, defaults and validation. |
| publishUi | Screen generation and keyed semantic descriptors | Godot supplies state, labels, ranges, bounds and focus intent. |
| uiIntent | Generation, control ID, kind(focus/activate/value/key), value/key/repeat as applicable | Reject stale generation, unknown or disabled control; exactly one authority handles an event. |
| cacheStatus / repairCache | Expected buildId; readiness, waiting, missing/corrupt paths and error | See delivery contract; mismatched build cannot become ready. |
| downloadDiagnostics | Read-only JSON payload and fixed download filename | Diagnostics export only; local download, no upload or telemetry. |

Unknown messages are ignored with development diagnostics; they do not mutate gameplay.
Only presentation-safe values may enter the DOM; use native properties/textContent
rather than accepting arbitrary HTML from definitions.

## Environment and input ownership

Read CSS safe areas through an env(safe-area-inset-*) probe. Report actual CSS viewport
geometry separately from engine render resolution. Godot scales its Controls to
CSS-pixel-equivalent sizes while limiting canvas render density to DPR 1.5.
Observe visibilitychange, focus/blur, resizing/orientation and reduced-motion changes.
Clear input when geometry changes invalidate its fixed anchors.

Godot owns normal canvas input through ScreenTouch/ScreenDrag (touch index, canceled
flag), mouse events and its input controller. Disable emulated mouse-from-touch and
touch-from-mouse duplication. Cancellation affects the originating touch; native
indices must not be guessed from DOM pointerId. Global interruption clears all inputs.
Do not install a parallel JS touch-to-action translator. Verify browser-native cancel
and outside-canvas release behavior in the foundation slice.

Selection activates after a fresh completed gesture, ignores >8 CSS-pixel drags and
canceled gestures, and suppresses held Enter/Space repeats across steps. Combat
requests actions on initial press, preserving the existing 60 CSS-pixel joystick
radius, 15% deadzone, fixed anchor and clamped drag response.

## Semantic UI projection

Each descriptor includes stable ID, role, accessible name, text or range/value,
disabled/pressed state, CSS bounds, focus order, visibility, and optional live-region
priority. Publish changed state/layout only; preserve DOM element identity so updates
do not reset focus or scroll. Do not announce health changes every rendered frame.

Use native buttons, ranges, checkboxes, headings, meters and dialog semantics.
The semantic layer remains in the accessibility tree and keyboard order while visually
transparent and pointer-transparent; do not use display:none, visibility:hidden or
aria-hidden to hide these mirrored controls.

Physical canvas pointers reach Godot. Browser keyboard/assistive actions on semantic
controls enter the generation-tagged command path once and suppress a second engine
activation for that event. When focus is within semantic UI, that route owns its keys;
otherwise Godot owns canvas/editor keys. A DOM focus change updates the visible Godot
focus indicator without previewing or confirming a character.

Preserve roving roster focus, disabled selected-fighter tile, labels and numeric
stat meters, two-step confirmation, 44 CSS-pixel minimum footer controls and current
combat sizing. Arrow-key navigation, scrolling and initial focus are decided by
Godot; JS applies the requested browser focus/scroll only. Settings traps focus and
restores the originating control on close without resuming gameplay.

Publish prompts, cache/update status and GO politely; countdown numeral announcements
are atomic and do not accumulate a queue. Announce result/error states clearly.
Test VoiceOver/TalkBack and browser keyboard operation in addition to canvas touches.

## Persistence compatibility

No persistence migration is required: use the original keys and version 1 JSON.

| Key | Value | Validation/default |
| --- | --- | --- |
| sor.settings.v1 | schemaVersion, musicVolume, effectsVolume, screenShake | schemaVersion=1; finite volumes in [0,1], defaults 0.7 and 0.8; boolean shake defaults true; invalid fields fall back individually. |
| streets-of-rock.best.v1 | schemaVersion, bestSuccessfulMs | schemaVersion=1; finite positive duration; invalid means null; only a strictly faster victory replaces it. |
| streets-of-rock.tutorial.v1 | schemaVersion, completed | schemaVersion=1; known IDs only, deduplicated in movement/attack/heavy/dodge/special order. Legacy attack completion does not imply Heavy completion. |

Missing, denied or malformed storage permits in-memory operation. Do not overwrite
a valid best result with defeat or invalid time. A write denial retains the in-memory
value; it does not repeatedly block interaction. Never persist a selected duo, run,
held input, cache-ready flag or temporary loading generation.

The non-web editor adapter may use a versioned user-data file for local development;
that file does not replace or migrate production browser keys.

## Audio and interruption

Godot owns one streamed music player and capped sample effect voices (eight maximum,
reuse the oldest effect voice when saturated). Separate music/effect levels apply
immediately. Normal pause preserves music position; Retry resets the new run's track
to its beginning; result feedback must fire once without overlapping music.

Actual selection, Retry and Resume gestures enable audio. Semantic activation must
enter the Godot action synchronously from the real browser gesture callback so that
permission-sensitive startup is not deferred beyond that gesture. Verify this path
on Safari and Chrome; failed audio permission still permits silent play.

On hide/blur/portrait, notify Godot promptly to pause clocks, gameplay and audio;
returning merely updates environment safety. Context-loss handling uses the runtime
contract. Preference changes and explicit resume remain usable while gameplay is paused.

## Required browser scenarios

Preserve all selection/settings accessibility tests with Godot controls, including
a twelve-entry test roster. Independently test real simultaneous canvas touches and
cancel, mouse drag/release, keyboard focus/confirmation, old saved values, malformed
values, denied storage, rejected audio, portrait countdown, lifecycle during each
Special, stale semantic commands, dialog focus restoration and release-hook absence.
