# Initial Animation Exploration

**Inspected**: 2026-10-15. Read-only inspection of local files, exported animation metadata and current presentation code. No retargeting trial, rendered candidate comparison or device test has been performed.

## Existing characters

All four exported characters already have seven-joint rigs and named clips for supported states. Cow has 20 clips; Crow, Lion and Plates have 23 each. Cow, Lion and Plates use Root, Torso, Head, two arm and two leg joints; Crow substitutes wing joints for arms. The current generation script rigidly assigns mesh parts to bones and makes sparse procedural poses. These findings explain the limited articulation; they do not establish the best replacement rig.

Evidence: `scripts/blender/rig_export.py`, `content/animation-clips.json`, and the four runtime character GLBs under `assets/characters/`.

`game/presentation/character_view.gd` samples a named animation at an externally supplied phase. `game/presentation/world_view.gd` selects phases from gameplay action timing, supplies a repeated idle/movement cycle and adds rotation during the two spin Specials. Any production design must account for this existing rotation and action ownership to avoid doubled spins, pose discontinuities or changed combat timing.

## Supplied candidates

| Source | Observed local contents | Promising coverage | Adaptation questions |
| --- | --- | --- | --- |
| KayKit Character Animations 1.1 | Medium and Large rigs; sampled Medium files contain 23 joints. Separate movement, general, melee and other libraries. | Idle_A/B, Walking_A/B/C, Running_A/B, Hit_A/B, Death_A/B, directional dodges, unarmed punch/kick, melee spins and Throw. | Existing seven-joint rigs do not match the source hierarchy. Test limb segmentation, pose axes, proportions and timing; weapon-oriented clips may require substantial adaptation. Large versus Medium suitability remains untested. |
| Universal Animation Library Standard | Godot/Unreal GLBs with and without root motion; each has 65 joints and 43 animations. Each file is approximately 7.27 MiB before runtime packaging. | Idle_Loop, Jog_Fwd_Loop, Punch_Jab, Punch_Cross, Hit_Chest/Head, Death01 and Roll. | Human skeleton includes articulated spine and finger chains absent from current rigs. Test simplification, proportion correction and whether motion suits each silhouette. Does not by itself demonstrate coverage of the four bespoke Specials. |

KayKit evidence: `/home/mark/projects/godot/assets/KayKit_Character_Animations_1.1/Animations/gltf/` and `License.txt`. The local license identifies Kay Lousberg and CC0; credit is stated to be optional.

Universal evidence: `/home/mark/projects/godot/assets/Universal Animation Library[Standard]/Unreal-Godot/` and `README.txt`. The README identifies Quaternius, CC0, and explains that `_RM` includes root motion while the other file disables it. Preserve the actual source/license evidence and source URLs in production provenance records; acquisition dates were not established by this inspection.

Neither source is a drop-in replacement. Joint counts alone do not prove incompatibility with an adaptation workflow or predict visual quality. Pack size is an assessment concern, not a measured final download cost; ship only needed motion if the chosen workflow permits.

## Character questions for planning

| Character | Preserve | Trial focus |
| --- | --- | --- |
| Cow | Jacketed, heavy brawler silhouette and spin | Weight shifts, planted stance, separated Light strikes and heavier follow-through. |
| Lion | Mane, slow powerful style and ROAR | Large-body articulation and a custom roar if neither library supplies suitable motion. |
| Crow | Aviator jacket, wings and wing spin | Map useful body/leg motion while adapting wing strikes rather than forcing human hand anatomy. |
| Plates | Rigid plate body, fast long reach and Headrest Throw | Keep the plate rigid while articulating limbs; demonstrate launch timing and body/prop integrity. |

The first production decision should follow matched actual-character idle, travel and attack trials from both sources. Select sources per character or action, or retain custom motion when neither is suitable. Source selection, complete coverage, owner review, mobile cost and final acceptance all remain pending.
