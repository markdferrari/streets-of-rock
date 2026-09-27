# Implementation Plan: Rigged Cow and Crow in Gameplay

**Branch**: `004-rigged-cow-crow-gameplay` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

## Summary

Rig the approved Blender concept assemblies as rigid articulated parts, export self-contained animated GLBs, and use them for Cow/Crow in the existing Three.js game. Keep simulation timing authoritative. See [research](research.md), [data model](data-model.md), [runtime contract](contracts/runtime.md), and [quickstart](quickstart.md).

## Technical context

Blender 5.2.2/Python 3.13, Three.js 0.186, TypeScript 6.0, Vite 8.3, Bun 1.4.2, Vitest and Playwright. Two asset files, two actor roles, no new dependencies, no persistent data. Mobile web targets 60 fps, with a required 30 fps busiest-encounter floor on iPhone 12 and Pixel 6.

## Constitution check

| Gate | Before research and after design |
| --- | --- |
| Specification led | PRD FR-032/022/033/037 and scenarios in spec; no playable Crow or smooth deformation. |
| Touch combat | Existing input unchanged; browser and device visual checks cover attack legibility, muted play and pause. |
| Test first | Blender and TS/browser tests fail before code; visual procedure defined in quickstart before animation work. |
| Mobile reliability | Loading/retry and resource lifetime tested; offline readiness remains an existing unmet MVP gate and is not claimed. |
| Measured quality | No new package; benchmark complete run/busy encounter on reference phones; preserve five-player MVP gate. |
| Delivery | Feature branch verified; all existing tests and build run before conventional commit. |

Both pre-research and post-design gates are addressed. The existing unfinished PWA and device evidence are explicit acceptance dependencies, not implied completed work.

## Structure and approach

Extend `scripts/blender` for rig/export and `tests/blender` for validation. Put generated GLBs under a Vite-imported asset directory. Add a small presentation asset loader and animation mapper; update `GameApp` startup and `GameScene` ownership. Keep actor simulation files unchanged. The export script runs from saved source scenes, applies rigging in new rigged scenes, and exports character-only geometry. Runtime loads once before gameplay and seeks action clips using simulation ticks. Browser startup has loading/error states. Validate with quickstart and record missing device evidence.
