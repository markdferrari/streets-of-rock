# Lion, Plates and Reusable Character Creation — Validation

## Setup and inherited implementation baseline

Work is on branch `007-implement`. The user's existing modification to
`.specify/feature.json` was present before implementation and has been preserved.
The 007 requirements checklist contains 16 items; all 16 are complete. There are
no configured before/after implementation hooks.

The runtime does not yet contain the 007 roster or Specials: `src/content/characters.ts`
and `src/content/characters.json` consumers support Cow/Crow only, the UI and session
use the 005 selected-duo flow, and the game has 006's partner behavior and arena view.
No 007 Lion/Plates assets or character-builder skill existed at the start of this work.
The 005 and 006 validation records show their automated engineering work is implemented;
phone, full physical offline, owner soundtrack, performance and participant acceptance
remain pending. 007 must extend their systems rather than duplicate them.

| Gate | Baseline on 2026-09-29 |
| --- | --- |
| Bun | 1.4.2 |
| `bun install --frozen-lockfile` | Pass; no dependency changes |
| `bun run typecheck` | Pass |
| `bun run test:unit` | Pass: 37 files, 139 tests |
| `CI=1 bun run test:e2e` | Fail to start: configured `vite preview` server exited 1 before Playwright tests; no browser cases ran |
| Blender | 5.2.2 LTS. `tests/blender/run_tests.py` entered the suite but stalled at its nested-process validation probe for over 60 seconds; interrupted, so no suite result claimed |
| `bun run build` | Pass; 17 precached assets, generated inventory 5.78 MiB; existing >500 kB JavaScript chunk warning |
| `bun run audit:build` | Pass: 17 assets, 5.78 MiB. Intended soundtrack evidence remains pending final acceptance |
| `git diff --check` | Pass before this record |

The 005/006 detailed validation records remain the source for inherited red/green
evidence and pending acceptance gates. This baseline is from the current checkout and
does not retroactively validate device or human-review requirements.

## Shared registry validation — in progress

`tests/unit/content/characters.test.ts` added a Cow/Crow numeric migration snapshot and
versioned JSON validation cases. The first run failed as intended because
`validateCharacterDefinitions` did not exist. The snapshot initially exposed an
incorrect expectation in the new test itself; comparing against `src/content/tuning.ts`
corrected it to Cow Light2=14 and Special=60, matching the current runtime. After
implementing the validator in `src/content/characters.ts`, the focused suite passed
(5 tests) and `bun run typecheck` passed. Follow-up invalid cases covered nested unknown
fields, non-positive timing, non-finite damage, partner Special rejection, and bounded
Special kinds. Explicit combat classes were added for each existing enemy archetype.
Resource/clip resolution, JSON migration, definition consumer wiring, and game behavior
remain open.

## Requirement and acceptance evidence map

| Scope | Automated evidence planned | Manual evidence planned |
| --- | --- | --- |
| FR-001–003, FR-013–014; US4 scenarios; SC-005 | Definition, validator, scaffold, duplicate-ID, missing-clip and preservation tests; two actual skill exercises | Review each brief and concept candidates before model production; five uncoached players identify both styles |
| FR-004–006, FR-010; US1 scenarios; SC-001–002 | Lion profile/basic action tests; stun lifecycle and ROAR integration tests; legacy Cow/Crow regression | Run Lion with Cow/Crow; review silhouettes, warnings and mixed normal/boss combat |
| FR-007–010; US2 scenarios; SC-001–002 | Plates profile/action, segment collision and headrest lifecycle tests | Run Plates with Cow/Crow; inspect conjure/throw, interception, miss and target changes |
| FR-003, FR-011–012, FR-015; US3 scenarios; SC-003–004 | Four-roster selection/e2e, role/run reset, offline/cache and readiness tests; all twelve ordered distinct duos and four duplicate rejections | Both phones, all duos, retry/solo completion, safe areas and interruption/resume |
| FR-015 cross-cutting; SC-001–006 | Full unit/integration/browser/Blender suites, build/inventory audit and static checks | iPhone 12/Safari and Pixel 6/Chrome, muted/no-shake/reduced motion, complete offline replay, full-run performance and five-player study |

Scenario-level automated and manual procedures are specified in
`quickstart.md`; unavailable physical-device, intended-track, participant and visual
review observations will remain explicitly pending until performed.

## Ongoing execution evidence

Append red/green commands and observed outcomes beside the task progress as 007 work
proceeds. A baseline pass is not evidence for new feature behavior. Do not mark a
behavior accepted based only on compilation or a related inherited test.

The definition validator received timing/profile checks test first: positive whole tick
durations, finite positive damage/range/stat values, zero-allowed knockback, exact
object keys, nonempty presentation keys, bounded Special kinds, required Light count,
partner Special rejection and kebab-case unique IDs. The invalid timing case failed
before its validator change; afterward `bunx vitest run tests/unit/content/characters.test.ts`
passed 5/5 and `bun run typecheck` passed. Enemy definitions state normal/boss
classification explicitly; wider status and runtime integration remain unchecked.
