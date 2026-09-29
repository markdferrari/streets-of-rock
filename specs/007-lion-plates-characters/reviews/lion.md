# Lion creation run

## Brief supplied to the character-builder workflow

Add Lion as a slow, high-damage brawler with claw Light combo, broad Heavy, shared
Dodge/meter/knockback rules, ordinary partner support attacks, and ROAR. ROAR stuns
normal enemies without damage or knockback; bosses take queued damage without being
stunned or interrupted. Preserve all existing characters and their behavior.

Missing owner choices: palette, costume details, and final visual approval. The skill
workflow surfaced these as review decisions. No owner or player approval is claimed.

## Concept review

`concepts/lion-candidates.png` contains three silhouette directions. Direction B, a
broad squared ochre mane with a readable face and compact body, was used for the first
production pass because its head silhouette separates from the round plates design.
This is the implementation team's provisional choice; external art review remains
pending. The current rendered portrait is readable at selection scale but can read
bear-like; mane shape contrast remains an art refinement before final approval.

## Exercise outputs

- Definition: `src/content/characters/lion.json`, validated as schema version 1.
- Editable source, rig, semantic-action GLB, and portrait: `assets/characters/lion/`.
- Integration: player profile, normal/boss ROAR behavior, status expiry/cancellation,
  animation selection, feedback, and selected-role asset loading.
- Automated evidence: `tests/unit/game/lion.test.ts`,
  `tests/unit/game/status-effects.test.ts`,
  `tests/integration/game/headrest.test.ts` (shared lifecycle coverage), and Blender
  source/export tests. Full Blender suite passed 23 tests on 2026-09-29.
- Playable browser/manual review: Chromium selection is under review; physical-device
  and five-player checks have not been performed.

## Preservation check

Cow/Crow source and runtime assets remain tracked without modifications in this change.
Current Git blob hashes:

| Resource | SHA-1 blob |
| --- | --- |
| Cow source | `dacb70a0ecdb24ce27108decc8c145962d0cbe19` |
| Crow source | `c49d2b41360dfec78b773b6d216b2017a1f43588` |
| Cow runtime | `3af01e6221e4221c3f3e45ef699c3ec6ee39fea4` |
| Crow runtime | `c0f677685149277ac9c48d0456af26236a686f86` |
| Cow portrait | `fed144540f4a6e31b8893c72d3d1c2f570b8a030` |
| Crow portrait | `deffb74637a4d2bae426459d6db31ff835eccbbc` |

These are current preservation fingerprints; a separately captured pre-generation
hash ledger was not available, so they do not assert a before/after comparison.

## Outstanding evidence

Owner visual approval, muted/reduced-motion device review, gameplay balance and
participant recognition remain pending. See `../validation.md` for current suite and
acceptance status.
