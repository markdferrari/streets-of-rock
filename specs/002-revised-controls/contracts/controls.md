# Revised Controls Runtime and Player Contract

**Version:** 1, scoped to feature 002.
**Related:** [Specification](../spec.md), [data model](../data-model.md), [MVP runtime contract](../../001-neon-velvet-mvp/contracts/runtime.md).

This contract supersedes the joystick, action-button, and input-frame portions of the MVP runtime contract. Other MVP screens, terminal precedence, audio, storage, offline, and delivery contracts retain their requirements. There is no new public network API.

## Player-facing game screen

| Element | Required initial state | Interaction and feedback |
| --- | --- | --- |
| Left joystick | Ring and centred knob visible during active landscape gameplay before touch | A touch starting inside the ring owns it. Knob tracks drag but stays within ring; movement continues at full input beyond ring. Release/cancel returns knob to centre and movement to zero. |
| Light | Label visible at left position of right diamond; visually largest starting target | One tap requests a Light hit. Three valid timed taps form the existing combo. Press feedback appears while held; hold does not repeat. |
| Heavy | Label visible at right position | One tap requests the slower, stronger single strike. It resets Light combo only on start. Press feedback appears while held. |
| Dodge | Label visible at bottom position, with `Ready` or remaining cooldown | One tap requests Dodge along current movement or facing if neutral. Cooldown state updates without relying on color. |
| Special | Label visible at top position, with 0–100% progress or `Ready` | One tap requests Bovine Spin at full meter, spends meter once on start, and remains available after Crow KO. |
| HUD/Pause | Existing health, Crow status, meter, boss health, Pause | HUD touches never activate movement. Pause clears input and requires explicit Resume. |

A normal two-thumb grip must reach Light and Dodge without releasing movement or moving the holding hand. At 568×320 CSS pixels and each reference phone, safe-area insets, the browser viewport, and HUD remain respected. Controls must not overlap one another or hide central enemy warnings; tune sizes/spacing from the provisional 120/72/56 CSS-pixel baselines if device checks reveal a failure. The game must not claim ergonomic acceptance from desktop emulation alone.

## Input adapter to simulation

| Operation | Input | Output / rule |
| --- | --- | --- |
| `pointer.down` | Pointer ID, point, hit-tested ring/button/HUD region | Claim one movement owner only for downs inside ring; or emit one action request for the starting button; ignore HUD/other regions. |
| `pointer.move` | Pointer ID, point | Update only movement owner's drag; action kind stays fixed and does not repeat. |
| `pointer.up` | Pointer ID | Release owned movement immediately; preserve one normal tap request, then ignore its `lostpointercapture`. |
| `pointer.cancel` / capture loss | Pointer ID | Remove owned movement or an unconsumed action request; identify any still-buffered request from this pointer for deletion. Never undo an action already executed. |
| `input.sample` | Accumulated pointer events for one 60 Hz tick | Return finite normalized movement, ordered action requests, and canceled source IDs. Samples are consumed once. |
| `input.clear` | Pause, hidden/blur/portrait, result, retry, resize geometry invalidation | Release all owners, neutralize movement, centre knob, discard adapter requests, and clear the Cow's pending action. |
| `game.step` | `InputFrame` and `RunState` | Deterministically resolve eligibility and priority, action transitions, contacts, meter, and events without DOM or browser APIs. |

Action request fields are `kind`, `sourcePointerId`, and `order`. `InputFrame` additionally contains `move` and `canceledPointerIds`. At most one eligible request may wait in Cow state. Before processing new requests in a tick, remove a buffered action whose source appears in `canceledPointerIds` and expire old pending actions. Process eligible new requests: latest replaces earlier; when received in the same tick, Special > Dodge > Heavy > Light, then arrival order for duplicates. A currently unavailable request emits feedback once and never replaces a valid pending request. If Cow is busy, retain the winner for at most the 150 ms starting buffer; when actionable, start it once. No request cancels an in-progress action. A normal release does not cancel a valid buffered tap.

Same-tick actions use the existing fixed-step order, with Cow input resolved before AI and contacts. A started Heavy attack captures origin and facing at windup start, creates one attack instance on active transition, and follows existing once-per-target hit registration. Both Light and Heavy hits on enemies build meter. Spin, misses, and table hits do not. Defeat wins Cow/Liam simultaneous lethal ties as in the MVP contract.

## Lifecycle and persistence

- On pause, hidden page, lost focus, portrait orientation, result, and retry: clear adapter and buffered simulation input. Stop active gameplay time and audio under existing MVP lifecycle behavior. Foregrounding/return to landscape never resumes automatically.
- Keep existing local settings, best successful time, and previously completed prompts. Add Heavy as an independent tutorial completion. A legacy completed `attack` ID still means Light; it does not mark Heavy complete. Storage errors use in-memory defaults.
- The packaged static release remains suitable for HTTPS hosting on AWS. Revised controls introduce no backend or remotely loaded asset. The final cached build, including all existing assets, must support a full offline run and retry when MVP PWA work is complete.

## Contract verification

Use deterministic Vitest tests for movement ownership, action request order/cancellation, Heavy phases and damage, buffering, cooldown/meter, tutorial migration, and interruption state. Use browser tests for visible ring/knob, diamond order, labels, button feedback, HUD precedence, and explicit Resume. Use iPhone 12 Safari and Pixel 6 Chrome for touch reach, safe areas, warning visibility, muted/no-shake readability, interrupted input, installed mode where supported, and complete-run frame timing. Keep the five-player SC-001/004/007 observations separate from automated results.
