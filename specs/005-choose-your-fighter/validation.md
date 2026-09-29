# Choose Your Chieftain validation

Build under test: `005-implement`, 2026-09-28. This is implementation evidence, not final acceptance. Feature 007 later expands the production roster to four; feature 005's two-character minimum remains a validation rule, not a final roster cap.

## Baseline (T001)

| Gate | Result |
| --- | --- |
| Bun | 1.4.2 (pinned version) |
| `bun run typecheck` | Pass |
| `bun run test:unit` | Pass: 18 files, 72 tests |
| `CI=1 bun run test:e2e` | Pass: 26 tests with `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers` and local server permission. Initial attempt failed because sandbox blocked loopback binding; second failed because Playwright did not find the repository-local browser binaries. |
| Blender suite | Pass: 15 tests under Blender 5.2.2. Sandbox run stalled in nested fresh-process probes; rerun with process permission passed in 13.3 s. |
| `bun run build` | Pass; Vite reported a non-fatal 500 kB chunk warning |
| `bun run audit:build` | Passes only the existing placeholder index check; complete audit pending T048 |
| `git diff --check` | Pass |

## Requirement and scenario evidence plan (T002)

| Requirement/scenario | Automated evidence | Manual evidence |
| --- | --- | --- |
| FR-001–003, FR-012–013; US1 1–4 | Roster, selection, portrait/preview unit tests and Chromium/WebKit selection journeys | Both phones: named portrait tiles, accurate bars, first preview and second confirmation, changed preview, still pose under reduced motion |
| FR-004–006; US2 1–4; SC-004 | Duo/reducer and keyboard/pointer/browser tests with two and twelve entries | Both phones: Cow/Crow and Crow/Cow, Back, AI explanation, unavailable fighter, drag/cancel, safe areas and resize; desktop keyboard focus |
| FR-007–008, FR-011; US3 1–2, 5–7; SC-003 | Session generation and countdown fake-clock tests, interrupted browser journeys and retry reset | Both phones: interrupt preparation and each numeral at partial time by hide, blur and rotation; explicit Resume and zero pre-run time |
| FR-009–010; US3 3–4; SC-002 | Both-duo actor, combat, AI, HUD, camera, clip and result tests | Both phones: all four actions for each fighter, partner knockout and solo victory, player defeat/tie, clear feedback with muted audio/no shake |
| FR-014; US4 3–4; SC-005 | Storage/audio failure, cache inventory, range, offline and waiting-worker tests | Both phones: complete cached offline run/result/retry for both duos, installed mode where supported, two-tab/two-build update wait, soundtrack playback |
| SC-001 | No substitute for player study | Five first-time players: record intended duo before play, uncoached outcome, AI role identification; require at least four of five for each threshold and retain PRD combat evaluation |
| SC-006 | Diagnostics unit tests and local export | Full soundtrack-inclusive runs with both fighters on iPhone 12/Safari and Pixel 6/Chrome: OS/browser version, active rolling FPS (60 target, 30 minimum), longest frame, draws/triangles, busiest encounter and ten selection/run/retry cycles |

Manual procedures follow `quickstart.md`: landscape selection with touch, mouse and keyboard; twelve-entry scrolling/cancellation; reduced motion, muted/no-shake, asset and WebGL failures; interruption at every countdown numeral; both-role combat and retry; cached offline relaunch and waiting updates; complete-run diagnostics and five-player evaluation. Record exact device/OS/browser, build ID, selected duo and outcome for each execution. No physical-device, owner soundtrack, or five-player evidence is available yet; those gates remain pending.

The full production build must keep every asset at or below 16 MiB and the total required inventory at or below 30 MiB, including the intended owner track. Test-first execution: add a behavior test, record its expected red result, implement, then record green. Run all existing suites and production audit before any conventional commit.

## Foundation red/green (T003–T006)

`bunx vitest run tests/unit/content/characters.test.ts tests/unit/game/duo.test.ts` first failed because the registry/validator modules did not exist. A later roster test failed because an incomplete damage map was accepted; validation now checks every required move. The same command then passed 5 tests in 2 files, and `bun run typecheck` passed. The twelve-entry fixture lives only under `tests/fixtures/`.

## US1 progress

`bunx vitest run tests/unit/app/selection.test.ts` failed before `src/app/selection.ts` existed, then passed 3 fighter-step tests after implementation. The reducer keeps focus separate from preview, changes preview on first activation and requires a ready preview for the second activation.

The Blender suite failed as expected when portrait jobs were absent. After adding a portrait render mode using the existing approved Cow/Crow `.blend` files, all 17 Blender tests passed. Both 512×512 head-and-shoulders portraits were generated and visually inspected. The initial sandbox generation produced the images but could not exit cleanly because of a sandbox audio-loop error; the permitted rerun exited successfully. Other US1 browser and preview checks remain pending.

