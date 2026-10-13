# Lion — Godot workflow review

Date: 2026-10-10. Technical workflow/action review **passed**. Owner balance,
reference-phone and human full-level review **pending**; SC-008 is not accepted.

## Scope and preserved appearance

The brief is the existing feature-007 fighter: slow powerful brawler with ROAR.
Existing concepts and editable Blender/source/runtime/portrait assets carry forward.
No art was regenerated and no new owner approval is claimed. Historical review
reports were not relabelled. This review covers Godot integration and authoring.

## Actual commands and outcomes

```sh
bun scripts/characters/validate.ts --character lion --root .
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

[In-game action screenshot](characters/lion-godot.png) was inspected. The
golden mane and large brawler silhouette; ROAR produces the cyan area effect remain visible with the final entrance art/HUD.
This is a technical screenshot observation, not an owner visual/balance decision.
The all-move regression stages its terminal state; it cannot establish a full win.

The independent native-control run used read-only snapshots and real WASD/Heavy/
Special inputs, with no position/HP/meter/room or terminal-state commands. Its
natural outcome was **defeat** after 124.619 active seconds;
visited zero-based room indices: `[0, 1]`.
See [raw outcome JSON](characters/full-run-results.json) and
[natural result screenshot](characters/lion-full-run.png).
This simple input bot does not use defensive dodge tactics and is not a human
balance/playtest proxy. Natural full-level victory remains unverified.

## Fingerprints

| Resource | SHA-256 |
|---|---|
| `assets/characters/lion/source.blend` | `c877ee63c4fd63278bf635341a9fe7b640adba986ee42bebec79ea340f87d835` |
| `assets/characters/lion/runtime/character.glb` | `d82aa13c93b8bb055352a9dbe22ba3590e93827b5b5b3d9836d17e20b48a866d` |
| `assets/characters/lion/portrait.png` | `3fd5a772ebdf5d5dcb26c6250c5b890a3b242cb05a8cc9db61d2042f82689874` |
| `content/characters/lion.json` | `ae4fd6454d1bbb6d4d41404a88744d9ec2cd090b3515b89bf11b273c562e14f1` |

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
