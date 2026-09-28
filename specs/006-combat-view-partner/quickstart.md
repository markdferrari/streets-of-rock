# Quickstart and Validation: Combat View and AI Partner Improvements

## Prerequisites

Use branch `006-combat-view-partner`, Bun 1.4.2 and the locked package versions. Integrate feature 005's selected roles/session, audio/settings and complete PWA audit first for full acceptance. The current checkout still has fixed Cow/Crow gameplay and no completed platform implementation: its legacy behavior is baseline evidence, not a passing two-role/offline release.

No assets need regeneration for this feature. Retain the existing Blender 5.2 regression suite and final bundled soundtrack. Use iPhone 12/Safari and Pixel 6/Chrome for physical acceptance; installed/offline validation needs HTTPS or localhost, not plain LAN HTTP.

From the repository root:

```sh
bun install --frozen-lockfile
bunx playwright install chromium webkit
bun run dev
```

## Baseline and test-first procedure

Before changing framing, record the integrated 005 build ID, four room bounds/spawn definitions, and matched room screenshots at 844×390 and 915×412 landscape CSS pixels plus actual phone viewport sizes. Use identical actor coordinates, game phase and graphics settings before/after. Record projected floor polygon area divided by viewport area; do not use canvas size as the sole metric.

Create `validation.md` in this feature directory during implementation, mapping FR-001–012, story scenarios and SC-001–006 to automated and manual evidence. For every rule add the failing regression first, record its expected failure, implement, then record passing results. Do not merely replace old numeric assertions with implementation details.

## Automated scenarios

- Parameterize both duos. Put a valid enemy near the partner while moving the player farther away within the arena: no separation-driven chase cancellation or repositioning. Finish a valid six-tick support action without changing cadence/damage.
- Check left/right pursuit, regrouping and attack facing, equal-horizontal target position, pure depth motion and sub-deadzone jitter. KO partners remain inactive and do not control player Special/progression.
- Filter off-screen/dead/unreachable targets while retaining existing threat ranking. With no eligible target, verify idle/regroup hysteresis rather than target/follow oscillation.
- Attempt a genuinely blocked route for 120 active ticks after alternate movement attempts; assert safe recovery with unchanged HP/enemies/meter/cooldown/progression. Repeat with stationary attacking, cooldown, pause, invalid destination and ordinary separation: no recovery.
- Test camera math at both reference aspects, smaller landscape layouts, body-envelope extremes and viewport shrink. All required body corners fit; fixed angle/room geometry stay identical and stable-room floor coverage increases over baseline.
- Cross all three doorway gaps with the partner initially at the far side of the outgoing room. Both remain visible, the partner moves by profile speed, entry/wave progression remains player-driven, and temporary widening settles after natural arrival. Knock out the trailing partner and ensure it cannot delay the camera or progression.
- Test intermediate-wave clearance versus final-wave unlock, travel, next-room entry, retry, defeat and final boss victory. GO derives from actual next route; include a synthetic leftward route without shipping new content.
- Verify exactly one visible cue, accessible direction announcement, no pointer interception, non-overlap with safe areas/HUD/controls, and static reduced-motion behavior.
- Interrupt approach/attack/doorway travel by blur, hide and portrait rotation. Assert no partner action or active time advances until explicit Resume, and no stale input/cue/recovery occurs.

After implementation:

```sh
bun run typecheck
bun run test:unit
bun run test:e2e
/usr/local/bin/blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py
bun run build
bun run audit:build
git diff --check
```

Playwright serves a test build on port 4173; avoid reusing an unrelated server. `CI=1 bun run test:e2e` enforces a fresh configured server. Rebuild production afterward for its audit. The enhanced 005 audit must exist; the current index.html-only audit cannot substantiate cache/budget claims. All existing suites must pass before a conventional commit; this documentation-only planning phase creates no commit.

## Physical phone procedure

1. Record device, OS/browser, build, landscape viewport, graphics/audio preferences and selected duo. Repeat both assignments on each phone.
2. Fight while walking away from a partner actively approaching/attacking. Observe no distance-driven pulling, backwards sliding or useless follow oscillation. Move near all room edges and perform all three transitions with varied initial separation.
3. Compare captured stable-room views against baseline: larger displayed combat area, reduced unused space, unchanged angle/room bounds. Exercise simultaneous joystick and each action; cancel touches and resize browser chrome. Check warnings, player/partner bodies, HUD and safe-area overlays.
4. Clear each room. Arrow/text must point toward progression, persist through travel and disappear at entry. Pause/resume during travel, retry after defeat and beat the final boss; no stale/final arrow. Repeat muted, shake-off and reduced-motion.
5. Background, lose focus and rotate during pursuit/attack/travel; explicit Resume must restore the same safe state and cue with no hidden progress or sudden partner movement.
6. After successful current-build caching, close/relaunch offline and complete full run, audio, results and retry. Repeat installed mode where supported, denied audio/storage, failure/retry and pending-update cases from 005. Record missing prerequisites rather than passing them by assumption.

## Performance and player evaluation

Use feature 005's implemented diagnostics-only frame sampler and `bun run build:diagnostics`. Record both fighters' complete runs, including busiest encounter and the widest transition frame, full soundtrack/assets, longest frames and visible stalls. Target 60 fps and require at least 30 fps in active one-second windows during the busiest encounter. Check inherited triangle/draw-call/build budgets; no measurements from an empty scene count as acceptance.

For five first-time casual action players, start timing when the first unlocked GO cue appears; ask them to indicate where to go without coaching. Record direction/time, with at least four correct within three seconds. Continue existing PRD combat-readability/usability evaluation and record any partner behaviour confusion. Do not infer general market results from this formative sample.

## Completion evidence

Record commands, red/green results, matched screenshots/projection metrics, partner recovery events, viewport/body containment checks, frame records, cached build identity, track identity and participant outcomes in `validation.md`. Missing hardware/track/005 prerequisites remain explicitly pending. This plan and its document checks are not runtime acceptance; proceed to task generation before implementation.
