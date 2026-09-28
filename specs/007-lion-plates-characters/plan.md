# Implementation Plan: Lion, Plates and Reusable Character Creation

**Branch**: `007-lion-plates-characters` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: `specs/007-lion-plates-characters/spec.md`

## Summary

Extend the 005 selected-role registry to one validated JSON definition per character, retaining its separation of identity from control. Add a bounded Special behaviour union: existing area strike, Lion roar, Plates straight projectile. Reuse 006 arena visibility and partner intent. Extend the existing Blender pipeline for per-character assets and deliver a project-local character-builder skill exercised for both new characters.

## Technical Context

**Language/Version**: TypeScript 6.0.3, ES2022, Bun 1.4.2; Python through Blender 5.2.x for existing asset tools.

**Primary Dependencies**: Existing Three.js 0.186.0, Vite 8.3.0, Vitest 4.1.11, Playwright 1.63.0; inherit 005 PWA/Workbox. No new runtime/schema/state-machine library.

**Storage**: Bundled JSON content and asset imports; in-memory stun/projectiles only. Existing preferences/results persist unchanged. No runtime character editor or backend.

**Testing**: Vitest unit/integration, Playwright Chromium/WebKit, Blender bundled unittest, definition/asset/build validation and two recorded skill exercises.

**Target Platform**: Landscape iOS Safari/Android Chrome, iPhone 12/Pixel 6 reference phones; desktop selection and cached installed replay where supported.

**Project Type**: Existing browser game plus repository-local authoring workflow.

**Performance Goals**: Target 60 fps and require 30 fps in busiest encounter on both phones. Retain 005 provisional complete-build limits: 30 MiB overall, 16 MiB per asset, 100k visible triangles, 100 draw calls, DPR ≤1.5. Measure new assets and full soundtrack, not isolated models.

**Constraints**: No Cow/Crow rebalance, AI Specials, friendly fire, table damage by new Specials, new levels or graphics overhaul. Use real visual/concept review; missing art/device evidence remains pending.

**Scale/Scope**: Four characters, twelve ordered distinct duos, two new Special behaviours, one reusable creation skill and two exercises.

## Constitution Check

| Gate | Before research | After design |
| --- | --- | --- |
| Specification-led delivery | PASS: PRD 2.4 and constitution 1.2.0 authorize scope. | PASS: FR-001–015 mapped below, numerical defaults explicitly provisional. |
| Touch combat | PASS: new moves require telegraph and device review. | PASS: existing four controls, stunned-state feedback, visible conjure/release, muted/no-shake and lifecycle checks specified. |
| Test-first | PASS: existing suites and mandatory TDD retained. | PASS: definition, status, collision, meter and workflow tests precede code/assets; manual review procedure defined. |
| Mobile reliability | PASS: 005/006 prerequisites required, not presumed delivered. | PASS: new assets join full cache inventory; stun/projectiles pause/reset and audio/storage/update regressions required. |
| Focused scope/quality | PASS: four roster identities and bounded move types only. | PASS: no new dependencies; existing art style, budget audit, phone and five-player criteria retained. |
| Delivery discipline | PASS: feature branch, preserve specification edits. | PASS: Bun, conventional commits after all suites, actual review/evidence before acceptance. |

No exception or unresolved technical clarification. Implementation depends on 005 role/session/platform code and 006 arena/partner code, still absent from the inspected legacy runtime. Complete/integrate their tracked work before combined acceptance; do not duplicate those systems here.

## Project Structure

### Documentation (this feature)

```text
specs/007-lion-plates-characters/
  spec.md  plan.md  research.md  data-model.md  quickstart.md
  contracts/character-definition.md
  contracts/specials.md
  contracts/character-workflow.md
  checklists/requirements.md
```

Task generation creates tasks.md later.

### Source Code (repository root)

```text
src/content/characters/{cow,crow,lion,plates}.json
src/content/characters.ts                 # pure registry and validation
src/game/{specials,status-effects}.ts     # discriminated move effects and stun
src/game/{actions,collision,projectiles,damage,step}.ts
src/presentation/{character-assets,character-animation,scene,effects}.ts
scripts/characters/{validate,scaffold}.ts
scripts/blender/                         # existing tools extended by character ID
assets/characters/{lion,plates}/          # editable source, rigged/runtime, portrait
assets/props/headrest/                   # editable prop and bundled runtime asset
.agents/skills/character-builder/SKILL.md
.agents/skills/character-builder/references/workflow.md
 tests/{unit,integration,e2e,blender}/
```

