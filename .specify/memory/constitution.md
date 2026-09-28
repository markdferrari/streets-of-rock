<!--
Sync Impact Report
Version change: 1.1.0 → 1.2.0 (four-character roster and creation workflow)
Reason: Owner approved specification of Lion, Plates and reusable character creation on 2026-09-28.
Modified principle: V. Focused Scope and Measured Quality allows Cow, Crow, Lion or Plates
as fighter and a different AI partner; existing solo-completion and quality gates remain.
PRD 2.4 adds FR-051–055, AC-053–057, SC-010 and explicit Lion/Plates Special semantics.
Feature 007 supersedes 005's two-character/shared-Special assumptions; 006 partner/view rules apply.
Reviewed spec-template.md, plan-template.md and tasks-template.md: existing traceability,
TDD, mobile and evidence gates apply without template edits.
Validation impact: twelve duo initialisations, new Special/status/projectile rules, both skill
exercises, concept/gameplay review, cached asset and phone performance evidence required.
Deferred graphical upgrades and further roster content remain deferred.
-->


# Streets of Rock Constitution

## Core Principles

### I. Specification-Led Delivery

Every gameplay or platform change MUST trace to a numbered requirement and an acceptance
scenario in its feature specification. Feature specifications MUST identify the applicable
requirements in `PRD.md`, explicitly distinguish committed scope from provisional tuning,
and list deferred work. Plans and tasks MUST retain that traceability.

Implementation MUST follow specification, technical planning, and dependency-ordered tasks.
When an intended behavior changes, its specification and acceptance scenarios MUST be
updated before the corresponding implementation. A defect that violates an existing
requirement MUST receive a regression test; it does not require inventing a new feature.
Documentation-only changes MUST receive a consistency review rather than artificial
runtime tests. This keeps requirements, code, and evidence aligned.

### II. Responsive and Readable Touch Combat

Gameplay MUST support simultaneous movement and action input on real touch devices without
stuck input after cancellation or interruption. Enemy attacks MUST have readable warnings
and avoidance opportunities using the abilities actually available to the player.

Essential combat feedback MUST remain understandable with sound muted and screen shake
disabled, and MUST NOT depend on color alone. Controls and HUD MUST remain visible within
supported landscape layouts and safe areas. Pausing MUST suspend combat and active timing;
resuming from interruption MUST require an explicit player action.

Changes affecting controls, camera, telegraphs, or combat feel MUST include device playtest
criteria. Automated correctness alone does not establish usable touchscreen combat.

### III. Test-First Implementation

Implementation of testable behavior MUST follow red–green–refactor: write a meaningful test,
observe it fail for the expected reason, implement the smallest change that passes it, and
refactor while preserving passing tests. Bug fixes MUST reproduce the defect in a failing
test before correction when the behavior is automatable.

Deterministic rules such as hit registration, damage, cooldowns, meter consumption, encounter
progression, terminal states, and retry reset MUST be testable independently of rendering
and real-time waiting. Browser integration behavior MUST receive integration tests where
feasible. Tests MUST assert observable outcomes rather than merely duplicate implementation.

Touch ergonomics, animation readability, actual browser audio, installation, offline replay,
and performance MUST also receive documented device checks. For behavior that cannot be
meaningfully automated, define the manual acceptance procedure before implementation and
record its result afterward. This does not waive automated tests for underlying logic.

All existing automated tests MUST pass before a commit. A missing test suite MUST be reported
as missing, never as passing. Documentation changes require document validation; they do not
require creation of a game test harness before application code exists.

### IV. Reliable Mobile-Web Play

The supported experience MUST work in mobile Safari on iOS and Chrome on Android, with
installation optional. After successful caching, a complete run including audio, results,
and retry MUST work without a network connection while cached browser data is retained.
Offline readiness MUST only be claimed after the required assets are cached.

Loading and caching failures MUST provide actionable feedback. Updates MUST apply between
runs. Hidden-page, focus-loss, orientation, and touch-cancellation handling MUST preserve
safe gameplay state. Audio MUST start through user interaction and follow pause state.
Unavailable local storage or audio MUST NOT prevent otherwise playable gameplay.

The MVP MUST NOT require accounts, backend services, or remote telemetry. Browser-specific
services MUST remain separable from deterministic game rules so those rules can be tested
without a live browser. Native packaging MUST NOT become a prerequisite for web delivery.

### V. Focused Scope and Measured Quality

