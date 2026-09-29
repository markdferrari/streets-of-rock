# Quickstart and Validation: Lion and Plates

This guide reflects the implementation in progress. Lion, Plates, their role-aware
runtime behavior, character authoring commands, Blender assets and the character-builder
skill are present. Device, owner-art, soundtrack and participant acceptance remain open.

## Prerequisites

The 005 selected-role/session/platform and 006 visible-arena/partner behavior are
integrated in this checkout. Work is on branch `007-implement`, with Bun 1.4.2, the
existing lockfile and Blender 5.2.2. Final acceptance still requires owner visual and
gameplay review, intended soundtrack evidence, both reference phones and five testers.

From repository root:

```sh
bun install --frozen-lockfile
bunx playwright install chromium webkit
bun run dev
```

`validation.md` here maps FR-001–015 and story scenarios to automated/manual evidence.
For a fresh browser run, use `CI=1 bun run test:e2e`; to run Chromium where WebKit
dependencies are unavailable, use `CI=1 bun run test:e2e --project=chromium`. New
automatable behavior was developed test first; see the validation log for observed
red/green results and limitations. Cow/Crow profile snapshots and asset hashes are
recorded there and in the creation reports.

## Definition and workflow validation

After implementing the planned commands:

```sh
bun scripts/characters/validate.ts
bun scripts/characters/validate.ts --character lion
bun scripts/characters/validate.ts --character plates
```

Expect field/resource-specific errors for bad IDs, unsupported version/kind, invalid numbers and missing clips. Test scaffolding on temporary output rather than overwriting approved content. Exercise the actual character-builder skill for Lion and Plates, save brief/concept review/results in `reviews/lion.md` and `reviews/plates.md`, and compare unrelated resource hashes before/after. An unfinished concept review stays pending; it must not be represented as approval.

## Automated gates

```sh
bun run typecheck
bun run test:unit
bun run test:e2e
/usr/local/bin/blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py
bun run build
bun run audit:build
git diff --check
```

Vitest includes integration tests; Playwright uses Chromium/WebKit and a test build on port 4173. Avoid stale reused servers (`CI=1 bun run test:e2e` forces a fresh configured server). Rebuild production after browser tests and verify no test hooks/fixture characters. The 005 enhanced inventory audit must exist; the legacy index-only check proves nothing about new cached assets. All existing suites must pass before a conventional commit.

Required scenarios:

- JSON validation plus exact Cow/Crow profile migration; shared bars; complete semantic clips and role asset loading.
- Lion/Plates corresponding basic damage/reach/cycle and movement comparisons; existing Dodge, controls, meter and table rules.
- All ROAR and headrest boundary/cancellation/order cases in [specials contract](contracts/specials.md), including same-tick lethal outcomes, active hitbox cancellation and earliest physical collision with reversed actor IDs.
- All twelve ordered distinct duos through selection/countdown, player/partner identity, no AI Specials, HUD and retry. Reject four duplicate pairings.
- Each new player completes after partner knockout; status/projectile/prepared action resets completely. Existing Cow/Crow tests stay green.
- Load failures, denied storage/audio, explicit interruption/resume, complete asset cache and safe waiting update regressions.
- Definition/scaffold/skill invalid-input and unrelated-overwrite protection tests; actual two skill exercises, not just a scaffold test.

## Device and visual procedure

On iPhone 12/Safari and Pixel 6/Chrome record OS/browser/build and test each new player with existing partners plus Lion/Plates and Plates/Lion pairings. Inspect all action phases, broad swipe, long reach, ROAR radius/status versus boss impact, and visible headrest conjure/release. Review full-body previews and silhouettes before final acceptance. Repeat with sound muted, shake disabled and reduced motion; controls and warnings remain inside safe areas.

ROAR against a mixed prepared encounter: normals stop with unchanged health, boss loses health while continuing its move, released projectiles continue. Resume after hiding/rotating during stun and confirm exact remaining active duration.

Throw at a moving target, let another intercept, and attempt with none visible. Check straight trajectory, readable miss, one hit, no ally/table effect and no-target meter retention. Interrupt before release and after launch; confirm no duplicate throw or lingering object after retry/results.

After full caching, close/relaunch offline and play both new fighters through level/audio/results/retry, in installed mode where supported. Use HTTPS/localhost for service workers; plain LAN HTTP is not offline evidence. Denied playback/storage remains playable, but missing cached assets cannot claim offline-ready. Pending updates cannot replace a running or paused session.

## Performance and player evaluation

Use 005's implemented diagnostics and `bun run build:diagnostics`; collect complete soundtrack-inclusive runs with each new fighter and both new-character pairings. Include busiest encounter, multiple stunned enemies, headrest flight and 006 wide transition framing. Target 60 fps, require at least 30 fps in active busiest-encounter windows, record longest frames/stalls and inherited build/render budgets. Do not substitute empty-scene FPS or desktop emulation for phone evidence.

Five testers try both characters without coaching. Ask which is slower/stronger and which is faster/longer-reaching; at least four identify both correctly. Record responses and retain existing control/readability/completion gates. Tune numerical values with recorded evidence while preserving fixed Special semantics and Cow/Crow compatibility.

## Completion record

`validation.md` records FR/scenario mappings, red/green commands, build/asset
inventory, suite status and remaining acceptance evidence. Per-character reports record
workflow and provisional visual review. Final owner track, art approval, physical phones
and participants may remain unavailable, but their tasks remain incomplete. Passing
automated checks do not imply those acceptance gates passed.
