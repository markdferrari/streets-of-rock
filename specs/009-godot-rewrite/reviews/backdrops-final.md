# Final in-game backdrop review

Reviewed by Codex on 2026-10-09 after the owner's [concept approval](backdrop-concepts.md).
Actual Chromium Web Test capture: 844×390, build
`4d42d662abe7454e345d59a9199d145952318f02900e28828109ed2823b33204`.
The [manifest](final/manifest.json) retains exact state, duos, console results and
six clearance/connector captures. These are actual game composites, not mockups.

| Stable room ID → setting | Busy encounter | Review decision |
| --- | --- | --- |
| dance-floor → outside entrance | [Cow/Crow](final/outside-entrance.png) | Technical review approved: masonry/window, posters, neon Bondi Beach sign, queue posts and right-hand entrance are recognizable. Pavement stays quiet behind fighters and feedback. |
| vip-lounge → bar | [Crow/Lion](final/bar.png) | Technical review approved: bottles, counter, stools, booth, pendants and branding distinguish the room. The two existing 3D breakable tables remain distinct from flat wall decoration; warning rings remain readable. |
| backstage-corridor → dance floor | [Lion/Plates](final/dance-floor.png) | Technical review approved: DJ equipment, large speakers, disco fixture and static light pools establish the setting. Quiet tiles preserve silhouettes and original controls. |
| alley-exit → stage/VIP | [Plates/Cow](final/stage-vip.png) | Technical review approved: curtains, stage, VIP seating, branding and warm static lighting frame the original Liam encounter. Scenery adds no interaction or collision. |

All four imported fighter silhouettes are represented. The retained Godot camera,
1.25 ally scale, procedural enemy bodies, shadows, impact/warning feedback and
controls are composited with the actual eight final imported textures. The art
uses opaque unlit materials and contains no animation, flashing or strobing.

## Clearances, connectors and edges

| Exit | Actual cleared view | Actual connector view | Review decision |
| --- | --- | --- | --- |
| Entrance → bar | [Clearance](final/outside-entrance-cleared.png) | [Connector](final/outside-entrance-connector.png) | Approved technically: both room groups remain visible, quiet surfaces cover the route, and the native vector GO arrow points right. |
| Bar → dance floor | [Clearance](final/bar-cleared.png) | [Connector](final/bar-connector.png) | Approved technically: floor/wall transitions retain continuous backing and the original tables. |
| Dance floor → stage/VIP | [Clearance](final/dance-floor-cleared.png) | [Connector](final/dance-floor-connector.png) | Approved technically: both settings frame the connector without new boundaries or interactions. |

Camera-edge tests exercise room edges and all three connectors at 667, 844 and
915 widths. A first test exposed the lower margin at 667; the quiet backing
was extended without changing playable geometry. Browser tests use all three
landscape layouts and verify full canvas coverage, safe controls, static scenery,
original waves/tables, all three actual transitions, terminal suppression and retry.
The source clearance fixture uses test-only enemy removal; connector entry uses
native movement. It is not a recorded normal full-level playthrough.

In-game review caught the missing font glyph for the GO arrow. The final cue
draws its arrow in Godot vector primitives; the [earlier failed rendering](../validation/evidence/us2-go-glyph-red/outside-entrance-connector.png)
is retained. A separate regression corrected GO overlapping the pause message.
The final cue avoids visible controls/messages and respects safe insets.

## Acceptance still pending

Owner approval applies to the four concepts (“good enough for now”). Codex's
decisions above are actual technical visual reviews of the implemented scenes.
Owner final gameplay review, reference-phone performance/accessibility and
five-player recognition remain pending. No participant responses are invented.
Recognition uses the separate [player procedure](../validation/procedures.md):
at least four of five players must identify every setting without location labels
or coaching. T049 explicitly defers that evaluation to the final acceptance phase.

## Owner decision — 2026-10-14

Owner approval is now recorded for the existing appearance/gameplay decisions under
[the instruction to assume all relevant decisions approved](../validation/owner-approvals.md).
The earlier pending labels describe the historical review date. This update supplies
approval without relabelling historical captures or claiming new phone, participant
or natural full-level outcomes.
