# Character-Creation Skill Contract

## Deliverable

Create `.agents/skills/character-builder/SKILL.md` with name `character-builder` and a concise description for building/updating this game's roster characters from a brief. Keep essential routing/invariants in the entrypoint and detailed asset/review commands in `references/workflow.md`. Follow the available skill-creator instructions when authoring; include optional UI metadata only when useful and valid. No global installation/plugin or deployment required.

## Inputs and outputs

Input: new/update/validate intent, character identity, supplied visual/fighting brief, expected moves and references if supplied. Read existing character definition and asset status before editing. If a required appearance decision is unresolved, prepare concrete concept candidates for review before final model production; do not repeatedly request permission already given.

Outputs: validated definition; editable model and runtime exports; portrait and required clips; supported/new behaviour integration with failing-then-passing tests; selected-role/AI/selection/cache integration; playable review and per-character report. Report incomplete work honestly, including unsupported mechanics, missing assets, concept review, balance and device evidence.

## Workflow

1. Inspect current registry/brief; identify missing material intent and validate unique ID/scope.
2. Prepare concept candidates using existing style and review them before final production. Reuse explicit accepted appearance decisions.
3. Scaffold/edit only the requested definition. Reference a supported Special kind; if unsupported, specify and test the new reusable behaviour before claiming configuration support.
4. Run per-character Blender generation/rig/export/portrait tools and validate clip/resource coverage. Protect unrelated characters and fail preflight on unintended overwrite.
5. Integrate role registry, assets, preview/stats, controls, support AI and cache inventory; follow repository TDD/branch/test-before-commit rules.
6. Run playable and visual review, record commands/results and remaining evidence in a CreationReport. A script exit code alone cannot approve appearance or balance.

Use Lion to exercise the first version, improve shared instructions/tools, then use the same skill for Plates. Both exercise reports are required; retroactively writing reports for manually bypassed workflows does not count. In addition to actual character runs, test invalid/incomplete briefs, duplicate IDs, unsupported move kind, missing clips, existing-output refusal and preservation of unrelated resources.

Skill validation checks frontmatter, referenced paths and actual helper behavior. Use the installed skill-creator validator if present, with its documented invocation; do not assume global paths on other machines. Keep generated implementation code/assets in repository tool locations rather than embedding duplicate engines in the skill.