The MVP MUST deliver the complete one-level experience defined in `PRD.md`: selection of Cow, Crow, Lion or Plates as the playable fighter with a different character as
a vulnerable AI partner, readiness and entry countdown, four areas, three enemy roles,
a two-phase boss, and a clear result/retry loop. The 3–5 minute successful-run target MUST guide playtesting, not impose a gameplay deadline. The entry countdown does not count toward run time.
Loss of either selected AI partner MUST NOT make solo completion impossible for the selected fighter.

Features listed as deferred in the PRD MUST NOT enter implementation without an explicit
scope revision. Engine abstractions, production pipelines, dependencies, and visual effects
MUST be justified by a current requirement. Prefer the smallest design that meets the
accepted behavior and verification needs.

Combat balance MUST be adjustable through tuning data. Plans MUST define how performance
and player outcomes will be measured. The MVP MUST satisfy the PRD's device performance and
five-player evaluation criteria before being declared accepted; unfinished evidence MUST
remain visible. Improve controls, readability, and balance before expanding content when
those criteria fail.

## Product and Technical Constraints

- `PRD.md` is the product baseline. Feature specs refine it; they MUST NOT silently contradict
  it. This constitution governs process and quality; detailed balance values remain in
  specifications and tuning data.
- Delivery MUST be a landscape mobile-browser PWA with simple stylized 3D presentation.
  Capacitor packaging remains deferred until separately specified.
- The initial reference devices are iPhone 12 and Pixel 6. Plans MUST target 60 fps and verify
  at least 30 fps in the busiest encounter during a complete run on both, recording OS and
  browser versions and frame-timing evidence. Desktop emulation is supplementary evidence.
- The owner-supplied soundtrack MUST be a replaceable bundled asset included in offline
  caching. Placeholder assets are permitted during development; final acceptance MUST use
  the intended supplied track. A player audio-file picker is outside MVP scope.
- Technical planning MUST select and record the engine, language/tool versions, test commands,
  asset workflow, performance measurement procedure, and storage/cache strategy. This
  constitution does not mandate an engine or automated Blender pipeline.
- Runtime acceptance and asset budgets MUST reflect the complete game, including the
  soundtrack and busiest encounter, rather than an empty scene or isolated demo.

## Development Workflow and Quality Gates

1. **Branch first:** Work MUST occur on a feature branch, never on `main`, including
   documentation changes. Preserve unrelated user changes.
2. **Specify:** Define player journeys, stable requirement references, explicit exclusions,
   observable acceptance scenarios, failure modes, and measurable success criteria.
3. **Plan:** Complete the Constitution Check before research and repeat it after design.
   Record applicable evidence, planned verification, and justified non-applicability for each
   gate. An unaddressed violation blocks implementation.
4. **Task:** Order test creation and expected-failure verification before corresponding
   implementation. Include regression, device, offline, performance, and playtest tasks where
   relevant. A playable increment is not acceptance of the entire MVP.
5. **Implement and verify:** Follow test-first development. Run all existing automated tests
   before committing, plus applicable build/static checks. Record commands and results.
   Complete device checks for affected behavior before marking that behavior accepted.
6. **Review and accept:** Check PRD/spec/plan/task consistency, requirement coverage, and
   constitution compliance. Record outstanding device or asset dependencies explicitly;
   do not mark blocked validation as complete. Declare the MVP accepted only after all PRD
   acceptance scenarios and measurable success criteria pass.

## Governance

This constitution is the governing project policy for specifications, plans, tasks, and code.
`AGENTS.md` supplies the branch and testing instructions incorporated here. Contributors MUST
resolve conflicts explicitly instead of silently following a weaker template or generated task.

Amendments MUST state the reason, affected principles, and impact on existing specifications,
plans, tasks, and validation. Update this file, its Sync Impact Report, and affected templates
in the same change. Changes to product scope MUST also update `PRD.md` and affected feature
specifications. A complexity justification alone does not authorize violating a MUST rule;
an actual policy change requires an explicit amendment.

Version this constitution using semantic versioning: MAJOR for incompatible principle removals
or redefinitions, MINOR for new principles or materially expanded guidance, and PATCH for
clarifications without policy changes. Keep the original ratification date and update the
last-amended date whenever the constitution changes.

Every implementation review MUST include constitution compliance and test evidence. The
project owner resolves disputed scope or governance decisions. Initial version 1.0.0 adopts
these rules from the agreed PRD and repository instructions; it replaces an unratified template.

**Version**: 1.2.0 | **Ratified**: 2026-09-26 | **Last Amended**: 2026-09-28
