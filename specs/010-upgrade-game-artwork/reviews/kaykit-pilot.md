# KayKit enemy animation pilot

The first two review characters are implemented: a mohawked Grunt and an apron/bow-tie bartender Zoner. Their original project meshes use KayKit Medium's skeleton and five selected clips each. The owner approved the concept direction and proceeding with KayKit reuse; final animation and gameplay appearance remain unreviewed.

Run from the repository root:

```sh
bun run build:test
bun run preview -- --dir dist-test --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/?fixture=enemy-art`. In Godot, open `tests/godot/fixtures/art/representative.tscn` and run the current scene. Pause/Resume, Face, Attack, Idle, Move, Stun, Hurt, Defeat and Reset expose the authored states. Cow and Crow provide unchanged hero references. This route is a Web Test fixture. After the owner approved the previews, Grunt and Zoner were also integrated into [normal gameplay](gameplay-enemies.md).

| Review capture | Chromium | WebKit |
| --- | --- | --- |
| 667×375 | [image](kaykit-pilot/chromium-667.png) | [image](kaykit-pilot/webkit-667.png) |
| 844×390 | [image](kaykit-pilot/chromium-844.png) | [image](kaykit-pilot/webkit-844.png) |
| 915×412 | [image](kaykit-pilot/chromium-915.png) | [image](kaykit-pilot/webkit-915.png) |

Watch the [motion preview](kaykit-pilot/motion.webm) for all six authored state modes in both facings. The [tick-40 capture](kaykit-pilot/release-tick40.png) shows the actual projectile after release.

The matched JSON files record the actual tick, sampled clips, UI bounds, renderer counters and errors. At tick 20 the corrected scene measures 99 draw calls and 20,534 primitives in desktop browsers. This is a small review scene, not the busy-encounter or phone performance gate.

## Behavior established

- Imported, independent skeletal instances manually sample Idle, Move, Hurt, held Stunned, held Defeated and attack phases. Pause freezes simulation and samples; facing uses the existing actor convention.
- The fixture runs the production enemy AI, status, clock and projectile systems. Grunt becomes active at tick 28. The Zoner releases its bottle at tick 40, the existing AI's transition to active; animation callbacks cannot create gameplay events.
- Each runtime skin has one mesh, one shared vertex-colour material, 23 bones and only five selected clips. Horizontal hip lunges are anchored. Godot import explicitly uses `outfit.tres`; otherwise this editor imported the vertex palette without enabling it as albedo.
- Browser environment events use the existing browser bridge. The backing canvas resizes with the viewport; all controls remain at least 44 pixels across the three tested landscape sizes.

## Remaining review and implementation

Foot placement, skating, punch contact/reach and the spatial hand-to-projectile handoff need motion review in both facings. The release-tick and forward-hand assertions prove timing and the active-start pose, not a visually seamless handoff. Grunt active begins at source 0.47 seconds; Zoner active begins at 0.70 seconds. These source samples align with the existing gameplay boundaries at ticks 28 and 40. The Grunt/Zoner skins are pilots, not accepted final artwork. The plain counter/wall are review dressing, not a completed bar room.

Enforcer and Liam, final furnished rooms, production catalogue/CLI validation, ResourceStore/readiness integration, 21-tick defeat retirement, credits, full gameplay lifecycle integration, phone performance/offline checks and player/final artwork reviews remain open in `tasks.md`. No release or feature completion is implied by this pilot.

## Rebuild and source identity

```sh
blender -noaudio --background --factory-startup --python-exit-code 1 --python scripts/art/build_enemy_pilot.py
```

`-- --role grunt` or `-- --role zoner` rebuilds one skin and preserves the other definition. Editable `.blend` files retain named body/outfit parts; runtime GLBs batch the parts. The `.glb.import` files and shared `outfit.tres` must be retained for the correct Godot palette.

Exact acquired/exported hashes, adaptation notes, licences and import/material identities are in [art provenance](../../../content/art-provenance.json). The retained animation and Dungeon bottle source directories are excluded from Godot import. Pilot assets are listed under `prototypeAssets`/`prototypeProps`; The approved Grunt/Zoner assets now also have separate production records under `runtimeAssets`, with a bottle record under `runtimeProps`.
