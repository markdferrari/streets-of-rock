# Quickstart and Validation: The Neon Velvet MVP

**Status:** Design guide. Application scripts below are contracts for implementation, not
commands that can run against the current documentation-only repository. Do not report them
as passed until the app and tests exist.

## Prerequisites

- Work on `001-neon-velvet-mvp` or an authorized feature branch, never main.
- Node 24.21.0, Bun 1.4.2, and the exact locked dependencies in [plan](plan.md).
  Bun manages dependencies and scripts; Node remains available for the selected tool CLIs.
- Playwright browser binaries and their system dependencies for Chromium and WebKit.
- iPhone 12/Safari and Pixel 6/Chrome; record exact installed OS/browser versions.
- The owner-supplied soundtrack for final validation; initial development may use a labeled
  temporary track. Prepare its looping MP3 and catalog entry under the delivery contract.
- Static HTTPS preview reachable from both phones for real installation/service-worker tests.
  Future production deployment targets AWS; use the S3/CloudFront reference configuration
  in the delivery contract when provisioning is scheduled.
  A plain LAN HTTP development URL does not establish PWA acceptance.

## Required package scripts

Implement these scripts during setup and keep them stable for later task and review evidence.

| Script | Command/behavior |
| --- | --- |
| dev | vite; no worker registration during ordinary development |
| typecheck | tsc --noEmit |
| test:unit | vitest run; pure rules and adapter integration tests |
| test:e2e | playwright test; config builds/serves the test-mode production bundle automatically |
| test | bun run test:unit followed by bun run test:e2e; all existing automated tests |
| build | Typecheck, version content/create inventory, vite build, then audit required precache entries and budgets |
| build:test | Same production pipeline with VITE_TEST_MODE=1; enables controlled scenario fixtures, keeps service worker behavior |
| build:diagnostics | Same pipeline with VITE_DIAGNOSTICS=1 and test mode disabled; enables local timing export |
| audit:build | Verify full same-origin content inventory, precache completeness, per-file/total budgets, and absence of test mutation controls in release |
| preview | vite preview; default test port 4173, static production output |

The build scripts must use one shared packaging implementation. Build modes are explicit;
test mode cannot be silently inherited into release. Playwright's webServer starts
`bun run build:test` then `bun run preview --host 127.0.0.1 --port 4173`; run PWA scenarios
with serviceWorkers allowed. No test routes or fixture globals ship in a release.

After application setup and lockfile creation:

```sh
bun install --frozen-lockfile
bun run playwright install chromium webkit
bun run typecheck
bun run test
bun run build
bun run audit:build
bun run preview --host 127.0.0.1 --port 4173
```

The final preview command is a long-running local server. Use a separate terminal for browser
checks. Install missing Playwright OS dependencies using the documented platform procedure
when necessary; do not mistake a missing browser binary for a passing or skipped test.

## Test-first development

1. Select requirement/scenario IDs from the spec and a corresponding task.
2. Write observable behavior tests and run the focused Vitest/Playwright selection. Confirm
   failure is caused by missing behavior, not setup or syntax errors.
3. Implement the smallest behavior and rerun that selection until it passes.
4. Refactor with passing tests. Run all existing tests and applicable type/build checks before
   committing. Use conventional commit messages (for example, `feat: add touch combat`).
   Record commands, results, and any outstanding manual evidence.
5. For manual-only behavior, define the procedure first and execute it on real devices after
   implementation. Do not replace rule tests with a video or screenshot.

Pure tests control ticks and input directly. Cover one-hit-per-strike, depth misses, command
expiry, combo reset, invulnerability boundaries, resource consumption, concurrent attack slots,
AI targeting/recovery, exact-once wave/drop transitions, simultaneous Cow/Liam lethal damage,
Crow knockout, full retry reset, and paused/active timing. Browser tests cover pointer ownership,
screens, persistence failures, worker contracts, and audio-error fallback.

## End-to-end acceptance groups

Run these against the release on both phones. Use fixture builds only to reproduce rare states;
also complete an unmodified release run. Record each AC as pass/fail with build/device evidence.

| Group | Procedure | Expected outcome |
| --- | --- | --- |
| Learn and fight (AC-001–007, AC-022–024) | Fresh preferences; follow prompts, hold movement while tapping attacks, test facing/depth/edges, combo, dodge, charged spin, canceled touches, enemy pressure | Prompts do not block controls; hits/resources/cooldowns match rules; no stuck inputs, allied damage, or unavoidable attack pileup |
| Level and partner (AC-008–014, AC-025–029) | Traverse all waves; allow Crow knockout; win solo; separately lose Cow, retry, break both tables, collect at full health, and exceed five minutes | Correct locks/GO and enemy roles; readable boss phase; only Cow death loses; exact drops/healing; complete reset and accurate best time |
| Device reliability (AC-015–018, AC-030–032, AC-034) | Pause/resume repeatedly; change volumes/shake; hide app, lock/unlock, blur, rotate, cancel touches, reload; inspect art and play muted | Input/clocks/audio stop appropriately; explicit resume; reload returns to title; no doubled music; readable supported layout and presentation |
| Offline delivery (AC-019–021, AC-033–034) | Complete preparation, close/reopen offline, finish/retry with music; test interrupted preparation, update, and optional installation | Full offline content; truthful readiness/errors; no account/network dependency; updates never disrupt active clients |

