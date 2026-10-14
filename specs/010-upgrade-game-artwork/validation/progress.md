# Feature 010 implementation progress

2026-10-14; branch `010-upgrade-game-artwork`.

T001–T006 are complete: baseline/source audit, exact candidate provenance and eight editable concept blockouts with owner approval of their appearance direction. The owner also approved proceeding with the inspected KayKit assets. Final artwork approval is separate.

The initial motion increment includes structural/import validation, a pure enemy pose resolver, an independently sampled enemy view and an actual Grunt/Zoner KayKit review scene. T008, T028 and T036 are complete. T009/T011/T014 and the Grunt/Zoner story tasks have partial work; they remain unchecked because the complete import/export/CLI, representative-room and production integration contracts are not satisfied.

See [the motion pilot](../reviews/kaykit-pilot.md) for controls, actual browser captures, source identities and limits. Its original meshes use KayKit Medium motion; simulation timing remains authoritative. The refined pilot/room recheck passes 16 browser cases; 61 platform, 83 GUT, 26 parity fixtures and 27 Blender cases pass, with typecheck and Release smoke/audit passing. The completed whole-suite browser run had 94 passes/five skips and one WebKit selection-helper failure. Helpers now wait for each native selection result and the affected room scope passes. The subsequent complete recheck was interrupted by SIGTERM; T007 remains unchecked. See [exact evidence and remaining gates](kaykit-pilot.md).

The owner has now approved the motion previews. Grunt and bartender rigs are integrated into normal gameplay, with validated preparation, bottle views, pause-safe 21-tick defeat retention and owned-instance cleanup. See [gameplay instructions/captures](../reviews/gameplay-enemies.md). Inherited scenery and basic Enforcer/Liam models remain. Four furnished rooms, those remaining roles, full catalogue/CLI/dependency validation, credits and final artwork acceptance remain open. Phone/offline/performance, soundtrack, player and final artwork acceptance are pending. Desktop pilot counters are not reference-phone evidence.

## Next work

Complete the shared validation/CLI and representative-room/export foundation, then implement the other enemies/rooms through the production ResourceStore and view boundaries. Preserve hero contracts; retain the explicitly requested two-axis Grunt pursuit and warning-time bottle aim. Camera code and attack timing constants remain unchanged. Review punch contact, foot placement and spatial bottle handoff in motion before treating these phase segments as final.

No commit or deployment has been performed. `runtimeAssets` now records the two approved gameplay skins and `runtimeProps` records the bottle; review fixtures remain separately identified.

## Extension hooks

`.specify/extensions.yml` is absent. Both before_implement and after_implement hook dispatch are skipped under the speckit-implement rules; no mandatory or optional hook is registered.


## Gameplay increment verification

The initial integration passed all 26 legacy replays. Latest owner steering authorizes turning/two-axis pursuit and less accurate throws. The updated code passes 95 GUT and 62 platform tests, typecheck and all 26 current-rule replays (18 explicitly versioned gameplay revisions, eight untouched legacy checkpoints). Additional browser and Release checks are running; see `validation/gameplay-enemies.md` for final evidence.
