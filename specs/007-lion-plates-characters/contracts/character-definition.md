# Character Definition and Asset Contract

Use `src/content/characters/<id>.json` schemaVersion 1 as defined in [data-model.md](../data-model.md). `loadCharacterDefinitions` validates all four definitions before exposing the readonly registry. Error output identifies character, field/resource and expected value; do not silently omit invalid roster entries.

`validateCharacterDefinition` checks data shape, supported behaviour and numeric domains; manifest validation separately checks actual files/clip inventory. No arbitrary evaluation of JSON values. Gameplay and selection consume the same validated values. Keep CharacterId independent of player/partner role and all twelve distinct pairings valid.

Static presentation manifests use explicit imports to preserve bundled asset discovery. New paths: `assets/characters/lion/` and `assets/characters/plates/` each contain source.blend, runtime/character.glb, runtime/rigged.blend and portrait.png; `assets/props/headrest/` contains source.blend and headrest.glb. Preserve current Cow/Crow paths and approved resources. Missing semantic clips fail readiness, not silently substitute unrelated animation.

Add `bun scripts/characters/validate.ts [--character <id>]` and `bun scripts/characters/scaffold.ts --id <id> --brief <path>` during implementation. Validation is read-only and nonzero on failure; scaffold fails on existing identity/output and emits a draft definition/report without inventing unsupported behaviour. Updates require an explicit named character and retain unrelated content. Commands are future interfaces, not currently runnable tools.

Generalize existing Blender commands with `--character <id>` and scoped `--output-dir`, retaining legacy Cow/Crow invocation compatibility. Preflight all outputs before writing; `--overwrite` affects only the requested character's derived artifacts. Source edits and final concept approval remain reviewable. No broad regeneration of approved existing characters is necessary.

Exported assets, portrait and headrest join the full-build inventory/precache audit. No persistent browser-data migration or public network API is introduced. Existing Cow/Crow numeric and visual regressions must pass after format migration.
