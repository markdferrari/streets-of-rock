# Plates creation run

## Brief supplied to the refined character-builder workflow

Add Plates as a fast, long-reaching, lower-damage walking dinner plate with shared
Dodge/meter/knockback rules and ordinary partner support attacks. Its Special selects
the nearest living visible enemy at actual action start, stores the target's initial
position, conjures and throws a separate car-seat headrest in a straight line, and
spends meter once. With no eligible target, provide unavailable feedback and retain
meter. Preserve unrelated character resources.

Missing owner choices: plate decoration, palette approval, and final visual approval.
These remain review decisions; no owner approval is claimed.

## Concept review

`concepts/plates-candidates.svg` compares three silhouettes: a scalloped plate, a broad
rimmed round plate, and a square ceramic plate. Direction B was selected for its clear
dinner-plate silhouette at small size and its close match to the existing friendly
character style. Its portrait and model use a warm rim rather than the sheet's blue
material swatch. The separate seat headrest prop makes the weapon identity clear.
This is the implementation team's provisional selection; formal external concept
approval remains pending.

## Exercise outputs

- Definition: `src/content/characters/plates.json`, validated as schema version 1.
- Editable source, rig, semantic-action GLB, portrait, and separate headrest source/GLB:
  `assets/characters/plates/` and `assets/props/headrest/`.
- Integration: target snapshot, fixed aim, collision fraction ordering, range clipping,
  protection consumption, reset/readiness integration, animation, feedback, and
  selected-role asset loading.
- Automated evidence: `tests/unit/game/plates.test.ts`,
  `tests/unit/game/headrest-collision.test.ts`,
  `tests/integration/game/headrest.test.ts`, and Blender source/export tests. Full
  Blender suite passed 23 tests on 2026-09-29.
- Playable browser/manual review: full twelve-duo browser verification is in progress;
  physical-device and five-player checks have not been performed.

## Preservation check

The Cow/Crow sources, runtime models and portraits retain their current Git blob hashes
listed in `lion.md`; their files have no diff in this feature. These are current
fingerprints, not a separately captured pre-generation comparison.

## Outstanding evidence

External concept approval, muted/reduced-motion device review, gameplay balance and
participant recognition remain pending. See `../validation.md` for suite status.