**Structure Decision**: Pure data registry owns gameplay definitions. Presentation resolves static asset keys; JSON contains no functions, code paths or arbitrary script evaluation. Skill references repository tools rather than copying implementations. Existing Cow/Crow asset locations remain valid.

## Design

### Character definitions and compatibility

Use schemaVersion 1 JSON per character with strict runtime validation before registry readiness; TypeScript discriminated types describe supported move behaviours. Add no general expression language. Migrate Cow/Crow into the same format preserving their integrated 005 values exactly, with snapshot regression tests. Derive selection bars and gameplay from one validated definition. Basic action timing/reach may differ for Lion/Plates; controls and meter gain rules remain shared.

A static asset manifest maps definition asset keys to imported GLB/portrait/audio URLs. Validate each required semantic animation phase against exported clips. Keep 005/006 identity, body-envelope, role-selector and visible-arena contracts. All four characters implement player and support roles; support uses existing 006 tactics and no Specials.

### ROAR and stun

At the transition from Special windup to effect, sample Lion's current position and apply one radius evaluation. Normal targets receive stun; bosses receive a queued damage intent. Cancel newly stunned normals' active melee hitboxes and release attacker slots before their AI/contact processing; prevent stunned actors moving, attacking, allocating slots or producing new projectiles. Already released projectiles remain independent. Stun expiry permits a fresh normal decision; cancelled attacks do not resume.

Keep boss damage in the existing batched contact resolution so lethal ties remain defeat-first. ROAR must not put a living boss into hurt/recovery or modify its action/attack cooldown. Meter is spent once at valid action start even with no targets. Stun uses run ticks, so pause freezes it naturally.

### Headrest Throw

At action start select the nearest living enemy inside the 006 visible arena, arena-plane Euclidean distance then actor ID; store its world aim position. No target rejects the action without spending meter. At release, compute a fixed direction from actual release position to that stored point, using current facing for a zero-length vector. Spawn once; movement thereafter uses the stored velocity only.

Use swept segment-circle entry fractions for this projectile, choose lowest fraction then actor ID, and clip the final movement segment to remaining travel range before collision. Damage one enemy and consume even when that target's existing protection prevents damage. No homing, stun, knockback, piercing, table damage or ally hit. Keep legacy enemy projectile behavior compatible rather than silently changing its damage/order.

### Assets and character skill

Use current stylized articulated models, existing rig/export/render tooling, and semantic animation contracts. Lion gets claw/sweep/roar poses; Plates gets readable long limbs and conjure/throw poses with a visible headrest prop. New assets require all locomotion/hurt/KO/player phases and support clips. Concept-review candidates precede final production; do not invent owner approval. Existing approvals and explicit later direction carry forward.

Create `character-builder` locally, with concise name/description/frontmatter and one workflow reference for detailed conventions. It accepts brief/create/update/validate intent; checks scope and definitions; uses per-ID safe tools; distinguishes reusable behaviour implementation from configuration; produces playable review and a report. No publication, global installation or external messaging is implied. Follow skill-creator guidance during actual skill authoring and validate it with the available skill validator. Exercise Lion first, refine the shared workflow, then Plates; retain both reports and unrelated-resource checks.

## Implementation Order and Traceability

| Increment | Feature requirements | Evidence |
| --- | --- | --- |
| Integrate 005/006; pure definitions and schema | FR-001–003 | Invalid/duplicate/missing-resource tests, exact Cow/Crow profile migration, selection stats. |
| Reusable authoring tools and skill | FR-013–014 | Brief validation, unsupported move reporting, scoped overwrite tests, two exercise reports. |
| Lion status/mechanics and assets | FR-004–006, FR-010 | ROAR normal/boss/mixed/no-target/pause/tie cases, stun action/slot cancellation, concept/animation review. |
| Plates mechanics and assets | FR-007–010 | Fixed aim, moved/dead target, earliest swept hit, zero-distance/range/no-target cases and visible prop. |
| Roster/partner/platform integration | FR-011–012, FR-015 | Twelve pairings, AI no-Special, solo continuation, full retry, cache and phone evidence. |

Every automatable increment begins with an observed failing test. No public API or persistent migration. Existing exports/configuration consumers migrate atomically. Final track, visual review, device access and participants remain acceptance dependencies; plan completion is not runtime acceptance.
