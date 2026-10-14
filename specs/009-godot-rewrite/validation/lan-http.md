# LAN HTTP loading regression — 2026-10-10

The reported `TypeError: Cannot read properties of undefined (reading 'addModule')`
was reproduced with the actual Release engine at `http://sor-lan.test/` in Chromium.
Playwright routes that insecure origin to the local preview payload; the browser's
`isSecureContext` is false and its secure audio/service-worker APIs are unavailable.
The failing browser artifact showed the exact reported error in the loading screen.

Worklet capability detection now selects Godot's `--audio-driver Dummy` before startup
when secure worklet audio is unavailable. Official engine bytes remain unchanged.
Optional audio no longer prevents gameplay. The app reports that offline play needs
HTTPS or localhost when service workers are unavailable. Trusted HTTPS remains
necessary for full mobile sound/offline/installed testing; desktop localhost retains
normal audio/cache behavior. Plain LAN HTTP is an online, silent gameplay preview.

The unit test failed before the driver-selection change and passes afterward.
`bun run test:platform` passes 53 tests; `bun run typecheck:legacy` passes.
Actual Release insecure-origin boot/selection/countdown/Light and normal localhost
boot/action/pause/isolation both pass. The insecure-origin check also asserts no
JavaScript/Godot errors and an actionable offline status. The corresponding Test
export is checked separately. All three exports were rebuilt and audited.

| Mode | Build ID | Cached bytes | gzip estimate | Brotli estimate |
|---|---|---:|---:|---:|
| Release | `9b5f79acdfb0eed7bd4faf117c29f16f61c09f0c371cad3614a9167eea429beb` | 45,480,570 | 15,837,227 | 13,886,785 |
| Test | `d8751641638af260e213db150c1b734d22f453c024ce13fcb5da1fe5bf92346b` | 44,377,289 | 16,267,642 | 14,415,793 |
| Diagnostics | `3847c7405ada9a55db6b1d2e779511650b831f551822625231dc21aea5f523a9` | 45,482,789 | 15,838,740 | 13,888,252 |

These replace the local preview artifacts, not the immutable historical update
fixtures or the actual earlier character/phase review evidence. No physical phone,
Safari or final acceptance pass is inferred from this desktop regression check.
