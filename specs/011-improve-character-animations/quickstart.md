# Quickstart and Validation: Fighter and Companion Animations

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Contracts**: [presentation](contracts/animation-presentation.md), [assets](contracts/animation-assets.md)

## Status and prerequisites

This is the implementation validation guide. The proposed profiles, hero validation option and review fixture are not implemented by planning. Use branch `011-improve-character-animations`; preserve unrelated work and existing feature evidence. Run commands below from the repository root.

Use pinned Godot 4.7.2 and locked matching web templates, Bun 1.4.2, Blender 5.2.2 LTS and repository dependencies. The supplied samples live under `/home/mark/projects/godot/assets/KayKit_Character_Animations_1.1` and `/home/mark/projects/godot/assets/Universal Animation Library[Standard]`. Keep them read-only; retain selected copies and licenses in the repository through the provenance workflow. Physical acceptance requires iPhone 12/Safari, Pixel 6/Chrome, intended soundtrack, owner review and five playtesters.

## Existing setup and baseline commands

```sh
bun install --frozen-lockfile
bun run setup:godot
godot --headless --path . --import
bun run typecheck
bun run test:godot
bun run test:blender
bun run validate:art
```

`setup:godot` verifies/installs the locked tooling as needed; it does not expose a separate `--verify` mode. Browser binaries may need the repository's existing Playwright setup. Do not upgrade dependencies to resolve an environment issue without investigating the pinned installation.

Before asset/runtime edits, record baseline build and character-source hashes, all four characters' idle/move/actions, both facings and matched camera/settings. Preserve feature 010's historical evidence. Write meaningful failing replacement tests for superseded seven-bone/hash assumptions, and failing new behavior tests, before implementation. Document the manual procedures below before producing motion.

## Build and run existing app

```sh
bun run build:test
bun run preview -- --dir dist-test --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/`. Once implemented, the planned `?fixture=hero-animation` route supplies repeatable actual-character comparisons and action review in Web Test only. It must not appear in Web Release. Ordinary `/` gameplay remains required for integration validation.

## Proposed hero validation commands

After implementation extends the current validator:

```sh
bun run validate:art -- --character cow
bun run validate:art -- --character crow
bun run validate:art -- --character lion
bun run validate:art -- --character plates
bun run validate:art
```

Expected: each focused command verifies source/profile/provenance plus real imported animation; unfiltered validation covers all heroes and existing scenery/enemies/props. A malformed profile, missing clip, invalid track, stale hash or unresolved dependency exits nonzero with the character/source and repair action. `--definitions-only` cannot count as import or release acceptance.

## A. Candidate comparison and articulated export

For each character, run both source trials using exact file/clip names, not assumed names shared between KayKit rig sizes. Compare current, KayKit and Universal idle, travel and representative attack at the same normal gameplay scale, camera, lighting and speed, both facings. Record source hash, target-rig revision, coverage gaps, defects, size and adaptation effort. Produce four composite comparisons from eight trials and record owner feedback plus a source/custom decision before full production.

Inspect upper/lower limb articulation, planted stance, Crow's wings/feathers, jackets/horns/mane and Plates' complete rigid body/face. Check no donor mannequin geometry ships. Save editable rigged sources; export and freshly import each runtime GLB. Confirm exact semantic coverage, bounded root translation, continuous loop/phase samples, correct bone targets/weights, preserved materials and safe batching. A successful import is not visual approval.

## B. Complete fighter motion

For Cow, Lion, Crow and Plates in each facing: preview, idle, forward/backward/depth/diagonal travel, start/stop, turn, wall blocking, all three Light hits, Heavy, Dodge in supported directions, Special, hit and knockout. Include full-speed and slowed boundary playback. Required outcome: stable identity, no rest-pose flashes/detached parts/unintended snaps, no sustained steady-travel foot sliding, distinct Light strikes and Heavy, truthful Special contact/release.

Exercise buffered follow-ups and action boundaries. Compare visible contact to existing action windows; unchanged deterministic traces must show the same damage, reach, meter, timing and results. Hit reactions must not cancel actions or postpone a legal input. Cow/Crow spin exactly once under a single visual owner; Lion's ROAR and Plates' prop release match the existing effect tick. No duplicate headrest projectile or added world displacement.

## C. All twelve duos and independent presentation

Test ordered pairs: Cow/Crow, Cow/Lion, Cow/Plates; Crow/Cow, Crow/Lion, Crow/Plates; Lion/Cow, Lion/Crow, Lion/Plates; Plates/Cow, Plates/Crow, Plates/Lion. Cover every partner's pursuit, ordinary following, catch-up, depth-only facing, obstruction recovery, support hit, damage, knockout and solo continuation.

