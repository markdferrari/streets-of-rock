# Contract: Animation Presentation and Player Experience

**Applies to**: local FR-002–007; PRD FR-065–068, AC-067–070.

This documents the app's observable behavior and its presentation integration boundary. No public network API is introduced.

## Player-visible behavior

Selection retains the existing four-character flow and animated full-body previews. Each preview has independent idle time; reduced motion uses a still pose. Gameplay retains all twelve ordered duos, controls, action eligibility and effects. The same character design supports both roles, while the partner uses only its existing support behavior.

All three Light strikes, Heavy, Dodge, character Special, hurt and knockout must have readable motion in either facing. Cow spin, Crow wing spin, Lion ROAR and Plates Headrest Throw remain distinct. Motion cannot change gameplay direction, travel, contact window, reach, damage, targeting, meter, invulnerability, AI, camera or progression.

## Integration interfaces (planned)

- `world.observe_step(run, events)`: called immediately after every simulation step and before terminal result handling. Copies only needed fields into per-actor private motion state; never mutates `run` or events. Initial run binding seeds all allies even before the first step.
- `CharacterPose.resolve(actor, profile, motion_state)`: pure validated state-to-sample conversion. Resolves physical clip/time from current semantic phase. Equal inputs yield equal samples.
- `CharacterView.apply_pose(position, facing, sample)`: applies simulation world transform and samples only its own visual skeleton. Imported playback stays manual; no autonomous processing or animation callback emits gameplay effects.
- Selection preview update: uses the same profile/view sampling with a separate clock and fixed reduced-motion sample.
- Results settle update: advances only an already-latched knockout, bounded by profile duration, and only while foreground, lifecycle-safe, modal-free and not interrupted. It cannot advance other world animations/effects.

## Action timeline

For an authoritative action phase, normalize `(tick - startedTick) / (endTick - startedTick)`, clamp to [0,1], and map into that semantic binding's interval. Derive a stable action identity from move ID and phase start minus preceding configured phase lengths; phase changes must not restart the authored action or transition blend. Validate zero/invalid phase duration rather than divide by it. Actual configured phase durations remain the authority.

Require contiguous physical intervals for an attack's windup/active/recovery. Contact/release markers lie within the active segment; immediate effects use its first sample. Full-turn spin tracks need intermediate samples preserving the intended turn, not equivalent start/end quaternions that collapse to no rotation. World transform applies facing once; remove existing hero tilt/squash and additional spin rotation when authored counterparts land.

Support differs: `partner-hit` already applies damage at action start and sets six active ticks. The ready stance supplies anticipation before eligibility. Contact is immediate at the event; visual follow-through is interruptible and does not add recovery. Do not fabricate a simulation windup to fit a donor punch.

`hit` uses targetId to identify the damaged actor; HP transitions provide initialization/fallback information. Hurt is an optional masked visual reaction during an authoritative action, or a short reaction while otherwise idle/moving. Author Hurt as rest-relative local bone deltas and apply it only through the declared reaction mask after the authoritative base pose; sampling it must not overwrite unmasked bones. It never adds hitstun, cancels recovery or delays input. Zero HP wins over every other pose.

## Locomotion and transitions

Accumulate actual ordinary travel once per simulation tick, including depth travel. Use local forward/backward/left/right loop bindings and at most two weighted samples for diagonal travel, preserving simulation facing during depth-only movement. Do not advance gait from render delta, requested joystick input or global tick modulo. A render with no new tick retains the last movement decision. Exclude attack/Dodge/knockback travel and obstruction recovery; seed/reset previous position on new runs and recovery events. Partner pursuit, normal follow and catch-up share this mechanism with speed expressed through travelled distance.

Cache outgoing bone transforms for permitted visual crossfades. State priority changes immediately; blend timing is at most 0.1 seconds and must finish by authoritative contact, or be zero where no anticipation interval exists. Reaction masks must preserve striking contact and projectile-release poses. Do not smooth actor position/facing in a way that changes visible hit alignment.

## Knockout and lifecycle

A newly knocked-out ally falls once and remains visibly inactive. During running, the fall ages only on observed simulation ticks. At results, only its remaining fall may settle with a dedicated visual clock, at most one second total per knockout. Results and Retry/Home are available immediately; their behavior does not wait for animation.

When that terminal settle is interrupted, reuse the existing paused/Resume flow with a victory/defeat resume target. Resume of a terminal target restores results and remaining visual settling only; simulation, run time, scoring, audio and projectile/effect timers remain stopped. No new Resume control type is required. Settings freeze the visual clock. Reduced motion may immediately show the final inactive pose. Home/retry disposes every old view and clears all motion/latch state.

## Ownership and batching

Each actor/preview owns its skeleton, AnimationPlayer, pose cache and clock. Shared Animation/mesh/material data stays immutable. Rigged parts that enter `character_batches.gd` must be animated through bones; mesh-node transform/visibility animation would not affect the visible merged surface. Reject those tracks on batchable geometry or explicitly exclude a required animated attachment from batching. Headrest projectile remains the existing simulation-owned prop; authored release gestures must not spawn a duplicate or animate the projectile itself.

## Required failure and regression evidence

Test duplicate renders, multiple simulation steps per render, all phase boundaries, immediate support damage, nonlethal hit overlays, zero-HP without a knockout action, terminal settle with unchanged run state, paused settling and resume, independent previews/duos, both facings and ten teardown cycles. Check actual imported bone transforms, not only returned clip names. Existing simulation parity fixtures must pass unchanged.
