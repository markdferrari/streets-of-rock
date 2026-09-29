# Quickstart and Validation: Choose Your Chieftain

This guide defines validation for the forthcoming implementation. The planning command does not claim the feature, browser checks, or device acceptance are complete.

## Prerequisites and setup

Use branch `005-choose-your-fighter`, Bun 1.4.2, locked dependencies, Playwright Chromium/WebKit browsers, and Blender 5.2.x for changed character exports. Final audio/offline acceptance requires the intended owner-supplied track; an identified bundled placeholder may support development. Have iPhone 12/Safari and Pixel 6/Chrome available for final checks.

Run from the repository root:

```sh
bun install --frozen-lockfile
bunx playwright install chromium webkit
bun run dev
```

A network connection is required for missing dependencies/browser binaries. Do not replace the lockfile or upgrade versions as part of this feature. Browse the displayed local URL; physical-device PWA validation requires an HTTPS test deployment, which is separate from this planning command. Plain LAN HTTP is not evidence of service-worker/offline support.

## Test-first workflow and automated gates

For each implementation increment in [plan.md](plan.md), first write a test that exercises the intended observable behavior, run it and record the expected failure, then implement and refactor. Keep the simulation/countdown independent of real waiting. Browser tests must exercise GameApp through the production RunSession, not a disconnected test-only controller.

After implementation, the existing commands are:

```sh
bun run typecheck
bun run test:unit
bun run test:e2e
/usr/local/bin/blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py
bun run build
bun run audit:build
git diff --check
```

`test:unit` includes integration tests. `test:e2e` builds test mode and starts port 4173 for Chromium/WebKit. Stop an unrelated server on that port or use `CI=1 bun run test:e2e` so a reused server cannot hide stale code. Run the production build after browser tests so the final audit inspects production output, including absence of `__sorTest` and fixture roster. All existing automated suites, including Blender tests, must pass before a conventional commit. Documentation-only planning uses document consistency checks and creates no commit.

The audit currently checks only index.html; implementation must extend it to inventory completeness, actual precache entries, required animation coverage, production test-hook exclusion, and asset budgets before treating it as release evidence. `build:diagnostics` currently only sets an environment flag; implementation must add a local diagnostics sampler before claiming frame measurements from that command.

## Required automated scenarios

| Test group | Observable outcomes |
| --- | --- |
| Registry and actors | Both assignments validated; duplicates/unknown IDs/incomplete roster reject; player/partner IDs, full health and positions correct; displayed bars reflect actual profiles. |
| Selection | First activation previews, second confirms; switching only previews; unavailable tile cannot select; Back clears partner and requires reconfirmation; focus differs from preview. |
| Input/layout | Touch/click/keyboard equivalent; Enter repeat cannot confirm; Space handled once; pointer cancellation and scrolling never select; meaningful focus restored; two/twelve-entry rosters reachable. |
| Readiness/lifecycle | Failure Retry preserves duo; stale success/failure ignored; no simulation before initial render/readiness; duplicate events yield one run; disposal does not damage shared assets. |
| Countdown | Fake timestamps test each one-second boundary; pause every number at 400 ms then resume for 600 ms; no hidden elapsed time; foreground stalls cannot skip numerals; run tick/time zero until launch. |
| Both-role combat | All player actions, buffering/cancellation, protection, enemy targeting, partner follow/recovery/knockout, special meter, pickups/tables, tutorial, HUD, camera, defeat tie, and solo victory follow roles. Preserve current Cow numeric cases. |
| Retry/reset | Retry uses same duo with full reset and new countdown; homepage/reload clears assignment; no held selection input executes a combat action. |
| Assets | Every semantic action/phase resolves to an actual exported clip; Crow player Dodge/actions and Cow support work; switching previews and returning/retrying repeatedly do not accumulate canvases/mixers. |
| Platform | Invalid/denied storage defaults, rejected audio remains playable, cached complete offline flow, media 200/206/416 handling, failed caching never shows ready, waiting updates do not disrupt any active tab. |

Migrate all three existing Start-based browser suites using a shared helper that deliberately previews/confirms fighter and partner and waits for countdown completion. Add role-based helpers such as defeatPlayer and stagePlayerHit in test mode only; never skip the UI journey in its own acceptance tests.

## Manual selection and accessibility procedure

