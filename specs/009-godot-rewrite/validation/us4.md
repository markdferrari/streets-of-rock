# US4 — Character authoring evidence

Executed 2026-10-10. Authoring implementation is complete; subjective/device playable
review and SC-008 acceptance remain pending. See the new [Lion review](../reviews/lion-godot.md)
and [Plates review](../reviews/plates-godot.md). Historical feature-007 reports and
production assets were preserved.

## US4.1 — Authoritative validation

The normal Bun CLI delegates to the pinned headless Godot validator. Full validation,
per-character validation and `--root` all check definitions, source GLB clip names,
imported animations/models, imported portrait texture types and required props.
`--root` selects the actual Godot project rather than validating files against unrelated
imports. A fixture repository must contain the Godot project/tooling and imported
assets. JSON-only test helpers remain explicitly opt-in; the normal CLI cannot skip
assets or claim imported checks it did not run.

Commands passed:

```sh
bun scripts/characters/validate.ts --full
bun scripts/characters/validate.ts --character lion
bun scripts/characters/validate.ts --character plates --root .
bun run test:platform
bun run test:godot
bun run test:blender
```

Contract tests execute actual Godot subprocesses for all four characters, a different
project root, missing identities, unsupported mechanics and a portrait mapped to a
non-texture import. Missing argument/conflicting mode errors are actionable. Imported
missing-clip rejection is additionally exercised by `test_resource_store.gd`; source
missing clips, malformed schemas, role/timing/resource constraints and incomplete
drafts retain existing rejection coverage. Errors produce a nonzero CLI exit status.

## US4.2 — Scoped scaffolding and preservation

Scaffolding retains the `definition` and `report` fields, explicit `--output-dir`,
incomplete nonregistered drafts and actionable creation reports. Its default follows
the active numbered SpecKit feature rather than hardcoding feature 007. Invalid brief,
invalid/duplicate identity and existing output are rejected before mutation. Partial
new output is cleaned on write failure. Tests verify unrelated definitions remain
byte-identical.

The 24 Blender tests exercise scoped generation/export/portrait behavior in temporary
directories. Godot imports/builds do not run Blender. All existing Cow/Crow assets and
Headrest source/runtime files were compared with git HEAD and remained byte-identical.
Lion/Plates source/runtime/portrait fingerprints are recorded in their new reports;
none were regenerated for these phases.

## US4.3 — Updated workflow and actual browser exercises

The character-builder skill and workflow guide were updated through skill-creator.
They now document authoritative Godot validation/import, browser export/playable
review, current-feature evidence locations, separate fighter/partner behavior and
pending manual acceptance. Scoped Blender options remain intact. The skill's
`quick_validate.py` check passed.

Actual Chromium canvas exercises passed for all twelve ordered duos. Lion with Plates
and Plates with Lion additionally exercised Light, Heavy, Dodge, Special, Pause,
Resume and retained-duo Retry. Their screenshots are new Godot evidence. Terminal
states in those regression cases are deliberately staged; they do not prove natural
completion or balance. A separate native-input run records unstaged outcomes in
`reviews/characters/full-run-results.json` using read-only snapshots and native controls.
Its method and limitations are detailed in the individual reports.

Cold offline checks exercise every fighter and all four rooms on the current test
release; the worker validates the full inventory. Source/import validation, parity,
resource ownership and release audits all pass. Exact build IDs and automated counts
are in [US3 evidence](us3.md).

Owner review of final appearance/balance, both reference phones, human full-level
outcomes and first-time-player Lion/Plates differentiation remain pending. Automated
action exercises and an input bot cannot substitute for SC-008's actual review.
