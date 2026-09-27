# Implementation Plan: Cow and Crow Blender Models

**Branch**: `003-cow-crow-models` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

## Summary

Create two editable smooth cartoon character assemblies with reproducible Blender Python scripts, three self-contained scenes, and ten preview images. Cow is a broad brawler in a black biker jacket; Crow is a smaller aviator with full wings. This is an authoring milestone with owner visual approval, preceding rigging and game integration.

## Technical Context

**Language/Version**: Blender 5.2.2 LTS, bundled Python 3.13.13; standard library and `bpy` only.  
**Primary Dependencies**: Installed Blender; Cycles CPU rendering. Existing Bun tooling remains for game regression checks.  
**Storage**: Local `.blend`, PNG, and JSON validation evidence; no remote services.  
**Testing**: Python `unittest` inside Blender, fresh-process reopen checks, image smoke rendering, manual review; existing `bun run test` and `bun run build` before commit.  
**Target Platform**: Local Linux Blender authoring, separate from the mobile web runtime.  
**Project Type**: Internal asset authoring scripts.  
**Performance Goals**: Bounded execution, portable CPU previews, no runtime performance claim. Smoke tests use 128×128 images at 8 samples; final individual previews use 1024×1024 and duo previews 1600×1000 at 64 samples with denoising.  
**Constraints**: Three scenes, ten final previews, editable geometry/materials, reproducible semantic results, explicit overwrite protection, no external textures or asset downloads.  
**Scale/Scope**: Cow, Crow, comparison; no skeletons, animation, GLB delivery, runtime loader, or new gameplay.

## Constitution Check

Pre-research and post-design checks both pass for this bounded authoring scope. Verification below is planned evidence, not a claim that implementation has passed.

| Gate | Evidence / planned verification | Pre / post |
| --- | --- | --- |
| Specification-led delivery | Spec FR-001–FR-011 and AC-001–AC-009 trace to PRD FR-032/FR-033; explicit exclusions and provisional art defaults recorded. | Pass / Pass |
| Touch combat | No controls, camera, telegraphs, or combat code changes. Full/reduced-size art review applies; device combat checks deferred to integration. | N/A / N/A |
| Test-first implementation | `unittest` red–green–refactor for output, reopen, repeatability, and overwrite behavior; visual checklist established before modeling. | Pass / Pass |
| Mobile-web reliability | Assets live outside web public/build inputs. No loading/cache/lifecycle/audio/storage changes; confirm bundle exclusion. | N/A / N/A |
| Focused scope and measured quality | Owner explicitly requested this authoring feature. Blender is installed; no added dependencies. PRD does not require automated Blender generation for MVP acceptance. Art acceptance makes no claim about frame timing or five-player criteria. | Pass / Pass |
| Delivery discipline | Feature branch created from existing checkout; unrelated edits preserved. All existing automated tests plus new artifact checks before any conventional commit. | Pass / Pass |

No constitution amendment is needed: this is the explicitly requested bounded authoring workflow, without importing other deferred product features. No unresolved clarifications or gate violations remain.

## Project Structure

```text
specs/003-cow-crow-models/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  validation/                 # evidence produced during implementation
scripts/blender/
  generate.py                 # entry point; character/scene generation
  characters.py               # Cow and Crow mesh/material construction
  presentation.py             # cameras, lighting, rendering
  validate.py                 # saved-scene validation entry point
  render.py                   # renders from saved scenes, preserving manual edits
tests/blender/
  run_tests.py                # unittest entry point; isolated temporary outputs
  test_assets.py              # behavioral checks and fresh-process validation
assets/characters/cow-crow/
  cow.blend
  crow.blend
  comparison.blend
  previews/                   # ten final PNGs
```

Authoring sources and accepted deliverables are versioned normally; no Git LFS dependency is introduced. Temporary outputs use temporary directories; Blender backup files are excluded narrowly within this output directory during implementation. Nothing is placed in `public/` or imported by the game. This skill produces design documents only; `tasks.md`, scripts, tests, models, and previews are subsequent work.

