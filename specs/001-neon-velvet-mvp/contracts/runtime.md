# Runtime and Player Interface Contract

**Version:** 1; scoped to the MVP. No public server API.
**Related:** [Data model](../data-model.md), [specification](../spec.md).

## Module boundaries

| Boundary | Input | Output / obligations |
| --- | --- | --- |
| game.createRun | LevelDefinition, Tuning | Fresh RunState; no retained mutable state from a previous run |
| game.step | RunState, InputFrame, Tuning; one fixed tick | Next state plus ordered GameEvents; no browser, renderer, storage, audio, or clock calls |
| input.sample | Pointer ownership and action taps since last tick | Movement vector, action intents; finite normalized values and deterministic order |
| input.clear | Pause, cancellation, reset | Neutral movement, no action taps or pending commands |
| presentation.render | Previous/current state, interpolation fraction, events | Scene/HUD update; never mutates combat state or applies damage |
| audio.handle | GameEvents, settings, lifecycle state | One music stream, bounded effect voices; failure returns unavailable status without throwing into gameplay |
| persistence.load/save | Validated preference/result records | Records or safe in-memory fallback; never stores RunState |
| lifecycle | visibility, focus, orientation, Pause/Resume, context-loss events | App state plus pause latch/blockers, cleared input, active-clock control |

`InputFrame` contains moveX/moveDepth in [-1,1], ordered action taps from attack/dodge/special,
and the sampled tick. Pause/Resume/Start are app commands, not attacks. Normalize analog
movement once in input; the simulation validates it again to protect tests and future callers.

`GameEvents` are tagged records: actionStarted, hitAccepted, actorHurt, actorKnockedOut,
meterChanged, tableBroken, pickupCollected, waveStarted, arenaCleared, bossPhaseChanged,
runEnded, tutorialCompleted. Each includes tick and relevant stable IDs; damage events include
amount and target. Effects are emitted only for accepted transitions, never every render frame.

The app owns active elapsed milliseconds. `runEnded` freezes that counter, and only victory
can update the best record. Run state never reads performance.now() or localStorage directly.

## Screens and UI behavior

| Screen | Required controls / information | Preconditions and result |
| --- | --- | --- |
| Loading | Progress, failure reason, Retry | Start cannot enter a partially loaded visual/game scene; audio alone may fail gracefully |
| Title | Start, Settings, offline status, installation guidance where available | Start creates a new run only in landscape with required assets ready |
| Playing | Cow/Crow health, partner KO label, meter, Pause, joystick, Attack/Dodge/Special; boss health when relevant | Controls have accessible names; HUD consumes its own touches |
| Paused | Resume, Settings, interruption reason | Resume requires visible, focused landscape and restored renderer; never resumes automatically |
| Settings | Music volume, Effects volume, Screen shake, Back | Available from title and pause; audio levels independent; returning from pause settings stays paused |
| Victory | Completion time, Best time, Retry, Return to title | No combat continues; preserve valid local settings/tutorial/best |
| Defeat | Defeat reason, Retry, Return to title | Cow death wins simultaneous terminal ties; retry resets both heroes |
| Portrait overlay | Rotate-device instruction | Blocks gameplay/Start/Resume; does not erase current run |
| Unsupported rendering | WebGL 2 unavailable message | Do not pretend loading succeeded; explain supported-browser requirement |

The movement region is the left half of the playable safe viewport excluding HUD. The first
eligible movement pointer owns the joystick until pointerup/cancel/lostcapture; additional
left-side pointers do not steal it. Action buttons trigger once per pointerdown; holding does
not auto-repeat. Capture pointer ownership; do not move actions between buttons as a finger
slides. Do not suppress normal browser gestures outside the game/control surface.

On pause/hidden/blur/portrait, clear all owned pointers and buffered actions. Resize canvas and
DOM layout together using the actual viewport; retain 72/56 CSS-pixel action targets where
space permits, with safe-area padding and no overlap. Layout is usable at 568×320 CSS pixels
and above in landscape. Smaller layouts show the rotate/space-needed overlay rather than
making controls overlap. A resized camera must keep the whole locked arena visible.

Inactive actions display cooldown/empty-meter feedback and consume nothing. Special is usable
after Crow is knocked out. Both health bars and meter use readable labels/shapes alongside
color. Contextual prompts mark completion only after the relevant action is successfully used.

## Test and diagnostics boundary

Vitest tests call game and adapter boundaries directly with controlled ticks. A test-only
entry point may load predefined scenario fixtures and read state to exercise integration;
compile it only when VITE_TEST_MODE=1, and assert it is absent from release builds. A passing
scripted run does not count as the five-player evaluation.

A separate VITE_DIAGNOSTICS=1 build exposes a local frame-time recorder and report download
on title/results, without combat mutation controls or remote telemetry. Reports include build
ID, device/browser entry, frame intervals, area/wave markers, pauses, active duration, and
stall counts. Normal controls and graphics are identical to release. Final visual/performance
acceptance must also be repeated on the release build.