## US1–US3 engineering progress (2026-09-29)

The selection/partner browser tests cover first preview and second confirmation, keyboard key-release behavior, failed preview retry, unavailable selected-fighter tile, and Back. The pure reducer and session tests cover both valid duos, no automatic partner preview, retained assignments, stale preparation generation, interruption latch, and retry/homepage reset. The asset-store test first failed because a preparation failure discarded an already loaded preview model; per-role loading now preserves successful templates and retries only the missing model (5 focused tests pass).

After replacing the legacy Start entry with selection, the first browser run failed at every Start locator. The migrated helper now enters by two activations per role, then waits through 3–2–1. The targeted Chromium legacy gameplay suite passed 15/15. New countdown tests passed 2/2 for no pre-launch ticks, interruption, Crow-player retry, and homepage reset. A locked-duo portrait assertion then failed as expected; the entry UI now shows both selected portraits, and countdown/partner Chromium tests pass 4/4. An unselected `createRun` initially failed the new rejection test; run construction now requires a validated assignment, and all 100 Vitest tests passed afterward. The full Chromium/WebKit browser regression passed 40/40 in 1.3 minutes. A new Crow-player action test was added after this run and requires verification.

The intended owner soundtrack is unavailable. A development placeholder is permitted and is bundled for engineering tests; T052 and soundtrack-dependent acceptance remain pending. The user can provide iPhone 12, Pixel 6, and five-player results after the engineering procedures are ready. No physical-device or player-study result is claimed here.

## US4 and diagnostics progress (2026-09-29)

`tests/unit/platform/settings.test.ts` first failed because the settings store was absent; a second red run found that an unsupported schema retained stale values. The versioned store now validates each field and retains in-memory preferences when storage throws. `tests/e2e/settings.spec.ts` first failed at the missing Settings control, then passed 2/2 Chromium journeys for homepage persistence, focus restoration, and paused modal behavior. Screen shake is wired to camera impact offset and disabled by the stored setting or dynamic reduced-motion preference; its focused test passed.

`tests/unit/platform/audio.test.ts` first failed because the adapter was absent, then passed 2/2 for synchronous silent unlock, independent volumes, pause/resume, one music instance and denied playback. Chromium's rejected-playback journey passed with no page error and a playable Crow run. A reproducible 8-second development-only WAV loop is bundled at `public/assets/audio/music-placeholder.wav`; it is not the intended soundtrack. Short game-effect tones currently use the local AudioContext adapter.

The offline browser journey first failed because no worker/readiness status existed. After injectManifest and a cache-status message were added, a cached Chromium relaunch entered a Crow run offline. Its new range test failed because Workbox returned 206 for a request beyond EOF; the worker now returns 416, and the browser test passed with full 200, partial 206 and invalid 416 media responses. A separate test deleted the cached music bytes and confirmed `Offline cache incomplete` after reload. The worker does not force activation or reload. Two-tab/two-build update behavior still needs its dedicated test and phone evidence.

The build-audit test first failed because no inventory module existed, then passed 3/3 with temporary builds covering omitted precache entries, required animation clips, production hooks, changed revisions, 16-MiB assets and final-track evidence. The production build audit passed with 11 precached assets totaling 2.22 MiB; `--final` intentionally remains unavailable until the intended owner track and evidence exist. A diagnostics-only frame sampler passed 2/2 unit tests for active intervals, rolling FPS, longest frames, draw/triangle peaks and local JSON export. `build:diagnostics` included its hook and a Chromium diagnostics smoke test passed; the production build audit confirmed the hook is excluded. No actual phone FPS measurements are claimed.

The twelve-entry test roster initially rendered only two tiles, then passed Chromium keyboard navigation and scrolling after test-only injection. Drag cancellation, 44-pixel footer controls and portrait Resume also passed 3/3. The full cross-browser suite is being rerun after these changes; reduced-motion and physical safe-area inspection remain pending.

## Engineering verification update (2026-09-29)

Both assignments now construct a required, immutable duo. The Crow-player tests cover Light, Heavy, Dodge and Wing Spin, movement speed, hit meter, healing, enemy targeting, Cow support, HUD ownership and partner knockout. Existing Cow numeric regressions remain green. Step tests cover solo continuation and lethal-tie defeat precedence. Session tests cover stale preparation, one launch, interruption and reset; the browser countdown tests cover zero pre-launch ticks, explicit Resume, retry and homepage clearing. The semantic move-to-clip mapping is checked in unit and Blender tests. Cow and Crow `.glb` and rigged `.blend` files were regenerated from the approved sources with Blender 5.2.2; the Blender suite passed 18/18.

