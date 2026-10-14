# Source/runtime prerequisite audit — T004

2026-10-14, branch `010-upgrade-game-artwork`, source `71f148a412bf39e1b50855ed7901736a3eb0990b` (merge of main). Feature 010 plan/research/quickstart describe the pre-merge state; the current tracked application is Godot. `git ls-files` confirms the root project, presets and all required boundary scripts. Generated `.godot/` and exports are not the source proof.

| Feature 009 dependencies | Checked-in capability | Verification / feature 010 consumers |
| --- | --- | --- |
| T004–T007 | `godot-engine.lock.json`, setup/typecheck/test runners, `addons/gut`, root `project.godot`, `export_presets.cfg` | Exact editor/templates verified by export runner; Compatibility, single-thread, Blender import disabled. GUT baseline and typecheck; 010 T007–T013 |
| T010–T012 | Shared `content/resources.json`, catalogue/validator, authoritative level/tuning/roster | GUT content suite; 010 extends single authority, not a parallel loader |
| T013–T021 | `scripts/godot/export.ts`, immutable inventories, `web/runtime-loader.ts`, bridge/cache worker, character view/resource store | Real Test export and Chromium journeys; Release export/audit; WebKit must use documented local libavif environment. 010 T007/T014–T015 |
| T022–T026, T030–T035 | Deterministic simulation, tick/action/stun/projectile snapshots, four-area progression, camera_math/ArenaContext | Existing GUT simulation/camera and immutable parity fixtures; 010 T016/T028/T030/T039/T051 |
| T027–T029, T036–T042 | Generation-safe session/readiness, independent hero poses, controls/world/HUD/test bridge | `main.gd` prepares selected models, renders initial view before `session.prepared`, disposes stale views; session rejects stale success/error. 010 T007, US1/US2 |
| T050–T066, T074 | Browser lifecycle/audio/persistence/semantics, shared store, exact pack/inventory/cache/update, diagnostics/audit/full runners | Active platform/e2e suites and release audit; future 010 T041–T060 must extend art coverage |
| T043–T049 (superseded visual scope) | Existing SVG scenery/backdrops tests are real inherited implementation | Not feature 010 artwork. T018–T025 replace room rendering; T041/T046 replace eight-texture-only readiness; retain GO/layout/table/transition regressions |
| T075–T081 | Intended soundtrack evidence, technical cutover and explicit 009 owner manual waiver | `009/validation/manual-waiver.md` explicitly limits exception to 009. New phones/player/concept/final review evidence remains pending |

## Missing feature 010 capabilities

`world_view.gd` still draws primitive enemies with `enemy_model`; normal stun is not an enemy pose resolver and no decorative defeat lifetime exists. `resource_store.gd`, `main.gd` and export grouping still require exactly eight SVG backdrop textures. There are no room/enemy catalogues, art validator, semantic enemy rigs, art-aware dependency closure or artwork credits. These are 010 tasks, not missing engine migration. Preserve inherited hero/camera/simulation values while replacing these boundaries.

## Commands and gate status

See [baseline](baseline.md) and raw evidence. Tracked source foundation is present; Release export and content audit pass. Initial restricted export failed on local sockets; unrestricted browser run passed 47 Chromium cases but could not launch 47 WebKit cases without libavif. The configured rerun reached 88 browser passes/5 declared skips but failed one Lion/Crow WebKit selection case; its isolated retry passed. The combined gate remains unresolved before T007 can be checked. No art source/import tests or representative proof have run; T015 and story integration remain gated by T005/T006 and foundation work. Missing phones are acceptance evidence, not proof of an engine defect.

Exact source last-change commits and working/tracked fingerprints are retained in [runtime sources](evidence/runtime-sources.json). Baseline commands are run through inherited wrappers; no Godot prerequisite task is marked complete solely from a preexisting checkbox or local output.


## KayKit increment recheck

The new pilot has passing structural/import, pure pose and actual instance tests, web review captures and Release exclusion evidence. A completed whole browser run had one WebKit selection-helper failure (94 passes/five skips); the helper now uses explicit native-selection state waits and the affected scope passes. A fresh complete run was interrupted, so T007 remains open. [Current detailed evidence](kaykit-pilot.md) supersedes the earlier statement that no art import/representative checks exist. Full art CLI/production-room and phone acceptance still remain incomplete.
