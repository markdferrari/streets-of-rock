# Character asset validation

Status: implementation in progress. Owner visual verdict: **pending**.

## Visual checklist, defined before modeling

- [ ] Cow has the agreed stocky build, leather biker jacket, muzzle, horns, markings, legs, boots, determined eyes, and slightly spread arms.
- [ ] Crow has the agreed smaller wiry build, aviator jacket and cream collar, beak, birdlike feet, determined eyes, and full partially open wings through shoulder openings.
- [ ] Individual front, side, back, and three-quarter views keep the full silhouette in frame, including horns and feather tips.
- [ ] The duo has a visible gap, common ground, Cow larger than Crow, and distinguishable outlines at 160-pixel height.
- [ ] Neutral and neon views use the same geometry, materials, and duo camera. Faces and feathers remain readable; contact shadows anchor both models.
- [ ] No unintended visible intersections at Cow's jacket/arms or Crow's jacket/wings.
- [ ] A part and a material can be edited, saved, and reopened in a copy of each native file.

## Evidence

Pending execution. Automated pass does not establish appearance approval.

## Test-first evidence

2026-09-27: `blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py` initially exited 1 with two expected `NotImplementedError: Character generation is not implemented yet` failures in saved-asset and editability tests. After implementing the individual models, the same command exited 0: four tests passed. An intermediate test error referenced a Blender object after reopening a file; the test now captures the numeric coordinate before reopen.
