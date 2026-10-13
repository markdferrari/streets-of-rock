# Runtime Presentation and Player Interface Contract

**Applies to:** FR-003–009, FR-013; extends feature 009's [runtime contract](../../009-godot-rewrite/contracts/runtime.md) only for revised artwork.

## Authority

Simulation owns run/actor IDs, positions, facing, health, status, attack phases, projectiles, waves, camera inputs and results. Presentation consumes read-only snapshots/events. It must not alter simulation, register a hit from mesh overlap, move an actor using root motion or change AI timing when an animation finishes.

The pure interface `resolve_enemy_pose(snapshot, previous_snapshot, tick, definition)` returns semantic key, normalized sample, facing and phase overlay. It does not load assets, read wall-clock time or mutate the snapshot. The instance layer applies that result to its private skeleton/animation player. Imported resources and immutable clip data may be shared; pose/mixer state and mutable material overrides may not.

## Pose selection and sampling

1. HP <=0 or terminal actor defeat -> Defeated; keep a presentation-only record as described below.
2. Living normal enemy with `tick < stunnedUntilTick` -> Stunned. Bosses bypass this rule. Repeated per-tick stun events do not restart the pose loop.
3. Existing windup/active/recovery with moveId -> the corresponding role binding. Hurt is shown only when the simulation is in hurt.
4. Otherwise, actual simulation displacement -> Move; no displacement -> Idle. Camera motion must not create walking animation.

For action phases, progress is `clamp((tick-startedTick)/max(1,endTick-startedTick),0,1)`. Sample the bound imported clip segment at that normalized progress; it cannot stretch the simulation's phase duration. Before the boundary use the outgoing phase; at the boundary use the simulation's new phase after its tick. A zero-length held binding samples its explicit valid pose. Idle/Move use the inherited 28-tick loop initially; looping rates may be tuned visually without altering movement speed.

Choose authored windup/active boundaries so melee/charge/rope contact is visually readable when existing attack windows open. The bartender hand release and projectile appearance agree with the actual simulation projectile creation tick; the projectile uses its own transform/lifetime. Rope and shockwave visual coverage must represent the existing damage/avoidance region, not a new collision test. Do not introduce an apparent safe region where the existing attack can hit.

Liam's phase-two visual overlay appears when `phase==2` and persists without interrupting ongoing actions. It must not add immunity, a pause, a cinematic or a new cooldown. Existing phase warning/effects remain readable. Normal-enemy stun/hit/death may interrupt animation exactly when the simulation changes state; already released projectiles retain their existing lifecycle.

## Defeat, ownership and reset

At the first defeated snapshot, hold an authored Defeated pose at the actor's final transform. Keep it for initially 21 active simulation ticks (0.35 seconds at 60 Hz) while play continues, even if the actor leaves the next snapshot. It is decorative: no gameplay collider, hit target or encounter membership. Subsequent absent snapshots must not restart its lifetime. A new wave does not wait for it.

At terminal result, freeze the final defeated pose beneath the result UI while that view remains displayed; results appear immediately. Do not advance an extra gameplay clock to finish a death animation. Pause freezes the view and lifetime. Home, retry, release replacement or view disposal clears all records. Key ownership by runId and actorId so ID reuse cannot inherit a pose or effect.

A view owns instantiated room nodes, enemy skeletons/animation players, local shadows/effects and mutable overrides. ResourceStore owns shared resource references. Retiring a view frees only its owned instances; retired preparations release late arrivals. Ten run/retry/home cycles must settle to the same live-owned counts after settling and must not show progressive retained memory growth.

## Room/camera/readability interface

World mapping stays x -> x, depth -> z, ground y=0. Preserve the scalar camera fit/offset, smoothing, hero envelopes, ArenaContext and enlarged combat coverage from 009/006. Imported enemy dimensions do not alter AI visibility bounds or targeting calculations. Fit art to the view; do not change the gameplay camera to accommodate it.

Keep scenery outside active combat and controls. Retain neighboring room geometry while visible; use frustum culling/room-bounded batches rather than switching all geometry by areaIndex. Validate camera extremes and transitions at 667x375, 844x390, 915x412 and actual safe-area phone layouts. Geometry/name validation cannot replace screenshot review for gaps, overlaps, quiet floors or false routes.

No flashing/strobing. Baseline decoration is static; any later optional ambient motion freezes on pause and stops under reduced motion. Essential warnings remain visible with audio/shake disabled and without colour-only communication. Preserve GO timing, rightward progression and final-room suppression.

## Readiness and failure

Preparation requires all four room scenes, shared coverage, all four enemy definitions/rigs/bindings and all imported dependencies plus the selected duo. Validate each type and render the initial view before countdown. A missing asset, clip, material or invalid binding produces an actionable loading error, retains the duo and offers Retry. Never enter gameplay with invisible enemies or a silent primitive fallback.

Callbacks carry the inherited preparation generation/release ID. Late callbacks from abandoned attempts cannot start a run, replace current art or overwrite current errors. Retry creates a fresh generation; shared valid immutable assets can be reused. A cache-only failure allows loaded online play with offline readiness false. Required visual failure blocks entry; audio/storage failure retains inherited fallback behavior.

## Credits UI

Add an Artwork Credits entry in existing Home/Settings. Display bundled source/creator/license/modification text and required notices with scrollable, safe-area controls and a clear Back action; reflect focus/labels through the existing semantic bridge. In pause settings, opening/closing credits keeps the run paused and requires the existing explicit Resume. Home credits do not change duo selection or cached readiness. Credits work offline; source links are optional external navigation, never required to view the license/attribution.

No public HTTP API is added. JSON authoring data, the validation CLI and these player-facing loading/credits behaviors are this feature's interfaces.
