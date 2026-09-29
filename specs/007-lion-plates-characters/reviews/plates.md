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

The current production direction is a broad white ceramic plate body with cobalt rim,
simple face, and short visible limbs so its plate silhouette remains clear in the
selection preview. The headrest remains a distinct prop. The team selected a restrained
silhouette before modeling to keep the weapon readable in flight; formal external
concept approval remains pending. Candidate-sheet art is not yet retained, so this
review is incomplete and final art production remains provisional.

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
