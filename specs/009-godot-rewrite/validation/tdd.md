# TDD evidence

## Pinned setup (T004/T005)

Red: `bunx vitest run tests/tooling/godot-setup.test.ts` — four assertion failures: version mismatch accepted, corrupt bytes accepted, wrong install directory, runner failures swallowed. All imports/runner executable (evidence/setup-red.log).

Green: same command — four tests passed after implementation (evidence/setup-green.log).

## Reference schema/comparator (T008)

Red/green: `bunx vitest run tests/tooling/reference.test.ts` — four behavioral failures with executable stubs, then all four passed (evidence/reference-red.log, evidence/reference-green.log). Ordered events, exact outcomes, absent-to-null and continuous tolerance are covered.

## Shared catalogue (T010–T012)

Red/green: `bun run test:godot` — four behavioral failures against callable catalogue/validator stubs, then 32 assertions passed (evidence/catalogue-red.log, evidence/catalogue-green.log). Stronger malformed definition rejection is a specification correction; shipped definitions were moved byte-for-byte.

## Imported rig / ownership (T015/T019)

Red/green: `bun run test:godot` — observable readiness/pose/ownership failures, then 74 assertions across six tests passed (evidence/import-red.log, evidence/import-green.log). Imported clip sanitization required explicit semantic aliases.

## Export and browser adapter (T013/T017)

Red: `bunx vitest run tests/tooling/export.test.ts` and `bunx vitest run tests/platform/bridge.test.ts` — six and four expected contract failures respectively with callable stubs. Green: same commands all pass (evidence/export-*.log, evidence/bridge-*.log).

## Cache audit and preview server (T018/T020)

Red: focused Vitest tests demonstrate empty/duplicate inventory incorrectly ready and incorrect MIME/missing-asset/traversal responses (evidence/cache-red.log, evidence/preview-red.log). Green: `bunx vitest run tests/tooling tests/platform` — 21 tests passed (evidence/platform-green.log). Actual engine/browser checks follow.

## Actual web foundation (T014, T017–T019)

Red: the first actual exported fixture reached ready, but canvas activation remained 0 and blur did not pause (`evidence/browser-red.log`). After implementation, canvas/semantic/audio/lifecycle passed on Chromium and WebKit. The next native multi-touch test reproduced a canceled action, then a focused adapter test reproduced the absent cancellation notification (`evidence/touch-cancel-red.log`). After the native-identifier capture notice and Godot source cancellation, all six executable browser checks pass (`evidence/browser-green.log`); two WebKit host-capability checks remain skipped for physical Safari.

The reusable Godot gesture Control also has an observed assertion failure and passing regression (`evidence/gesture-red.log`, `evidence/gesture-green.log`). No missing engine, import, or browser runner is counted as a behavioral red.

## Exported byte audit and private scan marker

Red/green: `bunx vitest run tests/tooling/export.test.ts` rejects absent/modified/unlisted assets (evidence/audit-red.log, evidence/audit-green.log). The preview regression first served `.gdignore`, then correctly returned 404 after excluding build scan markers (evidence/preview-marker-red.log, evidence/preview-marker-green.log). Exact artifact audits also detected imported SVG sidecars contaminating previous outputs; output roots now retain scan-ignore markers, excluded from served inventories and blocked by the preview server.

## Actual bone sampling and runner summaries

Red: real imported Skeleton3D bone rotations did not change even though sample_time changed (evidence/bone-sampling-red.log). Green: manual callback mode plus explicit advance updates the actual bones while playback remains stopped; eight GUT tests, 81 assertions pass (evidence/bone-sampling-green.log). This verifies rendering behavior independently of sample-time bookkeeping.

Red/green: the runner initially missed GUT's real `Failing Tests         1` summary when status was zero; the focused setup test reproduces this, then the corrected optional-colon parser passes (evidence/runner-summary-red.log, evidence/runner-summary-green.log). Template download/checksum handling now streams the archive to bound memory.

## Phases 3–4 continuation: deterministic rules and playable session

- Clock/constructor tests first failed against callable placeholders: `us1-clock-red.log`;
  actual constructor/accumulator/countdown/wall-clock behavior passes in `us1-clock-green.log`.
- Combat/Special/AI/progression assertions failed against the no-op step: `us1-rules-red.log`.
  Source rule ordering/tuning was ported before cleanup; expanded cases pass in
  `us1-rules-expanded.log`, with all 26 exact reference replays in `us1-parity.log`.
  JSON-derived combo indices needed integer formatting; no tuning value changed.
- Source camera fitting failed before implementation: `us1-camera-red.log`; camera
  equations and explicit ArenaContext are also checked at every replay frame.
- Selection/generation/countdown/reset/tutorial failures: `us1-session-red.log`.
  Input ownership/freshness failures: `us1-input-red.log`. Combined implementations
  pass in `us1-session-input-green.log`. Scalar normalization fixed Vector2 precision.
- Actual canvas/keyboard journeys observed missing gameplay against the existing
  fixture, then snapshot publication revealed a callback-return limitation. Corrected
  explicit JSON publication passes in `us1-browser-integration.log`; the full combined
  Chromium/WebKit rerun is `us1-browser-full.log`.
