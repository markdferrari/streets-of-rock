# Feature Specification: Cow and Crow Blender Models

**Feature Branch**: `003-cow-crow-models`  
**Created**: 2026-09-27  
**Status**: Specified; visual acceptance pending implementation  
**Input**: Owner-approved brief for editable smooth cartoon models, reproducible generation, and preview renders.

## Product Alignment

- **PRD references**: FR-032 (character identities, stylized presentation, silhouettes) and FR-033 (neon rock venue art direction). This supports their character-art requirements, without fulfilling runtime animation or venue acceptance.
- **Included**: Two editable concept models, individual Blender files, a comparison scene, repeatable generation, ten preview images, artifact checks, and visual review.
- **Deferred**: Rigs, skinning, deformation-ready topology, animation, GLB delivery, runtime loading, gameplay changes, playable Crow, optimization, other characters, and distribution changes.
- **Scope authorization**: The owner explicitly requested this bounded authoring feature. The PRD says automated Blender generation is not an MVP acceptance requirement; this feature does not turn it into one or authorize other deferred features.
- **Provisional art tuning**: Exact proportions, colors, roughness, camera framing, and lighting strength can change during review while preserving character identities and deliverables.

## User Scenarios & Testing

### User Story 1 — Inspect and edit the characters (P1)

As the owner, I can open each character in Blender, recognize the agreed design, and edit parts and materials.

**Independent test**: Open saved files in fresh Blender processes and inspect each model from all sides.

1. **AC-001**: Cow is a broad, stocky upright fighter with a black leather biker jacket, rounded muzzle, cream horns, black and white markings, sturdy legs, chunky boots, expressive eyes, and a determined expression. Arms are slightly spread. (FR-001, FR-003)
2. **AC-002**: Crow is a smaller, wiry upright character with a brown aviator jacket, cream collar, dark feathers, prominent beak, birdlike feet, expressive eyes, and a determined expression. Full wings emerge through shoulder openings and are partially open. (FR-002, FR-003)
3. **AC-003**: Named parts and material colors are editable without missing dependencies; saving and reopening preserves an edit. (FR-004, FR-008)

### User Story 2 — Review appearance and relative scale (P1)

As the owner, I can compare characters in consistent views under neutral and neon lighting.

**Independent test**: Review the comparison scene and complete image set against a checklist defined before modeling.

1. **AC-004**: Each character has front, side, back, and three-quarter PNG views with its entire silhouette in frame. (FR-005)
2. **AC-005**: The comparison scene and duo previews show Cow taller and broader than Crow on a shared ground plane. Neutral/neon variants use the same geometry and character materials. (FR-006)
3. **AC-006**: Review at full and reduced size records species recognition, smooth shading, expressive faces, silhouette separation, and absence of unintended visible clothing/wing intersections. Acceptance requires owner approval. (FR-003, FR-010)

### User Story 3 — Regenerate and validate the assets (P2)

As a contributor, I can reproduce outputs using documented commands without external art packages or a running game.

**Independent test**: Generate into a new directory, reopen all scenes, render a smoke image, and compare a second generation.

1. **AC-007**: The workflow produces three self-contained scenes and ten previews from an empty destination. Failures return nonzero status. (FR-005–FR-009)
2. **AC-008**: Identical settings preserve part names, material parameters, and dimensions across runs within floating-point tolerance; binary files and pixels need not be identical. (FR-007)
3. **AC-009**: Existing outputs are protected unless overwrite is explicitly selected. (FR-009)

## Functional Requirements

- **FR-001**: Cow MUST match AC-001.
- **FR-002**: Crow MUST match AC-002, using full wings rather than feathered hands or additional back wings.
- **FR-003**: Both MUST have smooth cartoon forms, distinct silhouettes, expressive eyes, determined expressions, and restrained clothing detail.
- **FR-004**: Each character MUST have named, editable mesh parts and materials in its own `.blend` file. Concept assemblies are acceptable.
- **FR-005**: Deliver front, side, back, and three-quarter PNGs per character: eight individual previews.
- **FR-006**: Deliver a comparison `.blend` scene and two duo PNGs under neutral and neon lighting: ten previews overall.
- **FR-007**: Blender Python scripts MUST reproducibly generate both characters and the comparison scene from documented settings.
- **FR-008**: Files MUST reopen without missing assets. Character materials MUST use a simple setup compatible with later GLB material export; actual export is deferred.
- **FR-009**: Commands MUST document prerequisites/output paths, report failures, and require an explicit overwrite option before replacing outputs.
- **FR-010**: Artifact checks MUST follow TDD; manual visual checks MUST be defined before modeling and results recorded afterward.
- **FR-011**: Authoring assets MUST remain outside the deployed web bundle. Gameplay, runtime APIs, character control, and caching behavior MUST remain unaffected.

## Edge Cases

- Missing Blender or unsupported version: clear prerequisite error.
- Background hang: bounded timeout and failed validation; printed success alone is insufficient.
- Existing/unwritable output: clear failure; overwrite is opt-in and never deletes unrelated files.
- Interrupted generation: rerun into a new directory or explicitly replace partial outputs; incomplete artifacts are not accepted.
- Missing geometry/materials after reopen, invalid dimensions, or absent previews: validation fails.
- Cropped horns/wings, feathers lost under neon light, or unintended clothing intersections: visual review fails and requires revision.

## Mobile Quality and Validation

Touch input/cancellation, safe areas, telegraphs, lifecycle, audio, storage, caching, updates, device frame timing, and five-player evaluation are unaffected because these assets are not integrated. Applicable checks remain required during integration. Reduced-size previews are an art check, not evidence of runtime performance or combat readability.

## Key Entities

- **Character asset**: Identity, editable parts, materials, scale convention, and saved file.
- **Comparison scene**: Both characters, shared ground, cameras, and lighting setups.
- **Preview**: Character/view or duo/lighting combination, dimensions, and output path.
- **Validation evidence**: Versions, commands, exit statuses, automated results, and owner verdict.

## Success Criteria

- **SC-001**: Three files reopen in fresh Blender processes with required parts/materials intact. (AC-001–AC-003, AC-005, AC-007)
- **SC-002**: Ten valid PNGs have complete character framing. (AC-004–AC-007)
- **SC-003**: Regeneration passes semantic consistency and overwrite-protection checks. (AC-008–AC-009)
- **SC-004**: The owner accepts both designs and the visual checklist; unresolved defects remain recorded. (AC-006)
- **SC-005**: Gameplay and the deployed bundle remain unaffected. (FR-011)

## Assumptions

Blender 5.2.2 LTS is the initial supported version. Cow is larger than Crow; dimensions are provisional art defaults in the plan. Full wings may require bespoke rigging later. The owner provides appearance approval; automated checks cannot establish artistic quality.
