# Feature Specification: Rigged Cow and Crow in Gameplay

**Branch**: `004-rigged-cow-crow-gameplay`  
**Status**: Approved for implementation, 2026-09-27

## Product alignment

This feature fulfills the Cow/Crow portion of PRD FR-032 and supports FR-022, FR-033, and FR-037. Cow remains the sole playable character and Crow the AI partner (PRD section 2). The owner approved the concept appearance and chose articulated existing parts with action animation. Smooth deformation topology, playable Crow, enemy model replacement, and the unfinished complete PWA delivery system remain deferred.

## Journeys and acceptance

### US1 — Recognize the partners (P1)

On starting a run, Cow and Crow appear as the approved jacketed Blender characters in their correct relative scale and orientation. The title does not enter gameplay until both assets load. A failed load gives a retry action. Retry and return to title do not leak or invalidate model resources.

### US2 — Read actions (P1)

Movement, Cow's three Light strikes, Heavy, Dodge, Spin, hurt and knockout, and Crow's support strike have distinct joint movement. Windup precedes impact; the authoritative simulation still controls damage. Pause freezes poses and resuming continues them. Crow remains visibly knocked out and inactive at zero health. Animated poses retain silhouettes and do not intersect clothing or wings conspicuously at gameplay scale.

### US3 — Reproduce delivery (P2)

From the approved editable character sources, a Blender 5.2 script creates rigged editable scenes and self-contained GLBs. Materials, character meshes and required clips are present; no presentation cameras, lights or ground are exported. The release build contains hashed character assets on the same origin.

## Requirements

- FR-001: Use the approved Cow and Crow meshes, colors and relative scale in gameplay.
- FR-002: Provide editable Blender armatures with one rigid bone assignment per existing part; preserve semantic part names.
- FR-003: Export deterministic self-contained GLBs with documented named clips for idle, motion and applicable actions.
- FR-004: Map authoritative actor state/tick to presentation clips without altering game rules or hit timing.
- FR-005: Handle loading errors visibly; reuse assets and dispose renderer resources safely on retry/title.
- FR-006: Keep GLBs inside the production bundle with hashed URLs and no external dependencies.

## Mobile quality

Touch control and collision rules stay intact; browser regression checks cover startup, combat, pause and retry. Visually check legibility with muted audio and no shake. Verify loading failures and interruption. Record busiest-encounter frame timing on iPhone 12 Safari and Pixel 6 Chrome, targeting 60 fps and requiring at least 30 fps before device acceptance. Complete offline play is pending the project's existing PWA work; this feature must not claim it. The five-player MVP evaluation remains pending.

## Success criteria

Both characters visibly load and animate in normal gameplay; automated rig, export and browser checks pass; visual review accepts action readability; the full existing test suite passes before commit. Device acceptance requires the reference-phone evidence above.
