# Four-role enemy implementation

Grunt, Zoner, Enforcer and Liam now use distinct production rigged GLBs, editable source and complete semantic bindings. Enforcer has a security vest/crew-cut silhouette; Liam has a broad coat, cream lapels, shaped pale hair and coiled rope. Existing Grunt/Zoner designs remain. All source/export hashes and acquired motion provenance are retained.

The pure pose resolver preserves defeat > normal stun > action > movement/idle precedence. Manual animation sampling never advances the simulation or changes actor position. Boss phase-two chevrons are instance-owned and nonblocking; Liam does not acquire a stun binding. Attack-region cues follow existing EnemyAI/Combat bounds: grunt 1.5/0.45, charge 1/0.6, close 1.1/0.45, rope 3/0.45, radial shockwave 20. The bottle warning follows its locked aim and 15-unit maximum travel; actual bottles remain independently owned simulation projectiles. A visible rope line connects the imported hand to the active reach. No attack timing, damage or hit region was changed here.

All four rigs are prepared/inspected before launch, including skin binding, bones, clips, materials and safe tracks. Unknown roles report loading/presentation errors; the primitive enemy builder is removed. Views retain decorative defeat poses for 21 active ticks, freeze at pause/results, dispose on home/retry and clear per-run ownership before actor IDs can be reused. Ten complete room/rig/projectile cycles return to zero owned imports.

`test_enemy_catalog.gd`, `test_enemy_pose.gd`, `test_enemy_view.gd`, `test_gameplay_enemies.gd`, `test_art_cycles.gd` and scoped Blender checks cover the full role set, both facings, real imported bones and lifecycle. `artwork-enemies.spec.ts` samples every supported attack phase and common authored state in both facings under frozen gameplay; movement clips are additionally checked by GUT and the Grunt gameplay pursuit test. The browser fixture is physically excluded from production.

Owner direction is approved in [owner-approval.md](owner-approval.md). Captures are in `../reviews/enemies-final/`. Independent participant threat recognition and physical-phone readability remain pending.