- Visual review added regressions before corrections: preview camera tree access
  (`us1-preview-errors-red.log` / `us1-preview-errors-green.log`), retired actor render
  ownership (`us1-world-cleanup-red.log` / `us1-world-cleanup-green.log`), original touch
  geometry (`us1-control-layout-red.log` / `us1-control-layout-green.log`).

## Phase 4: approved vector scenery and required readiness

- Catalogue/SVG/budget tests failed against initial validator stubs, then passed:
  `us2-catalogue-svg-red.log` / `us2-catalogue-svg-green.log`.
  Expanded opacity, offset-background and CSS-animation assertions reproduced
  permissive validation: `us2-static-svg-red.log` / `us2-static-svg-green.log`.
- Loader tests were added before implementation (`us2-preload-red.log`; the
  initial missing callable is setup evidence). Actual imported-resource assertions
  then failed because mipmaps were disabled, and required readiness correctly
  refused the final panels: `us2-import-red.log`, `us2-final-import-red.log`.
  Explicit mipmap imports and atomic all-eight readiness pass in `us2-unit.log`.
  Null/wrong-size imports leave no partial texture set and expose resource errors.
- Camera-edge assertions exposed lower corners at 667px before the backing was
  extended: `us2-geometry-red.log` / `us2-geometry-green.log`. Static scene tests
  prove unchanged level data and no new collision or animation nodes.
- Actual exported browser scenery checks first observed absent final panels:
  `us2-browser-red.log`. A test incorrectly expecting tables before bar entry
  failed separately (`us2-browser-table-expectation-failure.log`); source tables
  appear on bar entry. Room waits now include both areaIndex and encounter state
  to avoid reading the previous published frame.
- Paused GO overlap failed before safe placement included all visible messages
  and controls: `us2-go-overlay-red.log` / `us2-go-overlay-green.log`.
  Actual connector screenshots exposed the unavailable arrow font glyph;
  `us2-go-glyph-red/` retains those images and `us2-go-glyph-red.log` the
  text regression. Native vector drawing is visible in final captures.
- Pack tests were added before the required-eight import audit:
  `us2-pack-art-red.log` / `us2-pack-art-green.log`. All current mode audits
  require the actual final import paths and reject concept-only substitutes.
- Final combined headless and scenery/input browser results are
  `us2-unit.log` and `us2-browser-final.log`; all executable cases pass.
  The broader duo/foundation browser gate passed in `us2-browser-full.log`.

The owner's actual concept approval preceded final production; four technical
in-game reviews and six connector/clearance captures are recorded in
[backdrops-final.md](../reviews/backdrops-final.md). Phone/player acceptance
remains separate and pending.
# Phases 5 and 6 — additional regression evidence (2026-10-10)

Tests preceded the persistence/browser/audio/resource/tooling changes. Additional
observed defects were reproduced and corrected during browser integration:

- Worker `CACHE_STATUS` detail overwrote the bridge event name; the bridge regression
  failed before `{...detail, type}` corrected delivery to Godot readiness.
- Settings volume updates rounded 0.4 to 0 because native ranges default to integer
  steps; the browser assertion passed after `step=any`.
- Settings close left focus on the document because the opening button was removed
  before its ID was captured. The actual Chromium focus assertion failed, then passed
  after capture moved before removal. Stable node identity and modal wrap also pass.
- `--character` without a value incorrectly validated the full roster; its negative
  CLI test failed before explicit argument validation.
- An external project's portrait mapped to a GLB passed despite the advertised
  imported checks. The actual Godot subprocess rejection test failed, then passed
  after imported portrait texture validation; `--root` now selects the correct project.
- Diagnostics FPS averaged the raw 120-sample buffer: a mixed-rate test observed
  40 FPS instead of the latest-second 100 FPS. The test passes after suffix-window
  sampling. Structured bridge JSON download is additionally verified in Chromium.

Final platform, GUT, affected browser, three-mode audits and authoring rejection/
preservation checks pass. Unavailable physical-device acceptance remains pending.


## Phase 7 — final audit evidence integrity (2026-10-13)

Red: `bun run test:platform tests/tooling/release-audit.test.ts` produced four
behavioral failures: six pass flags omitted art/character reviews; missing/stale/
changed evidence was accepted; missing/escaping paths were accepted; unapproved or
unlicensed/replaced music was accepted. See `evidence/phase7-audit-red.log`.

Green: `bun run test:platform` passes 57 tests after the final gate requires all nine
review families, build-bound file references and matching SHA-256 plus configured
soundtrack identity, owner approval and licensing. See `evidence/phase7-audit-green.log`.
These synthetic validator fixtures establish rejection rules, not product acceptance.

## Explicit owner waiver and runtime cutover — 2026-10-14

`bun run test:platform` first failed two new behavioral cases: an explicit current-build
owner waiver was rejected, and an undocumented waiver did not report the required
owner-decision failure. See `evidence/cutover-waiver-red.log`. The validator now accepts
only the four manual categories with digest-verified, matching-build owner decision
and reason; it still rejects attempts to waive soundtrack or other nonmanual gates.
All 59 platform/tooling tests pass (`cutover-waiver-green.log`).

Authoring contract tests now use the real imported Godot validator, including alternate
root, full/per-character, missing bundled file and invalid argument cases; they passed
before the fallback removal and again after it. Cutover deletes mapped owners and
changes static runner/dependency configuration; existing GUT/replay/platform/browser
suites validate the remaining implementation without artificial deletion tests.