Verify support contact at the immediate `partner-hit` event; readying/follow-through never inserts AI windup/recovery. Run two different simultaneous actor actions and a preview/gameplay isolation test. Exercise multiple fixed steps before rendering and repeated renders without a step. No event is applied twice, gait does not alternate spuriously between Move/Idle, and one actor cannot reset another's pose. Ten Home/run/retry/dispose cycles return to the same settled owned-resource count.

## D. Pause, terminal fall, touch and reduced motion

Interrupt movement, attack phases, hit reactions, knockout and countdown through pause, background, focus loss and portrait rotation. Return and wait before explicit Resume: motion and active time stay frozen, inputs are clear. Resume continues the same action without a second hit or skipped release.

Cause fighter knockout on the terminal tick. Results and Retry/Home must appear immediately while only the residual fall settles. Record unchanged simulation state, run time, score, projectiles and audio through settling. Interrupt the residual fall and explicitly Resume to results; combat cannot restart. Retry during settling discards it and starts a fresh duo. Reduced motion permits a final inactive pose and uses still selection previews; other essential cues stay readable.

On both phones, hold movement and use each action with sound muted and shake disabled. Cancel touches and vary landscape safe areas; no stuck input, hidden control or obscured enemy warning. Review busy overlaps in all four rooms, not only isolated characters.

## E. Readiness, offline, credits and updates

In isolated test fixtures, remove/corrupt one required hero model, profile binding and physical clip separately. Preview/run preparation must fail actionably with the duo retained and Retry available. Repair and retry starts once. Complete an abandoned load generation after a new preparation and verify it cannot replace current assets/errors.

Cache the complete release, close it, disable networking and reopen. Select, play a full level, reach results and retry on both reference phones; collectively cover all four characters in both roles. Check generated artwork credits offline. Repeat with cache failure, denied audio and unavailable storage: loaded online play remains usable where permitted and offline readiness is never falsely claimed. Test a waiting update during preparation/countdown/running/paused states; assets remain from one release until the existing safe boundary.

Browser automation is supplementary: existing WebKit offline emulation may be skipped, so a real Safari offline run is required. Fixture commands that skip encounters do not count as physical full-run evidence.

## F. Full-suite and release validation

Existing commands, after implementation and meaningful test registration:

```sh
bun run typecheck
bun run test
bun run test:art
bun run validate:art
bun run build
bun run audit:build -- dist
```

`bun run test` includes platform/GUT, parity, browser/release and Blender suites. New `tests/e2e/hero-animation.spec.ts` must be explicitly included in `playwright.godot.config.ts` testMatch. Use focused suites during red–green–refactor; run the complete existing suite before any conventional commit. Missing suites/tool execution are failures to verify, not passes. Check changes for valid secrets before committing.

Do not update expected simulation traces to accommodate this visual feature. Scope old feature 010 hero-freeze tests to their historical purpose while preserving unchanged source/enemy/scenery guarantees. Replace rigid-bone assumptions with actual attachment, deformation and motion assertions.

## G. Phone performance and five-player evidence

```sh
bun run build:diagnostics
bun run preview -- --dir dist-diagnostics --host 0.0.0.0 --port 4173
```

Use the established secure-origin phone/PWA test setup; a LAN HTTP preview alone does not establish service-worker/offline acceptance. Record build/asset identity, phone OS/browser versions, duo/settings, viewport/render density and full-run frame intervals including busiest encounters with intended soundtrack. Target 60 fps; every active one-second window in the busiest encounter must reach at least 30 fps on each phone. Report loading/transitions/stalls separately; exclude paused/hidden/results frames from active FPS summaries. Retain whole-scene geometry/draw/texture limits and record total content, largest file, engine, cached and compressed bytes. Compare actual release and diagnostics content identity.

Show five testers matched before/after gameplay for all four characters and both roles, counterbalancing order. At least four must prefer the improved motion; at least four must distinguish Light from Heavy, identify each Special and recognize an inactive companion without coaching, each judgment recorded separately. At least four must rate responsiveness and readability >=4/5 separately. Retain Lion/Plates style checks under PRD SC-010 and other inherited gameplay acceptance obligations.

Store actual artifacts under this feature's `reviews/` and `validation/`, with the [evidence fields](data-model.md). Generate build-bound `validation/acceptance.json` only with real outcomes and explicit pending entries. The existing final audit command is:

```sh
bun run audit:build -- dist --final --evidence specs/011-improve-character-animations/validation/acceptance.json
```

It must fail while required evidence is missing or bound to another build. Earlier waivers/phone captures cannot silently become animation acceptance. Feature acceptance requires all local FRs/SCs and applicable PRD scenarios, not merely successful source export or desktop tests.
