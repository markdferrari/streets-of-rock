# Phases 1–3 verification — 2026-10-16

Scope: T001–T015. T001–T015 are complete and checked. On 2026-10-16 the owner selected Universal for Cow, Crow, Lion and Plates; the choice is recorded in all four reviews and the existing provenance ledger. No later-phase implementation or physical-device acceptance is claimed. Work is uncommitted on `011-implement`.

## Implemented behavior

- Pure profile validation enforces exact semantic/model/source authority, four gait bindings, finite bounds, phase continuity/contact, masks and attachment declarations. Live catalogue activation remains T027.
- Explicit Blender trial export uses weighted upper/lower limbs, rigid plate/face and feather groups, a shared donor Idle neutral reference, rest/parent corrections, selected clips only and root-travel exclusion. Existing paths/source packs cannot be overwritten. Eight editable/GLB/mapping trials are isolated from production.
- Web Test provides three independent current/KayKit/Universal views, native-speed playback, explicit Pause/Resume, facing/action/character controls and normalized sampling. Current Light traverses its original phase timings. Interrupted/hidden/portrait review pauses. Partial trial clips do not weaken production semantic coverage.
- Release remains isolated from test routes, sources and trial assets. [Comparison manifest](../reviews/comparison-manifest.json) binds eight trials, 48 screenshots and eight videos to the final review build. [Source decisions](../reviews/source-decisions.md) record the owner-selected Universal source for all four characters.

## Commands and actual outcomes

| Command / check | Result |
| --- | --- |
| `bun run typecheck` | PASS; tooling + all Godot scripts. Final tooling check also passed after video-test changes. |
| `bun run test:godot` | PASS: 136 tests, including nine profile and five review tests; final duration-only snapshot field subsequently passed the focused review suite. |
| `bun run test:platform` | PASS: 87 tests, including 12 export tests. |
| `bun run test:parity` | PASS: all 26 current-rule fixtures, no discrete outcome tolerance; original fixtures unchanged. |
| `bun run test:blender` (with subprocess access) | PASS: 38 tests. After tightening exact imported clip matching and donor-geometry assertions, the four affected trial/export tests passed again. |
| `bun run validate:art` | PASS: full artwork definitions and imported closure. Hero production profile/CLI validation remains a later-phase task. |
| `bun scripts/godot/export.ts test --output-dir dist-hero-review` | PASS: final build identity/bytes are in the comparison manifest and local `review-build.log`. |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers LD_LIBRARY_PATH="$PWD/.browser-libs/usr/lib/x86_64-linux-gnu" bunx playwright test --config .tmp/hero-animation/review.config.ts` | PASS: all 8 character/browser comparisons. Each source completes a native-speed cycle of each action; independent skeletons, actual changing bones, frozen samples and interruption verified. |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers LD_LIBRARY_PATH="$PWD/.browser-libs/usr/lib/x86_64-linux-gnu" SOR_SKIP_EXPORT=1 bun run test:e2e:release` | PASS: 5 tests, 3 declared skips (Chromium-only LAN check / diagnostics-only report). Both actual Release query variants exclude hero/test/diagnostics hooks. |
| `bun run audit:build -- dist` | PASS: build `08373e1c94fdb582011129689f1d4a5ade318f9ca815aeb4ee2e44639a467cb4`; 5.77 MiB content, 37.96 MiB verified engine; 45,859,325 cached bytes; gzip estimate 16,173,125 bytes; Brotli estimate 14,213,443 bytes. |
| Actual Release PCK inspection with `readPck` | PASS: 185 entries; no tests, donor sources, Blender sources or test bridge. |
| Baseline source/runtime/fingerprint and retained license hash comparisons | PASS: original hero assets, semantic inventory and historical fingerprint records unchanged; retained KayKit/Universal inputs match ledger hashes. |
| `git diff --check` and document link/phase consistency | PASS; all feature Markdown links resolve, T001–T015 checked; later phases remain open. Historical regression-generated review captures were restored to their original bytes. |

The initial combined `bun run test` did not pass: sandbox sockets, occupied port 4181 and unconfigured WebKit libraries prevented completion. A baseline export on port 4183 passed all 64 Chromium cases; the configured WebKit rerun passed 58 cases with 6 declared skips. Those existing tests reuse the unchanged baseline export; the eight new comparison checks use the final review build. The initial sandbox Blender run stalled in fresh-process probes and was stopped; the configured rerun above passed. These failures are retained as environment history, never relabelled as passing commands. Detailed local logs are `.tmp/hero-animation/*.log`.

## Red–green evidence

- Profile schema tests failed on missing implementation; all nine pass after validation was implemented (216 assertions).
- Five synthetic rig/helper tests failed on the missing module; implementation passed. The added neutral-rest regression failed before `reference_pose` support and now passes, proving a 0.3-radian donor guard does not stack onto target rest.
- Four trial tests failed on missing plan/mapping/target/export APIs; all pass, including repeated export comparison and donor-byte preservation.
- Review tests failed on the missing scene/API, browser tests failed against baseline without the route, and export tests failed because trial GLBs were absent from test roots. Implementations pass. Browser checks caught sanitized baseline clip names; the fixture resolves aliases locally without mutating shared animation libraries.
- A full-baseline-attack test failed when only its active clip was sampled; it now proves original windup/active/recovery selection and timings.

## Remaining gates

T015 is complete: the owner's Universal choice supersedes the earlier mixed-source recommendation. This update changes review/provenance metadata only; consistency, source/capture hashes and artwork validation were checked without rerunning unchanged gameplay suites. Candidate quality is not final animation acceptance: foot planting, wing/body adaptation, complete action/role coverage and authoritative contact timing belong to subsequent production/runtime tasks. Phones and five-player outcomes remain pending as documented in [strategy](strategy.md). No before/after implementation extension hooks are configured. No commit or deployment was performed.
