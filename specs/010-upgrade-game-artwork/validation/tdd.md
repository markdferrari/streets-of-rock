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

## Shared authoring foundation — 2026-10-14 continuation

Evidence: [shared-foundation](evidence/shared-foundation/). Each red report precedes its paired implementation; fixture setup/compilation errors were corrected separately and are not counted as red evidence.

| Increment | Observed intended red | Green implementation/proof |
| --- | --- | --- |
| CLI modes/root/failure propagation | `cli-red.txt`: four contract assertions fail against callable placeholders | Bun wrapper delegates to the Godot validator; full/focused modes, usage/setup exit 2, validation exit 1, success exit 0; explicit definitions-only limitation |
| Actual imported validation | `import-red.txt`: six behavioral cases fail against a validator that always rejects | Isolated four-room/four-role catalogue passes; source hash/status, corrupt scene, missing clip, forbidden room node, landmark and undeclared dependency cases reject |
| Supplier-independent root motion | `root-motion-red.txt`: renamed top-level bone bypasses inspection | Detect root bones by skeleton parent identity; retain valid local limb motion |
| Representative GLB room/prop | `representative-red.txt`: room absent from scene | Explicit Blender source + GLB export, selected Kenney stools and one opaque palette surface; source/runtime hashes verified |
| Pinned importer palette | `palette-red.txt`: actual imported palette loses vertex colours; browser capture showed white geometry | Explicit palette material/import mapping; GUT and actual coloured browser capture pass |
| Busy representative instance set | `busy-red.txt`: extra independent rigs absent | Four enemy instances plus existing duo; six browser cases pass across Chromium/WebKit and all three layouts |
| Empty child reports | `runner-empty-red.txt`, `validator-empty-red.txt`: zero status plus empty output was accepted | Fail unverified output explicitly; both scoped test runners execute and propagate either failure |
| Author-only script exclusion | `export-exclusion-red.txt`: source filter includes author validators and wrong mode hooks | Exclude `game/tools/` from all web modes; retain runtime ArtCatalog and mode-appropriate hooks; actual Release smoke/audit pass |

The production Grunt/Zoner focus initially exposed their undeclared `assets/enemies/shared/outfit.tres` dependency. Both resource records now reference the single registered/hashed material and their focused imported validations pass. Production full validation intentionally still fails missing `content/rooms.json` and incomplete four-role coverage; fixtures never certify final production content.

The added scoped Blender case audits already implemented source editability, uniform scale, ground anchoring, canonical facing and exact runtime clips/hashes. It passes as part of all 28 Blender tests. Hero fingerprints remain unchanged. Representative teardown waits one engine frame for deferred imported helpers and then asserts no new orphan nodes; all 98 GUT tests pass.

### Runtime-gate regression: interruption on the last countdown boundary

The first current complete browser run finished with 100 passes/five declared skips and one WebKit failure: after Resume, the final countdown remained stuck. The regression in `tests/godot/app/test_session.gd` reproduces it without browser timing: `interrupt(3001)` samples and completes the final countdown second before the next session frame, then safe Resume returns to a countdown whose `completed` flag is already true. Previously `session.frame` required a *new* completion transition, so it could never launch.

`countdown-red.txt` records the expected failed running/exactly-one-launch assertions. `RunSession.frame` now samples the clock and independently checks completion. `countdown-green.txt` passes, including pause and unsafe-resume guards and exactly one launch after explicit safe Resume. This is the mapped 009 session/lifecycle prerequisite work in T007 and preserves 010 FR-008; no countdown duration or input/simulation rules change. The complete browser rerun and repeated affected WebKit checks are recorded separately.

`decorative-node-red.txt` additionally proves polygon colliders/navigation obstacles were omitted from both import-node exclusions. Both art kinds now reject those nodes; `godot-green.txt` includes all 100 GUT cases.

The complete browser rerun passes 101 cases with five declared skips; the Release smoke passes three with three mode/capability skips. `empty-mesh-red.txt` proves empty `ArrayMesh` resources were previously mistaken for visible geometry; both scene inspectors now reject them. `stale-import-red.txt` proves changed GLB bytes could previously pass against an older cached imported scene. Default validation now compares the pinned import cache's source checksum with the actual file and requires explicit reimport when stale; it never imports/mutates assets itself. Fourteen focused Vitest cases pass after that fix. Both production enemy focuses remain valid; unfiltered production validation still correctly fails unfinished room/role content.

## Continuation — 2026-10-15