The preparation error view initially lost the locked duo. A failing screen test was added, then the view was changed to retain both portraits and Retry; the focused test now passes. Separate touch taps and a held Enter across the fighter/partner boundary passed in Chromium and WebKit (14/14 focused browser cases). The full browser regression before those two added cases passed 57/57 with three expected skips. These skips are the diagnostics-only smoke test in the ordinary build and WebKit's offline relaunch case, where Playwright's offline navigation fails internally; physical Safari offline acceptance remains open.

The development cache passed a Chromium offline relaunch with 200/206/416 media responses, Crow/Cow gameplay, result, retry, return to homepage, Cow/Crow gameplay, result and retry. This uses a test-only defeat trigger to reach results; it does not prove full offline level completion on either phone. A damaged cache was reported as incomplete. The worker never forces activation or refresh. Two-tab/two-build waiting-update behavior and physical-device cache completion remain unverified.

The regenerated production build passed typecheck and the enhanced audit: 16 precached assets, 2.25 MiB total, with required character clips present and production test hooks absent. The `--final` audit remains intentionally pending because the intended soundtrack was not supplied. The eight-second WAV loop and bundled effects are development assets, not owner soundtrack evidence. Current offline readiness describes the cached development build only.

The production preview was inspected at 844×390 in Chromium for both Cow and Crow: each full body is framed within the preview panel, with readable identity, bars and confirmation text; merely previewing either fighter created no run. Browser tests at 667×375 passed cancellation, visible reduced-motion preview after a dynamic media change, and in-viewport footer bounds. The preview unit test verifies the reduced-motion Idle pose is held at time zero. T016 and T039 are complete for browser engineering; real device safe-area inspection remains T053.

An isolated Chromium update test now copies the test build to a temporary local server, loads two controlled tabs, changes the served worker bytes, and calls the browser's natural `registration.update()`. The replacement worker remained waiting while the Cow/Crow duo passed through countdown and combat, with no forced reload. The update notice appeared on the homepage and result screen, and remained absent during combat. The first test attempt incorrectly left both tabs uncontrolled and therefore let the new worker activate; after reloading both under the first worker, the test passed. This verifies the waiting path in Chromium, while a real deployment update on both phones remains T054. Playwright WebKit update emulation is skipped; physical Safari remains pending.

Final engineering regression after the held-key test timing correction: typecheck and 116 Vitest tests passed (30 files); 63 Playwright tests passed, with 3 documented skips. Blender passed 18/18. The production build and enhanced audit passed with 16 precached assets totaling 2.25 MiB; `git diff --check` passed. A subsequent full browser rerun is required after adding the isolated waiting-update test.

Still pending for implementation evidence: complete offline victories and final full-suite rerun after the update test. T050 remains unchecked. The user will provide iPhone 12, Pixel 6 and five-player observations. No device, intended-track, player-study or measured frame-rate result is claimed.

## Final engineering gate and acceptance status (2026-09-29)

After the update test was added, the complete browser suite passed 64/64 executed tests with four documented skips: the diagnostics-build smoke test in both ordinary browser projects, Playwright WebKit's offline relaunch, and the isolated WebKit waiting-update case. Typecheck passed; Vitest passed 116/116 in 30 files; Blender passed 18/18. Production build, 16-asset/2.25-MiB audit and `git diff --check` passed. The final-track audit is intentionally not claimed.

| Scope | Engineering evidence | Acceptance still required |
| --- | --- | --- |
| FR-001–006, FR-012–013; US1–2; SC-004 | Named tiles/stats, two activations, both duos, Back, pointer/touch/keyboard, cancellation, twelve-entry reachability, reduced-motion still pose and visual preview inspection passed. | Physical iPhone/Pixel safe-area and input checks. |
| FR-007–011; US3; SC-002–003 | Both-role combat, partner-loss/solo and tie regressions, countdown timing/interruptions, no stale or duplicate launch, result/retry and browser journeys passed. | Full phone runs and animation/readability review. |
| FR-014; US4; SC-005 | Denied storage/audio, placeholder music/SFX, cache integrity, 200/206/416 media, both-duo offline defeat/retry and Chromium two-tab waiting update passed. | Intended soundtrack, full offline victories/installed runs and real update behavior on both phones. |
| SC-001 and SC-006 | Protocol and diagnostic adapter prepared; diagnostic build smoke passed. | Five-player study and full soundtrack-inclusive FPS/long-frame/draw/triangle measurements on both phones. |

T050 and T052–T056 remain unchecked because those outcomes require a complete offline victory and/or owner-provided media, devices and participants. Implementation validation T057 is complete with these acceptance gaps explicitly retained. No requirement checklist item changed.
