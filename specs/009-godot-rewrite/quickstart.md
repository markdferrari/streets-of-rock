# Quickstart and Validation: Godot Rewrite

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Status and prerequisites

This is the intended validation interface for implementation. The current repository
still contains the JS game; the Godot project, new scripts and presets listed below
must be delivered by the implementation tasks. Their presence here is not a test pass.

Use branch `009-godot-rewrite`, standard Godot 4.7.2, matching official web templates,
Bun 1.4.2, Node 24.21.0, Blender 5.2.2 LTS and Python 3.12.3. The editor is installed
on the current host; web export templates are not. Pin GUT 9.7.1 and repository tool
dependencies. Physical validation needs iPhone 12/Safari, Pixel 6/Chrome, intended-track
confirmation, visual reviewers and five first-time casual players.

Run commands from the repository root. Do not run export commands against a bare
template or count missing scripts/browsers as passing. Record actual environment/build
identities and any skip or external dependency.

## Existing baseline commands

These commands work with the existing project before the port:

```sh
bun install --frozen-lockfile
bun run typecheck
bun run test:unit
bun run test:e2e
bun run build
bun run audit:build
blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py
```

Install Playwright Chromium/WebKit and required host libraries when absent. The current
host has project-local browsers and a libavif16 bundle; the following existing override
supports baseline tests without changing global libraries:

```sh
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers LD_LIBRARY_PATH="$PWD/.browser-libs/usr/lib/x86_64-linux-gnu" bun run test:e2e
```

A sandbox that blocks localhost listeners requires the normal approved test-server
execution path; a bind failure is infrastructure failure, not a game regression.
Record the earlier 167 passing unit/integration tests and timing-sensitive browser
results as historical baseline only, then establish current evidence before cutover.

## Planned setup and development commands

After their implementation:

```sh
bun install --frozen-lockfile
bun run setup:godot
bun run playwright install chromium webkit
godot --headless --path . --import
bun run dev
```

setup:godot verifies the editor and locked official archive and installs project-local
templates, as defined in the [delivery contract](contracts/delivery.md). dev opens the
Godot editor at the root project. For browser iteration:

```sh
bun run build:test
bun run preview -- --dir dist-test --host 127.0.0.1 --port 4173
```

The preview wrapper accepts the shown directory/host/port flags and serves correct
WASM/PCK MIME types. It must return errors for missing immutable resources.
Godot editor play is useful development feedback; acceptance uses exported browsers.

## Planned verification commands

| Command | Expected outcome |
| --- | --- |
| bun run typecheck | Godot import/static script checks and retained TypeScript tooling checks pass; parser errors fail the command. |
| bun run test:godot | GUT unit/integration tests pass with a nonzero process status on failure. |
| bun run test:platform | Vitest browser-adapter, packaging and authoring-wrapper checks pass. |
| bun run test:parity | Recorded legacy fixtures match Godot states/events and camera-dependent inputs within the runtime contract. |
| bun run test:unit | Runs test:godot and test:platform; includes still-unretired legacy suites during migration. |
| bun run test:e2e | Builds Web Test and runs both configured browser projects against it. |
| bun run test:blender | Runs the existing Blender suite and propagates failures. |
| bun run test | Runs all unit, parity, e2e and Blender gates, including still-active legacy suites. |
| bun run build | Exports Web Release and packages a complete static dist release. |
| bun run build:diagnostics | Exports read-only diagnostics build to dist-diagnostics. |
| bun run audit:build | Checks release inventory, resources, budgets, engine exception and absent test/diagnostic hooks. |
| bun run audit:build -- --final | Additionally requires actual intended soundtrack evidence and completed release evidence inputs. |

Representative direct Godot test invocation:

```sh
godot --headless --path . -s addons/gut/gut_cmdln.gd -gdir=res://tests/godot -ginclude_subdirs -gexit
```

Build wrappers invoke --export-release or --export-debug with the documented preset
into staging, then apply the release contract. A raw Godot export alone is not the
packaged/PWA release. The runner must surface script/load errors as failures even if
a tool's process status is insufficient on its own.

For TDD, run the owning focused suite, record the intended failing assertion,
implement the minimum behavior, then rerun/refactor. Do not use a missing dependency
or broken runner as the expected behavioral failure. Run all applicable suites before
any conventional commit.

## Reference capture and migration evidence

Before deleting legacy code, implement and run `bun run reference:capture` against
the pinned reference implementation, recording content identity and timestamps,
input/viewport/arena data, state and events. Capture matched visual references at
667x375, 844x390 and 915x412 plus the selected phone layouts.

Create a coverage register mapping each current PRD/feature acceptance scenario and
existing test to its replacement test or named physical procedure. Identify intentional
specification corrections separately. Parameterize all twelve duos as independent
tests; move exact combo-window assertions to deterministic replay while retaining
real-touch browser scenarios. Do not mark a flaky combined suite green because an
isolated rerun passed.

## Foundation slice before broad integration

