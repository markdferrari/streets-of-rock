# US3 — Browser reliability evidence

Executed 2026-10-10 on Linux x64 with Bun 1.4.2, pinned Godot
4.7.2.stable.official.ed1daf0bf, GUT 9.7.1 and Playwright 1.63.0/Chromium.
Implementation and automated checks pass. Physical mobile acceptance is **pending**;
T066 remains open. This is not final product acceptance.

## Implemented behavior and verification

| Requirement | Evidence |
|---|---|
| US3.1–2 / FR-009 | Exact three legacy keys, schema/default validation, denied-storage memory fallback, canonical tutorial IDs and strictly better victory replacement: `test_persistence.gd`, `storage.test.ts`, actual saved-value reload and cross-release upgrade. No transient run saves. |
| FR-007/010 | Native semantic roles/ranges, stable DOM nodes, focus without preview, twelve-entry roving fixture, stale intent rejection, Settings Tab trap and focus restoration: platform tests and `godot-accessibility.spec.ts`. |
| US3.2–3 / FR-010 | Hide/blur/portrait at each countdown numeral and during both Lion/Plates Specials freeze simulation/active time and require explicit safe Resume. One streamed music player/eight reused effect voices; independent gains, pause/resume/retry and silent fallback: GUT and `godot-lifecycle.spec.ts`. |
| FR-010/011/013 | Required missing model, imported clip and scenery failures; stale generations and retry; synthetic context-loss/restoration requiring explicit Resume; ten actual browser retries with stable owned rigs: session/resource GUT tests, lifecycle/loading browser tests. |
| US3.4–6 / FR-011 | Actual worker tests verify digest/length, missing/corrupt files, revisioned keys, serialized repair, quota errors, protocol/build/request IDs and idle/total deadlines. Runtime readiness remains independent of offline readiness. |
| US3.4–6 / FR-009/011 | Cold offline selection, all four fighters and eight room textures; immutable legacy-to-Godot two-window update while old sessions prepare/count down/run/pause, no forced takeover, close both windows then cold offline new release. `godot-offline.spec.ts`. Room/terminal fixtures check resource availability and screen transitions, not natural full-level completion. |
| FR-013–015 | Actual release/test/diagnostics exports and byte audits, official engine exceptions, resource membership/import remaps, content budgets, isolated hooks, local structured diagnostics download. `release-audit.test.ts`, `export.test.ts`, `godot-release.spec.ts`. |

Early worker messages now survive Godot startup. Worker `type` fields cannot override
the bridge event name. These defects were reproduced before correction. Browser
regressions also reproduced the Settings focus loss and slider integer rounding;
both were corrected. Diagnostics bridge JSON is decoded into an object, and rolling
FPS uses the latest active second rather than the whole raw sample buffer.

## Automated results

- `bun run typecheck`: TypeScript and Godot script checks passed. The actual importer
  also ran during each export.
- `bun run test:platform`: 15 files, 52 tests passed, including real authoritative
  Godot subprocesses and worker protocol execution.
- `bun run test:godot`: 54 tests, 753 assertions passed. GUT reports 14 float/int
  comparison warnings in existing clock assertions; no failures or pending tests.
- `bun run test:parity`: all 26 pinned state/event/camera fixtures matched exactly.
- Retained legacy unit/integration suite: 47 files, 167 tests passed.
- Chromium: all twelve ordered duos, five backdrop cases, four foundation cases,
  two input cases and ten-retry loading case passed. The expanded affected suite
  passed all 23 accessibility/character/lifecycle/offline cases after corrections.
  The final expanded all-fighter/all-room cold-offline and two-window upgrade suite
  passed both cases (58.3 seconds) on the final Test artifact.
- Actual Release: production boot/selection/Light/Pause checks passed; query parameters
  cannot register test or diagnostics hooks. The diagnostics-only test is intentionally
  skipped when checking Release.
