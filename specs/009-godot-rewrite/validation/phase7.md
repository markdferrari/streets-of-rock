# Remainder implementation and validation — 2026-10-14

Branch: `009-phase-7-validation`, based on merged implementation `ddca43f`.
Owner decisions are [approved](owner-approvals.md). Product acceptance/cutover
still needs physical measurements and individual participant outcomes.

## Current commands and outcomes

| Command/gate | Observed result | Evidence |
|---|---|---|
| `bun install --frozen-lockfile` | 380 installs checked, no lock/dependency changes. | [install](evidence/phase7-install.log) |
| `bun run setup:godot` | Locked editor and project-local templates verified. | [setup](evidence/phase7-setup.log) |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers bun run playwright install chromium webkit` | Success using existing local browsers; host fallback notices reported. | [browser installation](evidence/phase7-browser-local-install.log) |
| `bun run typecheck` | TypeScript plus Godot script checks pass. | [typecheck](evidence/phase7-typecheck-final.log) |
| `bun run test:unit` | Retained legacy 167, platform/tooling 57, GUT 54 tests / 753 assertions pass. GUT retains 14 float/int warnings. | [units](evidence/phase7-unit-final.log) |
| `bun run test:parity` | All 26 fixtures / 780 state/event/camera checkpoints match. | [parity](evidence/phase7-parity.log) |
| `bun run test:e2e:legacy` | Chromium/WebKit: 78 pass, eight skips. | [legacy browser](evidence/phase7-legacy-e2e.log) |
| `bun run test:e2e:godot` | 89 pass, five WebKit offline/CDP-specific skips; 14.3 minutes, no failures. | [Godot browser](evidence/phase7-godot-e2e.log) |
| `SOR_SKIP_EXPORT=1 bun run test:e2e:release` | Actual Release: three pass, three mode/browser-specific skips. | [Release smoke](evidence/phase7-release-e2e.log) |
| Same command with `SOR_RELEASE_DIR=dist-diagnostics` | Actual Diagnostics: five pass, one Chromium-only scenario skipped on WebKit. Both browsers download the structured diagnostics report. | [Diagnostics smoke](evidence/phase7-diagnostics-e2e.log) |
| `bun run test:blender` | All 24 tests pass outside the socket-restricting sandbox. | [Blender](evidence/phase7-blender-approved.log) |
| `bun scripts/characters/validate.ts --full` | Four definitions and bundled source/imported resources valid. | [authoring](evidence/phase7-characters.log) |
| `bun run build` / `build:diagnostics` and `audit:build` | Fresh exports/audits pass; full numeric records and exact identities retained. | [release](release.md) |
| `bun run audit:build -- --final` | Expected rejection while current phone/player acceptance is missing. | [final audit rejection](evidence/phase7-audit-final.log) |

All test commands use the existing wrappers in package.json. `test:unit` includes
legacy/platform/GUT; `test` includes units, parity, all three e2e owners and Blender.
`test:foundation` composes the same validated platform/GUT/Web Test/Release owners.
No still-active suite was removed. Interactive `dev` opens the Godot editor and is
not treated as an automated test pass. Preview was exercised by actual browser
journeys and an independent HTTP measurement, including MIME/cache headers and 404s.

The initial complete browser command passed the legacy suites but was interrupted
during Godot checks by the resumed session. Its identified orphan port-4181 preview
was stopped, then the complete Godot suite restarted. Initial sandbox preview/export
attempts failed because local sockets were denied; successful runs use the approved
host execution path. These infrastructure attempts are not gameplay regressions.
A redundant default-cache browser install was stopped after local installation passed.

## Changes made

Four behavioral regression cases failed before correcting the final audit. Final
acceptance now requires nine review families including art/character workflows,
existing evidence files with current release ID and actual SHA-256, and soundtrack
identity/owner approval/licensing tied to the configured audio bytes. See
[TDD record](tdd.md), [red](evidence/phase7-audit-red.log) and
[green](evidence/phase7-audit-green.log). Synthetic records in tests are not acceptance.

README/quickstart describe actual Godot and retained-JS commands. Release instructions
preserve immutable assets, the installation identity and the natural worker boundary.
Coverage, owner decisions, pending phone/player procedures and the cutover gate are
reconciled. No art, soundtrack or unrelated character assets were regenerated.

## Missing empirical records

Host device discovery showed no reference phone; iOS discovery could not retrieve
a device list and Android adb is absent. T066/T076 lack real phone/installed/assistive/
full-run/frame-series/ten-cycle evidence. T077 lacks five individual first-time-player
records. T078 awaits those results; T080/T081 require their acceptance before cutover.
See [performance](performance.md), [playtest](playtest.md) and [cutover](cutover.md).

Pre/post extension hooks: `.specify/extensions.yml` is absent, so none are dispatched.

## Final available result

T021/T074/T075/T079 are complete. All current automated owners pass: 278 legacy/
platform/GUT tests, 780 replay checkpoints, 175 browser checks across legacy/Godot/
Release/Diagnostics (17 explicit mode/capability skips), and 24 Blender tests.
Godot's ten-retry resource cycle passes in both browsers. WebKit's five native-touch/
offline/worker emulation skips still need physical Safari evidence.

The current [character captures](evidence/phase7-character-captures.json) identify
actual WebKit screenshots and the Web Test build. The earlier tracked screenshots
were restored byte-for-byte from HEAD after the tests wrote to their historical
paths. Their original review build identities remain intact.

T066/T076/T077/T078/T080/T081 remain unchecked: physical platform/performance and
five-player observations are unavailable, and acceptance must precede cutover.
All owner decisions have been recorded as approved. No further approval request is
pending. Final audit's nonzero result is the required rejection of unmeasured phones,
not an ordinary export/unit/browser failure. Changes remain uncommitted on the
feature branch; no hosting publication occurred.

## Subsequent owner-authorized cutover

The owner explicitly [waived the outstanding manual acceptance gates](manual-waiver.md).
Earlier pending labels and results above remain historical. See [cutover](cutover.md)
and [post-cutover validation](cutover-validation.md) for the current technical state.
No phone/player observation was converted into a measured pass.

Final current state: [post-cutover verification](cutover-validation.md) passes and all
81 task entries are closed. Historical blocked/pending labels above describe the
state before the explicit owner waiver. Actual manual measurements remain unverified.
