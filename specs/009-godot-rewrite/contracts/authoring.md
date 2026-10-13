# Character and Backdrop Authoring Contract

> **2026-10-13 art revision:** The Backdrops section's eight-SVG production contract is superseded by [010 art content](../../010-upgrade-game-artwork/contracts/art-content.md). Use actual 3D rooms, enemy GLBs and complete imported dependency validation. Existing playable-character workflow and unrelated authoring requirements remain applicable.

**Applies to:** feature 009 FR-004, FR-008, FR-012, FR-014–015.

## Shared definition and validation authority

Keep CharacterDefinitionV1, semantic animation keys and current asset paths. Runtime
definitions reside in `content/characters/`; the shared catalogue contains roster,
resources, clip requirements, sound sets and body envelopes. The authoritative
validator lives in `game/content/` and is usable without a renderer through
`game/tools/validate_content.gd`.

Retain these existing Bun CLI interfaces, including --root for fixture repositories:

- `bun scripts/characters/validate.ts`
- `bun scripts/characters/validate.ts --character lion`
- `bun scripts/characters/scaffold.ts --id <id> --brief <file>`

Validation delegates to the headless Godot validator and propagates its nonzero exit
status and character/field/resource diagnostic. Production validation includes imported
resources and all semantic clips. Tests may explicitly select definition-only validation;
the normal CLI must not silently skip assets.

Scaffolding retains incomplete draft output and duplicate/existing-output refusal.
Add optional `--output-dir`; otherwise resolve the active feature's drafts directory
from SpecKit metadata instead of hardcoding feature 007. Validate the brief and output
scope before writing, and leave playable content untouched. Preserve current result
fields `definition` and `report`.

Draft zero values, empty moves and TODO fields must fail readiness. Unsupported move
kinds require separately specified/tested runtime behavior; brief keyword detection
is advisory and cannot establish support. Stronger invalid-input validation must have
failing fixtures for nonpositive player HP/speed and nonnumeric knockback.

## Existing assets and Blender workflow

Reuse the existing source, runtime GLB and portrait files. Opening/building Godot must
not invoke Blender automatically. Preserve the scoped CLI options in generate.py,
rig_export.py, render.py and validate.py, including --character, --output-dir and
explicit --overwrite where supported.

Example validation and export commands (run from the repository root):

```sh
blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py
blender -noaudio --background --factory-startup --python-exit-code 1 --python scripts/blender/rig_export.py -- --character lion --output-dir .tmp/009-lion
```

The scoped example does not authorize replacing production assets. Capture fingerprints
of unrelated resources before/after workflow exercises. Verify both source GLB clip
names and imported animation tracks, materials, orientation and body-envelope fit.

Update the character-builder skill and referenced workflow through the skill-creator
instructions during implementation. Keep entrypoint concise and commands in its
reference guide. Exercise update/validate workflows for Lion and Plates and produce
new Godot-specific reports with actual commands/playable review; do not retroactively
rename old reports or regenerate unrelated characters. Existing accepted appearance
decisions carry forward; unresolved reviews remain explicit.

## Backdrops

Use feature 008's defining cues and existing stable-area mapping. Produce reviewable
composites for all four concepts using current characters/camera/HUD before final art.
Then create four wall SVGs (2048x1024) and four floor SVGs (1024x512) under
`assets/backdrops/<visual-id>/`. Keep editable vector source; use self-contained
paths/shapes with no external fonts/images, script, animation or foreignObject.

Import opaque, static textures with unlit materials and restrained contrast. Preserve
floor/background separation, quiet combat detail, branding and rightward entrance.
No decorative mesh receives a collider, hit target, pickup or gameplay identity.
Retain all room groups plus quiet coverage for the three connectors and camera margins.

Check all eight images before countdown. Source-byte, imported-size and resource
presence checks do not replace visual review or decoded texture accounting.
Estimated decoded backdrop textures including mipmaps must remain <=64 MiB; complete
release content and existing rendering budgets still apply.

## Reports and acceptance

Store new character and room review evidence under this feature's reviews directory,
including source/build identifiers, decisions and pending checks. Reports distinguish
definition/resource/automated validation, visual inspection, gameplay review, physical
phone validation and participant feedback. Provide two actual character workflow
reports and all four final room reviews before acceptance.

Keep the skill workflow's rejection and preservation cases: incomplete brief, duplicate
ID, unsupported mechanics, missing clips, pre-existing output and unrelated-resource
fingerprints. Add import/pack availability and offline roster verification for the
rewritten game. No authoring tool constitutes an in-game editor or an expanded roster.