Include dedicated regression checks for meter gain from Cow versus Crow, failed/unavailable
special input, Crow's relative damage against equivalent targets, and loss of rendered context.
For terminal-tie and precise timing boundaries use deterministic fixtures rather than relying
on accidental timing during a manual run.

## Offline and update procedure

1. Use a fresh persistent browser profile. Open build A online, wait for “Ready offline,” and
   record its build ID. Inspect a complete cache audit, including music and any GLB dependencies.
2. Close the page, disable network, reopen, complete the full level, retry, and confirm music
   loops. Repeat through the installed launcher where installation is supported.
3. Verify full audio responses and valid/invalid range handling (200, 206, 416). A partial
   streaming response must not satisfy the complete-cache check.
4. Delete one cached required entry using browser tooling, reconnect, and reopen. Offline
   readiness must fail; Retry must fetch matching content and restore readiness. Simulate
   denied cache storage or interrupted download: no false ready state, and online gameplay
   remains possible if required playable content loaded.
5. Open build A in two clients, leaving one running and one paused. Publish build B to the
   test origin. Trigger the browser's update check. A must keep playing; B remains waiting.
6. Close only one client: B must still wait. Close every A client and reopen: B activates and
   audits its own content. Check both browser tabs and installed windows during manual testing.
7. Test a denied/rejected audio start: game remains playable silently and no unhandled error
   breaks Start/Resume. Restore sound, retry several times, and confirm only one music instance.

Automated update tests use two build fixtures and a local fixture server, keeping one origin
while switching its served release. They do not deploy publicly. Browser networking/offline
controls and persistent context must be used; disabling service workers defeats this test.

## Performance acceptance

1. Build diagnostics with test controls disabled. Load on each reference phone through HTTPS;
   record build ID, device model, OS/browser version, display orientation, and power mode.
2. Warm up by completing one run. Record the next complete run at the default visual quality,
   including the four-enemy waves and Liam. Repeat the release run without diagnostics to
   verify the same behavior and inspect native browser profiling if diagnostics differ.
3. Export requestAnimationFrame interval data with active area/wave and pause markers. Count
   rendered frames in every complete 1-second active window at 250 ms offsets. Exclude loading
   and explicit pause intervals only; do not remove stalls or heavy effects from the sample.
4. Pass NFR-002/SC-006 only if every full window in the busiest measured encounter is ≥30 fps
   on both phones. Aim for 60 fps. Record full-run median/p95/p99 frame intervals, each >100 ms
   stall, draw calls, and visible triangle counts as diagnostic evidence.
5. If the gate fails, reduce rendering cost and remeasure the affected scenario. Do not silently
   reduce enemy content or relax the minimum. Baseline DPR is capped at 1.5; an evidence-based
   lower fixed cap is allowed if controls/telegraphs remain readable and both phones pass.

## Five-player formative evaluation

Recruit five casual action players. Use the same accepted release and allow at most three
attempts each, without verbal control coaching. Record the following locally:

| Field | Measurement |
| --- | --- |
| Build/device | Release ID, phone, OS/browser |
| Learning | Seconds from control availability until the player both moves and attacks |
| Completion | Attempt count, failure reasons, first successful active time, Crow survival |
| Ratings | Separate responsiveness and readability scores, each 1–5 |
| Observation | Confusing prompts, missed telegraphs, uncomfortable controls, repeated stalls |

At least four players must move and attack within 30 seconds, at least four finish within
three attempts, at least four record a first successful 3–5 minute run, and at least four rate
both responsiveness/readability ≥4. Nonfinishers fail the timing criterion. These are
SC-001–004; all 34 scenarios and both device gates are additionally required by SC-005–006.

Before future AWS deployment acceptance, repeat the offline/update procedure at the actual
CloudFront HTTPS origin. Confirm root loading, content types, music range responses, cache
headers, and missing-asset errors. This is a future deployment check; local build compatibility
can be validated without an AWS account or provisioned resources.

## Evidence and completion

Keep concise acceptance records in `specs/001-neon-velvet-mvp/validation/` when validation runs:
commands/results, scenario coverage, build/asset identities, device versions, frame summary,
and anonymized player results. Large raw traces may stay in ignored `test-results/` with
retained artifact locations referenced by the record. No personal player details are needed.

Do not mark MVP accepted with missing soundtrack/device evidence, a failing test, or a failed
player target. Planning completion only means the implementation approach and validation
procedures are ready for task generation.