- Actual Web Diagnostics: production isolation and bounded structured JSON download
  checks both passed on the final Diagnostics artifact (25.6 seconds); samples exclude
  paused/non-running time. These are desktop checks,
  not phone performance measurements.
- `bun run test:blender`: all 24 tests passed. Local process/socket checks needed
  execution outside the sandbox; no production assets were regenerated.

Initial foundation failures were an incorrect test-fixture snapshot accessor, not
production behavior. Corrected foundation cases all passed. An interrupted targeted
run left its own port-4181 preview process; that identified process was stopped and
the upgrade suite rerun successfully. No user-owned server was stopped.

## Phase 5/6 audited build identities (before the LAN HTTP fix)

| Mode | Build ID | Content | Verified engine | Complete cached bytes | gzip estimate | Brotli estimate |
|---|---|---:|---:|---:|---:|---:|
| Release | `ce47599636a8c55deb8c96129020f038d513690930af0a916c42676c93e3e76d` | 5,675,170 | 39,804,840 | 45,480,010 | 15,837,055 | 13,886,626 |
| Test | `7c422b69793d3f551e038e6cf8bb23589a1197169638ae148bce5fb3b0460416` | 6,148,675 | 38,228,054 | 44,376,729 | 16,267,471 | 14,415,619 |
| Diagnostics | `1db893a4d359ce826eb13bf1d9ee69df0582c18615889ece0b37f3336a4649a1` | 5,677,389 | 39,804,840 | 45,482,229 | 15,838,561 | 13,888,098 |

All modes contain one content pack and pass `bun run audit:build -- <directory>`.
Compressed sizes are deterministic per-file estimates, not measured network transfers.
The official engine is accounted for separately from the 30 MiB content budget and
16 MiB non-engine file limit. `--final` correctly refuses the missing current-build
`acceptance.json`; no acceptance evidence was invented to bypass that gate.

Immutable upgrade fixtures have their own locked historical IDs:
legacy `184f564e58e31647`, Godot
`0930123c68d675c10e7284821b9c33333200df24d2fbbefff15642966f043803`.
Tests verify each complete fixture tree hash before use. They were not relabelled as
the current release. The separate cold-offline test uses the current Test export.

## Required remaining evidence

T021/T066: iPhone 12/Safari and Pixel 6/Chrome, actual OS/browser versions, browser and
installed modes, safe areas, storage denial, gesture audio/listening, VoiceOver/TalkBack,
native orientation/background interruptions, true GPU loss/reload, offline full-level
completion/results/retry and two-window updates. Desktop synthetic environment/context
events and cache emulation cannot establish these device outcomes.

Local Playwright WebKit cannot launch because `libavif.so.16` is missing. No WebKit
pass is claimed. Physical Safari remains required even after desktop WebKit is repaired.
Soundtrack confirmation, phone performance and five-player evaluation remain later
Phase 7 gates (T075–T078), including SC-003–005/009 acceptance where applicable.

Follow-up: [LAN HTTP evidence](lan-http.md) records the reproduced `addModule`
loading error, silent audio fallback, secure API requirements and rebuilt preview
identities. The phase/character results above retain their actual historical IDs.

## Current owner decisions and browser verification — 2026-10-14

Owner music/art/character decisions are approved in [owner-approvals.md](owner-approvals.md).
Current full browser/static results and exact artifact IDs are in [phase7.md](phase7.md)
and [release.md](release.md). Local WebKit now launches with the documented project
`LD_LIBRARY_PATH` override. Historical lack of WebKit results above remains an
observation about that earlier run. Current skips/failures are reported separately.
T066's physical storage/gesture audio/VoiceOver/TalkBack/installed/offline/full-level
and update procedures remain unmeasured; desktop checks do not provide these outcomes.

## Subsequent owner-authorized cutover

The owner explicitly [waived the outstanding manual acceptance gates](manual-waiver.md).
Earlier pending labels and results above remain historical. See [cutover](cutover.md)
and [post-cutover validation](cutover-validation.md) for the current technical state.
No phone/player observation was converted into a measured pass.
