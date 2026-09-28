# Quickstart and Validation: Lion and Plates

This is a future implementation validation guide. Planning has not created characters, configuration scripts or the character-builder skill.

## Prerequisites

Integrate 005 selected roles/session/platform and 006 visible arena/partner behavior. Use branch `007-lion-plates-characters`, Bun 1.4.2, existing lockfile and Blender 5.2.x. Final acceptance requires visual concept/gameplay review, intended soundtrack, both reference phones and five testers. Do not interpret prior feature documents as working runtime code.

From repository root:

```sh
bun install --frozen-lockfile
bunx playwright install chromium webkit
bun run dev
```

Before implementation create `validation.md` here mapping FR-001–015 and every story scenario to evidence. Each automatable change starts with a meaningful failing test and recorded reason, then implementation/refactor with green results. Preserve Cow/Crow numeric/visual baseline before moving configuration.

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

`validation.md` records FR/scenario mappings, red/green commands, build/asset inventory, device versions, frame evidence, solo/offline outcomes and participant results; per-character reports record concept and workflow evidence. Final owner track, reviews, physical phones and participants may remain unavailable, but their tasks remain incomplete. No runtime acceptance is implied by this plan.
