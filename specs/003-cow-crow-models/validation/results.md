# Character asset validation

Status: models and previews approved by owner; repository browser-test gate remains open. Owner visual verdict: **accepted**.

## Visual checklist, defined before modeling

- [X] Cow has the agreed stocky build, leather biker jacket, muzzle, horns, markings, legs, boots, determined eyes, and slightly spread arms.
- [X] Crow has the agreed smaller wiry build, aviator jacket and cream collar, beak, birdlike feet, determined eyes, and full partially open wings through shoulder openings.
- [X] Individual front, side, back, and three-quarter views keep the full silhouette in frame, including horns and feather tips.
- [X] The duo has a visible gap, common ground, Cow larger than Crow, and distinguishable outlines at 160-pixel height.
- [X] Neutral and neon views use the same geometry, materials, and duo camera. Faces and feathers remain readable; contact shadows anchor both models.
- [X] No unintended visible intersections at Cow's jacket/arms or Crow's jacket/wings.
- [X] A part and a material can be edited, saved, and reopened in a copy of each native file.

## Evidence

- Blender 5.2.2 LTS / bundled Python 3.13.13. A clean temporary-directory run of `generate.py`, `validate.py`, and `render.py --smoke` returned 0 for all three commands. The final asset validator returned 0; see [asset-report.json](asset-report.json), where Cow, Crow, and comparison checks each pass.
- The final Blender suite returned 0: 14 tests passed. It covers both characters' edit/save/reopen behavior, semantic repeatability, protected overwrites, invalid geometry, missing parts/camera, and timeout rejection.
- Three native `.blend` files and ten PNGs passed file existence, Git trackability, PNG signature, and expected dimension checks. The PNGs total 10,002,238 bytes; the `.blend` files total 431,355 bytes. Final previews are eight 1024×1024 individual views and two 1600×1000 duo views.
- Full-size visual review covered each character's front, side, back, and three-quarter preview, plus both duo lighting variants. The jacket and foot corrections were regenerated and rerendered. At reduced duo scale the species and distinct silhouettes remain apparent; no cropping or obvious wing/jacket collisions were observed. The owner approved the designs after reviewing the neutral and neon duo images.
- `bun run build` returned 0. The production output contains no feature asset paths, preview filenames, `.blend` files, or PNGs. Unit tests returned 0 (16 files, 68 tests).
- `bun run test` first stopped at Playwright server startup because sandboxed localhost bind was rejected (`EPERM`). Outside the sandbox with `PLAYWRIGHT_BROWSERS_PATH=/home/mark/projects/streets-of-rock/.playwright-browsers`, 19/22 browser tests passed; two combo tests and one meter test failed. Serial rerun of those scenarios passed 3/4; Chromium's meter-gain test still failed because `Special 10%` did not appear. This gameplay failure is outside the asset change. The complete repository test gate is **not passing**. No commit is made.
- The existing unrelated `PRD.md` edit remains untouched. Rigging, animation, GLB export, runtime integration, device frame timing, and offline caching remain separate work.

## Test-first evidence

2026-09-27: `blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py` initially exited 1 with two expected `NotImplementedError: Character generation is not implemented yet` failures in saved-asset and editability tests. After implementing the individual models, the same command exited 0: four tests passed. An intermediate test error referenced a Blender object after reopening a file; the test now captures the numeric coordinate before reopen.

US2 red stage: presentation tests exited 1 because `comparison.blend` did not exist and rendering raised `NotImplementedError`; the existing US1 tests stayed green. After scene and renderer implementation, six tests passed including the 128×128 neutral smoke image. Full-size inspection found Cow's jacket was obscured and Crow's feet appeared disconnected. Geometry was revised and the final preview batch rerun; owner approval was recorded after the corrected final previews were reviewed.

US3 red stage: nine-test suite exited 1 only for `NotImplementedError: Saved-scene validation is not implemented yet`. After fresh-process validator implementation, nine tests passed. A later version-guard test failed as expected when the guard accepted an unsupported version; the guard was then added.

A targeted-render test failed before `--only` was added; it required duo preflight to ignore an existing Cow preview. The command now accepts `--only cow|crow|duo`, with `--smoke` kept separate.
