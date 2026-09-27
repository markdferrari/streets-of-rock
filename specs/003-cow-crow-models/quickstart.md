# Quickstart: Cow and Crow Authoring Validation

**Status**: Implemented authoring commands. See `validation/results.md` for executed commands, automated results, and the accepted owner visual verdict and open browser-test gate.

## Prerequisites

- Work on `003-cow-crow-models`, preserving unrelated working changes.
- Blender 5.2.2 LTS with bundled Python 3.13.13; `blender` resolves to the installed executable.
- CPU rendering and a writable output directory; no add-ons, downloaded assets, or Python packages required.
- Existing Bun dependencies and Playwright prerequisites for the game's regression suite.
- Run commands from the repository root. Use the working execution context: sandboxed Blender shutdown hung on this host, while execution outside that sandbox completed normally. Use normal tool approval when required; never treat printed output as proof of successful exit.

## 1. Verify Blender starts and exits

```sh
timeout --kill-after=2s 120s blender -noaudio --background --factory-startup --python-exit-code 1 --python-expr 'import bpy, sys; print(bpy.app.version_string, sys.version); bpy.ops.wm.quit_blender()'
```

Expected: supported versions, clean shutdown, exit 0. This diagnostic was verified outside the sandbox during research. Generation, smoke rendering, and fresh-process validation have been exercised; see `validation/results.md` for the final run status.

## 2. Define tests and visual checks first

The automated tests and pre-modeling visual checklist are present. Red-stage results are recorded in `validation/results.md`. Rerun the suite after any model or script change:

```sh
timeout --kill-after=5s 1800s blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py
```

Expected after implementation: `unittest` passes. Tests use temporary directories, launch fresh Blender processes for reopen checks, enforce subprocess timeouts, and return nonzero for failure. Include generation, semantic repeatability, edit/save/reopen, protected overwrite, invalid fixture rejection, and a small render that loads successfully.

## 3. Generate the three scenes

```sh
timeout --kill-after=5s 1800s blender -noaudio --background --factory-startup --python-exit-code 1 --python scripts/blender/generate.py -- --output-dir assets/characters/cow-crow
```

Expected: `cow.blend`, `crow.blend`, and `comparison.blend`; exit 0. Repeating against existing targets without `--overwrite` must fail clearly. Only add `--overwrite` when intentionally replacing generated scenes, including any manual edits. An interrupted run is not success; use a new directory or explicitly replace the partial outputs.

## 4. Validate saved scenes and smoke-render

```sh
timeout --kill-after=5s 1800s blender -noaudio --background --factory-startup --python-exit-code 1 --python scripts/blender/validate.py -- --output-dir assets/characters/cow-crow --report /tmp/cow-crow-validation.json
timeout --kill-after=5s 1800s blender -noaudio --background --factory-startup --python-exit-code 1 --python scripts/blender/render.py -- --output-dir assets/characters/cow-crow --smoke
```

Expected: fresh-process scene validation passes; JSON reports checks and versions; `smoke/duo-neutral.png` loads as a 128×128 image. Validation checks the asset conventions in [data-model.md](data-model.md). Smoke rendering must pass before the full batch.

## 5. Render final previews

```sh
timeout --kill-after=5s 1800s blender -noaudio --background --factory-startup --python-exit-code 1 --python scripts/blender/render.py -- --output-dir assets/characters/cow-crow
```

Expected: ten PNGs described in [data-model.md](data-model.md), using the saved scenes. Existing target previews require `--overwrite`; other files are preserved. To refresh one set, add `--only cow`, `--only crow`, or `--only duo` (with `--overwrite` if that set already exists). A timeout or nonzero exit is failure and must be investigated before acceptance. Do not weaken the error status merely because some images exist.

## 6. Manual acceptance checklist

Define this checklist before modeling, then record actual findings in `validation/results.md`:

- Open all three scenes in Blender. Edit a material and mesh part in a temporary copy, save, and reopen to confirm editability.
- Confirm Cow's stocky silhouette, biker jacket, rounded muzzle, cream horns, markings, sturdy legs, boots, eyes, and determined expression.
- Confirm Crow's smaller wiry silhouette, aviator jacket/collar, beak, birdlike feet, eyes, and full feather wings emerging through shoulder openings.
- Confirm smooth cartoon forms, restrained clothing detail, slight arm spread/partial wing spread, and readable contrast between characters.
- Check all front/side/back/three-quarter views for cropping, shading artifacts, and unwanted intersections, especially jacket/wing shoulders.
- Check Cow is taller and broader, both characters meet the ground, and silhouettes do not overlap in the duo scene.
- Compare neutral and neon duo images: geometry/materials and camera remain unchanged, faces and feathers remain readable, and shadows anchor both characters.
- Review individual images at approximately 160 pixels tall in addition to full size. Record reduced-size recognition; this does not establish in-game readability.
- Record owner approval, requested revisions, or pending review explicitly. Automatic pass cannot replace visual approval.

## 7. Regression and delivery evidence

Before committing implementation, run the Blender suite above and:

```sh
bun run test
bun run build
```

Inspect build outputs/manifest to confirm no `.blend` files or authoring previews entered the web bundle. Record results, versions, commands, and any unrelated baseline failures; do not claim tests passed if they were blocked. All tests must pass before any conventional commit. Documentation-only planning requires consistency review; it does not require creating a test harness. This authoring workflow does not require a commit for validation. Any eventual commit must use a conventional message and include only intended files.

Keep rigs, animation, GLB delivery, runtime loading/caching, gameplay changes, and device acceptance for the separately specified integration milestone.
