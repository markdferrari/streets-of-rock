# Asset Data Model: Cow and Crow

This document defines authoring conventions, not runtime schemas or a database. All coordinates use Blender Z-up, facing -Y, with meters as the scene unit and ground at Z=0.

## Character Asset

| Attribute | Convention / validation |
| --- | --- |
| Identity | Exactly `cow` or `crow` |
| Collection | `Character.Cow` or `Character.Crow` |
| Root | Empty named `Cow.Root` / `Crow.Root`, centered at ground origin in individual files |
| Parts | Mesh names prefixed `Cow.` / `Crow.`; unique semantic labels and `.L` / `.R` where applicable |
| Materials | Named `Cow.Material.*` / `Crow.Material.*`; explicit valid slots, simple Principled BSDF |
| Geometry | Nonempty mesh, finite vertex coordinates, positive overall width/depth/height, editable components and modifiers |
| Initial height | Cow 2.0 m including horns; Crow 1.6 m; provisional tuning, with Cow remaining taller and broader |
| Pose | Cow arms slightly spread; Crow full wings partially open |
| Dependencies | No missing linked libraries or external image/font dependencies |
| File | `cow.blend` / `crow.blend` |

Required semantic groups for Cow: torso, head, muzzle, eyes, ears, horns, jacket, arms, legs, boots, and black/white markings. For Crow: torso, head, beak, eyes, jacket, collar, left/right full wings with feather forms, legs, and feet. Groups can comprise multiple named objects; tests validate meaningful parts without fixing incidental vertex/object counts.

All character renderable geometry belongs to its character collection. Individual scenes contain exactly one character collection; comparison contains both. Character materials are retained across neutral/neon presentations. No armature or animation contract exists in this milestone.

## Presentation Scene

| Attribute | Convention / validation |
| --- | --- |
| File | Individual asset file or `comparison.blend` |
| Ground | Named ground mesh under both feet, supporting visible contact shadows |
| Camera collection | `Presentation.Cameras` |
| Light collections | `Presentation.Lights.Neutral`; comparison also includes `Presentation.Lights.Neon` |
| Cameras | Individual: front, side, back, three-quarter; comparison: duo three-quarter |
| Framing | Whole evaluated bounds including wings/horns, at least 10% image margin |
| Scale comparison | Cow taller and broader; both feet at common ground, separated by bounds plus a visible gap |
| Render state | Cycles CPU, seed 0, denoising, AgX; same duo camera for both light variants |

Collection visibility selects the lighting setup. Cameras and lights are excluded from character bounds. Render scripts load saved scenes rather than rebuilding meshes, so edited assets can be previewed.

## Preview Set

All paths are relative to the chosen output directory.

| Files | Quantity | Size | Lighting |
| --- | --- | --- | --- |
| `previews/cow-front.png`, `cow-side.png`, `cow-back.png`, `cow-three-quarter.png` | 4 | 1024×1024 | Neutral |
| `previews/crow-front.png`, `crow-side.png`, `crow-back.png`, `crow-three-quarter.png` | 4 | 1024×1024 | Neutral |
| `previews/duo-neutral.png` | 1 | 1600×1000 | Neutral |
| `previews/duo-neon.png` | 1 | 1600×1000 | Neon |

All filenames in the individual rows use the `previews/` prefix. `smoke/duo-neutral.png` is a temporary 128×128 check and does not substitute for any of the ten final images.

## Validation Report

`validate.py` writes a JSON report to the explicit `--report` path. Report fields: `blender_version`, `python_version`, `checks` (name, passed boolean, diagnostic), and `passed` (true only if every required automated check passed). Process exit is 0 for success, nonzero for failure. Reports do not contain an implied owner approval. Repeatability checks compare object-name sets, material parameters, and evaluated bounds with 1e-5 absolute tolerance.

Human evidence in `validation/results.md` records date, tool versions, exact commands/exit status, expected failing tests before implementation, final checks, preview locations, observed visual issues, and an owner verdict of pending/accepted/changes requested. Existing pre-feature repository edits and unrelated failures must be identified separately.

## Lifecycle and Failure States

`Specified → Tests/checklist defined → Generated → Automatically validated → Visually reviewed → Accepted`.

A generation/reopen/render failure blocks automatic validation. A missing image or unresolved visual defect blocks appearance acceptance. Regenerating after manual edits requires an explicit overwrite choice; rendering only reads scenes and writes its own previews. Any accepted model change requires revalidation and renewed visual review. A timeout is failure even when artifacts exist. Automated pass and pending owner review is a valid intermediate state, never final visual acceptance.
