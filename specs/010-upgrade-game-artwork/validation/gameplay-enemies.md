# Approved Grunt/Zoner gameplay increment

The owner approved the motion previews (“I am happy with the previews”). The registered Grunt and bartender rigs now render in normal encounters, not only the review scene. [Playable instructions and actual captures](../reviews/gameplay-enemies.md).

## Implemented boundary

`content/enemy-presentations.json` and `resources.art` identify the two current production roles. `Catalogue` validates their definitions and freezes them. `ResourceStore.prepare_enemies` checks actual imported clips/materials/skeletons and prepares the bottle before a run can launch. The exporter now explicitly includes the dynamically loaded registered scenes; source files and review fixtures remain excluded from Release.

`WorldView` uses independent, manually sampled `EnemyView` instances for registered roles. Positions/phases and timing remain simulation-owned. Normal game AI releases the bartender bottle at throw-active; the held prop and flying bottle are decorative views. Removed/dead rigs hold a defeated pose for 21 simulation ticks and release their resources afterward. Pause/results freeze this lifetime; expiration cannot re-create a dead actor's rig. A new world owns each run, so actor-ID reuse on Retry cannot carry an old rig or defeat record forward.

Retry checks count heroes plus current enemy/prop instances, prove previous instance IDs are absent, and retain seven shared imports rather than assuming the earlier two-hero-only ownership count. The initial art integration matched all 26 original simulation fixtures. Subsequent owner-requested movement and aiming changes have explicit versioned checkpoints, described below. All 29 protected hero files remain unchanged.

## Selection defect corrected

The complete run exposed two WebKit picker failures. Waiting between native clicks did not resolve the underlying issue. A cache-status refresh can rebuild an identical UI between pointer-down and pointer-up, losing the gesture; hidden queued controls also remained input-active. The deterministic red/green proof is in [the TDD record](tdd.md). The corrected screen preserves a pending gesture only when logical state and bounds are unchanged; hidden controls cannot activate. Both formerly failing browser journeys and the new encounter case passed three WebKit repetitions.

## Verification status

- TypeScript/Godot typecheck passes.
- 62 platform cases and 95 GUT cases pass after the requested gameplay changes.
- All 26 current-rule replay fixtures match with the same exact comparison: eight original checkpoints and 18 explicit feature 010 revisions. Frozen legacy fixtures and their digests remain intact.
- Four targeted browser cases cover normal encounters and ten retries in both engines; nine repeated WebKit cases verify the selection correction.
- The earlier complete browser run had 96 passes, five skips and one frozen archive fingerprint failure. The altered archive was backed up and restored from the pinned revision; the focused offline recheck passed. A fresh browser/Release gate after the gameplay changes is pending.

Evidence is under `evidence/gameplay-enemies/`. Earlier failed complete-run evidence is retained; focused passes do not imply a passing combined gate.

## Remaining feature scope

Enforcer/Liam retain their basic models; their new art/actions, all four furnished rooms, full CLI/source/dependency validation, credits, spatial contact/feet review, physical-phone performance/offline checks and final player/artwork acceptance remain open. No commit or deployment has been performed.

## Owner-requested gameplay corrections

The owner reported backward-running Grunts, requested up/down pursuit, and found enemy throws too accurate. These instructions extend the original artwork-only scope. Grunts now approach on both axes at the original total speed (0.04 units per tick), update facing during horizontal movement, and stay within the depth bounds. Move poses derive facing from actual horizontal displacement; attack poses retain simulation facing. Zoners capture the target position at the start of the 39-tick warning, then throw toward that position. Projectiles retain their straight, constant-velocity trajectory.

Four failing regressions are recorded in `following-red.txt`; all 95 Godot tests subsequently pass. They check turning in both directions, diagonal speed, depth-only approach reaching melee, pose priority and immutable snapshots, and a dodge during bottle windup followed by unchanged projectile velocity.

The original replay fixtures still describe the previous rules. `tests/reference/feature-010/manifest.json` binds 18 revised checkpoints to the exact original hashes; their starting runs, timestamps, viewports and inputs are unchanged. The difference report (`following-replay-diff.json`) shows Grunt positions/facing, resulting partner targeting/camera/melee timing, stored bottle aim and bottle trajectories. Eight scenarios still match the old rules exactly. No comparator tolerance or event checks were relaxed.
