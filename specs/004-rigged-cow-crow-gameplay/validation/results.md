# Validation results

- Blender rig/export validation: 15 existing Blender tests plus the new rig/export contract passed.
- `bun run build:test`: passed; emitted hashed Cow and Crow GLBs (about 351 KB and 380 KB).
- `bun run test`: passed, 72 unit tests and 26 Chromium/WebKit browser tests.
- Browser checks passed for startup loading, hashed model requests, retry after defeat, failed model loading, pause, touch combat, and meter gain.
- Gameplay captures are in this directory. The characters are recognizable at gameplay scale and remain grounded with separate silhouettes. Reference phone frame timing and owner animation approval still require device/visual review; no claim is made for those gates.
