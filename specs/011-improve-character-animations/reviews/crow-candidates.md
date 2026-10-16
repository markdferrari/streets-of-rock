# Crow — candidate review

T012; FR-001/002/010, SC-001, PRD AC-066. Date: 2026-10-16. Status: both sources trialled; owner selected Universal on 2026-10-16. Final production acceptance pending.

[Matched Chromium playback](comparisons/chromium-crow.webm) · [matched WebKit playback](comparisons/webkit-crow.webm) · [Idle](comparisons/chromium-crow-idle-face1.png) · [Move](comparisons/chromium-crow-move-face1.png) · [Attack](comparisons/chromium-crow-attack-face1.png). Opposite-facing images use `face-1`; both browsers cover all three actions and facings. Columns are Current / KayKit / Universal.

Build/source identity and all capture hashes: [comparison manifest](comparison-manifest.json).

Use [strategy A](../validation/strategy.md) and [quickstart A](../quickstart.md). Views share the first-room gameplay camera scale, lighting, actor display scale 1.25 and viewport 844×390. Playback is native 1×; paused captures use normalized 0.5. Current Attack traverses its original Light-1 windup/active/recovery using existing tick lengths; candidate Attack is the complete unmodified-duration trial clip. These are imported-rig comparisons, with no gameplay contact timing or full-game acceptance claim.

| Trial | Runtime GLB bytes | Target rig revision | Evidence |
| --- | ---: | --- | --- |
| Kaykit | 415,360 | hero-trial-2-neutral-corrected | [mapping / exact clips / hashes](../../../tests/godot/fixtures/hero-animation/candidates/crow/kaykit/mapping.json) |
| Universal | 434,980 | hero-trial-2-neutral-corrected | [mapping / exact clips / hashes](../../../tests/godot/fixtures/hero-animation/candidates/crow/universal/mapping.json) |

## Observations and adaptation needs

Both sources now articulate the legs and preserve attached feather groups and the aviator jacket. The sampled KayKit walk raises/folds the wing like a humanoid arm, which is a visible anatomical adaptation problem; Universal is more compact but still uses human punching mechanics. Neither trial proves a convincing bird gait or wing strike.

**Owner-selected direction:** Universal Animation Library Standard, for the fighter and companion roles. The owner selected Universal for all four characters on 2026-10-16; this supersedes the earlier technical recommendation. Retain the anatomy/timing adaptation needs described above.

Both libraries' exact retained files, available clip names, skin sizes and source hashes are in [candidate-inventory.json](candidate-inventory.json). KayKit includes idle/walk/melee and Hit/Death candidates in the retained categories; Universal includes Idle/Walk/Punch plus Hit_Chest, Hit_Head, Roll and Death01. Only Idle/Move/Attack were retargeted here. Reaction/death candidates remain untried on this body. Neither library proves the bespoke Special. Production still needs all three Light strikes, distinct Heavy, directed Dodge, four directional calibrated gaits, reactions/knockout, support timing and authored Special coverage; custom motion fills any rejected/unusable action.

The compact target uses actual mesh weights across upper/lower limb segments, explicit source mapping and an Idle-first neutral reference shared across all three actions. Parent/rest-axis correction prevents stacking donor guard rotations onto the original character rest pose. Donor root/pelvis translation, scale and mannequin geometry are omitted. Loop endpoints are matched numerically; sustained foot sliding, seam velocity, clipping, contact silhouettes and body envelopes still need visual/production work. Trial bytes do not predict complete-production or phone performance cost.

Editable rig, runtime GLB and mapping are isolated under `tests/godot/fixtures/hero-animation/candidates/crow/{kaykit,universal}/`. Existing production files are preserved. Source permissions and license bytes are retained in the existing provenance ledger: Kay Lousberg/KayKit CC0 and Quaternius/Universal CC0; original acquisition dates are unknown and 2026-10-16 retention is recorded separately. No unclear-permission source is proposed for shipping.

**Owner feedback (2026-10-16):** “I like universal in all cases - lets go with that”. **Production source choice:** Universal. **KayKit trial:** not selected for hero production because the owner preferred Universal; retained for comparison and provenance. First-bake guard-offset defects were corrected and preserved locally in `.tmp/hero-animation/first-trials/` for diagnostic comparison. T015 is complete; final production action coverage and gameplay acceptance remain pending.
