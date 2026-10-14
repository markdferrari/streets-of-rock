# Plates — Godot workflow review

Date: 2026-10-10. Technical workflow/action review **passed**. Owner balance,
reference-phone and human full-level review **pending**; SC-008 is not accepted.

## Scope and preserved appearance

The brief is the existing feature-007 fighter: faster fighter with the straight Headrest throw.
Existing concepts and editable Blender/source/runtime/portrait assets carry forward.
No art was regenerated and no new owner approval is claimed. Historical review
reports were not relabelled. This review covers Godot integration and authoring.

## Actual commands and outcomes

```sh
bun scripts/characters/validate.ts --character plates --root .
bun scripts/characters/validate.ts --full
bun run test:platform
bun run test:godot
bun run test:blender
bun run build:test
SOR_SKIP_EXPORT=1 bunx playwright test --config playwright.godot.config.ts --project=chromium godot-character-workflow.spec.ts
bun scripts/godot/authoring-review.ts
```

Full/per-character source and imported-resource validation passed. The validator
checks semantic source clips and imported animations/models/portrait textures/props.
All 24 Blender tests passed with scoped temporary outputs. Platform rejection and
preservation tests passed; 54 GUT tests and all 26 parity replays passed.
The repeatable native-run command above preserves the executed runner, initially
run from `.tmp/authoring-playtest.ts`; it writes only these review artifacts.

## Actual playable observations

Build: `7c422b69793d3f551e038e6cf8bb23589a1197169638ae148bce5fb3b0460416` (Web Test, Chromium at 844×390).
The separate canvas review exercised Light, Heavy, Dodge and Special, then Pause,
Resume, actual defeat-screen Retry and retained partner selection. All twelve
ordered-duo regressions passed, including this character as fighter and as partner.

[In-game action screenshot](characters/plates-godot.png) was inspected. The
white cymbal silhouette and separate Headrest projectile; ordinary support remains distinct from the fighter Special remain visible with the final entrance art/HUD.
This is a technical screenshot observation, not an owner visual/balance decision.
The all-move regression stages its terminal state; it cannot establish a full win.

The independent native-control run used read-only snapshots and real WASD/Heavy/
Special inputs, with no position/HP/meter/room or terminal-state commands. Its
natural outcome was **defeat** after 69.129 active seconds;
visited zero-based room indices: `[0]`.
See [raw outcome JSON](characters/full-run-results.json) and
[natural result screenshot](characters/plates-full-run.png).
This simple input bot does not use defensive dodge tactics and is not a human
balance/playtest proxy. Natural full-level victory remains unverified.

## Fingerprints

| Resource | SHA-256 |
|---|---|
| `assets/characters/plates/source.blend` | `f84f2b7336591f026b5a3179781b74feb8af81fab7fd29aaa2747b3d639b61d9` |
| `assets/characters/plates/runtime/character.glb` | `3d489bfc1cf350205a3b8bb19aeab4e7a6759b51495c7b97cebb7522fa023d64` |
| `assets/characters/plates/portrait.png` | `e8bbe01c430bf78e41fc925ba388466a5752594e2bbf4edd2c730e88f189700a` |
| `content/characters/plates.json` | `681e2e2c1d29d6a2e64fc2f12f40417642c153ae86e28f6faf31196b81cf114e` |

All tracked Cow/Crow sources, rigged exports, GLBs, portraits and previews, plus
Headrest source/runtime files, were compared with git HEAD and are byte-identical.
New Godot `.import` metadata is separate from authored source fingerprints.
[Complete preservation record](characters/asset-fingerprints.json) includes those
baseline comparisons. No unrelated assets were regenerated.

## Pending review

Owner appearance/balance review, iPhone 12/Safari and Pixel 6/Chrome gameplay,
actual gesture-audio listening, human complete-level outcomes and first-time-player
differentiation are pending. Current cold-offline tests cover all four fighters and
all four room resources; their staged results are not natural completion evidence.

## Owner decision — 2026-10-14

Owner approval is now recorded for the existing appearance/gameplay decisions under
[the instruction to assume all relevant decisions approved](../validation/owner-approvals.md).
The earlier pending labels describe the historical review date. This update supplies
approval without relabelling historical captures or claiming new phone, participant
or natural full-level outcomes.
