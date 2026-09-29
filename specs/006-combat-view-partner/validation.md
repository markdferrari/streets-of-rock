# Combat View and AI Partner Improvements: validation

Branch: `006-implementation` (feature branch). Date: 2026-09-29. This is engineering evidence, not physical-device acceptance.

## Requirement and scenario map (T001)

| Scope | Automated evidence | Manual evidence pending |
| --- | --- | --- |
| FR-001–005; US1 1–7; SC-001–002 | Both-duo target, movement, facing, obstruction, recovery, knockout and Chromium browser regressions | iPhone 12 and Pixel 6: pursuit during player separation, facing, natural travel and no routine snapping |
| FR-006–008; US2 1–5; SC-003 | Pure arena/camera fit, matched baseline/framing captures, overlays and lifecycle checks | Both phones: room coverage, body visibility, safe areas, simultaneous touch and Resume |
| FR-009–011; US3 1–6; SC-004–005 | Cue state, placement, accessibility, Chromium progression and input pass-through | Both phones: three exits and final boss; five first-time players, at least four correct directions within three seconds |
| FR-012; SC-006 | 005 role/session/platform regressions, production build and cache audit | Both phones: offline/installed full run, intended audio, waiting updates and frame diagnostics |

Manual procedures are defined in `quickstart.md` and require build identity, exact device/OS/browser, duo, landscape viewport, preferences and outcome. Reference phones, intended soundtrack acceptance, five participants and full-run frame records are unavailable here. They remain pending. The performance target is 60 fps, with a 30-fps active one-second minimum on the busiest complete run. Every asset must remain at most 16 MiB and the complete build at most 30 MiB.

## Preparation and 005 integration (T001–T002)

`bun --version`: 1.4.2. Branch is `006-implementation`, not `main`. The current unit run is 139 tests / 37 files. The implementation work predates this validation pass; expected-red command output from the earlier tests was not retained, so this document does not claim a full red-green transcript for those tests.

Feature 005's `src/game/selectors.ts`, `src/game/ai/partner.ts`, `src/app/session.ts`, `src/platform/pwa.ts`, and enhanced `scripts/audit-build.ts` are present. Both role assignments and the selected-role session are covered by unit/browser tests. The current build precaches 17 entries and `bun run audit:build` passes. This establishes bundle/cache coverage, not final soundtrack acceptance: the inventory script reports intended-track evidence pending, and 005's T050 and T052–T056 remain open for full offline Victory and intended-track evidence, real phone runs, performance and player study.

## Baseline capture (T003)

Before camera edits, the view used the fixed `(0, 8, 12)` offset, orthographic half-height 6 and room-centre/doorway interpolation. Walkable room x bounds are `[0,16]`, `[18,34]`, `[36,52]`, `[54,70]`; all rooms use depth `[-3,3]`. The three gaps are two units wide. Waves and spawns remain in `src/content/neon-velvet.ts`. Matched baseline and framing browser captures exist at 844×390 and 915×412. Actual phone-size captures are pending, so T003 stays open.

## Validation Results (2026-09-29)

- US1 automated scenarios: both duo assignments retain valid pursuit through player separation; support actions expire on schedule; invalid/off-screen targets are filtered; left/right/depth facing and regroup hysteresis hold; doorway movement is gradual; recovery occurs only after 120 blocked ticks, emits one diagnostic event and preserves HP/cooldown/progression. Distance-only recovery and knocked-out movement are rejected. The added partner tests and legacy Crow recovery regression pass.
- US2 automated scenarios: both viewport sizes keep the canvas full-screen; stable-room framing improves floor coverage in all four rooms; resize refits without actor displacement; interrupted sessions do not advance the run and require explicit Resume. Chromium touch/input and interruption regressions pass.
- US3 automated scenarios: cue derives from cleared state and actual route, survives pause, removes on entry/results, and does not intercept touches. Both Chromium progression journeys, including all exits and terminal suppression, pass. Synthetic left-route and placement/collision rules pass in unit/integration tests.
- `bun run typecheck`: pass.
- `bun run test:unit`: 139 tests / 37 files pass.
- `CI=1 bunx playwright test --project=chromium`: 39 passed, 3 skipped. Capture tests are explicitly opt-in and were run separately.
- `CAPTURE_COMBAT_VIEW=framing CI=1 bunx playwright test --project=chromium tests/e2e/combat-capture.spec.ts`: 2 passed. Captures wait until the camera returns to a stable room fit after doorway travel.
- Chromium floor coverage (baseline → framing): at 844×390, dance floor 0.228→0.285, VIP lounge 0.228→0.361, backstage corridor 0.228→0.377, alley exit 0.228→0.376. At 915×412: 0.222→0.328, 0.222→0.381, 0.222→0.395, 0.222→0.391. These desktop browser measurements are not phone evidence.
- `/usr/local/bin/blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py`: 18 passed with Blender 5.2.2 LTS.
- `bun run build && bun run audit:build`: pass; 17 precached assets, 5.78 MiB. Intended soundtrack evidence remains pending.
- `bunx vitest run tests/integration/app/arena-lifecycle.test.ts`: 1 passed. `git diff --check`: pass before this final documentation update; rerun after it.
- WebKit could not launch because host package `libavif16` is missing. `bunx playwright install-deps webkit` could not install it because sudo requires a password unavailable in this environment. This is an environment limitation, not a passing WebKit run.
- Reference iPhone 12 and Pixel 6 observations, traversal-time comparison, full-asset phone performance runs, installed/offline phone runs, intended soundtrack acceptance and the five-player direction study remain pending.
