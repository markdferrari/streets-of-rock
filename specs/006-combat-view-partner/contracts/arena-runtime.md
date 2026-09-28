# Runtime Contract: Shared Arena Geometry and Partner Intent

## Dependencies and interfaces

Implement after feature 005 provides selected roles, role selectors and a real session owner. No public network API. Suggested internal interfaces:

- `computeArenaFrame(run, viewport, envelopes, previousFrame, activeDelta): CameraFrame` is pure and enforces the data-model fit/containment rules.
- `buildArenaContext(run, frame, envelopes, transition): ArenaContext` returns legal and fully visible movement regions without changing geometry/progression.
- `choosePartnerTarget(run, context): EntityId | null` filters eligibility before ranking and resolves the selected player by role.
- `updatePartner(run, context, events)` updates intent, facing and existing support action without consuming player inputs or changing damage values.
- `deriveProgressionCue(run, sessionPhase): ProgressionCue` is a pure view of progression, not a progression controller.

Keep these independent of Three, DOM and wall-clock APIs. `scene.ts` applies CameraFrame to its existing orthographic camera; `game-app.ts` supplies measured viewport and body envelopes and reuses the computed frame when rendering. Replace 005's partner AI implementation in place rather than maintaining both old and new control policies.

## Tick and render ordering

Preserve the existing damage/AI stage ordering and support direct-hit path; do not introduce a second hit on pose completion. At each fixed simulation tick establish the current frame/context from run state and viewport, advance partner action expiration and intent at the existing AI stage, resolve normal movement/collisions, then process existing damage/terminal/progression stages. Recompute a containing camera frame from final positions and new encounter state before rendering. Any newly entered room retains the partner's unlocked outgoing travel region until arrival.

Numeric frame/context used for partner decisions is fixed for that tick. Frame-rate interpolation must never independently narrow the visible area below the last validated envelope. A viewport resize updates the envelope before the next active tick; pause/interruption clears pending input and freezes intent/progress timers. No renderer callback mutates partner position.

## Movement, attacks and recovery invariants

- No engagement cancellation, snap or player slowdown based solely on player-partner distance.
- Current valid attacks finish under existing timing unless combat rules or visibility require interruption. Interrupted active poses do not refund cooldown or repeat damage.
- Partner proposals stay on valid visible paths; boundary clipping shortens only this tick's movement, never teleports a distant actor.
- In active combat the room-fit frame includes the player and partner; during travel fit expansion provides time for ordinary profile-speed catch-up. Do not move the camera centre 18 units over a two-unit doorway without this containment.
- Stationary attacks, cooldown wait, target invalidation, viewport/camera changes and pause cannot fabricate obstruction evidence.
- Recovery is a last resort with the concrete evidence/candidate rules in the data model. Record recovery events for tests/diagnostics; never grant health/damage/progression as a side effect.
- Preserve no ally body-block/friendly fire, no partner healing/Special, knockout permanence and solo victory.

## Required compatibility checks

Migrate the old test that expects recovery from excessive separation into a regression asserting no such recovery. Preserve health and modest support-damage assertions. Parameterize both selected identities using 005 fixtures. Keep original level definitions and compare room bounds, spawn definitions and player traversal times before/after.

All new interface/cue code is part of the existing bundled build and therefore included in 005's actual inventory/cache audit. No additional persistent settings, remote services, audio assets or worker policy changes are introduced.