- `010-enemy-ownership-red.txt` (working evidence in `.tmp/`): three behavioral regressions exposed missing production skin validation, cross-run actor-ID pose inheritance and primitive fallback for an unknown role. After the implementation and an explicit GDScript Array annotation, `010-resume-gut.txt` passes 113 tests. The first interrupted green attempt contained a compile error and is not green evidence.
- `010-cues-red.txt`: missing per-instance attack regions; green adds exact simulation reach/depth/radial regions, manual-pose-safe phase-two styling and full role coverage (114 GUT tests).
- `010-credits-red.txt`: three behavioral assertions against an executable empty producer failed. Green adds deterministic shipped-source notices with exact reviewed attribution and original declarations. The earlier missing-module invocation is not a valid red phase.
- `010-credits-ui-red.txt`: missing Home/scrollable credit controls; green implements bundled safe-area credits without selection mutation (115 GUT tests).
- `010-delivery-red.txt`: a single-pack stub fails split/ownership and missing-art/notice assertions; green partitions the exact full exported PCK and audits all art/credit paths. A three-MiB physical cap correctly rejects the unchanged individual soundtrack; a five-MiB export creates two packs and cold browser mounts pass. No resource is byte-split.
- `010-store-red.txt`: cached template reuse hides a changed/missing scene path; green tracks prepared paths, rechecks required clips and requires all roles. Initial fixture mutation of frozen catalogue data was corrected by duplicating the test dictionary; those setup errors are not behavioral red evidence.
- `010-diagnostics-red.txt`: new diagnostic fields absent; green reports real imported texture data including mipmaps, mesh counts and render density alongside active-only timing. Ten complete venue/rig/projectile cycles add ownership checks. An orphan baseline decreased due to previous deferred frees; the final check correctly prohibits growth instead of requiring unrelated queued objects to survive.
- `010-room-batch-red.txt`: rooms draw many separate surfaces. Green batches each room's shared palettes while preserving every source triangle and landmark hierarchy. The assertion measures indexed triangle vertices rather than assuming an exporter-specific vertex index layout.
- `010-character-batch-red.txt`: 31/40/61/19 separate hero meshes exceed ten visible shared-material surfaces. Green batches only identity-transform single-surface meshes sharing the exact parent, skeleton, Skin and Material resources; source/runtime hero files are unchanged. All triangles and vertex skin arrays remain. Green suite: 121 GUT tests.
- `010-complete-browser.txt`: adding a persistent Home/Settings Credits control exposes focus trapping based on historical Map insertion order. The browser regression fails Shift+Tab wrapping. Semantic focus now follows descriptor order and tracks nested dialogs; corrected full/focused browser checks pass that case. Existing node identity and native slider behavior remain covered.
- `010-prop-credit-red.txt`: the inherited bottle prop was missing from source projection. Green includes actually shipped runtime props; KayKit Dungeon now appears in bundled credits.
- `010-prop-validation-red.txt`: the validator previously omitted the inherited prop provenance. Green checks its exact bytes and accepted source/license evidence in full and Zoner-focused validation, while leaving unrelated focused subjects independent.
- `010-scene-type-red.txt`: a wrong-kind imported material caused a PackedScene assignment script error. Green validates the loaded Resource type and returns an actionable required-scene error instead.

Final raw reports and build identities are archived under `validation/evidence/complete-art/` once each suite finishes. Manual phone/participant evidence remains pending.

### Final review and runner follow-up

The clean review fixture first failed its `neutral-review` assertion against the prior build (`010-neutral-red.txt`); `artwork-enemy-review.spec.ts` now captures unobscured actual rigs/attack cues with unchanged hero references, both facings and both boss phases. The complete review/credits/offline scope passes 13 cases with one declared physical-Safari offline limitation. The initial incorrect grep selected no tests and is not red evidence.

The wrong-scene guard needed an explicit `Node` annotation for its probe after loading a generic Resource. The intermediate parse failure caused two inherited character-validator workers to wait; those exact task-owned workers were terminated and the corrected source passes the complete 85-platform/122-GUT unit run and static checks. Interrupted attempts are not green evidence.

The actual `test:art` wrapper initially failed closed on an empty child report despite passing GUT. A command regression records the explicit installed Vitest entry; the wrapper pipes stdout/stderr and invokes it with Node. Further investigation showed managed sandbox restrictions suppress nested Node's asynchronous output (even a trivial `console.log`); the actual normal-execution scoped run passes **62 GUT and 22 Vitest tests**. The missing-report guard stays in place. This is an environment-specific execution requirement, not a claimed passing empty report.

The acceptance-selection regression (`evidence-selection-red.txt`) rejects silently using feature 009's record when feature 010 explicitly supplies its own evidence. The auditor now accepts a safe project-relative `--evidence` JSON path while preserving the inherited default. Platform tests pass 86 cases. The current feature record correctly fails strict acceptance on pending phones; no waiver or visual approval is substituted for physical/participant results.
