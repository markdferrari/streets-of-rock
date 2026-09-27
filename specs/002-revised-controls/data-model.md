# Data Model: Revised Controls

**Related:** [Feature specification](spec.md), [runtime contract](contracts/controls.md), [research decisions](research.md).

This feature extends the existing browser input and deterministic run state. Fields below are conceptual contract fields; exact TypeScript declarations are an implementation task.

## Movement control

| Field | Meaning and validation |
| --- | --- |
| `center` | Current centre of the rendered ring in CSS viewport coordinates; refreshed after responsive layout changes. Remains fixed during a touch. |
| `radius` | Positive finite effective ring radius; start at 60 CSS pixels. |
| `deadzone` | Fraction of radius, start at 0.15; movement is neutral within this distance. |
| `ownerPointerId` | One active pointer or none. Only a down event starting inside the ring and while unowned may claim it. |
| `dragPoint` | Latest finite location of the owner; may lie beyond the ring. |
| `move` | Finite x/depth vector, magnitude in [0,1]. Zero at/within deadzone or without an owner. |
| `knobOffset` | Visual offset from centre, clamped to radius; zero without an owner. |

State transitions: `unowned → owned` on eligible down; owned updates only from its owner; `owned → unowned` on owner up/cancel/clear. A second pointer never steals ownership or transfers after the first releases. Geometry updates on resize clear ownership before recalculation.

## Action request and pointer ownership

| Field | Meaning and validation |
| --- | --- |
| `kind` | `light`, `heavy`, `dodge`, or `special`; fixed from the button on pointerdown. |
| `sourcePointerId` | ID of the touch that created the request; used to cancel that touch’s unexecuted work. |
| `order` | Monotonic adapter order for requests received within and across sampled ticks; tie-breaks duplicate kinds. |
| `sampleTick` | The fixed simulation tick to which the adapter delivers the request. |
| `releasedNormally` | Adapter marker allowing pointerup to preserve a valid tap through the following `lostpointercapture` event. |

The adapter emits at most one request per pointerdown and no repeat while held. A finger crossing button bounds does not change kind. Same-tick requests are ordered by Special > Dodge > Heavy > Light; equal kinds use input order. A canceled request is removed before the simulation samples it; later cancellation identifies and removes a still-buffered request. Clear empties all action and movement ownership.

## Sampled input

`InputFrame` contains normalized `move`, ordered `actionRequests`, and `canceledPointerIds`. It is created once per 60 Hz simulation tick from the browser adapter and read only by game rules. Empty arrays and neutral movement are valid. Pause, result, or retry discards the adapter state and the Cow pending action before another simulation step. Existing boolean action fields retire after dependent tests and call sites migrate.

## Cow action state

| Field | Meaning and validation |
| --- | --- |
| `action` | Existing idle/windup/active/recovery/dodge/hurt/knockedOut state; Heavy uses windup → active → recovery. No action is interrupted by another button. |
| `comboStep` and `comboDeadlineTick` | Existing Light sequence progress. Successful Heavy start resets both; rejected Heavy leaves both unchanged. |
| `pendingAction` | Zero or one eligible `kind`, `sourcePointerId`, `order`, and exclusive `expiresTick`. Latest eligible request replaces it. Unavailable request leaves it intact. |
| `specialMeter` | Existing 0–100 meter. Eligible enemy hits by Light/Heavy add configured gain; table damage, misses, Crow hits, and Spin do not. |
| `dodgeReadyTick` and `dodgeDirection` | Existing cooldown/direction fields. New layout does not change Dodge timing. |

Eligibility at receipt: Cow alive, and for Dodge the cooldown has ended, or for Special meter is full. Light and Heavy have no resource gate. Actionable state is checked at execution; when busy, an eligible request may wait up to the buffer deadline. If it expires or its source is canceled, it disappears. The no-resource request emits unavailable feedback once and never sits invisibly waiting for resources. Terminal state and interruption clear the pending action.

## Attack and tuning

`MoveId` gains `cowHeavy`. One Heavy start creates one strike instance at its active phase, with a stable ID, captured facing/origin, range/depth limits, damage, lifetime, and `hitTargetIds`. Each eligible target is accepted at most once. Enemy hits give meter through the same Cow hit path as Light; table hits are applied through the existing table path and never give meter. Heavy knockback follows arena bounds and boss eligibility.

Initial Heavy tuning: windup 14 ticks, active 6 ticks, recovery 24 ticks, damage 30, range 1.3 world units, depth tolerance 0.45, knockback 1.2 world units, meter gain 10 per accepted enemy hit. These values are provisional. The project tuning data must own these and existing Light timing/damage values before balance iteration. Heavy remains slower in startup and recovery and stronger per hit than Light at every accepted tuning point.

## Presentation and tutorial progress

- `ControlView`: persistent joystick ring and knob; four labelled buttons with pressed state. Dodge button displays seconds until ready or `Ready`; Special displays percentage or `Ready`. The HUD may duplicate this information.
- `TutorialProgress`: retain existing IDs `movement`, `attack`, `dodge`, `special`; display `attack` as Light. Add independent `heavy`. The `heavy` completion flag is written only when Heavy starts successfully. Missing, corrupt, or unavailable storage loads safe defaults and never blocks play.
- `RunState` and `BestResult`: no new persistence of active runs; retry creates fresh combo, pending input, and meter while retained preferences/tutorial/best records remain.

## State invariants

1. Movement vector magnitude never exceeds 1; knob offset never exceeds ring radius; inactive stick is visually centred.
2. Each touch creates at most one action request and owns only the region where it began.
3. At most one eligible action is buffered; no start occurs while another action phase is active.
4. Heavy resets Light combo only when Heavy actually starts; one Heavy strike damages each target at most once.
5. Meter stays within [0,100]; only qualifying enemy hits increase it; Special spends exactly a full meter once.
6. Canceled unexecuted work cannot execute later. Already executed damage is not rolled back.
7. A paused or terminal run has neutral browser input and no pending Cow action; explicit Resume requires new touches.