## Design Decisions

### Character construction

Use named meshes assembled from rounded primitives and shaped meshes with editable bevel/subdivision modifiers. Smooth shading and geometry smoothing are separate operations. Model Cow's broad torso, muzzle, horns, ears, legs, boots, jacket, and patches; model Crow's slender torso, head/beak/eyes, jacket/collar, feet, and layered feather wings. No hidden humanoid hands or extra back wings. Materials use one Principled BSDF connected to output, with solid base colors, roughness, and metallic values. No procedural shader or image dependencies.

Use Blender Z-up, face -Y, character origins at ground center, and ground Z=0. Initial total heights are Cow 2.0 m including horns and Crow 1.6 m; exact proportions are art tuning. Use identical character geometry/materials in individual and comparison files. Position the pair side by side with a gap based on evaluated bounds so Crow's wings do not overlap Cow. Individual poses follow the accepted brief.

### Generation and rendering

Generation creates all three `.blend` files. Rendering loads those saved files, then produces the ten named previews without rebuilding the characters. This lets manual edits survive into previews. Save cameras and named neutral/neon light collections in each applicable scene. Include neutral ground for contact shadows; frame full evaluated bounds including modifiers with at least 10% margin. Render neutral individual views and neutral/neon duo views with an unchanged camera between duo lighting variants.

Commands take an output directory; rendering also accepts `--smoke` for one low-resolution duo preview in a separate `smoke/` directory. All commands validate prerequisites. Generation/rendering refuse existing target files unless `--overwrite` is passed; overwrite replaces only their known outputs and never deletes the directory or unrelated files. Preflight targets before writing. Partial output after interruption is a failure, with explicit rerun guidance.

Use Cycles CPU, fixed render seed 0, denoising, PNG RGB, and AgX color management. Geometry generation is deterministic and uses no randomness. Reproducibility means stable object names, material values, and dimensions, not binary or pixel equality.

### Validation and execution environment

Run tests with Blender's Python and standard `unittest`. Fresh Blender subprocesses reopen each file and return nonzero on validation failure. Check required semantic parts/materials, nonempty finite geometry, nonzero dimensions, local dependencies, character counts, ground/relative scale, and camera/light existence. Compare repeated outputs semantically at 1e-5 absolute tolerance. Include overwrite refusal and an intentional missing-part fixture to prove validator sensitivity. Verify small renders load as images with expected dimensions.

Use 120-second timeouts for metadata/reopen subprocesses and 30 minutes for a render batch; timeout is failed validation. On this host, sandboxed checks printed Python output and hung with a PulseAudio warning, while the same read-only check outside the sandbox exited 0 in under a second. Use the working execution context through normal tool approval where needed. Do not bypass shutdown with `os._exit` or infer success from printed text.

## Requirement Coverage and Acceptance

| Spec requirements | Delivery / evidence |
| --- | --- |
| FR-001–FR-003 | Both meshes and owner checklist covering shape, clothing, full wings, expressions, and silhouettes |
| FR-004, FR-008 | Three self-contained files; edit-save-reopen and fresh-process material/part checks |
| FR-005–FR-006 | Eight character views, two duo views, comparison scale and lighting checks |
| FR-007, FR-009 | Repeated generation, clear failures, overwrite protection, documented commands |
| FR-010 | Recorded expected failing tests, passing checks, and owner verdict |
| FR-011 | Authoring directory exclusion from runtime assets; existing game tests/build |

Define manual checks before modeling; record actual results afterward in `validation/results.md`. Owner approval is required for appearance acceptance, not for generating the first reviewable result. Runtime tests need not run for these documentation-only changes unless committing; review document consistency now. Implementation must run all existing tests before any commit. No commit or push is part of this planning command.

## Phase Outputs

[research.md](research.md) resolves technology choices; [data-model.md](data-model.md) defines asset conventions; [quickstart.md](quickstart.md) specifies end-to-end validation. No `contracts/` directory is needed for this internal authoring workflow; command behavior is documented here and in quickstart. Recheck extension hooks at completion; none were present during setup.
