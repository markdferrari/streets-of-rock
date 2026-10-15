# Final implementation checks — 2026-10-15

Implementation runs on feature branch `010-upgrade-game-artwork`. No commit or deployment was made. The initially modified `validation/evidence/gameplay-enemies/following-full-browser.txt` remains preserved.

| Check | Actual outcome |
| --- | --- |
| Full platform/tooling/art units | 86 tests pass (latest `platform-final.txt`); the combined unit run before the additional audit-selection case passed 85 platform plus 122 GUT tests. |
| Full Godot/GUT | 122 tests pass, 2,609 assertions. Existing fixture warnings remain visible in the raw report; complete ownership cycles add no retained instances/orphans. |
| Focused art command | 62 GUT plus 23 Vitest cases pass with both real runners executed; managed sandbox nested-Node output restrictions require normal execution. Empty child reports fail closed. |
| Typecheck | Full GDScript/TypeScript passes; the final acceptance-selector change additionally passes TypeScript checking. |
| Deterministic parity | All 26 current-rule fixtures match exactly; the separately approved feature 010 pursuit/aim changes remain explicit, with the original baseline retained. |
| Blender | All 28 source/export/editability tests pass, including four production roles and unchanged hero fingerprints. |
| Full exported-browser regression | 119 pass, five declared capability skips across Chromium/WebKit (124 cases). All twelve duos, transitions, lifecycle/countdown/audio/storage/cache/update and ten retries remain active. |
| Added clean review/credits/offline scope | 13 pass, one declared WebKit offline-emulation skip (14 cases), including clean neutral captures and both boss phases. Combined distinct current game cases: 122 pass/six declared skips out of 128. |
| Credits/accessibility/offline follow-up | Nine pass, one declared offline skip. Settings focus wrapping and nested credit focus return pass in both engines. |
| Final five-MiB forced split | Two actual packs; eight cold-browser smoke passes, two declared capability skips. Individual oversized resources are never byte-split. |
| Production smoke | Three pass, three mode/capability skips; test/diagnostic query parameters cannot register hooks in Release. |
| Diagnostics smoke | Both engines download actual bounded reports with texture/mesh/render fields. |
| Release/Diagnostics build audits | Both pass exact file/inventory/resource closure and content/engine budgets. |
| Full/focused/definitions-only art CLI | Full, exterior, Liam and definitions-only checks pass. Definitions-only retains its explicit incomplete-readiness label. |
| Strict final acceptance audit | Intentionally fails: the feature-specific current-build record has pending phone/performance/playtest evidence. No earlier waiver is reused. |

Raw reports and exact emitted build/ownership records live in [complete-art evidence](evidence/complete-art/manifest.json). The initial superseded browser run found two focus failures and was interrupted after 84 passes; it is not used as final green evidence. The current complete run and focused rechecks replace it.

The 124-case full run and final 14-case art/review/offline scope share the same production assets/presentation. The latter includes the last required-scene error guard, complete supplier credit metadata and test-only neutral review; those final changes also have current unit/import/static checks and real Release/Diagnostics/split exports. This avoids representing different build IDs as the same artifact. [Art records](../reviews/art-register.json) identify each capture build and the current release separately.

T052/T065/T066 remain unavailable physical/participant observations. T070 remains unchecked at its strict final acceptance gate. Owner appearance approval is recorded in [owner-approval.md](owner-approval.md); it does not supply those measurements.