Export one actual rigged fighter with manual pose sampling, scalar camera framing,
a Godot control, simultaneous joystick/action input, semantic browser focus/activation,
gesture audio and lifecycle pause/resume. Verify complete engine/PCK offline reload,
first-install cache status, source-to-import resource checks and a forced split-pack
fixture. Confirm the release variant has no mutation hooks.

Run browser checks early and physical phone smoke checks as soon as devices are
available. An absent device does not prevent independent rules/authoring work, but
platform support and final acceptance remain pending. A demonstrated engine/browser
failure blocks the affected integration until corrected; do not silently weaken scope.

## Automated end-to-end scenarios

1. Every ordered distinct duo: preview/confirm, disabled duplicate, Back, preparation,
   3–2–1, role-correct HUD/actions, defeat/victory, retained-duo reset and home.
2. Four fighters: Light/Heavy/dodge/Special timing and meter; no-target behavior,
   ROAR stun/boss distinction, swept headrest interception/miss/expiry; solo continuation.
3. Four rooms: original bounds/waves/tables, correct new visual identity, all connectors,
   GO suppression/reset, boss phases and lethal ties.
4. Physical canvas input separately from semantic DOM: real multi-touch/cancel,
   release/drag, held keyboard suppression, twelve-entry test roster, modal focus,
   stale semantic generations and safe-area resizing.
5. Preparation and each countdown numeral interrupted by hide/blur/portrait; pauses
   during actions/projectiles/stun; no elapsed inactive time or carried input.
6. Same-origin old saved settings/tutorial/best values; corrupt/denied storage and
   rejected audio; one music owner with independent levels.
7. Missing/invalid models, clips, props and scenery; stale loads, retry; audio/cache-only
   failures permit otherwise-ready play.
8. Cold/offline launch, complete victory/results/retry, missing/corrupt cache and repair,
   quota errors, wrong IDs, two old/new windows and updates across all locked phases.
9. Actual release smoke, inventory/mount checks, no source/test/diagnostic leakage,
   forced pack splitting and ten lifecycle cycles with stable owned-instance counts.

## Phone, art and five-player procedures

Record build ID, OS/browser, viewport/safe area, duo and settings for every procedure.

- **Touch/readability:** Play all fighters on both phones with music/effects muted and
  shake disabled, then reduced motion. Exercise simultaneous joystick/actions, canceled
  touches, edge positions, long drags, orientation changes and GO. Inspect 90% combat
  view coverage, labels, telegraphs, partner visibility and distinct interactive tables.
- **Accessibility:** Test keyboard focus and selection on desktop and VoiceOver/TalkBack
  on phones. Confirm names, pressed/disabled states, meters, countdown, errors and
  modal focus restoration agree with the visible Godot UI.
- **Art:** Review all four camera-composited concepts before final production, then all
  four rooms in busy gameplay. Record required cues, consistent branding, rightward
  entrance, quiet floor, no false platforms/exits, no gaps and no flashing/strobing.
- **Audio/lifecycle:** Use intended music and effects; activate from real gestures,
  pause/resume/retry, background and rotate during countdown and both new Specials.
  Confirm one music track, independent levels, frozen durations and explicit resume.
- **Offline/update:** Cache online, close, disable networking, reopen, finish all rooms
  and retry. Repeat installed mode where supported and with two windows awaiting an
  update. Include upgrade from the original JS release with saved records.
- **Performance:** Use the diagnostics build to record active-run frame intervals,
  one-second rolling FPS, longest frames, draw calls/triangles and ten lifecycle cycles.
  Keep at least 30 fps in the busiest encounter, target 60 fps; confirm identical
  content/settings in the release and repeat visible-stall checks there. Exclude
  selection/loading/countdown/paused/hidden/results samples from active-run summaries.
- **Players:** Five first-time casual players attempt selection and play without
  coaching. Record every PRD SC-001–011 outcome separately: learning within 30 seconds,
  completion within three attempts, first success 3–5 active minutes, separate
  responsiveness/readability >=4/5, four-action demonstration within two minutes
  after the last relevant prompt, correct AI-role understanding, GO direction within
  three seconds, Lion/Plates differentiation, and all four settings without labels.
  Apply the PRD's >=4/5 threshold per applicable criterion.

## Authoring and final acceptance

Run full and per-character validation through the retained CLI, exercise Lion/Plates
update/validate workflows, and record new reports plus unchanged unrelated-resource
fingerprints. See the [authoring contract](contracts/authoring.md) for scoped commands.

Store actual outputs in this feature's validation/reviews/evidence directories during
implementation. No created plan or passing document check marks runtime tests, intended
soundtrack, concept approval, phone performance or player evaluation complete.

Before cutover, require the coverage register, Godot/parity/browser/Blender suites,
release export/audit and actual acceptance evidence. Remove superseded JS runtime/tests
only after replacements and records exist; keep the previous deployable release for
rollback. This workflow does not provision or publish hosting.