1. On each reference phone in landscape, open a fresh homepage. Confirm two named portraits, no empty slots, and no preview before activation. Select Cow then Crow and repeat in reverse. Confirm the controlled character matches the selected fighter.
2. Preview the other fighter before confirming, navigate Back from partner selection, and reconfirm. Check the unavailable tile label and the AI explanation. Repeat with mouse and keyboard; Tab must leave the roster and arrows must keep focused tiles visible.
3. Load the twelve-entry navigation fixture in test mode. Scroll with touch, cancelling one gesture midway. Ensure no accidental confirmation, all tiles remain reachable, and no controls overlap safe areas. Repeat with browser chrome resized.
4. Enable system reduced motion, mute audio, and disable shake. Verify still preview, readable labels/bars, distinct focus/preview/unavailable framing, and unchanged selection behavior.
5. Deny a required asset request, retry, and verify retained preview/duo and one eventual countdown. Trigger WebGL preparation failure and verify actionable error rather than a blank launch.
6. Open settings during selection, change both volumes/shake, close and reload. Confirm persistence when permitted and playable defaults when storage is denied. No settings action confirms a character.

## Interruption, audio, and run procedure

For both duo assignments on both phones, interrupt preparation and each countdown numeral by backgrounding, switching apps/focus, and rotating to portrait. Restore landscape and foreground: countdown must remain stopped until Resume and retain the remaining fraction. Verify no audio starts before control, no input leaks into combat, and run time excludes selection/loading/countdown/interruption.

Perform Light combo, Heavy, directed Dodge, and ready Special. Inspect Crow player and Cow partner animations for distinct poses, readable active phases, and no silent missing-clip fallback. Defeat the partner in a prepared encounter and complete solo; separately defeat the fighter while partner survives. Retry must restore the same duo at full health and repeat countdown. Verify player-only healing and role-correct HUD/tutorials. Return home clears both selections.

Reject media playback once and confirm silent gameplay. Enable it with a later deliberate user gesture; pause/resume/retry should never create overlapping music instances. Final soundtrack acceptance uses the supplied track and records codec/browser results.

## Offline and update procedure

1. Build and serve the complete versioned game over HTTPS (or localhost for automated browser tests). Wait for the current-build inventory audit to report offline-ready; record build ID and total bytes.
2. Close the page, disable networking, relaunch, and complete both valid duos through selection, previews, full level, results, and Retry. Repeat in installed mode where supported; verify soundtrack and effects throughout.
3. Clear or interrupt caching, then attempt the flow. Offline-ready must not appear without complete assets; runtime-loaded gameplay may remain usable. Missing required visuals give actionable Retry; audio playback failure stays nonblocking.
4. Serve build B after build A is cached. Keep one A tab in locked preparation/countdown and a second in active/paused gameplay. Confirm neither switches build or reloads and a waiting update remains pending. Check again at results/homepage; close all game windows and reopen to allow natural activation. Do not use forced worker activation to make this test pass.

## Performance and five-player evidence

Implement a diagnostics-only local frame sampler around the existing frame loop: record presented-frame intervals and renderer triangle/draw-call counts by phase and encounter, excluding hidden/paused periods. Export records locally; add no remote telemetry. Use an active one-second rolling FPS window to identify sustained drops, and report the longest frame separately so averages cannot conceal stalls. Production code must omit diagnostics/test mutation hooks.

Use `bun run build:diagnostics` after the sampler exists. On iPhone 12 and Pixel 6, run both fighters through the full level including the busiest encounter with complete assets and soundtrack. Target 60 fps and require at least 30 fps in every active one-second encounter window. Record visible stalls, peak draw/triangle counts, portrait-grid responsiveness, preview switching, ten homepage/run/retry cycles for resource accumulation, and browser/OS versions. Desktop emulation is supplementary.

Recruit five first-time casual action players. Before selection, record each intended duo; give no verbal coaching. At least four must select that duo and reach gameplay, and at least four must identify their AI partner afterward. Continue the existing PRD evaluation for learning controls, completion attempts, active run duration, responsiveness/readability ratings, and four-action demonstrations. Record confusion and tuning changes explicitly.

## Acceptance record

During implementation, create `validation.md` in this feature directory recording date/build, commands/results, feature requirement and scenario IDs, device/browser/OS, selected duo, inventory bytes, frame records, soundtrack identity, and player outcomes. Mark missing evidence as pending or blocked, never pass. Passing automated tests alone does not satisfy physical-device or five-player gates. See [runtime contract](contracts/runtime.md) and [data model](data-model.md) for expected transitions and values.
