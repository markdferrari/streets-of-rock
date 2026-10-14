# Test-first record

## T005 source-only provenance export regression (FR-012)

Adding editable `content/art-provenance.json` exposed the inherited export grouping's blanket JSON selection. The authoring catalogue contains unshipped candidate records and must stay out of runtime payloads; actual shipping credits will be generated later by T058.

1. Extracted existing JSON selection into `runtimeContentDefinitions` without changing its behavior.
2. Added an observable source-group regression in `tests/tooling/export.test.ts`: provenance is excluded while roster/tuning/room/enemy runtime definitions remain included.
3. Red: `bun run test:platform -- tests/tooling/export.test.ts`, exit 1; exact assertion included unwanted `content/art-provenance.json` (59 other tests passed). See `evidence/provenance-export-red.txt`.
4. Green: exclude only the authoring catalogue and run `bun run test:platform`; all 60 tests passed (15 files); see `evidence/provenance-export-green.txt`.
5. Actual export/PCK membership and unchanged baseline build hash are checked separately in `evidence/provenance-pck.txt`, `provenance-build.txt` and `provenance-audit.txt`. No setup failure was used as red evidence.

Visual blockouts follow the prewritten manual procedures; they are not behavior tests or final imported rigs/scenes. The required structural/import/CLI suites T008–T010 remain unimplemented.

## KayKit pilot increment

All files below are in `evidence/kaykit-pilot/`. The initial source-only statement above describes the first increment; these suites have now been added.

| Observed red | Green implementation/proof |
| --- | --- |
| `pose-red.txt`: pure resolver absent | `pose-green.txt`; semantic precedence, actual phase boundaries, displacement/facing, normal stun and Liam immunity, nonblocking phase two, explicit missing bindings |
| `catalog-import-red.txt`: structural/import checks absent | `catalog-import-green.txt`; exact role/room contracts, finite/path/source/dependency checks, forbidden nodes/tracks, required skeletons/materials/clips |
| `export-red.txt`: too many runtime meshes and horizontal hips lunge | `export-green.txt`, then `blender-final.txt`; joined skinned mesh, anchored horizontal hips, retained selected motion and unchanged hero/source bytes |
| `view-red.txt`: enemy view absent | `view-green.txt`; actual imported instances, independent bones, simulation-owned position/facing, paused manual sampling and error handling |
| `fixture-export-red.txt`: JSON definitions omitted from Web Test | `fixture-export-green.txt`; explicit fixture JSON group inclusion, source provenance remains excluded |
| `layout-red.txt`: 667-wide UI exceeded viewport | `browser-palette-final.txt`; responsive controls plus actual backing-canvas dimensions checked in both browser engines |
| `draw-budget-red.txt`: 110 draw calls exceeded 100 | `browser-palette-final.txt`; one vertex-colour material per skin and two background bottles yield 99 draws in the measured review scene |
| `palette-red.txt`: actual Godot material ignored vertex palette (81/82 tests passed) | `unit-final.txt`; explicit shared import material enables vertex albedo, all 82 GUT cases pass; browser captures verify the visual correction |

`scene-check.txt` and browser tests run real AI/projectile phase transitions, including the tick-39/40 bottle boundary. `blender-final.txt` covers 27 Blender cases; `unit-final.txt` covers 61 platform and 82 GUT cases. These checks do not substitute for final content, phones or motion/contact review.

`wrong-runner.txt` records an accidental `bun test` invocation, which bypassed the repository's Vitest setup. It is not accepted regression evidence. The configured command is `bun run test`. Earlier interrupted whole-suite logs likewise remain historical; only a completed final log establishes the complete gate.


Motion inspection found that the initial phase cuts put active-start poses in the backswing. `throw-sampling.txt` and `punch-sampling.txt` sample the retained clips at their 60 fps timebase. A real imported-bone regression failed in both facings (`release-pose-red.txt`: Grunt forward distance 0.190, Zoner -0.807). Segment boundaries now place Grunt active at source 0.47 seconds and Zoner active at 0.70 seconds, with forward-hand assertions passing (`release-pose-green.txt`, 83 GUT cases). The simulation still enters Grunt active at tick 28 and releases the bottle at tick 40. Full-suite browser exports were already built with the initial phase cuts; focused browser checks and refreshed captures must verify the amended segments afterward.


The configured full run recorded 94 browser passes, five declared skips and one failing WebKit canvas-selection journey (`full-suite-final.txt`). The final snapshot still showed the partner preview, so the helper had not observed the result of each native activation before sending the next click. Selection helpers now assert fighter preview, partner step and partner preview between their four native clicks. They do not retry clicks, inject selections, add sleeps or weaken gameplay assertions. The shared helper is used by duo, room, lifecycle and authoring journeys. A fresh complete run is required after the focused amended checks; the earlier failure is retained as red evidence.

## Approved Grunt/Zoner gameplay integration

The owner approved the previews and requested proceeding. `test_gameplay_enemies.gd` first failed four production-preparation/instance/lifetime/prop cases (`evidence/gameplay-enemies/red.txt`: 83 passing, four failing). Implemented shared catalogue registration, validated preparation, actual world instances, simulation-tick defeat retention and bottle views. JSON numeric decoding also exposed the integer-only defeat-count check; an actual JSON round-trip regression now verifies integral decoded floats and finite integer semantics.

The first actual Chromium export then failed to start a run (`export-red.txt`: phase `error` rather than `running`) because the existing export grouping did not include dynamically loaded enemy scenes. Added the registered `resources.art` scenes to exported groups. The gameplay/ten-retry checks now pass in both browser engines (`browser.txt`, four cases). Retry assertions count the new owned rigs/props, require seven reused imports, and prove old and new instance IDs are disjoint; the previous two-hero-only assumption is not retained.

The GUT suite now includes existing-dead-actor expiry without re-creation, pause-safe retention and full cleanup (89 cases passing). The inherited camera removal regression now explicitly checks the 21-tick decorative lifetime before retirement. All 26 exact simulation parity fixtures pass. No combat values, hero files or camera calculations were changed.

The first complete gameplay run had 95 browser passes/five declared skips and two WebKit selection failures. State waits alone did not resolve them. A deterministic regression reproduced loss of a mouse gesture when a cache-status update invalidates `render_key` and rebuilds an otherwise identical picker; a second regression showed hidden queued controls still processing input (`selection-red.txt`: 89 passes/two failures). `session_screen.gd` now transfers in-flight gesture state only across identical logical screens with unchanged control bounds; layout/mode changes still cancel it. `gesture_button.gd` rejects hidden controls. All 91 GUT cases pass (`selection-green.txt`), and each previously failing WebKit journey plus the new gameplay case passed three repetitions (`selection-browser.txt`, nine passes). The original complete-run failures are preserved in `full-suite.txt`; `full-suite-final.txt` records the subsequent complete gate.


## Gameplay corrections requested during review

`test_enemy_following.gd` and the movement-facing case in `test_enemy_pose.gd` produced four failing tests (`evidence/gameplay-enemies/following-red.txt`). Fixes add normalized two-axis Grunt pursuit, movement facing and warning-time Zoner aim. The green unit run reports 95 Godot and 62 platform tests. Current-rule replays use explicit feature 010 checkpoints for 18 changed scenarios, preserving all frozen legacy inputs/hashes and exact comparison. The difference audit and regression logs are retained alongside the earlier art-only parity evidence.
