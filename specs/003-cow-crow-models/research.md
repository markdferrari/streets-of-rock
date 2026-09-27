# Research: Cow and Crow Blender Models

**Date**: 2026-09-27  
**Status**: Design questions resolved; model implementation and renders not yet executed.

## 1. Blender Python authoring

**Decision**: Use Blender 5.2.2 LTS with its bundled Python 3.13.13, `bpy`, and standard library only. Run scripts in background factory-startup sessions with `--python-exit-code 1` before `--python`.

**Rationale**: The installed executable and bundled Python were verified. The workflow produces editable native scenes without additional package management. Argument order determines error handling and script execution.

**Alternatives considered**: Manual-only modeling would not satisfy reproducible generation. Third-party generation services add dependencies and do not guarantee editable structure. A Blender add-on is unnecessary for two assets.

**Source**: [Official command-line reference](https://docs.blender.org/manual/id/4.2/advanced/command_line/arguments.html). Versioned documentation supports the stable workflow; implementation verifies exact APIs against installed 5.2.2.

## 2. Smooth editable concept assemblies

**Decision**: Named component meshes, rounded primitives, deliberately shaped meshes, smooth shading, and retained bevel/subdivision modifiers. Use layered editable feathers for full wings; use material assignments or fitted geometry for Cow's markings.

**Rationale**: This supports the requested cartoon forms and easy proportion/material edits. Concept assemblies do not need animation-ready edge flow.

**Alternatives considered**: A single sculpted mesh is harder to regenerate and edit selectively. Early retopology/rigging expands the accepted milestone. Flat low-poly styling conflicts with the selected smooth cartoon direction.

**Source**: [Subdivision Surface](https://docs.blender.org/manual/en/3.6/modeling/modifiers/generate/subdivision_surface.html).

## 3. Materials and future export

**Decision**: One Principled BSDF per material with solid color, roughness, metallic, and output connection. Use no external images or procedural shader dependencies.

**Rationale**: The documented glTF exporter recognizes this material pattern. Self-contained scenes simplify reopen and portability checks. Future mesh optimization and GLB export remain separate work.

**Alternatives considered**: Procedural leather/feather shaders may require baking; texture painting adds files and an unnecessary dependency for this milestone. Basic materials are sufficient for restrained clothing detail.

**Source**: [Blender glTF material guidance](https://docs.blender.org/manual/en/4.0/addons/import_export/scene_gltf2.html).

## 4. Portable rendering

**Decision**: Cycles CPU, seed 0, 64 samples, denoising, AgX, PNG RGB. Individual previews are 1024×1024; duo previews 1600×1000. Smoke rendering uses 128×128 at 8 samples. Neutral area lights and magenta/cyan neon lights use unchanged character materials.

**Rationale**: CPU avoids requiring a particular GPU backend. Image dimensions and sample counts are project defaults, not Blender requirements. Fixed framing and comparable lighting aid review.

**Alternatives considered**: GPU rendering can be faster but depends on hardware/backend availability. Eevee requires a compatible graphics context. Photorealistic render settings would slow iteration without serving the chosen style.

**Sources**: [Cycles devices](https://docs.blender.org/manual/en/5.0/render/cycles/render_settings/index.html), [sampling and seed](https://docs.blender.org/manual/en/3.2/render/cycles/render_settings/sampling.html).

## 5. Reproducibility and tests

**Decision**: Standard-library `unittest`, fresh-process scene reopening, semantic comparisons, a low-resolution render check, and a separately recorded owner review.

**Rationale**: Native binary files and render pixels are unsuitable exact-equality assertions. Saved/reopened parts and materials test observable deliverables. Automated geometry checks cannot establish character appeal or detect all unwanted intersections.

**Alternatives considered**: Object counts alone miss lost materials and unreadable designs. Image snapshots are brittle across rendering environments. Adding pytest provides little value for this small Blender-contained suite.

**Source**: [Blender save/open operators](https://docs.blender.org/api/current/bpy.ops.wm.html). Local runtime validation remains necessary for actual artifacts.

## 6. Execution environment finding

**Observed**: A background factory-startup Python command reported Blender 5.2.2 LTS / Python 3.13.13, then hung during shutdown and printed `pa_write() failed while trying to wake up the mainloop: Operation not permitted`. `-noaudio` and an explicit quit did not resolve sandboxed execution. A bounded equivalent command outside the sandbox printed `Blender quit` and exited 0 in approximately 0.76 seconds. All diagnostics were stopped or timed out; no model files were created.

**Decision**: Use the verified execution context through normal approval mechanisms when required, retain process timeouts, and require clean process exit. Do not force Python termination or suppress failed cleanup as success.

**Rationale**: Evidence isolates the observed failure to the execution environment. It does not establish a need to reinstall Blender or change user audio settings. Rendering itself still needs the implementation smoke test.

**Alternatives considered**: Audio-disable flags alone failed locally. Global audio configuration changes and Blender reinstallation are unsupported by the evidence.

## 7. Scope and artifacts

**Decision**: Keep sources and reviewed deliverables outside the web bundle. Version three native scenes and ten PNGs; no new LFS dependency, service, runtime loader, or external interface contract.

**Rationale**: The owner requested an authoring milestone before animation/integration. It supports PRD FR-032/FR-033 while preserving deferred gameplay scope. The PRD's note that Blender automation is not an MVP acceptance requirement remains true.

**Alternatives considered**: Integrating GLB now adds loading, caching, animation, and device-performance work that the owner explicitly deferred. Building a reusable production asset platform exceeds the two-character need.
