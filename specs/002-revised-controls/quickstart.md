# Quickstart Validation: Revised Controls

**Status:** Planned procedure. The revised controls are not implemented or accepted yet.
**Related:** [Spec](spec.md), [runtime contract](contracts/controls.md), [data model](data-model.md).

## Prerequisites

- Work on feature branch `feat/revised_controls`; use Bun 1.4.2 and the repository's locked packages.
- Use current repo commands: `bun install --frozen-lockfile`, `bun run typecheck`, `bun run test:unit`, `bun run test:e2e`, `bun run build`. Browser tests require the repository's Playwright browser installation.
- Before a commit, resolve the current baseline: 58 Vitest tests pass, while four browser cases in `tests/e2e/touch-combat.spec.ts` fail across Chromium/WebKit at the `Dodge attacks` and `Special 10%` expectations. Inspect actual encounter state and update fixtures/assertions to test intended behavior. Record a fully passing `bun run test` and build.
- For final device checks use iPhone 12 Safari and Pixel 6 Chrome, in landscape browser tabs and installed mode where supported. Record OS/browser versions, viewport/safe-area conditions, and whether the complete MVP asset/audio/offline work is ready.

## Automated validation route

1. Write a failing pointer test for initial visible fixed centre, inside-ring ownership, deadzone, beyond-ring clamp, independent action touches, normal release versus cancellation, and second-finger behavior. Observe expected failure; implement until green.
2. Write failing pure-game tests for Heavy startup/recovery/damage/knockback, combo reset only on start, range/depth/once-per-target, table damage without meter, enemy hit meter, rejected-resource requests, latest eligible buffer replacement, priority, expiry, cancellation, and retry clearing. Observe failure before implementing each behavior.
3. Write failing integration/browser checks for the diamond order and labels, pressed/readiness feedback, muted/no-shake legibility, first-run and legacy tutorial flows, storage failure, HUD precedence, pause/resume, orientation/focus loss, and result/retry. Observe expected failure before implementation. Migrate old Attack-labelled tests to Light only once the new behavior is in place.
4. Run `bun run typecheck`, `bun run test:unit`, `bun run test:e2e`, and `bun run build`. A commit requires the full suite to pass. The static build must remain free of test fixture exports and backend dependencies.

## Browser and phone procedure

1. Start a new game without touching the playfield. Confirm an outer ring and centred knob at left and the labelled diamond at right: Special top, Light left, Heavy right, Dodge bottom. Confirm HUD and central enemy warnings remain visible.
2. From a normal two-thumb grip, move Cow in horizontal, depth-only, and diagonal directions. Drag beyond the ring, then release; verify the anchor stays fixed, knob clamps/returns, and movement stops. Repeat with two movement fingers and a HUD tap.
3. Keep moving while tapping each action. Compare Light combo and single Heavy, including Heavy's committed recovery and knockback. Confirm Dodge direction, cooldown text, Special percentage/readiness, and no held-button auto-repeat or slide switching.
4. Mute music/effects and disable shake. Recheck labels, pressed states, Dodge readiness, Special progress, and attack warnings without relying on color. Record missed touches, grip changes, and occluded warnings.
5. During movement and a buffered attack, pause, background/foreground, rotate portrait/landscape, blur/focus, and retry after a result. Confirm neutral controls, centred knob, stopped active timer/audio, and explicit Resume with fresh touches.
6. Repeat controls and full run on both reference phones. Record frame intervals and visible stalls through the busiest encounter; target 60 fps, require at least 30 fps. Confirm Cow can win after Crow is knocked out and successful active duration remains near 3–5 minutes.
7. Once the MVP PWA is complete, cache online, close, disable networking, relaunch, finish and retry offline using all four actions. Repeat installed mode where supported. Verify audio, loading failure/retry, settings persistence, and between-run updates under existing MVP acceptance criteria.

## Five-player evaluation

Recruit five casual action players. Give no verbal control coaching. Record time from control availability to first movement and Light attack; at least four must do both within 30 seconds (SC-001). After the last relevant contextual prompt, provide a reachable enemy and full meter through gameplay or a prepared encounter, then time each player's correct Light, Heavy, directed Dodge, and ready Special demonstrations; at least four must complete all four within two minutes (SC-007). Record separate 1–5 responsiveness and readability ratings; at least four must rate each at least 4 (SC-004). Record attempt count, first successful active duration, Crow survival, recurring confusion, grip changes, and device/browser version. Preserve SC-002/003 complete-level and duration gates.

Document actual results and failures. The procedure itself is not evidence that the feature or MVP passes acceptance.
