# Character Builder Workflow

## Inspect and scope

Read the requested character JSON, its review report, resource manifest, relevant game
actions, and `specs/007-lion-plates-characters/data-model.md`. Verify the ID is unique
and lowercase kebab-case. Determine whether the requested behavior already exists as
`areaStrike`, `roar`, or `straightProjectile`; configuration must not introduce executable
logic. Keep the selected fighter profile distinct from the ordinary support profile.

## Concepts and assets

Before final model production, prepare concrete visual candidates when the appearance
brief leaves a meaningful choice. Compare silhouette, readable fighter identity, existing
game style, and full-body mobile readability; record the options and which concept will
proceed. Never describe an unreviewed choice as user-approved.

Use the per-character Blender CLI with an explicit character ID and output directory.
Preflight every target before writing; require an explicit overwrite flag for derived
artifacts and preserve all other character sources/exports. Export editable source,
rigged scene, runtime GLB, portrait, and all required semantic clips. Validate the body
envelope and all clips before integrating readiness. Keep standalone props separate from
fighter meshes.

## Runtime and verification

For supported behavior, add a failing test for observable behavior, then implement the
smallest runtime change and rerun the focused test. Update role initialization, selection
bars/previews, ordinary AI support, bundled inventory/cache, action animation and feedback
where the new identity requires them. Retain Cow/Crow regressions and test role swaps,
retry, loss handling, and offline readiness.

Run the relevant Bun, browser, and Blender checks from the feature quickstart. Do not call
missing device, full-run performance, intended-soundtrack, or player-study evidence a
pass. Record commands, outcomes, build identity, affected resources, unrelated-resource
hashes, concept decision, playable review, and unresolved evidence under
`specs/007-lion-plates-characters/reviews/<id>.md`.

## Creation report

Each report records the supplied brief, concept candidates and review status, definition
and assets changed, behavior kinds supported, tests/commands with results, playable review
location, unrelated resource preservation checks, and remaining art/balance/device or
acceptance work. A draft or successful export command alone is not a completed exercise.
