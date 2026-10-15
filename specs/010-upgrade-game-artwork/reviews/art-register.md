# Final artwork register

All eight concept and eight final directions have explicit owner approval under [the 2026-10-15 instruction](../validation/owner-approval.md). This records blanket approval, not individual owner inspection of these captures. Technical source/import/state checks remain separate; physical-phone and five-player observations remain pending.

[Machine-readable records](art-register.json) contain exact editable/runtime/capture hashes, capture and release build IDs, semantic/landmark coverage and reviewer context. The retained eight [concept records](concepts/records.json) have verified current asset/capture hashes and the owner approval reference.

| Final subject | Runtime asset | Review captures |
| --- | --- | --- |
| exterior | `assets/rooms/exterior/runtime/room.glb` | 16 hashed captures |
| bar | `assets/rooms/bar/runtime/room.glb` | 16 hashed captures |
| dance-floor | `assets/rooms/dance-floor/runtime/room.glb` | 16 hashed captures |
| stage-vip | `assets/rooms/stage-vip/runtime/room.glb` | 16 hashed captures |
| grunt | `assets/enemies/grunt/runtime/character.glb` | 4 hashed captures |
| zoner | `assets/enemies/zoner/runtime/character.glb` | 4 hashed captures |
| enforcer | `assets/enemies/enforcer/runtime/character.glb` | 4 hashed captures |
| liam | `assets/enemies/liam/runtime/character.glb` | 24 hashed captures |

Room captures cover all edges/layouts with normal HUD/controls. Clean enemy captures use a test-only neutral floor with hero references; the pause UI is hidden only for this review fixture. Ordinary gameplay and paused-state captures are additional evidence. Every enemy action is checked in both facings; movement sampling and instance independence also have actual imported-bone GUT checks.

Grunt/Zoner release/contact timing, complete role bindings, 20-unit shockwave coverage, hand-to-reach rope line and nonblocking phase-two styling are verified without animation-driven damage. Prototype/neutral review helpers and source media are excluded from Release.
