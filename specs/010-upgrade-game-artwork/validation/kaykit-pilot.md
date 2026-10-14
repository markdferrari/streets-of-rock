# KayKit pilot validation increment

2026-10-14, `010-upgrade-game-artwork`. [Review controls, motion preview and captures](../reviews/kaykit-pilot.md). This increment proves two review rigs through real Godot/web boundaries; it does not complete feature 010 or promote the rigs into normal gameplay.

## Pilot increment identities (historical)

Web Test: `e3378d756d0df2355523cbe0f1d106a3810447c33529d7e40c8af2b3c634314a` (6,489,551 content bytes). Web Release: `0cb9c50d6777cdabbe6a1ea3719061f015996fce50385c8c95d0a9750f81dcea` (5.43 MiB content, 37.96 MiB verified stock engine). The Release excludes the pilot; these sizes do not measure future complete feature content.

Exact retained source/export/import/material identities are in `content/art-provenance.json`. The source snapshot is [current-files.json](evidence/kaykit-pilot/current-files.json); the protected hero register checks 29 unchanged files. Grunt and Zoner active segments begin at source 0.47 and 0.70 seconds respectively, while their existing gameplay boundaries remain ticks 28 and 40.

## Passing checks

| Command / scope | Result | Evidence |
| --- | --- | --- |
| `bun run typecheck` | TypeScript and Godot pass | [log](evidence/kaykit-pilot/typecheck-final.txt) |
| `bun run test:unit` | 61 platform, 83 GUT pass | [log](evidence/kaykit-pilot/unit-final.txt) |
| `bun run test:parity` | All 26 exact reference fixtures match | [log](evidence/kaykit-pilot/parity-final.txt) |
| Pilot + room browser recheck | 16 Chromium/WebKit cases pass | [log](evidence/kaykit-pilot/browser-amended.txt) |
| `bun run test:e2e:release` | 3 pass, 3 declared capability/mode skips | [log](evidence/kaykit-pilot/release-final.txt) |
| Release audit and exact PCK membership | Pass; 151 entries, pilot/source/provenance absent | [audit](evidence/kaykit-pilot/release-audit-final.txt), [closure](evidence/kaykit-pilot/release-exclusion-final.txt) |
| `bun run test:blender` | 27 cases pass | [log](evidence/kaykit-pilot/blender-final.txt) |

The browser checks cover real imported skins, exact AI phase/release ticks, pause/manual sampling, two facings, six state controls, actual backing-canvas resizing and 44-pixel controls at 667×375, 844×390 and 915×412. The measured review scene has 99 draw calls and 20,534 primitives; it is not a complete busy encounter or physical-phone measurement.

## Whole-suite gate remains open

The completed `bun run test` attempt had 61 platform/82 then-current GUT passes and all parity fixtures passing, followed by 94 browser passes, five declared skips and one WebKit selection-helper failure. [Full log](evidence/kaykit-pilot/full-suite-final.txt). The helper now waits for fighter preview, partner selection step and partner preview between its four native clicks, with the failing room scope passing in both browsers. No retries, fixed sleeps or injected selection were added.

The fresh whole-suite attempt was terminated by SIGTERM before completion: [interrupted recheck](evidence/kaykit-pilot/full-suite-recheck.txt). This is not a passing combined gate. The remaining release and asset checks were run independently and passed as listed above. T007 remains unchecked until a complete configured run finishes; do not claim T063/T070 or final automated acceptance from these focused checks.

The [TDD record](tdd.md) retains actual missing-implementation, export, layout, draw-budget, palette and forward-hand failures and their corresponding green proofs. Earlier interrupted/wrong-runner logs are historical, not accepted complete-suite evidence.

## Outstanding scope

Full CLI/runner and source/dependency validation, a representative production room, final motion/contact/foot review, production registration/readiness/ownership/defeat lifetime, remaining enemy roles, four furnished rooms, credits and full intended-content phone/performance/offline/player acceptance remain open. There has been no commit or deployment.


## Subsequent gameplay integration

After the owner approved these previews, Grunt/Zoner were promoted into normal encounters. See [gameplay captures and instructions](../reviews/gameplay-enemies.md) and the subsequent gameplay validation record. The earlier Release identities/exclusion statements above describe the review-only increment; current Release now includes the registered production skins and bottle while still excluding test fixtures/source files.
