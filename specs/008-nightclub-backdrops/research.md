# Research: Illustrated Nightclub Backdrops

Date: 2026-09-28. Repository inspection and delegated renderer/platform research informed these decisions. All technical unknowns are resolved; concept approval and device access remain acceptance dependencies.

## R1. Illustrated appearance within the current renderer

**Decision:** Author editable, self-contained SVG wall/floor illustrations, loaded as textures on static world-space panels in the existing Three scene. Four wall images and four quiet floor images; no new renderer, runtime dependency, dynamic lights, postprocessing or ambient animation in this increment.

**Rationale:** `src/presentation/environments.ts` already places simple floor/wall meshes beside 3D actors. Detailed outlined illustrations provide the requested cartoon appearance while retaining the fixed camera and character graphics. SVG is suitable for bold shapes, signage and editable layers. This is a design choice, not a requirement for generated bitmap art; no image generation is needed during planning.

**Alternatives considered:** Fully modelled decorated rooms increase geometry and production scope; a screen-fixed wallpaper breaks world alignment during travel; detailed painted foreground props risk hiding combat. Raster art remains a future production alternative only if visual review demonstrates a specific need and budgets/contracts remain satisfied.

## R2. Stable room identity and geometry

**Decision:** Keep simulation IDs `dance-floor`, `vip-lounge`, `backstage-corridor`, `alley-exit`; map them explicitly to outside entrance, bar, dance floor, stage/VIP in a presentation definition. Keep tables at (22,-2) and (28,2), all bounds/waves and Liam placement unchanged.

**Rationale:** `src/content/neon-velvet.ts`, run and encounter logic already use these IDs. Cosmetic renaming must not accidentally relocate encounters or confuse room 1 with the new visual dance floor in room 3.

**Alternatives considered:** Renaming simulation IDs requires unnecessary migration across game/tests. Reordering actual areas violates the feature scope.

## R3. Framing and continuity

**Decision:** Integrate after the implemented feature 006 CameraFrame. Cover the visible floor/rear-wall intersections throughout its valid frames, including three two-unit connectors and endpoint overscan. Place decorated panels behind the arena at depth -3.9; extend quiet opaque backing/floor geometry to cover additional viewport regions without stretching recognizable artwork. Use shared lighting/palette motifs at seams.

**Rationale:** Current 16-unit floor meshes leave gaps between rooms [0,16], [18,34], [36,52], [54,70]. Current legacy camera still sweeps 18 units across a two-unit transition; 006 changes this. Outgoing scenery must remain visible while it is in frame even after areaIndex advances.

**Alternatives considered:** Resize the camera to fit art violates preservation of the enlarged view. Showing only current areaIndex causes missing outgoing scenery. Full-screen overlays risk obscuring gameplay.

## R4. Loading and resource ownership

**Decision:** An app-owned BackdropAssetStore preloads/decodes all eight resources before the matching 005 readiness generation can start countdown. It owns textures; each venue layer owns its geometry/materials. Retry reuses valid textures. Failed/disposed generations clean up fulfilled and late-arriving resources and cannot signal readiness. App retirement disposes shared textures once.

**Rationale:** Current GameApp loads only character assets; scene disposal covers materials/geometries but not textures. Independent explicit texture ownership avoids retry leaks and double disposal. Static imports make required resources discoverable by the build.

**Alternatives considered:** Per-room lazy fetch can fail after gameplay starts or offline. Fire-and-forget loads allow visible texture pop-in. Material disposal alone cannot retire shared image resources.

**Source check:** Installed Three 0.186 source (`src/loaders/TextureLoader.js`, `src/textures/Texture.js`, `src/materials/Material.js`) supports asynchronous loading and separate disposal. The official [TextureLoader documentation](https://threejs.org/docs/pages/TextureLoader.html) also describes awaited loading and the risk of images appearing after a scene has started. Use explicitly configured sRGB colour textures and unlit materials to preserve illustration colours; verify actual appearance on target devices.

## R5. Offline and diagnostics dependencies

**Decision:** Extend feature 005's implemented inventory/readiness/worker/audit/diagnostics, with 006 framing integrated first. Do not build another platform subsystem here.

**Rationale:** Installed PWA packages are not functional offline support: current `vite.config.ts` has no worker configuration, `scripts/audit-build.ts` checks only index.html, and build:diagnostics currently only sets a flag. These remain prerequisite tracked work in 005/006.

**Alternatives considered:** Claiming asset URLs prove offline readiness is insufficient. An isolated backdrop FPS demo cannot establish full-game performance.

## R6. Art and memory budgets

**Decision:** Initial wall rasterization dimensions 2048×1024 each, floor 1024×512 each; opaque self-contained SVG, no external image/font/script dependencies or animation. Provisional total backdrop decoded texture budget ≤64 MiB including mipmaps; full build retains 30 MiB total, 16 MiB/file, 100k visible triangles, 100 draw calls and DPR≤1.5.

**Rationale:** Eight RGBA textures at these sizes total about 40 MiB before mipmaps, approximately 53.4 MiB with a full mip chain. Small SVG transfer size does not establish small GPU allocation. These budgets supplement, not replace, full-run phone measurements.

**Alternatives considered:** Unbounded vector rasterization or full-screen per-device textures can waste memory. More layers and alpha blending are unnecessary for the chosen static direction.

## R7. Review and verification

**Decision:** Prepare a four-room concept sheet with the actual camera/player/HUD overlay, record review before final illustration production, then inspect final screenshots during combat and play on both reference phones. Observe meaningful failing tests before new mapping, loading, ownership and integration behavior.

**Rationale:** Tests can verify IDs, resources, bounds, lifecycle and coverage; they cannot prove that players see a convincing nightclub or can distinguish combat warnings. All four concepts precede final production, while implementation can deliver rooms 1–2 then 3–4.

**Alternatives considered:** Snapshot approval alone does not prove readability; automatic concept approval is not actual review. Static art satisfies reduced-motion and pause without adding a new animation subsystem.
