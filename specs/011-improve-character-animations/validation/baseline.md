# Phase 1 baseline — 2026-10-16

T001; FR-005/009, AC-068/071. Work uses the existing `011-implement` feature branch at `58cb50039a03674fd301d49c37d3bf440589e413` (clean before this work). The feature resolver selects `011-improve-character-animations`; the shorter implementation branch is intentional. No tool/dependency versions change.

Verified local tools: Bun 1.4.2, Godot 4.7.2.stable.official.ed1daf0bf, Blender 5.2.2 LTS. Installed locked web templates are present. This private package is not published; existing `.gitignore` covers JavaScript/build/environment files, Blender backups, Python caches and Godot imports. No Docker, ESLint, Prettier, Terraform or Helm ignore file is applicable.

[Identity and original hashes](baseline/identity.json) bind the baseline test build, editable/runtime characters, semantic inventory and historical fingerprints. [Capture metadata](baseline/captures.json) records neutral camera/lighting and the four current characters at Idle, Move and Light contact, frames 1/6/12 in both facings. PNGs in `baseline/` are supplementary desktop renders of the unchanged runtime rigs, left to right Idle/Move/Attack. The later matched browser fixture uses the unchanged current GLBs beside each candidate; Blender and browser captures are not treated as phone evidence.

| Command | Actual baseline result |
| --- | --- |
| `bun run typecheck` | PASS, tooling and all existing Godot scripts |
| `bun run test` | Platform 86/86; Godot 122/122; all 26 current-rule parity fixtures match. Browser setup initially blocked by sandbox sockets; rerun with socket access found existing port 4181 occupied. Full command therefore did not pass. |
| `bun run validate:art` | PASS, full definitions and imported resource closure |
| `bunx playwright test --config .tmp/hero-animation/playwright.config.ts` | 64 Chromium passes. Initial unconfigured WebKit cases failed on missing library paths; configured WebKit rerun: 58 passes, 6 declared skips. Baseline export reused unchanged. |
| `bun run test:e2e:release`, `bun run test:blender` | Release configured rerun: 5 passes, 3 declared skips; Blender baseline 37 tests passed. Final implementation adds the neutral regression for 38 passing Blender tests. See implementation.md for exact commands and environment history. |

Logs are local `.tmp/hero-animation/baseline-*.log`; durable summaries record real exits below. Existing scenario fixtures and feature 010 fingerprints are preserved. The baseline captures/identity are evidence, not a declaration that the previous feature or new animations passed device/owner acceptance.
